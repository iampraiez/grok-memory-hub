import OpenAI from "openai";

export const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const model = "x-ai/grok-4.1-fast:free";
