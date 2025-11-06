// Resume Import Modal - Paste and parse existing resume
import React, { useState } from "react";
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeParserService } from "../../services/resumeParserService";
import type { ResumeData } from "../../types/resumeBuilder";
import * as pdfjsLib from "pdfjs-dist";

interface ResumeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (resumeData: ResumeData) => void;
}

export const ResumeImportModal: React.FC<ResumeImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [resumeText, setResumeText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [parseMode, setParseMode] = useState<"ai" | "basic">("ai");

  const handlePaste = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text");
      return;
    }

    setError(null);
    setSuccess(false);
    setIsParsing(true);

    try {
      let parsedResume: ResumeData;

      if (parseMode === "ai") {
        // Use AI parsing (more accurate)
        parsedResume = await ResumeParserService.parseResumeText(resumeText);
      } else {
        // Use basic parsing (fallback)
        parsedResume = ResumeParserService.parseResumeTextBasic(resumeText);
      }

      setSuccess(true);
      
      // Small delay to show success message
      setTimeout(() => {
        onImport(parsedResume);
        handleClose();
      }, 1000);
    } catch (err) {
      console.error("Parse error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse resume. Try using Basic mode or check the format."
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleClose = () => {
    setResumeText("");
    setError(null);
    setSuccess(false);
    setIsParsing(false);
    onClose();
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Configure PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0,
        stopAtErrors: false,
      }).promise;

      let fullText = "";

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str || "")
            .join(" ");
          
          if (pageText.trim().length > 0) {
            fullText += pageText + "\n\n";
          }
        } catch (pageError) {
          console.warn(`Error extracting text from page ${pageNum}:`, pageError);
        }
      }

      return fullText.trim();
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Failed to extract text from PDF. The PDF might be image-based, encrypted, or corrupted. Please try copying the text manually.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept text and PDF files
    const isTextFile = file.type.includes("text") || file.name.endsWith(".txt");
    const isPDFFile = file.type === "application/pdf" || file.name.endsWith(".pdf");

    if (!isTextFile && !isPDFFile) {
      setError("Please upload a .txt or .pdf file, or paste the text directly");
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      let text: string;
      
      if (isPDFFile) {
        text = await extractTextFromPDF(file);
        if (!text || text.trim().length < 50) {
          setError("Could not extract text from PDF. The PDF might be image-based or encrypted. Please try copying the text manually and pasting it.");
          setIsParsing(false);
          return;
        }
      } else {
        text = await file.text();
      }

      setResumeText(text);
    } catch (err) {
      console.error("File read error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to read file. Please paste the text directly."
      );
    } finally {
      setIsParsing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Import Resume
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Paste your resume text or upload a file to auto-populate sections
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Parse Mode Selection */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Parse Mode:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setParseMode("ai")}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      parseMode === "ai"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }
                  `}
                >
                  AI-Powered (Recommended)
                </button>
                <button
                  onClick={() => setParseMode("basic")}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      parseMode === "basic"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }
                  `}
                >
                  Basic
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".txt,.pdf,text/plain,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-file-upload"
                disabled={isParsing}
              />
              <label
                htmlFor="resume-file-upload"
                className={`cursor-pointer flex flex-col items-center gap-2 ${isParsing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Extracting text from PDF...
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <File className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload .txt or .pdf file or paste text below
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Supported: PDF, TXT
                    </span>
                  </>
                )}
              </label>
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste Resume Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setError(null);
                }}
                placeholder="Paste your resume text here...&#10;&#10;Example:&#10;John Doe&#10;Email: john@example.com&#10;Phone: +1 234-567-8900&#10;&#10;Professional Summary:&#10;Experienced software engineer...&#10;&#10;Experience:&#10;Senior Developer at Tech Corp (2020-Present)..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none font-mono text-sm"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {resumeText.length} characters • {resumeText.split("\n").length} lines
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Success!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Resume parsed successfully. Importing...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                💡 Tips for best results:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>PDF files: Text-based PDFs work best (not scanned images)</li>
                <li>Include all sections: Contact, Summary, Experience, Education, Skills</li>
                <li>Use clear section headings (e.g., "Experience:", "Education:")</li>
                <li>Format dates consistently (e.g., "2020-2024" or "Jan 2020 - Present")</li>
                <li>AI mode works best with well-formatted resumes</li>
                <li>Basic mode is faster but less accurate</li>
                <li>If PDF extraction fails, try copying text manually and pasting</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handlePaste}
              disabled={isParsing || !resumeText.trim()}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Parse & Import
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

