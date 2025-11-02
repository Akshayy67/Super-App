import React, { useState, useRef } from "react";
import {
  Brain,
  FileText,
  Lightbulb,
  Zap,
  Loader,
  BookOpen,
  Upload,
  X,
  File,
  Image,
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [results, setResults] = useState<ToolResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [availableDocuments, setAvailableDocuments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle file upload and extract content
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setSelectedDocument(""); // Clear document selection when file is uploaded
    setIsExtractingText(true);

    try {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      let content = "";

      // Handle PDF files
      if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const dataUrl = e.target?.result as string;
            setFilePreview(dataUrl);
            content = await extractTextFromPdfDataUrl(dataUrl);
            setUploadedFileContent(content);
            if (content && !inputText.trim()) {
              setInputText(`[Content extracted from ${file.name}]\n\n${content.substring(0, 500)}...`);
            }
          } catch (error) {
            console.error("Error extracting PDF text:", error);
            alert("Failed to extract text from PDF. Please try another file.");
            setUploadedFile(null);
            setFilePreview(null);
          } finally {
            setIsExtractingText(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // Handle image files
      if (fileType.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const dataUrl = e.target?.result as string;
            setFilePreview(dataUrl);
            // Extract text using OCR
            const ocrResult = await unifiedAIService.extractTextFromImage(dataUrl);
            if (ocrResult.success && ocrResult.data) {
              content = ocrResult.data;
              setUploadedFileContent(content);
              if (content && !inputText.trim()) {
                setInputText(`[Text extracted from ${file.name}]\n\n${content}`);
              }
            } else {
              alert("Could not extract text from image. Try a clearer image or paste text manually.");
              setUploadedFile(null);
              setFilePreview(null);
            }
          } catch (error) {
            console.error("Error extracting image text:", error);
            alert("Failed to extract text from image. Please try again.");
            setUploadedFile(null);
            setFilePreview(null);
          } finally {
            setIsExtractingText(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // Handle text files
      if (fileType.startsWith("text/") || fileName.match(/\.(txt|md|json|js|ts|html|css|csv|xml|yaml|yml)$/i)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            content = e.target?.result as string;
            setUploadedFileContent(content);
            if (content && !inputText.trim()) {
              setInputText(content);
            }
            setIsExtractingText(false);
          } catch (error) {
            console.error("Error reading text file:", error);
            alert("Failed to read text file. Please try again.");
            setUploadedFile(null);
            setIsExtractingText(false);
          }
        };
        reader.onerror = () => {
          alert("Failed to read file. Please try again.");
          setUploadedFile(null);
          setIsExtractingText(false);
        };
        reader.readAsText(file);
        return;
      }

      // Unsupported file type
      alert("Unsupported file type. Please upload PDF, image, or text files.");
      setUploadedFile(null);
      setIsExtractingText(false);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("An error occurred while processing the file. Please try again.");
      setUploadedFile(null);
      setFilePreview(null);
      setIsExtractingText(false);
    }
  };

  // Remove uploaded file
  const removeUploadedFile = () => {
    setUploadedFile(null);
    setUploadedFileContent("");
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        if (
          mime.startsWith("image/") ||
          file.content.startsWith("data:image")
        ) {
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
          if (
            mime.startsWith("image/") ||
            downloaded.startsWith("data:image")
          ) {
            const ocr = await unifiedAIService.extractTextFromImage(downloaded);
            return ocr.success && ocr.data ? ocr.data : "";
          }
          if (
            mime === "text/plain" ||
            mime.startsWith("text/") ||
            (file.name &&
              file.name.match(/\.(txt|md|json|js|ts|html|css|csv)$/i))
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
    
    // Prioritize uploaded file content
    if (uploadedFileContent) {
      content = uploadedFileContent;
      // Append additional text input if provided
      if (inputText.trim() && !inputText.includes("[Content extracted from")) {
        content = `${content}\n\n${inputText}`;
      }
    } else if (selectedDocument) {
      content = await getDocumentContent(selectedDocument);
      if (!content) {
        alert(
          "Could not extract text from the selected document. Please try with a text file or paste the content manually."
        );
        return;
      }
      // Append additional text input if provided
      if (inputText.trim()) {
        content = `${content}\n\n${inputText}`;
      }
    }

    if (!content.trim()) {
      alert("Please provide some text to analyze, upload a file, or select a document.");
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
        // Don't clear uploaded file - user might want to use it again
        // setInputText("");
        // setSelectedDocument("");
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
      type ParsedCard = {
        question: string;
        answer: string;
        reasoning?: string;
      };
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

      const Flashcard: React.FC<{ card: ParsedCard; idx: number }> = ({
        card,
        idx,
      }) => {
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
                className="absolute inset-0 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 p-4 flex flex-col justify-between"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Card {idx + 1}
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-4">
                  {card.question}
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={toggle}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700"
                  >
                    Flip
                  </button>
                </div>
              </div>
              <div
                className="absolute inset-0 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 p-4"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Answer
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {card.answer}
                </div>
                {card.reasoning ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {card.reasoning}
                  </div>
                ) : null}
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={toggle}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700"
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
      <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
        {result.content}
      </p>
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
    <div
      className="bg-white dark:bg-slate-900 h-full flex flex-col transition-colors duration-300"
      data-component="study-tools"
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Study Tools
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
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
                    isSelected ? "" : "text-gray-400 dark:text-gray-500"
                  }`}
                />
                <h3
                  className={`font-medium mb-2 ${
                    isSelected ? "" : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {tool.name}
                </h3>
                <p
                  className={`text-sm ${
                    isSelected
                      ? "opacity-80"
                      : "text-gray-600 dark:text-gray-400"
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
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload File (PDF, Image, or Text)
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,.json,.js,.ts,.html,.css,.csv,.xml,.yaml,.yml,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800"
                >
                  <Upload className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Choose File</span>
                </label>
                {uploadedFile && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    {filePreview && filePreview.startsWith("data:image") ? (
                      <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <File className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                    <span className="text-sm text-blue-900 dark:text-blue-200 truncate max-w-xs">
                      {uploadedFile.name}
                    </span>
                    {isExtractingText && (
                      <Loader className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                    )}
                    <button
                      onClick={removeUploadedFile}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {filePreview && filePreview.startsWith("data:image") && (
                <div className="mt-3">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-w-xs max-h-48 rounded-lg border border-gray-200 dark:border-slate-700"
                  />
                </div>
              )}
            </div>

            {/* Document Selection */}
            {availableDocuments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or Select from Saved Documents
                </label>
                <select
                  value={selectedDocument}
                  onChange={(e) => {
                    setSelectedDocument(e.target.value);
                    removeUploadedFile(); // Clear uploaded file when selecting document
                  }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {selectedTool === "explanation"
                  ? "Concept to Explain"
                  : "Text to Analyze"}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
              disabled={isLoading || isExtractingText || (!inputText.trim() && !selectedDocument && !uploadedFile)}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isExtractingText ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {isExtractingText ? "Extracting text..." : "Processing..."}
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
            <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {selectedTool ? "Ready to analyze" : "Select a study tool"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
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
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 bg-white dark:bg-slate-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {getResultTitle(result.type)}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
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
