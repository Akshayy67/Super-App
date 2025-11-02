// AI service for Google Gemini API
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || "";

// Debug: Log the API key being used with more details
console.log("🔑 API Key Status:", {
  hasKey: !!API_KEY,
  keyPrefix: API_KEY ? `${API_KEY.substring(0, 20)}...` : "NOT FOUND",
  keyLength: API_KEY?.length || 0,
  envVarExists: !!import.meta.env.VITE_GOOGLE_AI_API_KEY,
  envVarLength: import.meta.env.VITE_GOOGLE_AI_API_KEY?.length || 0,
  mode: import.meta.env.MODE,
});

// Warn if using old suspended key
if (API_KEY && API_KEY.startsWith("AIzaSyBAFT_Q2U-KuyKZm")) {
  console.error(
    "⚠️ WARNING: You are using the OLD SUSPENDED API key!",
    "\nPlease update your .env file with a new API key and restart the server.",
    "\nCurrent key prefix:", API_KEY.substring(0, 20)
  );
}

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
        // Handle 403 Forbidden specifically
        if (response.status === 403) {
          const errorMessage = result.error?.message || response.statusText;
          console.error("🔴 403 Forbidden Error (Image Generation):", {
            status: response.status,
            error: result.error,
          });
          return {
            success: false,
            error: `Access forbidden. ${errorMessage}. Please check: 1) API key is valid, 2) Generative Language API is enabled, 3) API key restrictions allow your domain/IP, 4) Billing is enabled.`,
          };
        }
        return {
          success: false,
          error: `Image generation failed (${response.status}): ${
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
        // Handle 403 Forbidden specifically
        if (response.status === 403) {
          const errorMessage = result.error?.message || response.statusText;
          console.error("🔴 403 Forbidden Error (Image Analysis):", {
            status: response.status,
            error: result.error,
          });
          return {
            success: false,
            error: `Access forbidden. ${errorMessage}. Please check: 1) API key is valid, 2) Generative Language API is enabled, 3) API key restrictions allow your domain/IP, 4) Billing is enabled.`,
          };
        }
        return {
          success: false,
          error: `Image analysis failed (${response.status}): ${
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

            // Handle 403 Forbidden errors specifically
            if (response.status === 403) {
              const errorMessage = apiResult.error?.message || response.statusText;
              const errorCode = apiResult.error?.code || apiResult.error?.status || "UNKNOWN";
              const errorDetails = apiResult.error?.details || [];
              
              // Check for suspended consumer
              const isSuspended = errorDetails?.some((detail: any) => 
                detail["@type"]?.includes("ErrorInfo") && 
                detail.reason === "CONSUMER_SUSPENDED"
              ) || errorMessage?.toLowerCase().includes("suspended");
              
              // Log comprehensive error details
              console.error("🔴 403 Forbidden Error Details:", {
                status: response.status,
                statusText: response.statusText,
                errorCode: errorCode,
                errorMessage: errorMessage,
                isSuspended: isSuspended,
                fullError: apiResult.error,
                apiKeyPrefix: API_KEY ? `${API_KEY.substring(0, 10)}...` : "NOT SET",
                errorDetails: errorDetails,
              });
              
              // Log the full error message as a string for easier reading
              console.error("📋 Full Error Response:", JSON.stringify(apiResult, null, 2));
              
              // Handle suspended API key specifically
              if (isSuspended) {
                const suspendedMessage = `🚨 API Key Suspended\n\nYour API key has been suspended by Google. This typically happens when:\n\n• The API key was exposed publicly (e.g., in client-side code, GitHub, etc.)\n• Google detected security issues with the key\n• Terms of service violations\n• Billing issues with the associated project\n\n🔧 Solution:\n\n1. Go to Google Cloud Console: https://console.cloud.google.com/\n2. Navigate to "APIs & Services" > "Credentials"\n3. Delete the suspended API key (or check if it can be restored)\n4. Create a NEW API key\n5. Set appropriate restrictions:\n   - Application restrictions: "HTTP referrers" with your domains\n   - API restrictions: Select only "Generative Language API"\n6. Add the new key to your .env file as VITE_GOOGLE_AI_API_KEY\n7. NEVER commit API keys to version control (add .env to .gitignore)\n8. For production, consider using a backend proxy to hide your API key\n\n⚠️ Important: If this key is exposed in your code or repository, revoke it immediately for security.`;
                
                console.error("⚠️ SECURITY WARNING: API key has been suspended. It may be exposed publicly!");
                
                return {
                  success: false,
                  error: suspendedMessage,
                };
              }
              
              // Provide specific error messages based on common 403 causes
              let userFriendlyMessage = "Access forbidden (403). ";
              
              // Check for specific Google API error codes and messages
              if (errorMessage?.toLowerCase().includes("api key") || 
                  errorMessage?.toLowerCase().includes("api_key") ||
                  errorMessage?.toLowerCase().includes("invalid api key")) {
                userFriendlyMessage += "❌ Invalid or restricted API key. ";
              } else if (errorMessage?.toLowerCase().includes("permission denied") ||
                         errorMessage?.toLowerCase().includes("access denied")) {
                userFriendlyMessage += "❌ Permission denied. Check API key restrictions. ";
              } else if (errorMessage?.toLowerCase().includes("billing") ||
                         errorMessage?.toLowerCase().includes("quota")) {
                userFriendlyMessage += "❌ Billing required or quota exceeded. ";
              } else if (errorMessage?.toLowerCase().includes("not enabled") ||
                         errorMessage?.toLowerCase().includes("api not enabled")) {
                userFriendlyMessage += "❌ Generative Language API not enabled. ";
              } else if (errorMessage?.toLowerCase().includes("restricted") ||
                         errorMessage?.toLowerCase().includes("http referrer")) {
                userFriendlyMessage += "❌ API key restrictions are blocking the request. ";
              }
              
              userFriendlyMessage += `\n\nError Code: ${errorCode}\nError Message: ${errorMessage || "No specific message"}\n\n💡 Troubleshooting Steps:\n1. Verify API key is valid in Google Cloud Console\n2. Enable "Generative Language API" in APIs & Services\n3. Check API key restrictions (HTTP referrer/IP restrictions)\n4. Ensure billing is enabled for your project\n5. Check if you've exceeded quota limits`;
              
              return {
                success: false,
                error: userFriendlyMessage,
              };
            }

            // Check if it's an API key issue (400)
            if (
              response.status === 400 &&
              (apiResult.error?.message?.includes("API key") ||
                apiResult.error?.message?.includes("invalid"))
            ) {
              return {
                success: false,
                error:
                  "Invalid API key. Please check your VITE_GOOGLE_AI_API_KEY configuration.",
              };
            }

            return {
              success: false,
              error: `API Error (${response.status}): ${
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
