import { memoryService } from "./memory.service";

export class RagService {
  async enrichPrompt(
    userId: string,
    userMessage: string,
    systemPrompt: string = "You are Grok, an advanced AI assistant with perfect memory. When providing explanations, steps, or lists, ALWAYS use Markdown formatting (e.g., **bold** for emphasis, numbered lists for steps, code blocks for code) to ensure clear and structured display.",
    searchQuery?: string
  ): Promise<string> {
    
    
    const query = searchQuery || userMessage;
    const limit = searchQuery ? 5 : 3; 
    
    
    
    const sortBy = searchQuery ? 'relevance' : 'recency';

    const context = await memoryService.getContext(userId, query, limit, sortBy);

    if (!context) {
      return systemPrompt;
    }

    
    return `${systemPrompt}

${searchQuery ? `## Relevant Context (searching for: "${searchQuery}")` : '## Background Context'}
${context}

Note: Use this context naturally when relevant, but don't force it into every response.`;
  }
}

export const ragService = new RagService();
