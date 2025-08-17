// OpenAI Service Alternative
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

export interface OpenAIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export const openaiService = {
  async generateResponse(prompt: string, context?: string): Promise<OpenAIResponse> {
    try {
      const fullPrompt = context 
        ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a helpful answer based on the context provided.`
        : prompt;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      const result = await response.json();
      
      if (result.choices && result.choices[0] && result.choices[0].message) {
        return {
          success: true,
          data: result.choices[0].message.content
        };
      }

      return { success: false, error: 'No response generated' };
    } catch (error) {
      return { success: false, error: 'AI response generation failed' };
    }
  },

  async summarizeText(text: string): Promise<OpenAIResponse> {
    const prompt = `Please provide a concise summary of the following text, highlighting the main points and key concepts:\n\n${text}`;
    return this.generateResponse(prompt);
  },

  async extractConcepts(text: string): Promise<OpenAIResponse> {
    const prompt = `Extract the key concepts, terms, and important topics from the following text. Return them as a comma-separated list:\n\n${text}`;
    return this.generateResponse(prompt);
  },

  async generateFlashcards(text: string): Promise<OpenAIResponse> {
    const prompt = `Create flashcards from the following text. Format each flashcard as "Q: [question] | A: [answer]" with each flashcard on a new line:\n\n${text}`;
    return this.generateResponse(prompt);
  },

  async explainConcept(concept: string, context?: string): Promise<OpenAIResponse> {
    const prompt = `Explain the concept "${concept}" in simple, clear terms. ${context ? `Use this context: ${context}` : ''}`;
    return this.generateResponse(prompt);
  }
};
