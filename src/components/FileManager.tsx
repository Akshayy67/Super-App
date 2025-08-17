import React, { useState, useEffect } from "react";
import {
  Upload,
  Folder,
  File,
  Search,
  MoreVertical,
  Plus,
  FolderPlus,
  Trash2,
  Eye,
  Download,
  Brain,
  ArrowLeft,
  FolderOpen,
} from "lucide-react";
import { FileItem } from "../types";
import { storageUtils } from "../utils/storage";
import { realTimeAuth } from "../utils/realTimeAuth";
import { unifiedAIService } from "../utils/aiConfig";

interface FileManagerProps {
  onPreviewFile: (file: FileItem) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({ onPreviewFile }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user, currentFolderId]);

  const loadFiles = () => {
    if (!user) return;
    const allFiles = storageUtils.getFiles(user.id);
    setFiles(allFiles);
  };

  const getCurrentFolderFiles = () => {
    return files.filter((file) => file.parentId === currentFolderId);
  };

  const getFilteredFiles = () => {
    const currentFiles = getCurrentFolderFiles();
    if (!searchQuery.trim()) return currentFiles;

    return currentFiles.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getCurrentPath = () => {
    if (!currentFolderId) return ["Home"];

    const path = ["Home"];
    let folderId = currentFolderId;

    while (folderId) {
      const folder = files.find((f) => f.id === folderId);
      if (folder) {
        path.unshift(folder.name);
        folderId = folder.parentId;
      } else {
        break;
      }
    }

    return path;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const uploadedFiles = Array.from(event.target.files || []);
    if (!user) return;

    for (const file of uploadedFiles) {
      const fileId = storageUtils.generateId();

      // Simulate upload progress
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;

        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const newFile: FileItem = {
          id: fileId,
          name: file.name,
          type: "file",
          mimeType: file.type,
          size: file.size,
          parentId: currentFolderId,
          content,
          uploadedAt: new Date().toISOString(),
          userId: user.id,
        };

        storageUtils.storeFile(newFile);
        loadFiles();

        // Remove progress after completion
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      };

      reader.readAsDataURL(file);
    }

    // Reset input
    event.target.value = "";
  };

  const createFolder = () => {
    if (!user || !newFolderName.trim()) return;

    const newFolder: FileItem = {
      id: storageUtils.generateId(),
      name: newFolderName.trim(),
      type: "folder",
      parentId: currentFolderId,
      uploadedAt: new Date().toISOString(),
      userId: user.id,
    };

    storageUtils.storeFile(newFolder);
    setNewFolderName("");
    setShowNewFolder(false);
    loadFiles();
  };

  const deleteFile = (fileId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      storageUtils.deleteFile(fileId);
      loadFiles();
    }
  };

  const analyzeWithAI = async (file: FileItem) => {
    if (!file.content) return;

    try {
      let extractedText = "";

      if (file.mimeType?.startsWith("image/")) {
        const ocrResult = await unifiedAIService.extractTextFromImage(
          file.content
        );
        if (ocrResult.success) {
          extractedText = ocrResult.data;
        }
      } else if (file.mimeType === "text/plain") {
        // For text files, decode base64
        try {
          extractedText = atob(file.content.split(",")[1]);
        } catch (e) {
          extractedText = file.content;
        }
      }

      if (extractedText) {
        const summaryResult = await unifiedAIService.summarizeText(
          extractedText
        );
        const conceptsResult = await unifiedAIService.extractConcepts(
          extractedText
        );

        if (summaryResult.success) {
          alert(
            `AI Analysis Complete!\n\nSummary: ${
              summaryResult.data
            }\n\nKey Concepts: ${
              conceptsResult.data || "Analysis in progress..."
            }`
          );
        }
      }
    } catch (error) {
      alert("AI analysis failed. Please try again.");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">File Manager</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </button>
            <label className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
              />
            </label>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-4">
          {getCurrentPath().map((pathItem, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => {
                  if (index === 0) {
                    setCurrentFolderId(undefined);
                  } else {
                    // Navigate to specific folder (implementation would need folder path tracking)
                  }
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {pathItem}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="border-b border-gray-200 p-4">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === "Enter" && createFolder()}
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewFolder(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-auto p-6">
        {currentFolderId && (
          <button
            onClick={() =>
              setCurrentFolderId(
                files.find((f) => f.id === currentFolderId)?.parentId
              )
            }
            className="flex items-center mb-4 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {getFilteredFiles().map((file) => (
            <div
              key={file.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {file.type === "folder" ? (
                    <Folder className="w-8 h-8 text-blue-500 mr-3" />
                  ) : (
                    <File className="w-8 h-8 text-gray-500 mr-3" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
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
                      setSelectedFile(selectedFile === file.id ? null : file.id)
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
                            setCurrentFolderId(file.id);
                            setSelectedFile(null);
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
                              onPreviewFile(file);
                              setSelectedFile(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </button>
                          <button
                            onClick={() => {
                              analyzeWithAI(file);
                              setSelectedFile(null);
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
                          deleteFile(file.id);
                          setSelectedFile(null);
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
                  onClick={() => setCurrentFolderId(file.id)}
                  className="w-full text-left"
                >
                  <p className="text-sm text-gray-600">
                    {files.filter((f) => f.parentId === file.id).length} items
                  </p>
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onPreviewFile(file)}
                      className="flex-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => analyzeWithAI(file)}
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

        {getFilteredFiles().length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No files found" : "No files yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Upload your first document to get started with AI-powered study assistance"}
            </p>
            {!searchQuery && (
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                <Upload className="w-5 h-5 mr-2" />
                Upload Files
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                />
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
