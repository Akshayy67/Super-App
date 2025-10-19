import React, { useState } from "react";
import { AIChat } from "../ai/AIChat";
import {
  File,
  Folder,
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Brain,
  Share2,
} from "lucide-react";
import { FileItem } from "../../types";
import { ShareMenu } from "../sharing/ShareMenu";

interface FilePreviewModalProps {
  previewFile: (FileItem & { storageType?: string; url?: string }) | null;
  previewContent: string;
  previewZoom: number;
  onClose: () => void;
  onZoomChange: (zoom: number) => void;
  onDownload: (file: FileItem) => void;
  onAnalyze: (file: FileItem) => void;
  formatFileSize: (bytes?: number) => string;
  showAIChat: boolean;
  setShowAIChat: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  previewFile,
  previewContent,
  previewZoom,
  onClose,
  onZoomChange,
  onDownload,
  onAnalyze,
  formatFileSize,
  showAIChat,
  setShowAIChat,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareMenuPosition, setShareMenuPosition] = useState({ x: 0, y: 0 });

  if (!previewFile) return null;

  const handleShareClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShareMenuPosition({
      x: rect.left,
      y: rect.bottom + 5,
    });
    setShowShareMenu(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white w-screen h-screen flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              {previewFile.type === "folder" ? (
                <Folder className="w-6 h-6 text-blue-600" />
              ) : previewFile.mimeType?.startsWith("image/") ? (
                <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-red-400 rounded"></div>
              ) : (
                <File className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {previewFile.name}
              </h3>
              <p className="text-sm text-gray-600 flex items-center space-x-2">
                <span>{formatFileSize(previewFile.size)}</span>
                {previewFile.mimeType && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-medium">
                      {previewFile.mimeType.split("/")[1]?.toUpperCase() ||
                        "FILE"}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {previewFile.mimeType?.startsWith("image/") && (
              <div className="flex items-center space-x-1 mr-2">
                <button
                  onClick={() => onZoomChange(Math.max(25, previewZoom - 25))}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm text-gray-600 min-w-[50px] text-center">
                  {previewZoom}%
                </span>
                <button
                  onClick={() => onZoomChange(Math.min(300, previewZoom + 25))}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
            <button
              onClick={() => onDownload(previewFile)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              title="Download file"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleShareClick}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              title="Share file"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowAIChat((prev) => !prev)}
              className={`p-2 rounded-full transition-colors ${
                showAIChat ? "bg-purple-100" : "hover:bg-purple-100"
              }`}
              title={showAIChat ? "Close AI Analysis" : "AI Analysis"}
            >
              <Brain className="w-5 h-5 text-purple-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 rounded-full transition-colors"
              title="Close preview"
            >
              <X className="w-5 h-5 text-gray-600 hover:text-red-600" />
            </button>
          </div>
        </div>

        {/* Side-by-side layout when AI Analysis is open */}
        {showAIChat ? (
          <div className="flex flex-1 overflow-hidden min-h-0">
            <div
              className="h-full overflow-auto border-r border-gray-200"
              style={{ width: "60%", minWidth: 0 }}
            >
              {/* File preview content */}
              {/* ...existing file preview rendering logic... */}
              {previewContent === "Loading file content..." ? (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-lg font-medium">Loading preview...</p>
                  <p className="text-sm">Fetching file content</p>
                </div>
              ) : previewFile.mimeType?.startsWith("image/") ? (
                <div className="h-full flex items-center justify-center p-6 bg-gray-50">
                  <div className="max-w-full max-h-full overflow-auto">
                    <img
                      src={previewContent}
                      alt={previewFile.name}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        transform: `scale(${previewZoom / 100})`,
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      className="transition-transform duration-200"
                    />
                  </div>
                </div>
              ) : (() => {
                  const isPdf =
                    previewFile.mimeType?.includes("pdf") ||
                    previewFile.name.endsWith(".pdf");
                  const hasValidContent =
                    previewContent &&
                    previewContent !== "PDF_DOWNLOAD_ONLY" &&
                    previewContent !== "Preview not available" &&
                    previewContent !== "Loading file content...";
                  const isValidPdfContent =
                    previewContent &&
                    (previewContent.startsWith("data:application/pdf") ||
                      previewContent.startsWith("data:application/x-pdf") ||
                      previewContent.startsWith("http") ||
                      previewContent.includes(".pdf"));

                  console.log("🔍 PDF Preview Debug:", {
                    isPdf,
                    hasValidContent,
                    isValidPdfContent,
                    previewContent: previewContent?.substring(0, 100) + "...",
                    mimeType: previewFile.mimeType,
                    fileName: previewFile.name,
                  });

                  return isPdf && hasValidContent && isValidPdfContent;
                })() ? (
                <div className="h-full flex flex-col bg-gray-100">
                  {/* PDF Header */}
                  <div className="flex items-center justify-between px-6 py-3 bg-red-50 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          PDF
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        PDF Document Preview
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-600">
                        Use browser controls to navigate • Scroll to zoom
                      </div>
                      <button
                        onClick={() => {
                          // Create a blob URL for better new tab handling
                          if (
                            previewContent.startsWith("data:application/pdf")
                          ) {
                            const byteCharacters = atob(
                              previewContent.split(",")[1]
                            );
                            const byteNumbers = new Array(
                              byteCharacters.length
                            );
                            for (let i = 0; i < byteCharacters.length; i++) {
                              byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], {
                              type: "application/pdf",
                            });
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl, "_blank");
                            // Clean up the blob URL after a delay
                            setTimeout(
                              () => URL.revokeObjectURL(blobUrl),
                              1000
                            );
                          } else {
                            window.open(previewContent, "_blank");
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Open in New Tab
                      </button>
                      <button
                        onClick={() => {
                          // Download the PDF
                          if (
                            previewContent.startsWith("data:application/pdf")
                          ) {
                            const byteCharacters = atob(
                              previewContent.split(",")[1]
                            );
                            const byteNumbers = new Array(
                              byteCharacters.length
                            );
                            for (let i = 0; i < byteCharacters.length; i++) {
                              byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], {
                              type: "application/pdf",
                            });
                            const blobUrl = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = blobUrl;
                            link.download = previewFile.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(blobUrl);
                          } else {
                            // For URL-based files, try to download
                            const link = document.createElement("a");
                            link.href = previewContent;
                            link.download = previewFile.name;
                            link.target = "_blank";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>

                  {/* PDF Viewer */}
                  <div className="flex-1 bg-gray-200 relative">
                    <object
                      data={
                        previewContent.startsWith("http")
                          ? previewContent.replace("/view?", "/preview?")
                          : previewContent
                      }
                      type="application/pdf"
                      className="w-full h-full absolute inset-0"
                      style={{ minHeight: "600px" }}
                    >
                      <iframe
                        src={
                          previewContent.startsWith("http")
                            ? previewContent.replace("/view?", "/preview?")
                            : previewContent
                        }
                        className="w-full h-full border-0"
                        title={`PDF Preview - ${previewFile.name}`}
                        style={{ minHeight: "600px" }}
                        sandbox="allow-same-origin allow-scripts allow-downloads"
                        allow="fullscreen"
                      />
                    </object>
                  </div>
                </div>
              ) : previewFile.mimeType === "text/plain" ||
                previewFile.name.endsWith(".txt") ||
                previewFile.name.endsWith(".md") ||
                previewFile.name.endsWith(".json") ||
                previewFile.name.endsWith(".js") ||
                previewFile.name.endsWith(".ts") ||
                previewFile.name.endsWith(".html") ||
                previewFile.name.endsWith(".css") ||
                previewFile.name.endsWith(".csv") ||
                previewFile.mimeType?.includes("text/") ? (
                <div className="h-full flex flex-col">
                  {/* Content Header */}
                  <div className="flex items-center justify-between px-6 py-3 bg-gray-100 border-b">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        File Content
                      </span>
                      {previewContent.length > 10000 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Content Truncated
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {previewContent.split("\n").length} lines •{" "}
                      {previewContent.length} characters
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="flex-1 overflow-auto p-6">
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono p-4 overflow-auto max-h-[60vh]">
                        {previewContent || "No content to display"}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500 p-6">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    {previewFile.mimeType?.includes("pdf") ||
                    previewFile.name.endsWith(".pdf") ? (
                      <div className="w-12 h-12 bg-red-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          PDF
                        </span>
                      </div>
                    ) : (
                      <File className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-700">
                    {previewFile.mimeType?.includes("pdf") ||
                    previewFile.name.endsWith(".pdf")
                      ? "PDF Preview"
                      : "Preview not available"}
                  </h3>
                  <p className="text-center mb-6 max-w-md text-gray-600 leading-relaxed">
                    {previewFile.mimeType?.includes("pdf") ||
                    previewFile.name.endsWith(".pdf")
                      ? "This PDF file cannot be previewed inline. Download the file to view it in your default PDF viewer, or use the AI analysis to extract text content."
                      : previewContent}
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onDownload(previewFile)}
                      className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {previewFile.mimeType?.includes("pdf") ||
                      previewFile.name.endsWith(".pdf")
                        ? "Download PDF"
                        : "Download File"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div
              className="h-full overflow-auto"
              style={{ width: "40%", minWidth: 0 }}
            >
              {/* AIChat component side-by-side */}
              {/* @ts-ignore */}
              <AIChat
                file={previewFile}
                fileContent={previewContent}
                initialPrompt={"Summarize this file"}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden bg-white">
            {/* ...existing file preview rendering logic... */}
            {previewContent === "Loading file content..." ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-lg font-medium">Loading preview...</p>
                <p className="text-sm">Fetching file content</p>
              </div>
            ) : previewFile.mimeType?.startsWith("image/") ? (
              <div className="h-full flex items-center justify-center p-6 bg-gray-50">
                <div className="max-w-full max-h-full overflow-auto">
                  <img
                    src={previewContent}
                    alt={previewFile.name}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      transform: `scale(${previewZoom / 100})`,
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    className="transition-transform duration-200"
                  />
                </div>
              </div>
            ) : (previewFile.mimeType?.includes("pdf") ||
                previewFile.name.endsWith(".pdf")) &&
              previewContent !== "PDF_DOWNLOAD_ONLY" &&
              previewContent &&
              previewContent !== "Preview not available" &&
              (previewContent.startsWith("data:application/pdf") ||
                previewContent.startsWith("data:application/x-pdf") ||
                previewContent.startsWith("http") ||
                previewContent.includes(".pdf")) ? (
              <div className="h-full flex flex-col bg-gray-100">
                {/* PDF Header */}
                <div className="flex items-center justify-between px-6 py-3 bg-red-50 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PDF</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      PDF Document Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-600">
                      Use browser controls to navigate • Scroll to zoom
                    </div>
                    <button
                      onClick={() => {
                        // Create a blob URL for better new tab handling
                        if (previewContent.startsWith("data:application/pdf")) {
                          const byteCharacters = atob(
                            previewContent.split(",")[1]
                          );
                          const byteNumbers = new Array(byteCharacters.length);
                          for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                          }
                          const byteArray = new Uint8Array(byteNumbers);
                          const blob = new Blob([byteArray], {
                            type: "application/pdf",
                          });
                          const blobUrl = URL.createObjectURL(blob);
                          window.open(blobUrl, "_blank");
                          // Clean up the blob URL after a delay
                          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                        } else {
                          window.open(previewContent, "_blank");
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Open in New Tab
                    </button>
                    <button
                      onClick={() => {
                        // Download the PDF
                        if (previewContent.startsWith("data:application/pdf")) {
                          const byteCharacters = atob(
                            previewContent.split(",")[1]
                          );
                          const byteNumbers = new Array(byteCharacters.length);
                          for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                          }
                          const byteArray = new Uint8Array(byteNumbers);
                          const blob = new Blob([byteArray], {
                            type: "application/pdf",
                          });
                          const blobUrl = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = blobUrl;
                          link.download = previewFile.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(blobUrl);
                        } else {
                          // For URL-based files, try to download
                          const link = document.createElement("a");
                          link.href = previewContent;
                          link.download = previewFile.name;
                          link.target = "_blank";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
                {/* PDF Viewer */}
                <div className="flex-1 bg-gray-200 relative">
                  <object
                    data={
                      previewContent.startsWith("http")
                        ? previewContent.replace("/view?", "/preview?")
                        : previewContent
                    }
                    type="application/pdf"
                    className="w-full h-full absolute inset-0"
                    style={{ minHeight: "600px" }}
                  >
                    <iframe
                      src={
                        previewContent.startsWith("http")
                          ? previewContent.replace("/view?", "/preview?")
                          : previewContent
                      }
                      className="w-full h-full border-0"
                      title={`PDF Preview - ${previewFile.name}`}
                      style={{ minHeight: "600px" }}
                      sandbox="allow-same-origin allow-scripts allow-downloads"
                      allow="fullscreen"
                    />
                  </object>
                </div>
              </div>
            ) : previewFile.mimeType === "text/plain" ||
              previewFile.name.endsWith(".txt") ||
              previewFile.name.endsWith(".md") ||
              previewFile.name.endsWith(".json") ||
              previewFile.name.endsWith(".js") ||
              previewFile.name.endsWith(".ts") ||
              previewFile.name.endsWith(".html") ||
              previewFile.name.endsWith(".css") ||
              previewFile.name.endsWith(".csv") ||
              previewFile.mimeType?.includes("text/") ? (
              <div className="h-full flex flex-col">
                {/* Content Header */}
                <div className="flex items-center justify-between px-6 py-3 bg-gray-100 border-b">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      File Content
                    </span>
                    {previewContent.length > 10000 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Content Truncated
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {previewContent.split("\n").length} lines •{" "}
                    {previewContent.length} characters
                  </div>
                </div>
                {/* Content Body */}
                <div className="flex-1 overflow-auto p-6">
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono p-4 overflow-auto max-h-[60vh]">
                      {previewContent || "No content to display"}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500 p-6">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  {previewFile.mimeType?.includes("pdf") ||
                  previewFile.name.endsWith(".pdf") ? (
                    <div className="w-12 h-12 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-bold">PDF</span>
                    </div>
                  ) : (
                    <File className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                  {previewFile.mimeType?.includes("pdf") ||
                  previewFile.name.endsWith(".pdf")
                    ? "PDF Preview"
                    : "Preview not available"}
                </h3>
                <p className="text-center mb-6 max-w-md text-gray-600 leading-relaxed">
                  {previewFile.mimeType?.includes("pdf") ||
                  previewFile.name.endsWith(".pdf")
                    ? "This PDF file cannot be previewed inline. Download the file to view it in your default PDF viewer, or use the AI analysis to extract text content."
                    : previewContent}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => onDownload(previewFile)}
                    className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {previewFile.mimeType?.includes("pdf") ||
                    previewFile.name.endsWith(".pdf")
                      ? "Download PDF"
                      : "Download File"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              <span className="font-medium">Uploaded:</span>{" "}
              {new Date(previewFile.uploadedAt).toLocaleDateString()} at{" "}
              {new Date(previewFile.uploadedAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAIChat((prev) => !prev)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            >
              <Brain className="w-4 h-4 mr-2" />
              {showAIChat ? "Close AI" : "AI Analyze"}
            </button>
            <button
              onClick={() => onDownload(previewFile)}
              className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Share Menu */}
      <ShareMenu
        isOpen={showShareMenu}
        onClose={() => setShowShareMenu(false)}
        fileName={previewFile.name}
        fileUrl={previewFile.webViewLink || previewFile.content}
        fileContent={previewContent}
        position={shareMenuPosition}
      />
    </div>
  );
};
