import fastify, { FastifyInstance } from "fastify";
import "dotenv/config";
import { clerkPlugin } from "@clerk/fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import authMiddleware from "./middleware/auth.js";
import health from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import { chatRoutes } from "./routes/chat.routes";
import { memoryRoutes } from "./routes/memory.routes";
import { preferencesRoutes } from "./routes/preferences.routes";
import { statsRoutes } from "./routes/stats.routes";
import { exportRoutes } from "./routes/export.routes";

import { ClerkUser } from "./types/index.js";
import { validateEnv } from "./lib/env.js";
import { AppError } from "./lib/errors.js";


const env = validateEnv();

declare module "fastify" {
  interface FastifyRequest {
    user?: ClerkUser;
  }
}

const isDevelopment = env.NODE_ENV === 'development';

const server: FastifyInstance = fastify({
  logger: isDevelopment ? {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
  } : true,
});
 
async function runServer(): Promise<void> {
  try {
    
    await server.register(cors, {
      origin: isDevelopment 
        ? true 
        : (origin, callback) => {
          
          const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'), false);
          }
        },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
    });

    
    await server.register(helmet, {
      contentSecurityPolicy: isDevelopment ? false : undefined,
    });

    
    await server.register(rateLimit, {
      max: isDevelopment ? 1000 : 100, 
      timeWindow: '1 minute',
      errorResponseBuilder: () => ({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded, please try again later.',
      }),
    });

    
    await server.register(clerkPlugin, {
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
      secretKey: env.CLERK_SECRET_KEY,
    });

    
    server.addHook("onRequest", authMiddleware);

    
    await server.register(health, { prefix: "/health" });
    await server.register(chatRoutes, { prefix: "/api/chat" });
    await server.register(memoryRoutes, { prefix: "/api/memories" });
    await server.register(preferencesRoutes, { prefix: "/api/preferences" });
    await server.register(statsRoutes, { prefix: "/api/stats" });
    await server.register(exportRoutes, { prefix: "/api/export" });


    
    server.setErrorHandler((error: any, request, reply) => {
      server.log.error(error);

      if (error instanceof AppError ) {
        return reply.code(error.statusCode).send({
          error: error.message,
        });
      }

      return reply.code(500).send({
        error: isDevelopment ? error?.message : 'Internal Server Error',
        ...(isDevelopment && { stack: error }),
      });
    });

    
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        server.log.info(`${signal} received, shutting down gracefully...`);
        await server.close();
        process.exit(0);
      });
    });

    
    const port = Number(env.PORT) || 3001;
    const host = '0.0.0.0';
    
    await server.listen({ port, host });
    server.log.info(`Server running on http://${host}:${port}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

runServer();
