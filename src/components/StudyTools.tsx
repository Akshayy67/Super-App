import React, { useState } from "react";
import {
  Brain,
  FileText,
  Lightbulb,
  Zap,
  Loader,
  BookOpen,
} from "lucide-react";
import { unifiedAIService } from "../utils/aiConfig";
import { driveStorageUtils } from "../utils/driveStorage";
import { realTimeAuth } from "../utils/realTimeAuth";
import { AIStatus } from "./AIStatus";

interface ToolResult {
  type: "summary" | "concepts" | "flashcards" | "explanation";
  content: string;
  timestamp: string;
}

export const StudyTools: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [results, setResults] = useState<ToolResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableDocuments, setAvailableDocuments] = useState<any[]>([]);

  const user = realTimeAuth.getCurrentUser();

  React.useEffect(() => {
    const loadDocuments = async () => {
      if (user) {
        try {
          const files = await driveStorageUtils.getFiles(user.id);
          const documents = files.filter((file) => file.type === "file");
          setAvailableDocuments(documents);
        } catch (error) {
          console.error("Error loading documents:", error);
        }
      }
    };

    loadDocuments();
  }, [user]);

  const tools = [
    {
      id: "summary",
      name: "Summarize",
      description: "Generate concise summaries of your documents or text",
      icon: FileText,
      color: "blue",
    },
    {
      id: "concepts",
      name: "Extract Concepts",
      description: "Identify key concepts and terms from your study material",
      icon: Lightbulb,
      color: "yellow",
    },
    {
      id: "flashcards",
      name: "Create Flashcards",
      description: "Automatically generate Q&A flashcards for studying",
      icon: BookOpen,
      color: "green",
    },
    {
      id: "explanation",
      name: "Explain Concepts",
      description: "Get detailed explanations of complex topics",
      icon: Brain,
      color: "purple",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600 border-blue-200",
      yellow: "bg-yellow-100 text-yellow-600 border-yellow-200",
      green: "bg-green-100 text-green-600 border-green-200",
      purple: "bg-purple-100 text-purple-600 border-purple-200",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getDocumentContent = (documentId: string): string => {
    const file = availableDocuments.find((doc) => doc.id === documentId);
    if (!file || !file.content) return "";

    try {
      // For text files, decode base64
      if (file.mimeType === "text/plain") {
        return atob(file.content.split(",")[1]);
      }
      // For other files, we would need proper text extraction
      // This is a simplified version for demo purposes
      return file.content;
    } catch (e) {
      return "";
    }
  };

  const runTool = async () => {
    if (!selectedTool || isLoading) return;

    let content = inputText;
    if (selectedDocument) {
      content = getDocumentContent(selectedDocument);
      if (!content) {
        alert(
          "Could not extract text from the selected document. Please try with a text file or paste the content manually."
        );
        return;
      }
    }

    if (!content.trim()) {
      alert("Please provide some text to analyze.");
      return;
    }

    setIsLoading(true);

    try {
      let result;

      switch (selectedTool) {
        case "summary":
          result = await unifiedAIService.summarizeText(content);
          break;
        case "concepts":
          result = await unifiedAIService.extractConcepts(content);
          break;
        case "flashcards":
          result = await unifiedAIService.generateFlashcards(content);
          break;
        case "explanation":
          result = await unifiedAIService.explainConcept(content);
          break;
        default:
          throw new Error("Unknown tool");
      }

      if (result.success && result.data) {
        const newResult: ToolResult = {
          type: selectedTool as any,
          content: result.data,
          timestamp: new Date().toISOString(),
        };
        setResults((prev) => [newResult, ...prev]);
        setInputText("");
        setSelectedDocument("");
      } else {
        alert("AI processing failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      alert(
        "An error occurred while processing your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatResult = (result: ToolResult) => {
    if (result.type === "flashcards") {
      const flashcards = result.content
        .split("\n")
        .filter((line) => line.includes("|"));
      return (
        <div className="space-y-3">
          {flashcards.map((card, index) => {
            const [question, answer] = card
              .split("|")
              .map((part) => part.replace(/^[QA]:\s*/, "").trim());
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="font-medium text-gray-900 mb-2">
                  Q: {question}
                </div>
                <div className="text-gray-700">A: {answer}</div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <p className="whitespace-pre-wrap text-gray-700">{result.content}</p>
    );
  };

  const getResultTitle = (type: string) => {
    const titles = {
      summary: "Summary",
      concepts: "Key Concepts",
      flashcards: "Flashcards",
      explanation: "Explanation",
    };
    return titles[type as keyof typeof titles] || "Result";
  };

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Study Tools</h2>
            <p className="text-gray-600">
              AI-powered tools to enhance your learning
            </p>
          </div>
        </div>

        {/* Tool Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(isSelected ? null : tool.id)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  isSelected
                    ? `${getColorClasses(tool.color)} border-2`
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <Icon
                  className={`w-6 h-6 mb-3 ${
                    isSelected ? "" : "text-gray-400"
                  }`}
                />
                <h3
                  className={`font-medium mb-2 ${
                    isSelected ? "" : "text-gray-900"
                  }`}
                >
                  {tool.name}
                </h3>
                <p
                  className={`text-sm ${
                    isSelected ? "opacity-80" : "text-gray-600"
                  }`}
                >
                  {tool.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Interface */}
      {selectedTool && (
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {tools.find((t) => t.id === selectedTool)?.name}
          </h3>

          <div className="space-y-4">
            {/* Document Selection */}
            {availableDocuments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Document (Optional)
                </label>
                <select
                  value={selectedDocument}
                  onChange={(e) => setSelectedDocument(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a document...</option>
                  {availableDocuments.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedTool === "explanation"
                  ? "Concept to Explain"
                  : "Text to Analyze"}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  selectedTool === "explanation"
                    ? "Enter a concept you want explained..."
                    : selectedDocument
                    ? "Text will be extracted from the selected document, or you can add additional text here..."
                    : "Paste your text here..."
                }
              />
            </div>

            <button
              onClick={runTool}
              disabled={isLoading || (!inputText.trim() && !selectedDocument)}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Tool
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-auto p-6">
        {results.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedTool ? "Ready to analyze" : "Select a study tool"}
            </h3>
            <p className="text-gray-600">
              {selectedTool
                ? "Provide some text or select a document to get started"
                : "Choose from our AI-powered study tools to enhance your learning experience"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getResultTitle(result.type)}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="prose max-w-none">{formatResult(result)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
