import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { getAuth } from "@clerk/fastify";
import { memoryService } from "../services/memory.service";

export async function memoryRoutes(fastify: FastifyInstance) {
  
  fastify.post("/", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { content, tags } = request.body as { content: string; tags?: string[] };

    if (!content) {
      return reply.code(400).send({ error: "Content is required" });
    }

    try {
      const memory = await memoryService.createMemory(userId, content, undefined, tags);
      return memory;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to create memory" });
    }
  });

  
  fastify.get("/search", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { q } = request.query as { q: string };

    if (!q) {
      return reply.code(400).send({ error: "Query parameter 'q' is required" });
    }

    try {
      const memories = await memoryService.searchMemories(userId, q);
      return memories;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to search memories" });
    }
  });

  
  fastify.delete("/:id", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { id } = request.params as { id: string };

    try {
      
      const memory = await prisma.memory.findUnique({
        where: { id },
      });

      if (!memory || memory.userId !== userId) {
        return reply.code(404).send({ error: "Memory not found" });
      }

      await prisma.memory.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to delete memory" });
    }
  });
}
