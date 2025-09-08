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
  isImageGeneration?: boolean;
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
  const [showImageUpload, setShowImageUpload] = useState(false);
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
    isImageGeneration?: boolean
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
      context,
      imageUrl,
      isImageGeneration,
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
  };

  const deleteSession = (sessionId: string) => {
    if (sessions.length <= 1) return; // Keep at least one session

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(sessions[0].id);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setShowImageUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = messageText || inputMessage.trim();
    if (!userMessage || isLoading) return;

    setInputMessage("");
    addMessage("user", userMessage);
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
      } else {
        // Regular text conversation with file context
        const context = fileContextText ? fileContextText.slice(0, 8000) : "";
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const currentSession = getCurrentSession();

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Session Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewSession}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 ${
                currentSessionId === session.id
                  ? "bg-blue-50 border-l-4 border-l-blue-600"
                  : ""
              }`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium truncate">
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Enhanced AI Assistant
                </h2>
                <p className="text-sm text-gray-500">
                  Multimodal AI with image analysis and generation
                </p>
              </div>
            </div>
            <AIStatus />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
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
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
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
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.context && (
                    <p className="text-xs mt-2 opacity-75">{message.context}</p>
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
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
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
        <div className="p-4 border-t border-gray-200 bg-white">
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

          <div className="flex gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Upload Image"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {showImageUpload && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Choose File"
                >
                  <Upload className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything, request an image, or upload an image to analyze..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
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
