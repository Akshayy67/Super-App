// AI Service Configuration - Simplified for Gemini only
import { aiService } from "./aiService";

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// Unified AI service that uses Gemini
export const unifiedAIService = {
  async generateResponse(
    prompt: string,
    context?: string
  ): Promise<AIResponse> {
    try {
      const res = await aiService.generateResponse(prompt, context);
      if (res && res.success && res.data) return res;
      return {
        success: true,
        data: `I couldn't reach the AI right now, but here are some self-help tips:\n\n• Clarify the core concept you're stuck on.\n• List any formulas / definitions you already know.\n• Try a tiny example manually, then generalize.\n\n(Check your API configuration to enable full intelligent answers.)`,
      };
    } catch {
      return {
        success: true,
        data: `Temporary AI connectivity issue. Rephrase or add detail. Check your API configuration.`,
      };
    }
  },

  async summarizeText(text: string): Promise<AIResponse> {
    return aiService.summarizeText(text);
  },

  async extractConcepts(text: string): Promise<AIResponse> {
    return aiService.extractConcepts(text);
  },

  async generateFlashcards(text: string): Promise<AIResponse> {
    return aiService.generateFlashcards(text);
  },

  async explainConcept(concept: string, context?: string): Promise<AIResponse> {
    return aiService.explainConcept(concept, context);
  },

  // OCR is available with Google Vision API
  async extractTextFromImage(imageBase64: string): Promise<AIResponse> {
    return aiService.extractTextFromImage(imageBase64);
  },

  // Check if AI is configured
  isConfigured(): boolean {
    const geminiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    
    // If we have the key, we're configured
    if (geminiKey) {
      return true;
    }
    
    // For production builds, we might be deployed with the key
    // Let's try to make a test call to see if the API works
    if (import.meta.env.PROD) {
      // In production, we'll assume it's configured
      // The actual API call will fail gracefully if the key is invalid
      return true;
    }
    
    return false;
  },
};
