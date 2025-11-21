import { clerkClient, getAuth } from "@clerk/fastify";
import { FastifyRequest, FastifyReply } from "fastify";

// also check if user is in db except login and register
async function authMiddleware(req: FastifyRequest | any, res: FastifyReply) {
  try {
    const url = req.url;
    if (
      url?.startsWith("/api/health") ||
      url?.startsWith("/api/auth/public") ||
      url?.startsWith("/api/auth/logout")
    ) {
      return;
    }
    // const { userId, isAuthenticated } = await getAuth(req);
    // if (!userId || !isAuthenticated) {
    //   return res.code(401).send({
    //     data: null,
    //     error: {
    //       message: "Unauthorized",
    //     },
    //   });
    // }
    // const user = await clerkClient.users.getUser(userId);
    req.user = {
      id: "clerk-dummy-id",
      username: "clerk-dummy-username",
      emailAddresses: [
        {
          emailAddress: "clerk-dummy-email",
          id: "clerk-dummy-email-id",
          verification: {
            status: "verified",
          },
        },
      ],
      imageUrl:
        "https://imgs.search.brave.com/kQTs3hGQ3RKHBm8A5eIGgZeRhiNaWkvtPTDjTMdp49o/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9waWNz/LmNyYWl5b24uY29t/LzIwMjQtMDktMDcv/UndPOWZrLTNTc3Fv/M0VZTHhLdXYyQS53/ZWJw",
    };
    return;
  } catch (error) {
    return res.code(401).send({
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
    });
  }
}

export default authMiddleware;
