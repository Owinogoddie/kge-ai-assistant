import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

export async function GET(req: NextRequest) {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "embedding-001", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      });
      
      const res = await embeddings.embedQuery("OK Google");
      
      console.log(res, res.length);
    return NextResponse.json({ 'similarityScore':'ssssssss' });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 });
  }
}
