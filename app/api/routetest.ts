import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { createClient } from "@supabase/supabase-js";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Document } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import { BytesOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { googleEmbeddings } from "@/utils/embeddings";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const runtime = "edge";

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    if (message.role === "user") {
      return `Human: ${message.content}`;
    } else if (message.role === "assistant") {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join("\n");
};

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;
const condenseQuestionPrompt = PromptTemplate.fromTemplate(CONDENSE_QUESTION_TEMPLATE);

const ANSWER_TEMPLATE = `You are an AI assistant specialized in answering questions ONLY about KGE internships. Your knowledge is limited to the information provided in the context below. Do not use any external knowledge.

Answer the question based ONLY on the following context about KGE internships:
<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}

IMPORTANT: 
1. Only answer questions related to KGE internships.
2. If asked "What do you do?", respond with: "I am an AI assistant specialized in providing information about KGE internships. I can answer questions about application processes, requirements, roles, and experiences specific to KGE internships. How can I help you with KGE internships today?"
3. For any question not specifically about KGE internships or if the information is not in the context, respond with: "I'm an AI assistant focused on KGE internships. I don't have information about that, but I'd be happy to answer any questions you have about KGE internships. What would you like to know about KGE internship opportunities, application processes, or experiences?"
4. When providing information that can be presented as a list (e.g., steps, requirements, benefits), use a numbered list format. For example:
   1. First item
   2. Second item
   3. Third item

Answer:`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

const VERIFY_ANSWER_TEMPLATE = `You are a verification assistant. Your task is to verify if the given answer is relevant to the question and specifically about KGE internships.

Question: {question}
Answer: {answer}

Is this answer relevant to the question and specifically about KGE internships? Respond with YES or NO, followed by a brief explanation.

Response:`;
const verifyAnswerPrompt = PromptTemplate.fromTemplate(VERIFY_ANSWER_TEMPLATE);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    console.log("Current message content:", currentMessageContent);

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY!,
      temperature: 0.5,
      model: "mixtral-8x7b-32768",
    });

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-pro",
      temperature: 0.4,
      maxRetries: 2,
    });

    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    console.log("Supabase client created");

    if (!googleEmbeddings) {
      console.error("Google Embeddings not initialized");
      return;
    }

    console.log("Google Embeddings initialized");

    const vectorstore = new SupabaseVectorStore(googleEmbeddings, {
      client,
      tableName: "documents_768",
      queryName: "match_documents_768",
    });

    console.log("Vector store created");

    const standaloneQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      llm,
      new StringOutputParser(),
    ]);

    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });

    const retriever = vectorstore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            console.log("Retrieved documents:", documents);
            resolveWithDocuments(documents);
          },
        },
      ],
    });

    const retrievalChain = retriever.pipe((docs) => {
      console.log("Documents before combination:", docs);
      const combined = combineDocumentsFn(docs);
      console.log("Combined documents:", combined);
      return combined;
    });

    const verifyAnswerChain = RunnableSequence.from([
      verifyAnswerPrompt,
      llm,
      new StringOutputParser(),
    ]);

    const answerChain = RunnableSequence.from([
      async (input) => {
        let question = input.question;
        let attempts = 0;
        let isRelevant = false;
        let answer = "";

        while (!isRelevant && attempts < 3) {
          try {
            console.log(`Attempt ${attempts + 1} - Question: ${question}`);
            const standaloneQuestion = await standaloneQuestionChain.invoke({
              question: question,
              chat_history: input.chat_history,
            });
            console.log("Standalone question:", standaloneQuestion);
            
            const context = await retrievalChain.invoke(standaloneQuestion);
            console.log("Retrieved context:", context);

            answer = await answerPrompt.pipe(llm).pipe(new StringOutputParser()).invoke({
              context: context,
              chat_history: input.chat_history,
              question: standaloneQuestion,
            });
            console.log("Generated answer:", answer);

            const verificationResult = await verifyAnswerChain.invoke({
              question: standaloneQuestion,
              answer: answer,
            });
            console.log("Verification result:", verificationResult);

            isRelevant = verificationResult.startsWith("YES");
            if (!isRelevant) {
              question = `Please rephrase the question to be more specific about KGE internships: ${standaloneQuestion}`;
              attempts++;
            }
          } catch (error) {
            console.error("Error in answer generation:", error);
            break;
          }
        }

        return {
          answer: isRelevant ? answer : "I apologize, but I couldn't generate a relevant answer about KGE internships. Could you please rephrase your question or ask something more specific about KGE internships?",
          question: question,
        };
      },
      (result) => {
        console.log("Final result:", result);
        return result.answer;
      },
    ]);

    const conversationalRetrievalQAChain = RunnableSequence.from([
      answerChain,
      new BytesOutputParser(),
    ]);

    console.log("Starting stream");
    const stream = await conversationalRetrievalQAChain.stream({
      question: currentMessageContent,
      chat_history: formatVercelMessages(previousMessages),
    });

    console.log("Stream created");

    const documents = await documentPromise;
    console.log("Full documents:", documents);

    const serializedSources = Buffer.from(
      JSON.stringify(
        documents.map((doc) => {
          return {
            pageContent: doc.pageContent.slice(0, 50) + "...",
            metadata: doc.metadata,
          };
        }),
      ),
    ).toString("base64");

    console.log("Serialized sources created");

    return new StreamingTextResponse(stream, {
      headers: {
        "x-message-index": (previousMessages.length + 1).toString(),
        "x-sources": serializedSources,
      },
    });
  } catch (e: any) {
    console.error("API Error:", e);
    console.error("Error stack:", e.stack);
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: e.status ?? 500 });
  }
}