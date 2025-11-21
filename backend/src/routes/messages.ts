import prisma from "../lib/prisma.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

async function messageRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/:convoId",
    async (request: FastifyRequest | any, reply: FastifyReply) => {
      const userId = request.user.id as string;
      const { convoId } = request.params;
      let conversation;
      try {
        conversation = await prisma.conversation.findUnique({
          where: { id: convoId },
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        });
      } catch (err) {
        console.error("[message] DB error", err);
        return reply.status(500).send({
          data: null,
          error: {
            message:
              err instanceof Error ? err.message : "Error getting messages",
          },
        });
      }
      if (userId !== conversation?.userId) {
        return reply.status(404).send({
          data: null,
          error: {
            message: "Unauthorized",
          },
        });
      }

      return reply.status(200).send({
        data: conversation.messages,
        error: null,
      });
    }
  );

  fastify.post(
    "/:convoId",
    async (request: FastifyRequest | any, reply: FastifyReply) => {
      const userId = request.user.id as string;
      const { convoId } = request.params;
      const { role, content } = request.body;
      let conversation;
      try {
        conversation = await prisma.conversation.findUnique({
          where: { id: convoId },
        });
      } catch (err) {
        console.error("[message] DB error", err);
        return reply.status(500).send({
          data: null,
          error: {
            message:
              err instanceof Error ? err.message : "Error getting messages",
          },
        });
      }
      if (userId !== conversation?.userId) {
        return reply.status(404).send({
          data: null,
          error: {
            message: "Unauthorized",
          },
        });
      }

      let message;
      try {
        message = await prisma.message.create({
          data: {
            role,
            content,
            conversationId: convoId,
          },
        });
      } catch (err) {
        console.error("[message] DB error", err);
        return reply.status(500).send({
          data: null,
          error: {
            message:
              err instanceof Error ? err.message : "Error creating messages",
          },
        });
      }

      return reply.status(200).send({
        data: message,
        error: null,
      });
    }
  );

  fastify.patch("/:messageId", async (request: FastifyRequest | any, reply) => {
    const userId = request.user.id as string;
    const { messageId } = request.params;
    const { content } = request.body;

    let existingMessage;
    try {
      existingMessage = await prisma.message.findUnique({
        where: { id: messageId },
        include: { conversation: true },
      });

      if (!existingMessage) {
        return reply.status(404).send({
          data: null,
          error: { message: "Message not found" },
        });
      }
    } catch (err) {
      console.error("[message] DB find error", err);
      return reply.status(500).send({
        data: null,
        error: { message: "Database error" },
      });
    }

    if (existingMessage.conversation.userId !== userId) {
      return reply.status(403).send({
        data: null,
        error: { message: "Unauthorized" },
      });
    }

    try {
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { content },
      });

      await prisma.message.deleteMany({
        where: {
          conversationId: updatedMessage.conversationId,
          createdAt: { gt: updatedMessage.createdAt },
        },
      });

      return reply.status(200).send({
        data: "updated",
        error: null,
      });
    } catch (err) {
      console.error("[message] DB update/delete error", err);
      return reply.status(500).send({
        data: null,
        error: { message: "Error editing message" },
      });
    }
  });
}

export default messageRoutes;
