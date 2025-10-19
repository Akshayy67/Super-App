import React, { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, ExternalLink } from "lucide-react";
import { FileItem } from "../types";
import { driveStorageUtils } from "../../utils/driveStorage";
import { filePreviewService } from "../../utils/filePreviewService";

interface FilePreviewProps {
  file: FileItem | null;
  onClose: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const [showAIChat, setShowAIChat] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  if (!file) return null;

  // Fullscreen API handlers
  const handleFullScreen = () => {
    if (!isFullScreen && previewRef.current) {
      previewRef.current.requestFullscreen?.();
      setIsFullScreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
      setIsFullScreen(false);
    }
  };

  React.useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
    };
  }, []);
  const downloadFile = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      // Check if it's a Google Drive file
      if (file.driveFileId && driveStorageUtils.isUsingGoogleDrive()) {
        // For Google Drive files, use the webContentLink if available
        if (file.webContentLink) {
          window.open(file.webContentLink, "_blank");
        } else {
          // Download through our API
          const content = await driveStorageUtils.downloadFile(
            file.driveFileId
          );
          if (content instanceof Blob) {
            const url = URL.createObjectURL(content);
            const link = document.createElement("a");
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }
      } else if (file.content) {
        // Local file with base64 content
        const link = document.createElement("a");
        link.href = file.content;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const openInGoogleDrive = () => {
    if (file.webViewLink) {
      window.open(file.webViewLink, "_blank");
    }
  };

  const renderPreview = () => {
    if (!file.content) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No preview available</p>
        </div>
      );
    }

    // Get preview info using the enhanced service
    const previewInfo = filePreviewService.getPreviewInfo(
      file.name,
      file.mimeType,
      file.content,
      file.id
    );

    // Check for corrupted or invalid data
    if (previewInfo.previewType === "corrupted") {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">{previewInfo.title}</p>
            <p className="text-sm text-gray-500 mb-4">
              {previewInfo.description}
            </p>
            <div className="space-y-2">
              {previewInfo.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (action.action === "download") {
                      downloadFile();
                    } else if (
                      action.action === "office-online" &&
                      action.url
                    ) {
                      window.open(action.url, "_blank");
                    }
                  }}
                  className={`px-4 py-2 text-white rounded-lg transition-colors mr-2 ${action.color}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Image preview
    if (file.mimeType?.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <img
            src={file.content}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ transform: `scale(${zoom / 100})` }}
          />
        </div>
      );
    }

    // Text preview
    if (file.mimeType === "text/plain") {
      try {
        const textContent = atob(file.content.split(",")[1]);
        return (
          <div
            className="h-full p-6 overflow-auto"
            data-component="file-content"
          >
            <pre
              className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed"
              style={{ fontSize: `${zoom}%` }}
              data-content="file-text"
            >
              {textContent}
            </pre>
          </div>
        );
      } catch (e) {
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Could not decode text content</p>
          </div>
        );
      }
    }

    // PDF preview with embedded viewer
    if (file.mimeType === "application/pdf") {
      try {
        return (
          <div className="h-full w-full">
            <iframe
              src={file.content}
              className="w-full h-full border-0"
              title={`PDF Preview: ${file.name}`}
              onError={() => {
                console.error("PDF iframe failed to load");
              }}
            />
          </div>
        );
      } catch (error) {
        console.error("Error rendering PDF:", error);
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 18h12V6l-4-4H4v16zm8-14v3h3l-3-3z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">PDF Preview Error</p>
              <p className="text-sm text-gray-500 mb-4">
                Could not display PDF preview.
                <br />
                The file may be corrupted or too large.
              </p>
              <button
                onClick={downloadFile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        );
      }
    }

    // PowerPoint files (.ppt, .pptx)
    if (
      file.mimeType?.includes("powerpoint") ||
      file.mimeType?.includes("presentation") ||
      file.name?.toLowerCase().endsWith(".ppt") ||
      file.name?.toLowerCase().endsWith(".pptx")
    ) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">PowerPoint Presentation</p>
            <p className="text-sm text-gray-500 mb-4">
              PowerPoint files cannot be previewed in the browser.
              <br />
              Download to view in PowerPoint or compatible software.
            </p>
            <div className="space-y-2">
              <button
                onClick={downloadFile}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors block mx-auto"
              >
                Download PowerPoint
              </button>
              <button
                onClick={() => {
                  // Try to open in Office Online if available
                  const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                    window.location.origin + "/api/file/" + file.id
                  )}`;
                  window.open(officeUrl, "_blank");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm block mx-auto"
              >
                Try Office Online
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Word documents (.doc, .docx)
    if (
      file.mimeType?.includes("msword") ||
      file.mimeType?.includes("wordprocessingml") ||
      file.name?.toLowerCase().endsWith(".doc") ||
      file.name?.toLowerCase().endsWith(".docx")
    ) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 18h12V6l-4-4H4v16zm8-14v3h3l-3-3z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Word Document</p>
            <p className="text-sm text-gray-500 mb-4">
              Word documents cannot be previewed in the browser.
              <br />
              Download to view in Word or compatible software.
            </p>
            <div className="space-y-2">
              <button
                onClick={downloadFile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors block mx-auto"
              >
                Download Document
              </button>
              <button
                onClick={() => {
                  // Try to open in Office Online if available
                  const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                    window.location.origin + "/api/file/" + file.id
                  )}`;
                  window.open(officeUrl, "_blank");
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm block mx-auto"
              >
                Try Office Online
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Excel files (.xls, .xlsx)
    if (
      file.mimeType?.includes("excel") ||
      file.mimeType?.includes("spreadsheetml") ||
      file.name?.toLowerCase().endsWith(".xls") ||
      file.name?.toLowerCase().endsWith(".xlsx")
    ) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Excel Spreadsheet</p>
            <p className="text-sm text-gray-500 mb-4">
              Excel files cannot be previewed in the browser.
              <br />
              Download to view in Excel or compatible software.
            </p>
            <div className="space-y-2">
              <button
                onClick={downloadFile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors block mx-auto"
              >
                Download Spreadsheet
              </button>
              <button
                onClick={() => {
                  // Try to open in Office Online if available
                  const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                    window.location.origin + "/api/file/" + file.id
                  )}`;
                  window.open(officeUrl, "_blank");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm block mx-auto"
              >
                Try Office Online
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Use the enhanced preview service for unsupported files
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{previewInfo.icon}</span>
          </div>
          <p className="text-gray-600 mb-2">{previewInfo.title}</p>
          <p className="text-sm text-gray-500 mb-4">
            {previewInfo.description}
          </p>
          <div className="space-y-2">
            {previewInfo.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  if (action.action === "download") {
                    downloadFile();
                  } else if (action.action === "office-online" && action.url) {
                    window.open(action.url, "_blank");
                  }
                }}
                className={`px-4 py-2 text-white rounded-lg transition-colors mr-2 block mx-auto mb-2 ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const canZoom =
    file.mimeType?.startsWith("image/") || file.mimeType === "text/plain";

  return (
    <div
      ref={previewRef}
      className={
        isFullScreen
          ? "fixed left-0 top-0 w-screen h-screen bg-white z-50 flex flex-col"
          : "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      }
    >
      <div
        className={`bg-white rounded-lg flex flex-col ${
          isFullScreen
            ? "w-full h-full" // Remove all constraints in full screen
            : "w-full h-full max-w-6xl max-h-5xl mx-4 my-4"
        }`}
        style={isFullScreen ? { borderRadius: 0 } : {}}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {file.name}
            </h3>
            <p className="text-sm text-gray-500">
              {file.size
                ? `${Math.round(file.size / 1024)} KB`
                : "Unknown size"}{" "}
              •{file.mimeType || "Unknown type"}
            </p>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setShowAIChat((prev) => !prev)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={showAIChat ? "Close AI Analysis" : "AI Analysis"}
            >
              {/* You can use a chat or analysis icon here if available */}
              <span className="font-bold">AI</span>
            </button>
            {canZoom && (
              <>
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 px-2">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}

            {file.webViewLink && (
              <button
                onClick={openInGoogleDrive}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open in Google Drive"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={downloadFile}
              disabled={isDownloading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title={isDownloading ? "Downloading..." : "Download"}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleFullScreen}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
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
              {renderPreview()}
            </div>
            <div
              className="h-full overflow-auto"
              style={{ width: "40%", minWidth: 0 }}
            >
              {/* AIChat component side-by-side */}
              {/* @ts-ignore */}
              <AIChat
                file={file}
                fileContent={
                  // Try to reuse rendered/decoded content where possible
                  (() => {
                    if (!file?.content) return "";
                    if (file?.mimeType?.startsWith("image/"))
                      return file.content;
                    if (file?.mimeType === "text/plain") {
                      try {
                        return atob(file.content.split(",")[1]);
                      } catch {
                        return "";
                      }
                    }
                    return "";
                  })()
                }
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative">
            {renderPreview()}
            {/* Second Full Screen Button (bottom right corner) */}
            {!isFullScreen && (
              <button
                onClick={handleFullScreen}
                className="absolute bottom-4 right-4 p-3 bg-gray-100 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
                title="Full Screen"
                style={{ zIndex: 10 }}
              >
                <ExternalLink className="w-6 h-6 text-gray-700" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
