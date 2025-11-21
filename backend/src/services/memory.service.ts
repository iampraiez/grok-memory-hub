import prisma from "../lib/prisma";
import { GrokService } from "./grok.service";
import {
  toExtractPrompt,
  memoryExtractorPrompt,
  searchPrompt,
  responsePrompt,
} from "../data/prompt";

const grok = new GrokService();

export class MemoryService {
  static async saveFromUser(
    content: string,
    userId: string,
    conversationId: string
  ) {
    const chunks = content.match(/.{1,500}(\s|$)/g) || [content];

    for (const chunk of chunks) {
      if (chunk.trim().length < 20) continue;

      await prisma.memory.upsert({
        where: {
          userId_conversationId_content: {
            userId,
            conversationId,
            content: chunk.trim(),
          },
        },
        update: {},
        create: {
          userId,
          conversationId,
          content: chunk.trim(),
        },
      });
    }
  }

  static async saveFromAssistant(
    content: string,
    userId: string,
    conversationId: string
  ) {
    const extractPrompt = toExtractPrompt(content);
    let facts: string[] = [];

    try {
      const response = await grok.response([
        {
          role: "system",
          content: memoryExtractorPrompt,
        },
        { role: "user", content: extractPrompt },
      ]);

      const raw = response.choices[0]?.message?.content?.trim() || "[]";
      facts = JSON.parse(raw);
    } catch (err) {
      console.error("Memory extraction failed:", err);
      return;
    }

    for (const fact of facts) {
      if (fact.length > 300 || fact.length < 20) continue;

      await prisma.memory.upsert({
        where: {
          userId_conversationId_content: {
            userId,
            conversationId,
            content: fact.trim(),
          },
        },
        update: {},
        create: {
          userId,
          conversationId,
          content: fact.trim(),
        },
      });
    }
  }

  static async searchRelevant(
    userId: string,
    currentMessage: string
  ): Promise<string[]> {
    const keywordPrompt = searchPrompt(currentMessage);

    let keywords: string[] = [];

    try {
      const response = await grok.response([
        {
          role: "system",
          content: responsePrompt,
        },
        { role: "user", content: keywordPrompt },
      ]);
      const raw = response.choices[0]?.message?.content?.trim() || "[]";
      keywords = JSON.parse(raw).map((k: string) => k.toLowerCase());
    } catch {
      keywords = currentMessage.toLowerCase().split(" ").slice(0, 6);
    }

    if (keywords.length === 0) return [];

    const results = await prisma.memory.findMany({
      where: { userId, content: { contains: keywords[0] } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return results.map(
      (r) => `Memory from ${r.createdAt.toLocaleDateString()}: ${r.content}`
    );
  }
}
