// AI Service Configuration
import { aiService } from "./aiService"; // Google Gemini
import { openaiService } from "./openaiService"; // OpenAI GPT
import { claudeService } from "./claudeService"; // Anthropic Claude

export type AIProvider = "gemini" | "openai" | "claude";

const DEV = import.meta.env.DEV;
// Configure which AI service to use
const AI_PROVIDER: AIProvider =
  (import.meta.env.VITE_AI_PROVIDER as AIProvider) || "gemini";

// Unified AI interface
export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// Get the active AI service based on configuration
const getAIService = () => {
  switch (AI_PROVIDER) {
    case "openai":
      return openaiService;
    case "claude":
      return claudeService;
    case "gemini":
    default:
      return aiService;
  }
};

// Unified AI service that delegates to the configured provider
export const unifiedAIService = {
  async generateResponse(
    prompt: string,
    context?: string
  ): Promise<AIResponse> {
    const service = getAIService();
    try {
      const res = await service.generateResponse(prompt, context);
      if (res && res.success && res.data) return res;
      return {
        success: true,
        data: `I couldn't reach the configured AI right now, but here are some self-help tips:\n\n• Clarify the core concept you're stuck on.\n• List any formulas / definitions you already know.\n• Try a tiny example manually, then generalize.\n\n(Provide a valid API key to enable full intelligent answers.)`,
      };
    } catch {
      return {
        success: true,
        data: `Temporary AI connectivity issue. Rephrase or add detail. Configure an API key for richer answers.`,
      };
    }
  },

  async summarizeText(text: string): Promise<AIResponse> {
    const service = getAIService();
    return service.summarizeText(text);
  },

  async extractConcepts(text: string): Promise<AIResponse> {
    const service = getAIService();
    return service.extractConcepts(text);
  },

  async generateFlashcards(text: string): Promise<AIResponse> {
    const service = getAIService();
    return service.generateFlashcards(text);
  },

  async explainConcept(concept: string, context?: string): Promise<AIResponse> {
    const service = getAIService();
    return service.explainConcept(concept, context);
  },

  // OCR is only available with Google Vision API
  async extractTextFromImage(imageBase64: string): Promise<AIResponse> {
    return aiService.extractTextFromImage(imageBase64);
  },

  // Get current provider info
  getCurrentProvider(): AIProvider {
    return AI_PROVIDER;
  },

  // Check if AI is configured enough to provide real answers
  // In production builds, we assume serverless proxies are available and return true
  // In local dev, require provider-specific VITE_* key for direct fallback
  isConfigured(): boolean {
    if (!DEV) return true; // production build => use proxies

    const geminiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;

    switch (AI_PROVIDER) {
      case "openai":
        return !!openaiKey;
      case "claude":
        return !!claudeKey;
      case "gemini":
      default:
        return !!geminiKey;
    }
  },
};
