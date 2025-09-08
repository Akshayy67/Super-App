// AI service for Google Gemini API
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || "";

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const aiService = {
  async extractTextFromImage(imageBase64: string): Promise<AIResponse> {
    const enabled = import.meta.env.VITE_ENABLE_SERVER_OCR === "true";
    if (!enabled) {
      return { success: false, error: "Server OCR disabled" };
    }
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

  async generateImage(prompt: string): Promise<AIResponse> {
    if (!API_KEY) {
      return {
        success: false,
        error:
          "API key not configured. Please set VITE_GOOGLE_AI_API_KEY in your environment variables.",
      };
    }

    try {
      // Use Gemini's image generation capabilities
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a detailed description for creating an image: ${prompt}. Provide a comprehensive visual description that could be used by an image generation AI.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: `Image generation failed: ${
            result.error?.message || response.statusText
          }`,
        };
      }

      if (
        result.candidates &&
        result.candidates[0] &&
        result.candidates[0].content
      ) {
        // For now, return the description. In a full implementation,
        // you would integrate with an actual image generation service
        return {
          success: true,
          data: result.candidates[0].content.parts[0].text,
        };
      }

      return { success: false, error: "No image description generated" };
    } catch (error) {
      return { success: false, error: "Image generation failed" };
    }
  },

  async analyzeImageContent(
    imageBase64: string,
    prompt?: string
  ): Promise<AIResponse> {
    if (!API_KEY) {
      return {
        success: false,
        error:
          "API key not configured. Please set VITE_GOOGLE_AI_API_KEY in your environment variables.",
      };
    }

    try {
      const analysisPrompt =
        prompt || "Analyze this image and describe what you see in detail.";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: analysisPrompt,
                  },
                  {
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: imageBase64.includes(",")
                        ? imageBase64.split(",")[1]
                        : imageBase64,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: `Image analysis failed: ${
            result.error?.message || response.statusText
          }`,
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

      return { success: false, error: "No analysis generated" };
    } catch (error) {
      return { success: false, error: "Image analysis failed" };
    }
  },

  async generateResponse(
    prompt: string,
    context?: string
  ): Promise<AIResponse> {
    if (!API_KEY) {
      return {
        success: false,
        error:
          "API key not configured. Please set VITE_GOOGLE_AI_API_KEY in your environment variables.",
      };
    }

    try {
      const fullPrompt = context
        ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a helpful answer based on the context provided.`
        : prompt;

      const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
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

      const result = await response.json();

      if (!response.ok) {
        // Check if it's an API key issue
        if (
          response.status === 400 &&
          result.error?.message?.includes("API key")
        ) {
          return {
            success: false,
            error:
              "Invalid API key. Please check your VITE_GOOGLE_AI_API_KEY configuration.",
          };
        }

        return {
          success: false,
          error: `API Error: ${result.error?.message || response.statusText}`,
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
    const prompt = `Create concise study flashcards from the following text. For each card, include a short, clear question, a direct answer, and a brief reasoning/explanation that justifies the answer. Use EXACTLY this format per line: \nQ: [question] | A: [answer] | R: [reasoning]\nReturn multiple lines (one per card) and nothing else.\n\nText:\n${text}`;
    return this.generateResponse(prompt);
  },

  async explainConcept(concept: string, context?: string): Promise<AIResponse> {
    const prompt = `Explain the concept "${concept}" in simple, clear terms. ${
      context ? `Use this context: ${context}` : ""
    }`;
    return this.generateResponse(prompt);
  },
};
