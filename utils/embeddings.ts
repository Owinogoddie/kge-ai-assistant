import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
let embeddings;

try {
  embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });
  console.log('embedings exists')
} catch (error) {
  console.error("Error creating Google Embeddings:", error);
}

export const googleEmbeddings = embeddings;
