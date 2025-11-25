import { createRequire } from "module";
import { prisma } from "../lib/prisma.js";
import { getAuth } from "@clerk/fastify";
import { memoryService } from "../services/memory.service.js";
import { searchService } from "../services/search.service.js";
import { GrokService } from "../services/grok.service.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");


export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post("/", async (request: FastifyRequest | any, reply: FastifyReply) => {
    const userId = request.user?.id 
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const { messages, conversationId, attachments } = request.body as {
      messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
      conversationId?: string;
      attachments?: Array<{ name: string; type: string; data: string }>;
    };

    let convoId = conversationId;

    try {
      if (!convoId) {
        
        const emptyConvo = await prisma.conversation.findFirst({
          where: {
            userId,
            messages: { none: {} },
          },
          orderBy: { createdAt: "desc" },
        });

        if (emptyConvo) {
          convoId = emptyConvo.id;
        } else {
          const convo = await prisma.conversation.create({
            data: {
              userId,
              title: "New Chat",
            },
          });
          convoId = convo.id;
        }
      }

      
      let processedContent: any = messages[messages.length - 1].content;
      let attachmentText = "";

      if (attachments && attachments.length > 0) {
        const images = attachments.filter(a => a.type.startsWith("image/"));
        const docs = attachments.filter(a => !a.type.startsWith("image/"));

        
        for (const doc of docs) {
          if (doc.type === "application/pdf") {
            try {
              const buffer = Buffer.from(doc.data.split(",")[1], "base64");
              const data = await pdf(buffer);
              attachmentText += `\n\n[Attached PDF "${doc.name}":\n${data.text.slice(0, 10000)}...]\n`;
            } catch (e) {
              request.log.error({ msg: "Failed to parse PDF", err: e });
              attachmentText += `\n\n[Failed to parse PDF "${doc.name}"]\n`;
            }
          } else if (doc.type.startsWith("text/")) {
             const text = Buffer.from(doc.data.split(",")[1], "base64").toString("utf-8");
             attachmentText += `\n\n[Attached File "${doc.name}":\n${text.slice(0, 10000)}...]\n`;
          }
        }

        
        if (attachmentText) {
          processedContent += attachmentText;
        }

        
        if (images.length > 0) {
          
          processedContent = [
            { type: "text", text: processedContent },
            ...images.map(img => ({
              type: "image_url",
              image_url: {
                url: img.data, 
              },
            })),
          ];
        }
      }

      
      
      const processedMessages = [...messages];
      processedMessages[processedMessages.length - 1] = {
        ...processedMessages[processedMessages.length - 1],
        content: processedContent
      };

      
      const lastMessage = messages[messages.length - 1];
      const dbContent = typeof processedContent === 'string' 
        ? processedContent 
        : (lastMessage.content + attachmentText + (attachments?.some(a => a.type.startsWith('image/')) ? " [Attached Images]" : ""));

      
      await prisma.message.create({
        data: {
          id: (request.body as any).messageId, 
          conversationId: convoId!,
          role: "user",
          content: typeof processedContent === 'string' ? processedContent : lastMessage.content,
        },
      });

      
      memoryService.createMemory(userId, dbContent, convoId).catch(err => {
        request.log.error({ msg: "Failed to auto-save memory", err });
      });

      
      reply.raw.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
      reply.raw.setHeader("Access-Control-Allow-Credentials", "true");  
      reply.raw.setHeader("Content-Type", "text/event-stream");
      reply.raw.setHeader("Cache-Control", "no-cache");
      reply.raw.setHeader("Connection", "keep-alive");
      reply.raw.setHeader("X-Accel-Buffering", "no"); 
      
      
      reply.raw.flushHeaders();

      
      if (!conversationId) {
        reply.raw.write(`data: ${JSON.stringify({ conversationId: convoId })}\n\n`);
      }

      
      let memorySearchQuery: string | undefined;
      const textContent = typeof processedContent === 'string' ? processedContent : lastMessage.content;
      const memoryMatch = textContent.match(/@memory\s+(.+)/i);
      if (memoryMatch) {
        memorySearchQuery = memoryMatch[1].trim();
      }

      
      let webSearchQuery: string | undefined;
      const searchMatch = textContent.match(/@search\s+(.+)/i);
      if (searchMatch) {
        webSearchQuery = searchMatch[1].trim();
      } else if (searchService.shouldTriggerSearch(textContent)) {
        webSearchQuery = textContent;
      }

      
      const prefs = await prisma.userPreference.findUnique({
        where: { userId },
      });

      
      let personalizedPrompt = "";
      if (prefs) {
        const hasPersonalization = prefs.nickname || prefs.occupation || (prefs.style && prefs.style !== "Default") || prefs.customInstructions || prefs.moreInfo;
        
        if (hasPersonalization) {
          personalizedPrompt += `\n\n## User Personalization\n`;
          if (prefs.nickname) personalizedPrompt += `- **User's Name**: ${prefs.nickname}\n`;
          if (prefs.occupation) personalizedPrompt += `- **Occupation**: ${prefs.occupation}\n`;
          if (prefs.style && prefs.style !== "Default") personalizedPrompt += `- **Response Style**: ${prefs.style}\n`;
          if (prefs.customInstructions) personalizedPrompt += `- **Custom Instructions**: ${prefs.customInstructions}\n`;
          if (prefs.moreInfo) personalizedPrompt += `- **More Info**: ${prefs.moreInfo}\n`;
          
          personalizedPrompt += `\nADAPT YOUR RESPONSE ACCORDINGLY.`;
        }
      }

      
      const { deepThinking } = request.body as { deepThinking?: boolean };
      if (deepThinking) {
        personalizedPrompt += `\n\n## DEEP THINKING MODE ENABLED
You are in Deep Thinking mode. Before answering the user's request, you MUST output your detailed chain of thought inside <thinking> tags.
1. Analyze the user's request carefully.
2. Break down the problem into steps.
3. Consider multiple perspectives or edge cases.
4. Verify your reasoning.
5. Finally, provide your response outside the <thinking> tags.

Example format:
<thinking>
[Your internal monologue and reasoning process here]
</thinking>
[Your final helpful response here]`;
      }

      
      let webSearchContext = "";
      const { webSearch } = request.body as { webSearch?: boolean };
      
      if (webSearch || webSearchQuery) {
        const queryToUse = webSearchQuery || textContent;
        try {
          const searchResults = await searchService.searchWeb(queryToUse);
          webSearchContext = searchService.formatSearchResults(searchResults);
          fastify.log.info({ query: queryToUse, resultsCount: searchResults.length }, "Web search performed");
        } catch (error) {
          fastify.log.error({ error, query: queryToUse }, "Web search failed");
        }
      }

      
      

      
      reply.raw.write(`data: ${JSON.stringify({ conversationId: convoId })}\n\n`);

      
      const grok = new GrokService();
      
      
      let enrichedPrompt = personalizedPrompt;
      if (webSearchContext) {
        enrichedPrompt += webSearchContext;
      }
      
      const completion = await grok.stream(userId, processedMessages, memorySearchQuery, enrichedPrompt);
      let fullResponse = "";
      
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          reply.raw.write(`data: ${JSON.stringify({ content })}\n\n`);
          
        }
      }

      
      await prisma.message.create({
        data: {
          conversationId: convoId!,
          role: "assistant",
          content: fullResponse,
        },
      });
      
      
      memoryService.createMemory(userId, fullResponse, convoId).catch((err) => {
        request.log.error({ msg: "Failed to auto-save assistant memory", err });
      });

      
      
      if (messages.length <= 1) {
        try {
          const title = await grok.generateTitle(lastMessage.content);
          await prisma.conversation.update({
            where: { id: convoId },
            data: { title },
          });
          reply.raw.write(`data: ${JSON.stringify({ title })}\n\n`);
        } catch (error) {
          request.log.error({ msg: "Failed to generate title", error });
        }
      }
      
      reply.raw.write("data: [DONE]\n\n");
      reply.raw.end();
    } catch (error: any) {
      request.log.error(error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      let statusCode = 500;

      
      if (error.status === 429 || error.code === 'rate_limit_exceeded') {
        errorMessage = "You're sending messages too quickly. Please wait a moment.";
        statusCode = 429;
      } else if (error.code === 'context_length_exceeded') {
        errorMessage = "The conversation is too long. Please start a new chat.";
        statusCode = 400;
      } else if (error.message) {
         
         
         
         errorMessage = error.message; 
      }

      
      if (!reply.raw.headersSent) {
        reply.type('application/json').code(statusCode).send({ error: errorMessage });
      } else {
        
        
        reply.raw.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
        reply.raw.end();
      }
    }
  });

  fastify.get("/conversations", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true }
        }
      }
    });

    return conversations;
  });

  fastify.get("/conversations/:id", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });
    const { id } = request.params as { id: string };
    const { cursor, limit = 100 } = request.query as { cursor?: string; limit?: number }; 

    const conversation = await prisma.conversation.findUnique({
      where: { id, userId },
    });

    if (!conversation) return reply.code(404).send({ error: "Not found" });

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      take: Number(limit),
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const nextCursor = messages.length === Number(limit) ? messages[messages.length - 1].id : undefined;

    return {
      ...conversation,
      messages: messages.reverse(),
      nextCursor,
    };
  });

  
  fastify.post("/conversations", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });

    
    const emptyConvo = await prisma.conversation.findFirst({
      where: {
        userId,
        messages: { none: {} },
      },
      orderBy: { createdAt: "desc" },
    });

    if (emptyConvo) {
      return { id: emptyConvo.id };
    }

    
    const convo = await prisma.conversation.create({
      data: {
        userId,
        title: "New Chat",
      },
    });

    return { id: convo.id };
  });

  
  fastify.patch("/conversations/:id", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });
    const { id } = request.params as { id: string };
    const { title } = request.body as { title?: string };

    if (!title) {
      return reply.code(400).send({ error: "Title is required" });
    }

    try {
      const updated = await prisma.conversation.update({
        where: { id, userId },
        data: { title },
      });
      return updated;
    } catch (error) {
      return reply.code(404).send({ error: "Conversation not found" });
    }
  });

  fastify.delete("/conversations/:id", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });
    const { id } = request.params as { id: string };

    await prisma.conversation.delete({
      where: { id, userId },
    });

    return { success: true };
  });

  
  fastify.delete("/conversations/:id/messages/:messageId", async (request, reply) => {
    const userId = request.user?.id || getAuth(request).userId;
    if (!userId) return reply.code(401).send({ error: "Unauthorized" });
    const { id, messageId } = request.params as { id: string; messageId: string };

    
    const conversation = await prisma.conversation.findUnique({
      where: { id, userId },
    });

    if (!conversation) return reply.code(404).send({ error: "Conversation not found" });

    
    const targetMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!targetMessage || targetMessage.conversationId !== id) {
      return reply.code(404).send({ error: "Message not found" });
    }

    
    await prisma.message.deleteMany({
      where: {
        conversationId: id,
        createdAt: {
          gte: targetMessage.createdAt,
        },
      },
    });

    return { success: true };
  });
}
