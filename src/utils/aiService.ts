// AI Service for Google Cloud API integration
const API_KEY = ""; // Canvas environment will inject this

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const aiService = {
  async extractTextFromImage(imageBase64: string): Promise<AIResponse> {
    try {
      const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: imageBase64.split(',')[1] // Remove data:image/...;base64, prefix
            },
            features: [{
              type: 'TEXT_DETECTION',
              maxResults: 1
            }]
          }]
        })
      });

      const result = await response.json();
      
      if (result.responses && result.responses[0] && result.responses[0].textAnnotations) {
        return {
          success: true,
          data: result.responses[0].textAnnotations[0].description
        };
      }

      return { success: false, error: 'No text found in image' };
    } catch (error) {
      return { success: false, error: 'OCR processing failed' };
    }
  },

  async generateResponse(prompt: string, context?: string): Promise<AIResponse> {
    try {
      const fullPrompt = context 
        ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a helpful answer based on the context provided.`
        : prompt;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }]
        })
      });

      const result = await response.json();
      
      if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        return {
          success: true,
          data: result.candidates[0].content.parts[0].text
        };
      }

      return { success: false, error: 'No response generated' };
    } catch (error) {
      return { success: false, error: 'AI response generation failed' };
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
    const prompt = `Explain the concept "${concept}" in simple, clear terms. ${context ? `Use this context: ${context}` : ''}`;
    return this.generateResponse(prompt);
  }
};