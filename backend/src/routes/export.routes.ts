import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { getAuth } from "@clerk/fastify";

export async function exportRoutes(fastify: FastifyInstance) {
  
  fastify.get("/", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    try {
      
      const conversations = await prisma.conversation.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      
      const memories = await prisma.memory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      
      const preferences = await prisma.userPreference.findUnique({
        where: { userId },
      });

      
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      const exportData = {
        exportedAt: new Date().toISOString(),
        user: {
          clerkId: user?.clerkId,
          email: user?.email,
          username: user?.username,
          createdAt: user?.createdAt,
        },
        preferences,
        conversations,
        memories,
        stats: {
          totalConversations: conversations.length,
          totalMessages: conversations.reduce((sum, conv) => sum + conv.messages.length, 0),
          totalMemories: memories.length,
        },
      };

      
      reply.header("Content-Type", "application/json");
      reply.header("Content-Disposition", `attachment; filename="grok-memory-hub-export-${new Date().toISOString().split('T')[0]}.json"`);

      return exportData;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to export data" });
    }
  });
}
