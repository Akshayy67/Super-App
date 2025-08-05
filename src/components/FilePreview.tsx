import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { FileItem } from '../types';

interface FilePreviewProps {
  file: FileItem | null;
  onClose: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(100);

  if (!file) return null;

  const downloadFile = () => {
    if (!file.content) return;
    
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    if (!file.content) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No preview available</p>
        </div>
      );
    }

    // Image preview
    if (file.mimeType?.startsWith('image/')) {
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
    if (file.mimeType === 'text/plain') {
      try {
        const textContent = atob(file.content.split(',')[1]);
        return (
          <div className="h-full p-6 overflow-auto">
            <pre 
              className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed"
              style={{ fontSize: `${zoom}%` }}
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

    // PDF preview (simplified - in production would use react-pdf)
    if (file.mimeType === 'application/pdf') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 18h12V6l-4-4H4v16zm8-14v3h3l-3-3z"/>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">PDF Preview</p>
            <p className="text-sm text-gray-500 mb-4">
              Full PDF preview requires additional setup.<br />
              Click download to view the file.
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

    // Unsupported file type
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 18h12V6l-4-4H4v16zm8-14v3h3l-3-3z"/>
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Preview not available</p>
          <p className="text-sm text-gray-500 mb-4">
            This file type is not supported for preview
          </p>
          <button
            onClick={downloadFile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download File
          </button>
        </div>
      </div>
    );
  };

  const canZoom = file.mimeType?.startsWith('image/') || file.mimeType === 'text/plain';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-5xl mx-4 my-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {file.name}
            </h3>
            <p className="text-sm text-gray-500">
              {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'} • 
              {file.mimeType || 'Unknown type'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {canZoom && (
              <>
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 px-2">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}
            
            <button
              onClick={downloadFile}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};