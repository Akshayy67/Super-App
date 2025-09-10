import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader,
  Brain,
  FileText,
  Image as ImageIcon,
  Plus,
  MessageSquare,
  Camera,
  Upload,
  X,
  Download,
  Copy,
  RefreshCw,
} from "lucide-react";
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
  imageUrl?: string;
  pdfUrl?: string;
  fileName?: string;
  isImageGeneration?: boolean;
  usedConversationContext?: boolean;
  contextualReferences?: string[];
};

type ChatSession = {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
  lastUpdated: string;
};

interface EnhancedAIChatProps {
  file?: any;
  fileContent?: string;
  initialPrompt?: string;
}

export const EnhancedAIChat: React.FC<EnhancedAIChatProps> = ({
  file,
  fileContent,
  initialPrompt,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileContextText, setFileContextText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [uploadedPdf, setUploadedPdf] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with a default session
  useEffect(() => {
    const defaultSession: ChatSession = {
      id: "default",
      name: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setSessions([defaultSession]);
    setCurrentSessionId("default");
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions]);

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showHistoryDropdown &&
        !(event.target as Element).closest(".history-dropdown")
      ) {
        setShowHistoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHistoryDropdown]);

  // Process initial prompt
  useEffect(() => {
    if (initialPrompt && currentSessionId) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, currentSessionId]);

  const getCurrentSession = () => {
    return sessions.find((s) => s.id === currentSessionId);
  };

  const addMessage = (
    type: "user" | "ai",
    content: string,
    context?: string,
    imageUrl?: string,
    pdfUrl?: string,
    fileName?: string,
    isImageGeneration?: boolean,
    usedConversationContext?: boolean,
    contextualReferences?: string[]
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
      context,
      imageUrl,
      pdfUrl,
      fileName,
      isImageGeneration,
      usedConversationContext,
      contextualReferences,
    };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              lastUpdated: new Date().toISOString(),
            }
          : session
      )
    );
  };

  // Helper function to detect contextual references in user messages
  const detectContextualReferences = (message: string): string[] => {
    const contextualPhrases = [
      "above",
      "that",
      "earlier",
      "previous",
      "before",
      "last",
      "recent",
      "you said",
      "you mentioned",
      "referring to",
      "based on what",
      "from what you",
      "in your",
      "your response",
      "your answer",
      "the explanation",
      "the example",
      "the concept",
      "this topic",
      "elaborate",
      "simplify",
      "clarify",
      "expand on",
      "more about",
    ];

    const foundReferences: string[] = [];
    const lowerMessage = message.toLowerCase();

    contextualPhrases.forEach((phrase) => {
      if (lowerMessage.includes(phrase)) {
        foundReferences.push(phrase);
      }
    });

    return foundReferences;
  };

  // Helper function to build conversation history for AI context
  const buildConversationHistory = (
    maxMessages: number = 8
  ): Array<{ role: string; content: string }> => {
    const currentSession = getCurrentSession();
    if (!currentSession) return [];

    // Get the last N messages (excluding the current one being processed)
    const recentMessages = currentSession.messages.slice(-maxMessages);

    return recentMessages.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.content,
    }));
  };

  // Helper function to determine if conversation context should be used
  const shouldUseConversationContext = (
    message: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): boolean => {
    // Use context if there are previous messages and the message contains contextual references
    const hasHistory = conversationHistory.length > 0;
    const hasContextualReferences =
      detectContextualReferences(message).length > 0;

    // Also use context for follow-up questions or when the message is short and might be referencing previous content
    const isLikelyFollowUp = message.length < 50 && hasHistory;

    return hasHistory && (hasContextualReferences || isLikelyFollowUp);
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setUploadedImage("");
    setUploadedPdf("");
    setUploadedFileName("");
  };

  const switchToSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setUploadedImage("");
    setUploadedPdf("");
    setUploadedFileName("");
    setShowHistoryDropdown(false);
  };

  const getRecentSessions = () => {
    return sessions
      .sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      )
      .slice(0, 5);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSessionPreview = (session: ChatSession) => {
    if (session.messages.length === 0) {
      return "New chat";
    }
    const lastMessage = session.messages[session.messages.length - 1];
    return (
      lastMessage.content.slice(0, 50) +
      (lastMessage.content.length > 50 ? "..." : "")
    );
  };

  const deleteSession = (sessionId: string) => {
    if (sessions.length <= 1) return; // Keep at least one session

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(sessions[0].id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;

      if (file.type.startsWith("image/")) {
        setUploadedImage(result);
        setUploadedPdf("");
        setUploadedFileName("");
      } else if (file.type === "application/pdf") {
        setUploadedPdf(result);
        setUploadedImage("");
        setUploadedFileName(file.name);
      }
      setShowFileUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || inputMessage.trim();
    if ((!userMessage && !uploadedImage && !uploadedPdf) || isLoading) return;

    setInputMessage("");

    // Detect contextual references before adding the user message
    const contextualReferences = detectContextualReferences(userMessage);

    // Add user message with file attachment if present
    if (uploadedImage) {
      addMessage(
        "user",
        userMessage || "Please analyze this image",
        undefined,
        uploadedImage,
        undefined,
        undefined,
        undefined,
        undefined,
        contextualReferences
      );
    } else if (uploadedPdf) {
      addMessage(
        "user",
        userMessage || "Please analyze this PDF",
        undefined,
        undefined,
        uploadedPdf,
        uploadedFileName,
        undefined,
        undefined,
        contextualReferences
      );
    } else {
      addMessage(
        "user",
        userMessage,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        contextualReferences
      );
    }

    setIsLoading(true);

    try {
      // Check if this is an image generation request
      const isImageRequest =
        /\b(generate|create|make|draw|show me)\s+(an?\s+)?(image|picture|photo|drawing|illustration)\b/i.test(
          userMessage
        ) ||
        /\b(image|picture|photo|drawing|illustration)\s+(of|showing|with)\b/i.test(
          userMessage
        );

      if (isImageRequest) {
        const result = await unifiedAIService.generateImage(userMessage);
        if (result.success && result.data) {
          addMessage("ai", result.data, undefined, undefined, true);
        } else {
          addMessage(
            "ai",
            result.error ||
              "Failed to generate image description. Please try again."
          );
        }
      } else if (uploadedImage) {
        // Analyze uploaded image with user's question
        const result = await unifiedAIService.analyzeImageContent(
          uploadedImage,
          userMessage
        );
        if (result.success && result.data) {
          addMessage(
            "ai",
            result.data,
            "Based on the uploaded image",
            uploadedImage
          );
        } else {
          addMessage(
            "ai",
            result.error || "Failed to analyze the image. Please try again."
          );
        }
        setUploadedImage("");
      } else if (uploadedPdf) {
        // Extract text from PDF and analyze with user's question
        try {
          const pdfText = await extractTextFromPdfDataUrl(uploadedPdf);
          const context = pdfText.slice(0, 8000); // Limit context size

          const response = await unifiedAIService.generateResponse(
            userMessage || "Please analyze this PDF content",
            context
          );

          if (response.success && response.data) {
            addMessage(
              "ai",
              response.data,
              `Based on the PDF: ${uploadedFileName}`,
              undefined,
              uploadedPdf,
              uploadedFileName
            );
          } else {
            addMessage(
              "ai",
              response.error || "Failed to analyze the PDF. Please try again."
            );
          }
        } catch (error) {
          addMessage(
            "ai",
            "Failed to extract text from the PDF. Please ensure it's a valid PDF file."
          );
        }
        setUploadedPdf("");
        setUploadedFileName("");
      } else {
        // Regular text conversation with conversation context and file context
        const fileContext = fileContextText
          ? fileContextText.slice(0, 8000)
          : "";
        const conversationHistory = buildConversationHistory();
        const useConversationContext = shouldUseConversationContext(
          userMessage,
          conversationHistory
        );

        const response = await unifiedAIService.generateResponse(
          userMessage,
          fileContext,
          useConversationContext ? conversationHistory : undefined
        );

        if (response.success) {
          let contextDescription = "";
          if (fileContext && useConversationContext) {
            contextDescription =
              "Based on file content and conversation history";
          } else if (fileContext) {
            contextDescription = "Based on the current file preview";
          } else if (useConversationContext) {
            contextDescription = "Based on conversation history";
          }

          addMessage(
            "ai",
            response.data ?? "",
            contextDescription || undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            useConversationContext,
            useConversationContext ? contextualReferences : undefined
          );
        } else {
          addMessage(
            "ai",
            "I apologize, but I encountered an error processing your request. Please try again."
          );
        }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const currentSession = getCurrentSession();

  return (
    <div className="flex h-full w-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Session Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <button
            onClick={createNewSession}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 border-b border-gray-100 dark:border-slate-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 ${
                currentSessionId === session.id
                  ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-600 dark:border-l-blue-400"
                  : ""
              }`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                    {session.name}
                  </span>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {session.messages.length} messages
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Enhanced AI Assistant
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Multimodal AI with image, PDF analysis and generation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative history-dropdown">
                <button
                  onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Chat history"
                >
                  <MessageSquare className="w-4 h-4" />
                  History
                </button>

                {showHistoryDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-slate-600">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Recent Chats
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {getRecentSessions().map((session) => (
                        <button
                          key={session.id}
                          onClick={() => switchToSession(session.id)}
                          className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                            session.id === currentSessionId
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {getSessionPreview(session)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {session.messages.length} messages
                              </p>
                            </div>
                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                              {formatTimestamp(session.lastUpdated)}
                            </span>
                          </div>
                        </button>
                      ))}
                      {sessions.length === 0 && (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          No chat history yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={createNewSession}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Start a new chat"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              <AIStatus />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-800 min-h-0 max-h-full">
          {currentSession?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === "user"
                      ? "bg-blue-600 dark:bg-blue-700 text-white"
                      : "bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-600 dark:bg-blue-700 text-white"
                      : "bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-600"
                  }`}
                >
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Uploaded content"
                      className="max-w-full h-auto rounded-lg mb-2"
                      style={{ maxHeight: "200px" }}
                    />
                  )}
                  {message.pdfUrl && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mb-2">
                      <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-800 dark:text-red-300">
                        {message.fileName || "PDF Document"}
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.context && (
                    <p className="text-xs mt-2 opacity-75">{message.context}</p>
                  )}
                  {message.usedConversationContext && (
                    <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>Used conversation context</span>
                      {message.contextualReferences &&
                        message.contextualReferences.length > 0 && (
                          <span className="ml-1 text-blue-600 dark:text-blue-400">
                            (detected:{" "}
                            {message.contextualReferences
                              .slice(0, 2)
                              .join(", ")}
                            )
                          </span>
                        )}
                    </div>
                  )}
                  {message.contextualReferences &&
                    message.contextualReferences.length > 0 &&
                    message.type === "user" && (
                      <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                        <span className="text-blue-600 dark:text-blue-400">
                          🔗 Contextual references:{" "}
                          {message.contextualReferences.slice(0, 3).join(", ")}
                        </span>
                      </div>
                    )}
                  {message.isImageGeneration && (
                    <div className="mt-2 text-xs opacity-75">
                      💡 This is an image description. In a full implementation,
                      this would generate an actual image.
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.type === "ai" && (
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="text-xs opacity-75 hover:opacity-100"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
          {uploadedImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="h-20 w-20 object-cover rounded-lg"
              />
              <button
                onClick={() => setUploadedImage("")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {uploadedPdf && (
            <div className="mb-3 relative inline-block">
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-800 dark:text-red-300 font-medium">
                  {uploadedFileName}
                </span>
                <button
                  onClick={() => {
                    setUploadedPdf("");
                    setUploadedFileName("");
                  }}
                  className="ml-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Upload File"
              >
                <Upload className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              {showFileUpload && (
                <div className="flex gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    title="Choose Image or PDF"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything, request an image, or upload an image/PDF to analyze..."
                className="w-full p-3 pr-12 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
