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
import { extractTextFromPdfDataUrl } from "../utils/pdfText";

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
    return "bg-gray-100 text-gray-600";
  };

  const getDocumentContent = async (documentId: string): Promise<string> => {
    const file = availableDocuments.find((doc) => doc.id === documentId);
    if (!file) return "";

    const decodeTextFromDataUrl = (dataUrl: string): string => {
      try {
        if (dataUrl.startsWith("data:")) {
          const base64 = dataUrl.split(",")[1];
          return atob(base64);
        }
        return atob(dataUrl);
      } catch {
        return dataUrl;
      }
    };

    try {
      // If we already have inline content (localStorage fallback)
      if (typeof file.content === "string" && file.content.length > 0) {
        const mime = file.mimeType || "";
        if (mime.startsWith("image/") || file.content.startsWith("data:image")) {
          const ocr = await unifiedAIService.extractTextFromImage(file.content);
          return ocr.success && ocr.data ? ocr.data : "";
        }
        if (
          mime.includes("pdf") ||
          (file.name && file.name.toLowerCase().endsWith(".pdf"))
        ) {
          if (file.content.startsWith("data:")) {
            try {
              return await extractTextFromPdfDataUrl(file.content);
            } catch {
              return "";
            }
          }
          return "";
        }

        if (
          mime === "text/plain" ||
          mime.startsWith("text/") ||
          (file.name && file.name.match(/\.(txt|md|json|js|ts|html|css|csv)$/i))
        ) {
          return decodeTextFromDataUrl(file.content);
        }

        // Fallback: unknown type; try to decode as text
        return decodeTextFromDataUrl(file.content);
      }

      // Otherwise, try downloading from Drive if available
      if (file.driveFileId) {
        const downloaded = await driveStorageUtils.downloadFileContent(
          file.driveFileId
        );
        if (typeof downloaded === "string" && downloaded.length > 0) {
          const mime = file.mimeType || "";
          if (
            mime.includes("pdf") ||
            (file.name && file.name.toLowerCase().endsWith(".pdf"))
          ) {
            if (downloaded.startsWith("data:")) {
              try {
                return await extractTextFromPdfDataUrl(downloaded);
              } catch {
                return "";
              }
            }
            return "";
          }
          if (mime.startsWith("image/") || downloaded.startsWith("data:image")) {
            const ocr = await unifiedAIService.extractTextFromImage(downloaded);
            return ocr.success && ocr.data ? ocr.data : "";
          }
          if (
            mime === "text/plain" ||
            mime.startsWith("text/") ||
            (file.name && file.name.match(/\.(txt|md|json|js|ts|html|css|csv)$/i))
          ) {
            return decodeTextFromDataUrl(downloaded);
          }
          // Fallback: unknown type
          return decodeTextFromDataUrl(downloaded);
        }
      }

      return "";
    } catch (e) {
      return "";
    }
  };

  const runTool = async () => {
    if (!selectedTool || isLoading) return;

    let content = inputText;
    if (selectedDocument) {
      content = await getDocumentContent(selectedDocument);
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
      type ParsedCard = { question: string; answer: string; reasoning?: string };
      const lines = result.content
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && l.includes("|"));

      const parsed: ParsedCard[] = lines.map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        const qPart = parts.find((p) => /^Q:/i.test(p)) || parts[0] || "";
        const aPart = parts.find((p) => /^A:/i.test(p)) || parts[1] || "";
        const rPart = parts.find((p) => /^R:/i.test(p)) || parts[2] || "";
        const clean = (s: string) => s.replace(/^[QAR]:\s*/i, "").trim();
        return {
          question: clean(qPart),
          answer: clean(aPart),
          reasoning: clean(rPart) || undefined,
        };
      });

      const Flashcard: React.FC<{ card: ParsedCard; idx: number }> = ({ card, idx }) => {
        const [flipped, setFlipped] = React.useState(false);
        const toggle = () => setFlipped((f) => !f);
        return (
          <div className="relative" style={{ perspective: 1000 }}>
            <div
              className="relative w-full h-40 md:h-48"
              style={{
                transformStyle: "preserve-3d",
                transition: "transform 400ms ease",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div
                className="absolute inset-0 border border-gray-200 rounded-xl bg-white p-4 flex flex-col justify-between"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="text-xs text-gray-500">Card {idx + 1}</div>
                <div className="font-medium text-gray-900 line-clamp-4">{card.question}</div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={toggle}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700"
                  >
                    Flip
                  </button>
                </div>
              </div>
              <div
                className="absolute inset-0 border border-gray-200 rounded-xl bg-white p-4"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="text-xs text-gray-500 mb-1">Answer</div>
                <div className="font-medium text-gray-900 mb-2">{card.answer}</div>
                {card.reasoning ? (
                  <div className="text-sm text-gray-600">{card.reasoning}</div>
                ) : null}
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={toggle}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700"
                  >
                    Flip back
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      };

      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parsed.map((c, i) => (
            <Flashcard key={`${c.question}-${i}`} card={c} idx={i} />
          ))}
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
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Simplified Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              AI Study Tools
            </h1>
            <p className="text-sm text-gray-600">
              Enhance your learning with AI-powered study tools
            </p>
          </div>

          <AIStatus />

          {/* Simplified Tool Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h2 className="text-base font-medium text-gray-900 mb-4">
              Choose a Tool
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`p-3 rounded border text-left transition-colors ${
                      selectedTool === tool.id
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-gray-100 p-2 rounded">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <h3 className="font-medium text-gray-900">{tool.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simplified Input Section */}
          {selectedTool && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Input Content
              </h3>

              {/* Document Selection */}
              {availableDocuments.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Document (Optional)
                  </label>
                  <select
                    value={selectedDocument}
                    onChange={(e) => setSelectedDocument(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded text-sm"
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Enter Text Directly
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your study material here..."
                  className="w-full h-32 p-3 border border-gray-200 rounded text-sm resize-none"
                />
              </div>

              <button
                onClick={runTool}
                disabled={isLoading || (!inputText.trim() && !selectedDocument)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Run Tool
                  </>
                )}
              </button>
            </div>
          )}

          {/* Simplified Results */}
          {results.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Results
              </h3>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {result.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {formatResult(result)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
