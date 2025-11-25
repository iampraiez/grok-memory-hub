import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { getAuth } from "@clerk/fastify";

export async function statsRoutes(fastify: FastifyInstance) {
  
  fastify.get("/", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    try {
      
      const totalConversations = await prisma.conversation.count({
        where: { userId },
      });

      
      const totalMessages = await prisma.message.count({
        where: {
          conversation: {
            userId,
          },
        },
      });

      
      const userMessages = await prisma.message.count({
        where: {
          conversation: { userId },
          role: "user",
        },
      });

      const assistantMessages = await prisma.message.count({
        where: {
          conversation: { userId },
          role: "assistant",
        },
      });

      
      const totalMemories = await prisma.memory.count({
        where: { userId },
      });

      
      const firstConversation = await prisma.conversation.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      });

      
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { createdAt: true },
      });

      return {
        totalConversations,
        totalMessages,
        userMessages,
        assistantMessages,
        totalMemories,
        firstConversationDate: firstConversation?.createdAt || null,
        accountCreatedAt: user?.createdAt || null,
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch statistics" });
    }
  });
}
