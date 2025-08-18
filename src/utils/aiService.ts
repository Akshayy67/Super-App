// AI service: prefer serverless proxy (/api/*). In local dev, if proxy 404s and a direct key is present, fallback to direct Gemini call.
const DEV = import.meta.env.DEV;
const DIRECT_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || "";

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const aiService = {
  async extractTextFromImage(imageBase64: string): Promise<AIResponse> {
    try {
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const result = await response.json();

      if (
        result.responses &&
        result.responses[0] &&
        result.responses[0].textAnnotations
      ) {
        return {
          success: true,
          data: result.responses[0].textAnnotations[0].description,
        };
      }

      return { success: false, error: "No text found in image" };
    } catch (error) {
      return { success: false, error: "OCR processing failed" };
    }
  },

  async generateResponse(
    prompt: string,
    context?: string
  ): Promise<AIResponse> {
    try {
      const fullPrompt = context
        ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a helpful answer based on the context provided.`
        : prompt;
      let response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      // Fallback: if local dev 404 and we have a direct key, call Gemini directly
      if (DEV && response.status === 404 && DIRECT_KEY) {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${DIRECT_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: fullPrompt,
                    },
                  ],
                },
              ],
            }),
          }
        );
      }

      const result = await response.json().catch(() => ({}));

      if (response.status === 404 && !DEV) {
        return {
          success: false,
          error:
            "AI endpoint missing (404). Ensure api/gemini.ts is deployed and not excluded from build, and Vercel functions config present in vercel.json.",
        };
      }

      if (
        result.candidates &&
        result.candidates[0] &&
        result.candidates[0].content
      ) {
        return {
          success: true,
          data: result.candidates[0].content.parts[0].text,
        };
      }

      return { success: false, error: "No response generated" };
    } catch (error) {
      return { success: false, error: "AI response generation failed" };
    }
  },

  async summarizeText(text: string): Promise<AIResponse> {
    const prompt = `Please provide a concise summary of the following text, highlighting the main points and key concepts:\n\n${text}`;
    return this.generateResponse(prompt);
  },

  async extractConcepts(text: string): Promise<AIResponse> {
    const prompt = `Extract the key concepts, terms, and important topics from the following text. Return them as a comma-separated list:\n\n${text}`;
    return this.generateResponse(prompt);
  },

  async generateFlashcards(text: string): Promise<AIResponse> {
    const prompt = `Create flashcards from the following text. Format each flashcard as "Q: [question] | A: [answer]" with each flashcard on a new line:\n\n${text}`;
    return this.generateResponse(prompt);
  },

  async explainConcept(concept: string, context?: string): Promise<AIResponse> {
    const prompt = `Explain the concept "${concept}" in simple, clear terms. ${
      context ? `Use this context: ${context}` : ""
    }`;
    return this.generateResponse(prompt);
  },
};
