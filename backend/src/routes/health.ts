import type { FastifyInstance } from "fastify";

async function health(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    try {
   request.log.info(`ifeif ${request}`);
   return reply.code(200).send({
     data: { status: "ok", timestamp: new Date().toISOString() },
     error: null,
   });
    } catch (err: unknown) {
      fastify.log.error(`[health] DB error: ${err}`);
      return reply.code(500).send({
        data: null,
        error: {
          message:
            err instanceof Error
              ? err.message
              : new Error("Something went wrong").message,
        },
      });
    }
  });
}

export default health;
