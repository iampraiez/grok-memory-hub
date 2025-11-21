import fastify from "fastify";
import health from "./routes/health.js";
import authMiddleware from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/messages.js";
import { clerkPlugin } from "@clerk/fastify";

const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
});

async function runServer() {
  await server.register(clerkPlugin, {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  server.register(async (fastify) => {
    fastify.addHook("onRequest", authMiddleware);
    fastify.addHook("onError", (request, reply, error, done) => {
      console.error("[Hook error]", error);
      done();
    });
  });

  server.register(health, { prefix: "/api/health" });
  server.register(authRoutes, { prefix: "/api/auth" });
  server.register(chatRoutes, { prefix: "/api/chat" });
  server.register(messageRoutes, { prefix: "/api/messages" });

  server.listen(
    { port: parseInt(process.env.PORT!) || 3000 },
    (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(
        `Server listening at ${address} {${process.env.CLERK_PUBLISHABLE_KEY}}`
      );
    }
  );
}

runServer();