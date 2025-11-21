import fastify, { FastifyInstance } from "fastify";
import "dotenv/config";
import { clerkPlugin } from "@clerk/fastify";
import authMiddleware from "./middleware/auth.js";
import health from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/messages.js";
import { ClerkUser } from "./types/index.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: ClerkUser;
  }
}

const server: FastifyInstance = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
  },
});

async function runServer(): Promise<void> {
  try {
    await server.register(clerkPlugin, {
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    server.addHook("preHandler", authMiddleware);

    server.addHook("onError", (request, reply, error, done) => {
      server.log.error(error);
      done();
    });

    server.register(health, { prefix: "/api/health" });
    server.register(authRoutes, { prefix: "/api/auth" });
    server.register(chatRoutes, { prefix: "/api/chat" });
    server.register(messageRoutes, { prefix: "/api/messages" });

    const port = parseInt(process.env.PORT || "3000", 10);
    await server.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(`Server listening on http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

runServer();
