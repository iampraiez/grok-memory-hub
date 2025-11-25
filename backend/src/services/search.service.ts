import { tavily } from "@tavily/core";

interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export class SearchService {
  private client: ReturnType<typeof tavily>;

  constructor() {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error("TAVILY_API_KEY is not set");
    }
    this.client = tavily({ apiKey });
  }

  async searchWeb(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    try {
      const response = await this.client.search(query, {
        maxResults,
        searchDepth: "advanced",
        includeAnswer: true,
      });

      return response.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
      }));
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  formatSearchResults(results: SearchResult[]): string {
    if (results.length === 0) return "";

    let formatted = "\n\n## Web Search Results\n\n";
    formatted += "The following information was found from recent web sources:\n\n";

    results.forEach((result, index) => {
      formatted += `${index + 1}. **${result.title}**\n`;
      formatted += `   Source: ${result.url}\n`;
      formatted += `   ${result.content}\n\n`;
    });

    formatted += "\nIMPORTANT: You MUST cite these sources in your response using markdown links.\n";
    formatted += "Format citations as: According to [Source Name](URL), ...\n";

    return formatted;
  }

  shouldTriggerSearch(query: string): boolean {
    const searchTriggers = [
      /\b(latest|current|recent|today|now|this week|this month)\b/i,
      /\b(news|update|announcement)\b/i,
      /\bwhat (is|are) the (latest|current|recent)\b/i,
      /\b(stock|price|weather|forecast)\b/i,
      /\bwhen (did|was|is)\b/i,
      /\bhow many\b/i,
      /\bwho (is|are|was|were) the (current|latest)\b/i,
    ];

    return searchTriggers.some(pattern => pattern.test(query));
  }
}

export const searchService = new SearchService();
