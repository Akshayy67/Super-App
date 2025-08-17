// AI Service Configuration
import { aiService } from './aiService'; // Google Gemini
import { openaiService } from './openaiService'; // OpenAI GPT
import { claudeService } from './claudeService'; // Anthropic Claude

export type AIProvider = 'gemini' | 'openai' | 'claude';

// Configure which AI service to use
const AI_PROVIDER: AIProvider = (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 'gemini';

// Unified AI interface
export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// Get the active AI service based on configuration
const getAIService = () => {
  switch (AI_PROVIDER) {
    case 'openai':
      return openaiService;
    case 'claude':
      return claudeService;
    case 'gemini':
    default:
      return aiService;
  }
};

// Unified AI service that delegates to the configured provider
export const unifiedAIService = {
  async generateResponse(prompt: string, context?: string): Promise<AIResponse> {
    const service = getAIService();
    return service.generateResponse(prompt, context);
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

  // Check if API key is configured
  isConfigured(): boolean {
    const geminiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;

    switch (AI_PROVIDER) {
      case 'openai':
        return !!openaiKey;
      case 'claude':
        return !!claudeKey;
      case 'gemini':
      default:
        return !!geminiKey;
    }
  }
};
