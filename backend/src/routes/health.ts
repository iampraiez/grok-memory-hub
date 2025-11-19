import type { FastifyInstance } from "fastify";

async function health(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    try {
      return reply
        .status(200)
        .send({ data: { status: "ok", timestamp: Date.now() }, error: null });
    } catch (err: unknown) {
      console.error("[health] error", err);
      return reply.status(500).send({
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
