import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader, Brain, FileText } from "lucide-react";
import { unifiedAIService } from "../utils/aiConfig";
import { storageUtils } from "../utils/storage";
import { realTimeAuth } from "../utils/realTimeAuth";
import { AIStatus } from "./AIStatus";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  context?: string;
}

export const AIChat: React.FC = () => {
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
  const [availableDocuments, setAvailableDocuments] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      const files = storageUtils.getFiles(user.id);
      const documentNames = files
        .filter((file) => file.type === "file")
        .map((file) => file.name);
      setAvailableDocuments(documentNames);
    }
  }, [user]);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    addMessage("user", userMessage);
    setIsLoading(true);

    try {
      // Try to get context from uploaded documents
      let context = "";
      if (user) {
        const files = storageUtils.getFiles(user.id);
        const analyses = storageUtils.getAIAnalysis(user.id);

        // Simple context matching - in production, this would use vector similarity
        const relevantAnalysis = analyses.find((analysis) =>
          userMessage
            .toLowerCase()
            .includes(analysis.extractedText.toLowerCase().slice(0, 50))
        );

        if (relevantAnalysis) {
          context = relevantAnalysis.extractedText;
        }
      }

      const response = await unifiedAIService.generateResponse(
        userMessage,
        context
      );

      if (response.success) {
        addMessage(
          "ai",
          response.data,
          context ? "Based on your uploaded documents" : undefined
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

  const suggestedQuestions = [
    "Summarize my uploaded documents",
    "What are the key concepts in my study materials?",
    "Generate flashcards from my notes",
    "Explain a complex topic I'm studying",
  ];

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
              <p className="text-gray-600">
                Ask questions about your study materials
              </p>
            </div>
          </div>
          <AIStatus />
        </div>

        {availableDocuments.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-sm text-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              <span>
                I have access to {availableDocuments.length} of your documents
                and can answer questions about them.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
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
              >
                {message.context && (
                  <div className="text-xs opacity-75 mb-2 flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {message.context}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
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
        <div className="border-t border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-3">Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                "{question}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your study materials..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
