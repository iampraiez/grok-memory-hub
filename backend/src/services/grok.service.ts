import { OpenAI } from "openai";
import { client, model } from "../lib/openai.js";
import { titlePrompt, systemPrompt as prompt } from "../data/prompt.js";
import { ragService } from "./rag.service.js";

export class GrokService {
  private client: OpenAI = client;

  async stream(userId: string, messages: Array<{ role: "system" | "user" | "assistant"; content: string }>, searchQuery?: string, personalizedPrompt?: string) {
    const lastMessage = messages[messages.length - 1];
    
    
    let enrichedSystemPrompt = await ragService.enrichPrompt(userId, lastMessage.content, undefined, searchQuery);
    
    if (personalizedPrompt) {
      enrichedSystemPrompt += personalizedPrompt;
    }
    
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: enrichedSystemPrompt },
        ...messages.slice(0, -1), 
        { role: "user", content: lastMessage.content } 
      ],
      stream: true,
    });

    return completion;
  }

  async response(
    userId: string,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
  ) {
    
     const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage.role === "user") {
      const systemMessageIndex = messages.findIndex((m) => m.role === "system");
      let systemPrompt = prompt
            
      if (systemMessageIndex !== -1) {
        systemPrompt = messages[systemMessageIndex].content;
      }

      const enrichedPrompt = await ragService.enrichPrompt(userId, lastUserMessage.content, systemPrompt);

      if (systemMessageIndex !== -1) {
        messages[systemMessageIndex].content = enrichedPrompt;
      } else {
        messages.unshift({ role: "system", content: enrichedPrompt });
      }
    }

    return this.client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    });
  }

  async generateTitle(context: string) {
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: titlePrompt,
        },
        {
          role: "user",
          content: `Summarize this chat in a title: ${context.slice(0, 4000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 20,
    });
    return completion.choices[0]?.message?.content?.trim() || "New Chat";
  }
}
