import { OpenAI } from "openai";
import { client, model } from "../lib/openai";
import { titlePrompt } from "../data/prompt";

export class GrokService {
  private client: OpenAI = client;

  async stream(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
  ) {
    return this.client.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: 0.7,
    });
  }

  async response(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
  ) {
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
