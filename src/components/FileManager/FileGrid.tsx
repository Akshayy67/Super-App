import React from "react";
import {
  Folder,
  File,
  MoreVertical,
  FolderOpen,
  Eye,
  Brain,
  Trash2,
} from "lucide-react";
import { FileItem } from "../../types";

interface FileGridProps {
  files: FileItem[];
  selectedFile: string | null;
  onFileSelect: (fileId: string | null) => void;
  onFolderOpen: (folderId: string) => void;
  onFilePreview: (file: FileItem) => void;
  onFileAnalyze: (file: FileItem) => void;
  onFileDelete: (fileId: string) => void;
  formatFileSize: (bytes?: number) => string;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedFile,
  onFileSelect,
  onFolderOpen,
  onFilePreview,
  onFileAnalyze,
  onFileDelete,
  formatFileSize,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group relative"
        >
          <div className="flex flex-col space-y-3">
            <div
              className={`flex items-center space-x-3 ${
                file.type === "folder"
                  ? "cursor-pointer hover:bg-gray-50 p-2 rounded-lg -m-2"
                  : ""
              }`}
              onClick={() => {
                if (file.type === "folder") {
                  console.log("📁 Opening folder:", file.name, "ID:", file.id);
                  onFolderOpen(file.id);
                }
              }}
            >
              {file.type === "folder" ? (
                <Folder className="w-8 h-8 text-blue-500 flex-shrink-0" />
              ) : (
                <File className="w-8 h-8 text-gray-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-medium text-gray-900 truncate text-sm"
                  title={file.name}
                >
                  {file.name}
                </h3>
                {file.type === "file" && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() =>
                  onFileSelect(selectedFile === file.id ? null : file.id)
                }
                className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {selectedFile === file.id && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
                  {file.type === "folder" ? (
                    <button
                      onClick={() => {
                        onFolderOpen(file.id);
                        onFileSelect(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Open
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onFilePreview(file);
                          onFileSelect(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          onFileAnalyze(file);
                          onFileSelect(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze with AI
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      onFileDelete(file.id);
                      onFileSelect(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {file.type === "folder" ? (
            <button
              onClick={() => onFolderOpen(file.id)}
              className="w-full text-left"
            >
              <p className="text-sm text-gray-600">
                {/* This would need to be calculated from props if needed */}
                Folder
              </p>
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => onFilePreview(file)}
                  className="flex-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-md hover:bg-blue-100 transition-colors"
                >
                  Preview
                </button>
                <button
                  onClick={() => onFileAnalyze(file)}
                  className="flex-1 px-3 py-1 bg-purple-50 text-purple-600 text-xs rounded-md hover:bg-purple-100 transition-colors"
                >
                  AI Analyze
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
