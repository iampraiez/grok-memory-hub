import { Memory } from "@prisma/client";
import { FlagEmbedding, EmbeddingModel } from "fastembed";
import { prisma } from "../lib/prisma.js";


export class MemoryService {
  private embeddingModel: FlagEmbedding | null = null;

  async initialize() {
    if (!this.embeddingModel) {
      this.embeddingModel = await FlagEmbedding.init({
        model: EmbeddingModel.BGESmallENV15,
      });
    }
  }

  async createMemory(userId: string, content: string, conversationId?: string, tags: string[] = []) {
    const embedding = await this.generateEmbedding(content);
    
    const memory = await prisma.memory.create({
      
      data: {
        userId,
        content,
        tags,
        conversationId,
      },
    });

    
    await prisma.$executeRaw`
      UPDATE memories 
      SET embedding = ${embedding}::vector
      WHERE id = ${memory.id}
    `;

    return memory;
  }

  async searchMemories(userId: string, query: string, limit: number = 5, sortBy: 'relevance' | 'recency' = 'relevance') {
    const queryEmbedding = await this.generateEmbedding(query);
    
    
    
    const fetchLimit = sortBy === 'recency' ? limit * 3 : limit;

    const memories = await prisma.$queryRaw<Memory[]>`
      SELECT id, content, "createdAt", "conversationId", tags
      FROM memories
      WHERE "userId" = ${userId}
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${fetchLimit}
    `;

    if (sortBy === 'recency') {
      
      return memories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
    }

    return memories;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embeddingModel) await this.initialize();
    
    const embeddings = this.embeddingModel!.embed([text]);
    let embedding: number[] = [];
    for await (const batch of embeddings) {
        
        
        
        embedding = Array.from(batch[0]);
        break;
    }
    return embedding;
  }

  async getContext(userId: string, query: string, limit: number = 5, sortBy: 'relevance' | 'recency' = 'relevance'): Promise<string> {
    const memories = await this.searchMemories(userId, query, limit, sortBy);
    if (memories.length === 0) return "";

    return memories
      .map((m) => `- ${m.content} (Date: ${m.createdAt.toISOString().split("T")[0]})`)
      .join("\n");
  }
}

export const memoryService = new MemoryService();
