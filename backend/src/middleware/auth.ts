import { clerkClient, getAuth } from "@clerk/fastify";
import { FastifyRequest, FastifyReply } from "fastify";

async function authMiddleware(req: FastifyRequest | any, res: FastifyReply) {
  try {
    const { userId, isAuthenticated } = await getAuth(req);
    if (!userId || !isAuthenticated) {
      return res.status(401).send({
        data: null,
        error: {
          message: "Unauthorized",
        },
      });
    }
    const user = await clerkClient.users.getUser(userId);
    req.user = user;
    return;
  } catch (error) {
    console.error("[auth] error", error);
    return res.status(401).send({
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
    });
  }
}

export default authMiddleware;
