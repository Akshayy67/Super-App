// AI service for Google Gemini API
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || "";

// Debug: Log the API key being used
console.log(
  "🔑 API Key loaded:",
  API_KEY ? `${API_KEY.substring(0, 20)}...` : "NOT FOUND"
);

// Rate limiting and caching configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 5, // Very conservative limit to avoid 429 errors
  requestQueue: [] as Array<{
    timestamp: number;
    resolve: Function;
    reject: Function;
  }>,
  isProcessing: false,
};

// Request caching and deduplication
const REQUEST_CACHE = new Map<
  string,
  {
    result: any;
    timestamp: number;
    ttl: number;
  }
>();

const PENDING_REQUESTS = new Map<string, Promise<any>>();

const CACHE_TTL = {
  AI_ANALYSIS: 5 * 60 * 1000, // 5 minutes for AI analysis
  GENERAL: 2 * 60 * 1000, // 2 minutes for general requests
};

// Rate limiting helper
const rateLimitedRequest = async <T>(
  requestFn: () => Promise<T>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    RATE_LIMIT_CONFIG.requestQueue.push({
      timestamp: Date.now(),
      resolve: (result: T) => resolve(result),
      reject,
    });
    processRequestQueue();
  });
};

const processRequestQueue = async () => {
  if (
    RATE_LIMIT_CONFIG.isProcessing ||
    RATE_LIMIT_CONFIG.requestQueue.length === 0
  ) {
    return;
  }

  RATE_LIMIT_CONFIG.isProcessing = true;

  while (RATE_LIMIT_CONFIG.requestQueue.length > 0) {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old requests from tracking
    RATE_LIMIT_CONFIG.requestQueue.splice(
      0,
      RATE_LIMIT_CONFIG.requestQueue.findIndex(
        (req) => req.timestamp > oneMinuteAgo
      )
    );

    // Check if we can make a request
    const recentRequests = RATE_LIMIT_CONFIG.requestQueue.filter(
      (req) => req.timestamp > oneMinuteAgo
    );

    if (recentRequests.length >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
      // Wait until we can make another request
      const oldestRequest = recentRequests[0];
      const waitTime = 60000 - (now - oldestRequest.timestamp) + 1000; // Add 1s buffer
      console.log(
        `⏳ Rate limit reached, waiting ${Math.round(
          waitTime / 1000
        )}s before next request`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      continue;
    }

    // Process the next request
    const request = RATE_LIMIT_CONFIG.requestQueue.shift();
    if (request) {
      try {
        // This is a placeholder - actual request will be made by the calling function
        request.resolve(null);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  RATE_LIMIT_CONFIG.isProcessing = false;
};

// Retry logic for API calls
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      const isRateLimited =
        error.status === 429 ||
        (error.message && error.message.includes("429")) ||
        (error.message && error.message.includes("Too Many Requests"));

      if (isRateLimited && attempt < maxRetries) {
        const delay =
          baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000; // Exponential backoff with jitter
        console.log(
          `⏳ Rate limited (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(
            delay / 1000
          )}s...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts`);
};

// Cache management functions
const getCacheKey = (prompt: string, context?: string): string => {
  return btoa(prompt + (context || "")).slice(0, 50); // Base64 encode and truncate
};

const getCachedResult = (cacheKey: string): any | null => {
  const cached = REQUEST_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log("🎯 Using cached AI response");
    return cached.result;
  }
  if (cached) {
    REQUEST_CACHE.delete(cacheKey); // Remove expired cache
  }
  return null;
};

const setCachedResult = (cacheKey: string, result: any, ttl: number): void => {
  REQUEST_CACHE.set(cacheKey, {
    result,
    timestamp: Date.now(),
    ttl,
  });

  // Clean up old cache entries periodically
  if (REQUEST_CACHE.size > 100) {
    const now = Date.now();
    for (const [key, value] of REQUEST_CACHE.entries()) {
      if (now - value.timestamp > value.ttl) {
        REQUEST_CACHE.delete(key);
      }
    }
  }
};

// Request deduplication
const deduplicateRequest = async <T>(
  cacheKey: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  // Check if the same request is already pending
  if (PENDING_REQUESTS.has(cacheKey)) {
    console.log("⏳ Deduplicating concurrent request");
    return PENDING_REQUESTS.get(cacheKey) as Promise<T>;
  }

  // Create new request and track it
  const requestPromise = requestFn().finally(() => {
    PENDING_REQUESTS.delete(cacheKey);
  });

  PENDING_REQUESTS.set(cacheKey, requestPromise);
  return requestPromise;
};

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
    context?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIResponse> {
    if (!API_KEY) {
      return {
        success: false,
        error:
          "API key not configured. Please set VITE_GOOGLE_AI_API_KEY in your environment variables.",
      };
    }

    try {
      let fullPrompt = prompt;

      // Build conversation context if provided
      if (conversationHistory && conversationHistory.length > 0) {
        const conversationContext = conversationHistory
          .map(
            (msg) =>
              `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
          )
          .join("\n\n");

        fullPrompt = `Previous conversation:\n${conversationContext}\n\nCurrent message: ${prompt}\n\nPlease respond naturally, taking into account the conversation history. If the user refers to "that", "above", "earlier", "previous", etc., use the conversation context to understand what they're referring to.`;
      }

      // Add file context if provided
      if (context) {
        fullPrompt = `File context: ${context}\n\n${fullPrompt}`;
      }

      // Check cache first
      const cacheKey = getCacheKey(fullPrompt, context);
      const cachedResult = getCachedResult(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Use deduplication for concurrent requests
      return await deduplicateRequest(cacheKey, async () => {
        const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

        // Build conversation context if provided
        if (conversationHistory && conversationHistory.length > 0) {
          const conversationContext = conversationHistory
            .map(
              (msg) =>
                `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
            )
            .join("\n\n");

          fullPrompt = `Previous conversation:\n${conversationContext}\n\nCurrent message: ${prompt}\n\nPlease respond naturally, taking into account the conversation history. If the user refers to "that", "above", "earlier", "previous", etc., use the conversation context to understand what they're referring to.`;
        }

        // Add file context if provided
        if (context) {
          fullPrompt = `File context: ${context}\n\n${fullPrompt}`;
        }

        // Use retry logic with rate limiting for the API call
        const result = await retryRequest(async () => {
          console.log("🤖 Making Gemini API request...");

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

          const apiResult = await response.json();

          if (!response.ok) {
            // Check if it's a rate limit error
            if (response.status === 429) {
              const error = new Error(
                `Rate limited: ${
                  apiResult.error?.message || response.statusText
                }`
              );
              (error as any).status = 429;
              throw error;
            }

            // Check if it's an API key issue
            if (
              response.status === 400 &&
              apiResult.error?.message?.includes("API key")
            ) {
              return {
                success: false,
                error:
                  "Invalid API key. Please check your VITE_GOOGLE_AI_API_KEY configuration.",
              };
            }

            return {
              success: false,
              error: `API Error: ${
                apiResult.error?.message || response.statusText
              }`,
            };
          }

          return apiResult;
        });

        // Handle the successful result
        if (typeof result === "object" && result.success === false) {
          return result; // Return error response from retry logic
        }

        if (
          result.candidates &&
          result.candidates[0] &&
          result.candidates[0].content
        ) {
          const response = {
            success: true,
            data: result.candidates[0].content.parts[0].text,
          };

          // Cache successful response
          setCachedResult(cacheKey, response, CACHE_TTL.AI_ANALYSIS);
          return response;
        }

        const errorResponse = {
          success: false,
          error: "No response generated",
        };
        return errorResponse;
      });
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
