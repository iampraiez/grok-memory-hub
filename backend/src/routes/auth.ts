import prisma from "../lib/prisma.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

import type { ClerkUser } from "../types/index.js";

async function authRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/me",
    async (request: FastifyRequest | any, reply: FastifyReply) => {
      const userId = request.user.id as string;

      let user;
      try {
        user = await prisma.user.findUnique({
          where: { clerkId: userId },
          include: { conversations: true },
        });
      } catch (err) {
        fastify.log.error(`[auth] DB error: ${err}`);
        return reply.code(500).send({
          data: null,
          error: {
            message: err instanceof Error ? err.message : "Database error",
          },
        });
      }

      return reply.code(200).send({
        data: user,
        error: null,
      });
    }
  );

  fastify.get(
    "/logout",
    async (request: FastifyRequest | any, reply: FastifyReply) => {
      request.user = null;
      return reply.code(200).send({
        data: null,
        error: null,
      });
    }
  );

  fastify.post(
    "/register",
    async (request: FastifyRequest | any, reply: FastifyReply) => {
      const user = request.user as ClerkUser;

      let existingUser;
      try {
        existingUser = await prisma.user.findUnique({
          where: { clerkId: user.id },
        });
      } catch (err) {
        fastify.log.error(`[auth] DB error: ${err}`);
        return reply.code(500).send({
          data: null,
          error: {
            message: err instanceof Error ? err.message : "Database error",
          },
        });
      }

      if (existingUser) {
        return reply.code(400).send({
          data: null,
          error: { message: "User already exists" },
        });
      }

      let newUser;
      try {
        newUser = await prisma.user.create({
          data: {
            clerkId: user.id,
            username: user.username || "",
            email: user.emailAddresses[0]?.emailAddress || "",
            imageUrl: user.imageUrl || "",
          },
        });
      } catch (err) {
        fastify.log.error(`[auth] DB error on create: ${err}`);
        return reply.code(500).send({
          data: null,
          error: {
            message: err instanceof Error ? err.message : "Database error",
          },
        });
      }

      return reply.code(201).send({
        data: {
          message: "User registered successfully",
          user: newUser,
        },
        error: null,
      });
    }
  );

  fastify.post(
    "/login",
    async (request: FastifyRequest | any, reply: FastifyReply) => {
      const user = request.user as ClerkUser;

      let existingUser;
      try {
        existingUser = await prisma.user.findUnique({
          where: { clerkId: user.id },
        });
      } catch (err) {
        fastify.log.error(`[auth] DB error${err}`);
        return reply.code(500).send({
          data: null,
          error: {
            message: err instanceof Error ? err.message : "Database error",
          },
        });
      }

      if (!existingUser) {
        return reply.code(400).send({
          data: null,
          error: { message: "User does not exist" },
        });
      }

      if (
        existingUser.username !== user.username ||
        existingUser.email !== user.emailAddresses[0]?.emailAddress ||
        existingUser.imageUrl !== user.imageUrl
      ) {
        const updatedUser = await prisma.user.update({
          where: { clerkId: user.id },
          data: {
            username: user.username || existingUser.username,
            email: user.emailAddresses[0]?.emailAddress || existingUser.email,
            imageUrl: user.imageUrl || existingUser.imageUrl,
          },
        });
        existingUser = updatedUser;
      }

      return reply.code(200).send({
        data: {
          message: "User logged in successfully",
          user: existingUser,
        },
        error: null,
      });
    }
  );
}

export default authRoutes;
