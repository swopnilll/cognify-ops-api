import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import logger from "../../utils/logger";

import dotenv from "dotenv";
dotenv.config();

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDING_MODEL,
});

export async function initVectorStore() {
  try {
    const vectorStore = await PGVectorStore.initialize(embeddings, {
      postgresConnectionOptions: {
        connectionString: process.env.DATABASE_URL,
      },
      tableName: "knowledge_base",
      columns: {
        idColumnName: "id",
        vectorColumnName: "embedding",
        contentColumnName: "chunk_text",
      },
    });
    logger.info("PGVectorStore initialized successfully.");
    return vectorStore;
  } catch (err) {
    logger.error("Failed to initialize PGVectorStore:", err);
    throw err;
  }
}
