import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader, Brain, FileText } from "lucide-react";
import { unifiedAIService } from "../utils/aiConfig";
import { driveStorageUtils } from "../utils/driveStorage";
import { AIStatus } from "./AIStatus";
import { extractTextFromPdfDataUrl } from "../utils/pdfText";

type ChatMessage = {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  context?: string;
};

interface AIChatProps {
  file?: any;
  fileContent?: string;
  initialPrompt?: string;
}
export const AIChat: React.FC<AIChatProps> = ({ file, fileContent, initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your AI study assistant. I can help you with questions about your uploaded documents, generate summaries, create flashcards, and explain complex concepts. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Removed cross-document access banner; no need to track other documents
  
  const [aiConfigured, setAiConfigured] = useState<boolean>(false);
  const [fileContextText, setFileContextText] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitialPromptRef = useRef<boolean>(false);

  

  useEffect(() => {
    // Check AI configuration status
    const checkAIConfig = () => {
      const configured = unifiedAIService.isConfigured();
      setAiConfigured(configured);
    };
    
    checkAIConfig();
    
    // Check again after a short delay to ensure environment variables are loaded
    const timer = setTimeout(checkAIConfig, 1000);
    
    // Also check when the component becomes visible (for production builds)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAIConfig();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Remove loading of other documents to avoid showing cross-document access notice
  // useEffect(() => {
  //   const loadDocuments = async () => {
  //     if (!user || file) return;
  //     try {
  //       const files = await driveStorageUtils.getFiles(user.id);
  //       const documentNames = files
  //         .filter((file) => file.type === "file")
  //         .map((file) => file.name);
  //       setAvailableDocuments(documentNames);
  //     } catch (error) {
  //       console.error("Error loading documents:")
  //     }
  //   };
  //   loadDocuments();
  // }, [user, file]);

  // Build context from the currently previewed file
  useEffect(() => {
    const buildContext = async () => {
      if (!file) {
        setFileContextText("");
        return;
      }

      try {
        // Prefer decoded/processed preview content if provided
        if (fileContent && typeof fileContent === "string") {
          if (file?.mimeType?.startsWith("image/")) {
            // Run OCR on image data URL/base64
            const imageData = file?.content || fileContent;
            const ocr = await unifiedAIService.extractTextFromImage(imageData);
            setFileContextText(ocr.success && ocr.data ? ocr.data : "");
          } else if (
            file?.mimeType?.includes("pdf") ||
            (file?.name && file.name.endsWith(".pdf"))
          ) {
            // Try to extract text from PDF data URL
            if (fileContent.startsWith("data:")) {
              try {
                const pdfText = await extractTextFromPdfDataUrl(fileContent);
                setFileContextText(pdfText);
              } catch {
                setFileContextText("");
              }
            } else {
              setFileContextText("");
            }
          } else {
            // Text-based previewContent is already decoded
            setFileContextText(fileContent);
          }
          return;
        }

        // Fall back to file.content (may be data URL)
        if (file?.content && typeof file.content === "string") {
          if (file?.mimeType?.startsWith("image/")) {
            const ocr = await unifiedAIService.extractTextFromImage(file.content);
            setFileContextText(ocr.success && ocr.data ? ocr.data : "");
          } else if (
            file?.mimeType === "text/plain" ||
            file?.name?.match(/\.(txt|md|json|js|ts|html|css|csv)$/i) ||
            file?.mimeType?.includes("text/")
          ) {
            try {
              if (file.content.startsWith("data:")) {
                const base64 = file.content.split(",")[1];
                setFileContextText(atob(base64));
              } else {
                // Might already be plain text
                try {
                  setFileContextText(atob(file.content));
                } catch {
                  setFileContextText(file.content);
                }
              }
            } catch {
              setFileContextText("");
            }
          } else {
            setFileContextText("");
          }
          return;
        }

        // As a last resort, try fetching from Drive if we have an ID
        if (file?.driveFileId) {
          const downloaded = await driveStorageUtils.downloadFileContent(file.driveFileId);
          if (downloaded && typeof downloaded === "string") {
            if (
              (file?.mimeType?.includes("pdf") || file?.name?.endsWith(".pdf")) &&
              downloaded.startsWith("data:")
            ) {
              try {
                const pdfText = await extractTextFromPdfDataUrl(downloaded);
                setFileContextText(pdfText);
              } catch {
                setFileContextText("");
              }
            } else {
              setFileContextText(downloaded);
            }
            return;
          }
        }

        setFileContextText("");
      } finally {
      }
    };

    buildContext();
  }, [file, fileContent]);

  // Build current file context on-demand (used when user asks before effect finishes)
  const ensureCurrentFileContext = async (): Promise<string> => {
    if (fileContextText) return fileContextText;

    if (!file) return "";

    try {
      // Prefer provided preview content
      if (fileContent && typeof fileContent === "string") {
        if (file?.mimeType?.startsWith("image/")) {
          const imageData = file?.content || fileContent;
          const ocr = await unifiedAIService.extractTextFromImage(imageData);
          const text = ocr.success && ocr.data ? ocr.data : "";
          setFileContextText(text);
          return text;
        } else if (
          file?.mimeType?.includes("pdf") ||
          (file?.name && file.name.endsWith(".pdf"))
        ) {
          if (fileContent.startsWith("data:")) {
            try {
              const pdfText = await extractTextFromPdfDataUrl(fileContent);
              setFileContextText(pdfText);
              return pdfText;
            } catch {}
          }
        } else {
          setFileContextText(fileContent);
          return fileContent;
        }
      }

      // Fallbacks
      if (file?.content && typeof file.content === "string") {
        if (file?.mimeType?.startsWith("image/")) {
          const ocr = await unifiedAIService.extractTextFromImage(file.content);
          const text = ocr.success && ocr.data ? ocr.data : "";
          setFileContextText(text);
          return text;
        } else if (
          file?.mimeType === "text/plain" ||
          file?.name?.match(/\.(txt|md|json|js|ts|html|css|csv)$/i) ||
          file?.mimeType?.includes("text/")
        ) {
          try {
            if (file.content.startsWith("data:")) {
              const base64 = file.content.split(",")[1];
              const text = atob(base64);
              setFileContextText(text);
              return text;
            } else {
              try {
                const text = atob(file.content);
                setFileContextText(text);
                return text;
              } catch {
                setFileContextText(file.content);
                return file.content;
              }
            }
          } catch {}
        } else if (
          (file?.mimeType?.includes("pdf") || file?.name?.endsWith(".pdf")) &&
          file.content.startsWith("data:")
        ) {
          try {
            const pdfText = await extractTextFromPdfDataUrl(file.content);
            setFileContextText(pdfText);
            return pdfText;
          } catch {}
        }
      }

      if (file?.driveFileId) {
        const downloaded = await driveStorageUtils.downloadFileContent(
          file.driveFileId
        );
        if (downloaded && typeof downloaded === "string") {
          if (
            (file?.mimeType?.includes("pdf") || file?.name?.endsWith(".pdf")) &&
            downloaded.startsWith("data:")
          ) {
            try {
              const pdfText = await extractTextFromPdfDataUrl(downloaded);
              setFileContextText(pdfText);
              return pdfText;
            } catch {}
          }
          setFileContextText(downloaded);
          return downloaded;
        }
      }

      return "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (
    type: "user" | "ai",
    content: string,
    context?: string
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
      context,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Programmatically send a message with current file context
  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInputMessage("");
    addMessage("user", text.trim());
    setIsLoading(true);
    try {
      const built = await ensureCurrentFileContext();
      const context = built ? built.toString().slice(0, 8000) : "";
      const wantsSummary = /\b(summarize|summary|summarise|summarization)\b/i.test(
        text
      );
      if (wantsSummary && context) {
        const result = await unifiedAIService.summarizeText(
          context.slice(0, 12000)
        );
        if (result.success && result.data) {
          addMessage("ai", result.data, "Based on the current file preview");
        } else {
          addMessage(
            "ai",
            result.error || "Summarization failed. Please try again."
          );
        }
        return;
      }
      const response = await unifiedAIService.generateResponse(text, context);
      if (response.success) {
        addMessage(
          "ai",
          response.data ?? "",
          context ? "Based on the current file preview" : undefined
        );
      } else {
        addMessage(
          "ai",
          "I apologize, but I encountered an error processing your request. Please try again."
        );
      }
    } catch {
      addMessage(
        "ai",
        "I'm experiencing technical difficulties. Please try again in a moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-send initial prompt once (e.g., "Summarize this file") when provided
  useEffect(() => {
    if (!initialPrompt || hasSentInitialPromptRef.current) return;
    hasSentInitialPromptRef.current = true;
    void sendMessageWithText(initialPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  // No multi-document aggregation: we only use the currently previewed file

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    addMessage("user", userMessage);
    setIsLoading(true);

    try {
      // Use only the current file's context. If not ready, build it now.
      const built = await ensureCurrentFileContext();
      const context = built ? built.toString().slice(0, 8000) : "";

      // If the user asks for a summary and we have context, call summarize API for higher quality
      const wantsSummary = /\b(summarize|summary|summarise|summarization)\b/i.test(
        userMessage
      );
      if (wantsSummary && context) {
        const result = await unifiedAIService.summarizeText(
          context.slice(0, 12000)
        );
        if (result.success && result.data) {
          addMessage("ai", result.data, "Based on the current file preview");
        } else {
          addMessage(
            "ai",
            result.error || "Summarization failed. Please try again."
          );
        }
        return;
      }

      const response = await unifiedAIService.generateResponse(
        userMessage,
        context
      );

      if (response.success) {
        addMessage(
          "ai",
          response.data ?? "",
          context ? "Based on the current file preview" : undefined
        );
      } else {
        addMessage(
          "ai",
          "I apologize, but I encountered an error processing your request. Please try again."
        );
      }
    } catch (error) {
      addMessage(
        "ai",
        "I'm experiencing technical difficulties. Please try again in a moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const suggestedQuestions = file
    ? [
        "Summarize this file",
        "What are the key concepts in this file?",
        "Generate flashcards from this file",
        "Explain the main idea in this file",
      ]
    : [
        "Summarize my uploaded documents",
        "What are the key concepts in my study materials?",
        "Generate flashcards from my short notes",
        "Explain a complex topic I'm studying",
      ];

  // Show file context if provided
  const fileContext = file ? (
    <div className="mb-4 p-2 bg-gray-50 rounded-lg text-sm text-gray-700 flex items-center">
      <FileText className="w-4 h-4 mr-2 text-blue-600" />
      <span>
        Analyzing file: <span className="font-semibold">{file.name}</span>
      </span>
    </div>
  ) : null;

  return (
    <div className="bg-white h-full flex flex-col scroll-area" data-component="ai-chat">
      {/* Header */}
      <div className="border-b border-gray-200 p-responsive">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="bg-purple-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-responsive-xl font-bold text-gray-900">AI Assistant</h2>
              <p className="text-responsive-sm text-gray-600 truncate">
                Ask questions about your study materials
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <AIStatus />
          </div>
        </div>
        {fileContext}
        {/* Removed cross-document access banner */}
        {!aiConfigured && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            <strong className="font-semibold">Demo mode:</strong> Super AI not configured.
            Add VITE_GOOGLE_AI_API_KEY in .env and restart for full answers.
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto scroll-area container-safe py-responsive space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-3xl ${
                message.type === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === "user"
                    ? "bg-blue-100 text-blue-600 ml-3"
                    : "bg-purple-100 text-purple-600 mr-3"
                }`}
              >
                {message.type === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`rounded-lg p-4 ${
                  message.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
                data-message-type={message.type}
              >
                {message.context && (
                  <div className="text-xs opacity-75 mb-2 flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {message.context}
                  </div>
                )}
                <p className="whitespace-pre-wrap" data-content="ai-message">{message.content}</p>
                <div
                  className={`text-xs mt-2 opacity-75 ${
                    message.type === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-3xl">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600 mr-3">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-lg p-4">
                <div className="flex items-center">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Thinking...
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="border-t border-gray-200 p-responsive">
          <p className="text-responsive-sm text-gray-600 mb-3">Try asking:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="btn-touch text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors touch-manipulation"
              >
                "{question}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-responsive">
        <div className="flex space-x-2 sm:space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your study materials..."
              rows={1}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="btn-touch px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center touch-manipulation"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
