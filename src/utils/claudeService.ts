// Anthropic Claude Service Alternative
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || "";

export interface ClaudeResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export const claudeService = {
  async generateResponse(prompt: string, context?: string): Promise<ClaudeResponse> {
    try {
      const fullPrompt = context 
        ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a helpful answer based on the context provided.`
        : prompt;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: fullPrompt
            }
          ]
        })
      });

      const result = await response.json();
      
      if (result.content && result.content[0] && result.content[0].text) {
        return {
          success: true,
          data: result.content[0].text
        };
      }

      return { success: false, error: 'No response generated' };
    } catch (error) {
      return { success: false, error: 'AI response generation failed' };
    }
  },

  async summarizeText(text: string): Promise<ClaudeResponse> {
    const prompt = `Please provide a concise summary of the following text, highlighting the main points and key concepts:\n\n${text}`;
    return this.generateResponse(prompt);
  },

  async extractConcepts(text: string): Promise<ClaudeResponse> {
    const prompt = `Extract the key concepts, terms, and important topics from the following text. Return them as a comma-separated list:\n\n${text}`;
    return this.generateResponse(prompt);
  },

  async generateFlashcards(text: string): Promise<ClaudeResponse> {
    const prompt = `Create flashcards from the following text. Format each flashcard as "Q: [question] | A: [answer]" with each flashcard on a new line:\n\n${text}`;
    return this.generateResponse(prompt);
  },

  async explainConcept(concept: string, context?: string): Promise<ClaudeResponse> {
    const prompt = `Explain the concept "${concept}" in simple, clear terms. ${context ? `Use this context: ${context}` : ''}`;
    return this.generateResponse(prompt);
  }
};
