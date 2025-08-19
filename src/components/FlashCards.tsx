import React from "react";
import { BookOpen, Loader, Zap, Brain } from "lucide-react";
import { unifiedAIService } from "../utils/aiConfig";
import { driveStorageUtils } from "../utils/driveStorage";
import { realTimeAuth } from "../utils/realTimeAuth";
import { extractTextFromPdfDataUrl } from "../utils/pdfText";

type ParsedCard = { question: string; answer: string; reasoning?: string };

export const FlashCards: React.FC = () => {
  const [inputText, setInputText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableDocuments, setAvailableDocuments] = React.useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = React.useState("");
  const [cards, setCards] = React.useState<ParsedCard[]>([]);

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

  const getDocumentContent = async (documentId: string): Promise<string> => {
    const file = availableDocuments.find((doc) => doc.id === documentId);
    if (!file) return "";

    try {
      if (typeof file.content === "string" && file.content.length > 0) {
        const mime = file.mimeType || "";
        if (mime.startsWith("image/") || file.content.startsWith("data:image")) {
          const ocr = await unifiedAIService.extractTextFromImage(file.content);
          return ocr.success && ocr.data ? ocr.data : "";
        }
        if (mime.includes("pdf") || (file.name && file.name.toLowerCase().endsWith(".pdf"))) {
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

        return decodeTextFromDataUrl(file.content);
      }

      if (file.driveFileId) {
        const downloaded = await driveStorageUtils.downloadFileContent(file.driveFileId);
        if (typeof downloaded === "string" && downloaded.length > 0) {
          const mime = file.mimeType || "";
          if (mime.includes("pdf") || (file.name && file.name.toLowerCase().endsWith(".pdf"))) {
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
          return decodeTextFromDataUrl(downloaded);
        }
      }

      return "";
    } catch (e) {
      return "";
    }
  };

  const parseFlashcards = (raw: string): ParsedCard[] => {
    const lines = raw
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
    return parsed;
  };

  const generateFlashcards = async () => {
    if (isLoading) return;
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
      alert("Please provide some text to generate flashcards.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await unifiedAIService.generateFlashcards(content);
      if (result.success && result.data) {
        setCards(parseFlashcards(result.data));
      } else {
        alert("AI processing failed: " + (result.error || "Unknown error"));
      }
    } catch (e) {
      alert("An error occurred while generating flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Flash Cards</h2>
            <p className="text-gray-600">Generate and study Q&A flashcards</p>
          </div>
        </div>

        <div className="space-y-4">
          {availableDocuments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Document (Optional)</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text to Convert into Flashcards</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                selectedDocument
                  ? "Text will be extracted from the selected document, or you can add additional text here..."
                  : "Paste your text here..."
              }
            />
          </div>

          <button
            onClick={generateFlashcards}
            disabled={isLoading || (!inputText.trim() && !selectedDocument)}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto p-6">
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards yet</h3>
            <p className="text-gray-600">Enter text or select a document, then click Generate Flashcards</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c, i) => (
              <Flashcard key={`${c.question}-${i}`} card={c} idx={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashCards;


