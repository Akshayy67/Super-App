import React, { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, ExternalLink, Brain } from "lucide-react";
import { FileItem } from "../types";
import { filePreviewService } from "../../utils/filePreviewService";

interface EnhancedFilePreviewProps {
  file: FileItem | null;
  onClose: () => void;
  onDownload?: (file: FileItem) => void;
  onAnalyze?: (file: FileItem) => void;
}

export const EnhancedFilePreview: React.FC<EnhancedFilePreviewProps> = ({ 
  file, 
  onClose, 
  onDownload,
  onAnalyze 
}) => {
  const [zoom, setZoom] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  if (!file) return null;

  const previewInfo = filePreviewService.getPreviewInfo(
    file.name, 
    file.mimeType, 
    file.content, 
    file.id
  );

  const previewContent = filePreviewService.renderPreviewContent(
    file.name, 
    file.mimeType, 
    file.content
  );

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

  const handleAction = (action: any) => {
    switch (action.action) {
      case 'download':
        if (onDownload) {
          onDownload(file);
        } else {
          // Default download behavior
          if (file.content) {
            const mimeType = filePreviewService.getDownloadMimeType(file.name, file.mimeType);
            const link = document.createElement('a');
            link.href = file.content;
            link.download = file.name;
            link.click();
          }
        }
        break;
      
      case 'office-online':
        if (action.url) {
          window.open(action.url, '_blank');
        }
        break;
      
      case 'analyze':
        if (onAnalyze) {
          onAnalyze(file);
        }
        break;
      
      case 'external':
        if (action.url) {
          window.open(action.url, '_blank');
        }
        break;
    }
  };

  const renderPreview = () => {
    if (!previewContent) {
      // Show file type specific message with actions
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{previewInfo.icon}</span>
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-700">
              {previewInfo.title}
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {previewInfo.description}
            </p>
            <div className="space-y-2">
              {previewInfo.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(action)}
                  className={`
                    inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm text-white
                    transition-colors duration-200 mr-2 mb-2
                    ${action.color}
                  `}
                >
                  {action.action === 'download' && <Download className="w-4 h-4 mr-2" />}
                  {action.action === 'office-online' && <ExternalLink className="w-4 h-4 mr-2" />}
                  {action.action === 'analyze' && <Brain className="w-4 h-4 mr-2" />}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Render actual preview content
    switch (previewInfo.previewType) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={previewContent}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              style={{ transform: `scale(${zoom / 100})` }}
            />
          </div>
        );

      case 'pdf':
        return (
          <div className="h-full w-full">
            <iframe
              src={previewContent}
              className="w-full h-full border-0"
              title={`PDF Preview: ${file.name}`}
              onError={() => {
                console.error('PDF iframe failed to load');
              }}
            />
          </div>
        );

      case 'text':
        return (
          <div className="h-full p-6 overflow-auto">
            <pre
              className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed"
              style={{ fontSize: `${zoom}%` }}
            >
              {previewContent}
            </pre>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Preview not available</p>
          </div>
        );
    }
  };

  const canZoom = previewInfo.previewType === 'image' || previewInfo.previewType === 'text';

  return (
    <div
      ref={previewRef}
      className={`
        fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
        ${isFullScreen ? 'p-0' : 'p-4'}
      `}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`
        bg-white rounded-lg shadow-xl flex flex-col
        ${isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-5/6'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{previewInfo.icon}</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {file.name}
              </h2>
              <p className="text-sm text-gray-500">
                {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'} • {previewInfo.title}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom controls */}
            {canZoom && (
              <>
                <button
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500 min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Fullscreen toggle */}
            {!isFullScreen && (
              <button
                onClick={handleFullScreen}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Fullscreen"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-hidden relative bg-gray-50">
          {renderPreview()}
        </div>

        {/* Footer with actions */}
        {previewInfo.actions.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {previewInfo.canPreview ? 'Preview available' : 'Download to view'}
            </div>
            <div className="flex space-x-2">
              {previewInfo.actions.slice(0, 2).map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(action)}
                  className={`
                    inline-flex items-center px-3 py-1.5 rounded text-sm font-medium text-white
                    transition-colors duration-200
                    ${action.color}
                  `}
                >
                  {action.action === 'download' && <Download className="w-3 h-3 mr-1" />}
                  {action.action === 'office-online' && <ExternalLink className="w-3 h-3 mr-1" />}
                  {action.action === 'analyze' && <Brain className="w-3 h-3 mr-1" />}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedFilePreview;
