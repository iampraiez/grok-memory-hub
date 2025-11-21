import prisma from "../lib/prisma.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { GrokService } from "../services/grok.service.js";
import { MemoryService } from "../services/memory.service.js";
import { systemPrompt } from "../data/prompt.js";
import { MessageRole } from "@prisma/client";

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
        fastify.log.error(`[message] DB error: ${err}`);
        return reply.code(500).send({
          data: null,
          error: {
            message:
              err instanceof Error ? err.message : "Error getting messages",
          },
        });
      }
      if (userId !== conversation?.userId) {
        if (!conversation) {
          return reply.code(404).send({
            data: null,
            error: {
              message: "Conversation not found",
            },
          });
        }
        return reply.code(404).send({
          data: null,
          error: {
            message: "Unauthorized",
          },
        });
      }

      return reply.code(200).send({
        data: conversation.messages,
        error: null,
      });
    }
  );

  // user sends a message
  fastify.post(
    "/:convoId",
    async (request: FastifyRequest | any, reply: FastifyReply) => {
      let conversation, message, history, title;
      const userId = request.user.id as string;
      const { convoId } = request.params;
      const { content } = request.body;
      const role = "user";
      try {
        conversation = await prisma.conversation.findUnique({
          where: { id: convoId },
        });
      } catch (err) {
        fastify.log.error(`[message] DB error: ${err}`);
        return reply.code(500).send({
          data: null,
          error: {
            message:
              err instanceof Error ? err.message : "Error getting messages",
          },
        });
      }
      if (userId !== conversation?.userId) {
        if (!conversation) {
          return reply.code(404).send({
            data: null,
            error: {
              message: "Conversation not found",
            },
          });
        }
        return reply.code(404).send({
          data: null,
          error: {
            message: "Unauthorized",
          },
        });
      }

      // apparently save message first before sending to grok

      try {
        message = await prisma.message.create({
          data: {
            role,
            content,
            conversationId: convoId,
          },
        });

        history = await prisma.message.findMany({
          where: { conversationId: convoId },
          orderBy: { createdAt: "asc" },
          select: { role: true, content: true },
        });
      } catch (err) {
        fastify.log.error(`[message] DB error: ${err}`);
        return reply.code(500).send({
          data: null,
          error: {
            message:
              err instanceof Error
                ? err.message
                : "Error creating or getting messages",
          },
        });
      }

      await MemoryService.saveFromUser(content, userId, convoId);
      //getting history
      const chatHistory = history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      const memories = await MemoryService.searchRelevant(userId, content);
      if (memories.length > 0) {
        chatHistory.push(
          ...memories.map((m) => ({ role: MessageRole.system, content: m }))
        );
      }
      if (history.length === 1) {
        chatHistory.unshift({
          role: "system" as const,
          content: systemPrompt,
        });
      }

      const grok = new GrokService();
      const completion = await grok.response(chatHistory);

      const aiContent =
        completion.choices[0]?.message?.content ||
        "Sorry, something went wrong.";

      if (aiContent !== "Sorry, something went wrong.") {
        await MemoryService.saveFromAssistant(aiContent, userId, convoId);
      }

      const aiResponse = await prisma.message.create({
        data: {
          role: "assistant",
          content: aiContent,
          conversationId: convoId,
        },
      });

      if (history.length === 1) {
        title = await grok.generateTitle(aiContent);
        await prisma.conversation.update({
          where: { id: convoId },
          data: { title: title.slice(0, 100) },
        });
      }

      return reply.code(200).send({
        data: { aiContent, title: title ? title : null },
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
        return reply.code(404).send({
          data: null,
          error: { message: "Message not found" },
        });
      }
    } catch (err) {
      fastify.log.error(`[message] DB error: ${err}`);
      return reply.code(500).send({
        data: null,
        error: { message: "Database error" },
      });
    }

    if (existingMessage.conversation.userId !== userId) {
      return reply.code(403).send({
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

      return reply.code(200).send({
        data: "updated",
        error: null,
      });
    } catch (err) {
      fastify.log.error(`[message] DB error: ${err}`);
      return reply.code(500).send({
        data: null,
        error: { message: "Error editing message" },
      });
    }
  });
}

export default messageRoutes;
