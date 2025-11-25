import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { getAuth } from "@clerk/fastify";

export async function preferencesRoutes(fastify: FastifyInstance) {
  
  fastify.get("/", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const prefs = await prisma.userPreference.findUnique({
      where: { userId },
    });

    return prefs || {
      style: "Default",
      customInstructions: "",
      nickname: "",
      occupation: "",
      moreInfo: "",
    };
  });

  
  fastify.put("/", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { style, customInstructions, nickname, occupation, moreInfo } = request.body as {
      style?: string;
      customInstructions?: string;
      nickname?: string;
      occupation?: string;
      moreInfo?: string;
    };

    const prefs = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        style,
        customInstructions,
        nickname,
        occupation,
        moreInfo,
      },
      create: {
        userId,
        style: style || "Default",
        customInstructions,
        nickname,
        occupation,
        moreInfo,
      },
    });

    return prefs;
  });
}
