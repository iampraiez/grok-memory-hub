import prisma from "../lib/prisma.js";
import fastify from "fastify";
import type { Conversation } from "../types/index.js";

async function chatRoutes(fastify: fastify.FastifyInstance) {
  fastify.post(
    "/new",
    async (
      request: fastify.FastifyRequest | any,
      reply: fastify.FastifyReply
    ) => {
      const userId = request.user.id as string;
      let conversation;
      try {
        conversation = await prisma.conversation.create({
          data: {
            userId,
          },
        });
      } catch (err) {
        console.error("[conversation] DB error", err);
        return reply.status(500).send({
          data: null,
          error: {
            message: err instanceof Error ? err.message : "Database error",
          },
        });
      }

      return reply.status(200).send({
        data: conversation.id,
        error: null,
      });
    }
  );

  fastify.get(
    "/all",
    async (
      request: fastify.FastifyRequest | any,
      reply: fastify.FastifyReply
    ) => {
      const userId = request.user.id as string;
      let conversations;
      try {
        conversations = await prisma.conversation.findMany({
          where: { userId },
          include: {
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
            _count: true,
          },
        });
      } catch (err) {
        console.error("[conversation] DB error", err);
        return reply.status(500).send({
          data: null,
          error: {
            message: err instanceof Error ? err.message : "Database error",
          },
        });
      }
      conversations = conversations.map((convo) => {
        return {
          id: convo.id,
          title: convo.title || "No title assigned yet",
          isPinned: convo.isPinned,
          updatedAt: convo.updatedAt,
          lastMessage: convo.messages[0] || null,
          lastMessageRole: convo.messages[0]?.role || null,
          messageCount: convo._count.messages || 0,
          lastMessageAt: convo.messages[0]?.createdAt || null,
        };
      });

      return reply.status(200).send({
        data: conversations as Conversation[],
        error: null,
      });
    }
  );

  fastify.put(
    "/:id/edit",
    async (
      request: fastify.FastifyRequest | any,
      reply: fastify.FastifyReply
    ) => {
      const { id } = request.params;
      const userId = request.user.id as string;
      const { title, isPinned } = request.body;
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id },
          select: { userId: true },
        });
        if (conversation?.userId !== userId) {
          return reply.status(404).send({
            data: null,
            error: {
              message: "Unauthorized",
            },
          });
        }
        await prisma.conversation.update({
          where: { id, userId },
          data: { title, isPinned },
        });

        return reply.status(200).send({
          data: "ok",
          error: null,
        });
      } catch (err) {
        console.error("[conversation] DB error", err);
        return reply.status(500).send({
          data: null,
          error: {
            message: err instanceof Error ? err.message : "Error updating",
          },
        });
      }
    }
  );

  fastify.delete(
    "/:id",
    async (
      request: fastify.FastifyRequest | any,
      reply: fastify.FastifyReply
    ) => {
      const { id } = request.params;
      const userId = request.user.id as string;
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id },
          select: { userId: true },
        });
        if (conversation?.userId !== userId) {
          return reply.status(404).send({
            data: null,
            error: {
              message: "Unauthorized",
            },
          });
        }
        await prisma.conversation.delete({
          where: {
            id,
          },
        });
        return reply.status(200).send({
          data: "ok",
          error: null,
        });
      } catch (err) {
        console.error("[conversation] DB error", err);
        return reply.status(500).send({
          data: null,
          error: {
            message: err instanceof Error ? err.message : "Error updating",
          },
        });
      }
    }
  );
}

export default chatRoutes;
