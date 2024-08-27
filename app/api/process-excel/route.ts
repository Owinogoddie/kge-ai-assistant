import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
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

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  const documents = jsonData.map((row: any) => ({
    pageContent: `${row.Category}: ${row.Question} - ${row.Answer}`,
    metadata: { category: row.Category, question: row.Question, answer: row.Answer }
  }));

  try {
    await SupabaseVectorStore.fromDocuments(
      documents,
      embeddings,
      {
        client: supabaseClient,
        tableName: "documents",
        queryName: "match_documents",
      }
    );
    console.log("docs stored successfully")
    return NextResponse.json({ success: true, message: 'Documents stored successfully' });
  } catch (error) {
    console.error('Error storing documents:', error);
    return NextResponse.json({ error: 'Failed to store documents' }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false },
};