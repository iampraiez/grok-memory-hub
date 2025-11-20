import prisma from "../lib/prisma.js";
import fastify from "fastify";

async function conversationRoutes(fastify: fastify.FastifyInstance) {
  fastify.get(
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
}

export default conversationRoutes;
