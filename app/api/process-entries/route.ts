import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { parse } from 'papaparse';
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from '@supabase/supabase-js';

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2"
});

const supabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Document {
  pageContent: string;
  metadata: {
    category: string;
    question: string;
    answer: string;
  };
}

async function processDocuments(documents: any[]) {
  const processedDocs = [];
  const duplicates = [];

  for (const doc of documents) {
    const { data, error } = await supabaseClient
      .from('documents')
      .select('id')
      .eq('metadata->>question', doc.metadata.question)
      .eq('metadata->>answer', doc.metadata.answer)
      .eq('metadata->>category', doc.metadata.category);

    if (error) {
      console.error('Error checking for duplicates:', error);
      throw error;
    }

    if (data && data.length > 0) {
      duplicates.push(doc);
    } else {
      processedDocs.push(doc);
    }
  }

  if (processedDocs.length === 0) {
    throw new Error('All documents are duplicates.');
  }

  return { processedDocs, duplicates };
}


export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const manualEntriesJson = formData.get('manualEntries') as string;

  let documents: Document[] = [];

  if (file) {
    const buffer = await file.arrayBuffer();
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType === 'csv') {
      const csvText = new TextDecoder().decode(buffer);
      const { data } = parse(csvText, { header: true });
      documents = data.map((row: any) => ({
        pageContent: `${row.Category}: ${row.Question} - ${row.Answer}`,
        metadata: { category: row.Category, question: row.Question, answer: row.Answer }
      }));
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      documents = jsonData.map((row: any) => ({
        pageContent: `${row.Category}: ${row.Question} - ${row.Answer}`,
        metadata: { category: row.Category, question: row.Question, answer: row.Answer }
      }));
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }
  }

  if (manualEntriesJson) {
    const manualEntries = JSON.parse(manualEntriesJson);
    const manualDocuments = manualEntries.map((entry: any) => ({
      pageContent: `${entry.category}: ${entry.question} - ${entry.answer}`,
      metadata: { category: entry.category, question: entry.question, answer: entry.answer }
    }));
    documents = [...documents, ...manualDocuments];
  }

  if (documents.length === 0) {
    return NextResponse.json({ error: 'No data to process' }, { status: 400 });
  }

  try {
    const { processedDocs, duplicates } = await processDocuments(documents);

    const result = await SupabaseVectorStore.fromDocuments(
      processedDocs,
      embeddings,
      {
        client: supabaseClient,
        tableName: "documents",
        queryName: "match_documents",
      }
    );

    console.log('Documents added to Supabase:', result);

    return NextResponse.json({ 
      success: true, 
      addedCount: processedDocs.length, 
      duplicateCount: duplicates.length 
    });
  } catch (error:any) {
    if (error.message === 'All documents are duplicates.') {
      console.error('No documents added: All provided documents were duplicates.');
      return NextResponse.json({ 
        success: true, 
        addedCount: 0, 
        duplicateCount: documents.length 
      });
    } else {
      console.error('Error processing documents:', error);
      return NextResponse.json({ error: 'Failed to process documents' }, { status: 500 });
    }
  }
}
