import React, { useState, useEffect } from "react";
import {
  Upload,
  Folder,
  File,
  Search,
  FolderPlus,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  ArrowLeft,
  FolderOpen,
  Brain,
  X,
  ZoomIn,
  ZoomOut,
  Share2,
} from "lucide-react";
import { FileItem } from "../types";
import { GeneralLayout } from "../layout/PageLayout";
import { driveStorageUtils } from "../../utils/driveStorage";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { unifiedAIService } from "../../utils/aiConfig";
import { extractTextFromPdfDataUrl } from "../../utils/pdfText";
import { FilePreviewModal } from "../FileManager/FilePreviewModal";
import { ShareMenu } from "../sharing/ShareMenu";

interface FileManagerProps {
  // File manager handles preview internally now
}

export const FileManager: React.FC<FileManagerProps> = () => {
  // State management
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
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [showAIChat, setShowAIChat] = useState(false);
  const [storageStatus, setStorageStatus] = useState<{
    type: "localStorage" | "googleDrive";
    hasAccess: boolean;
    needsReauth?: boolean;
    error?: string;
  }>({ type: "localStorage", hasAccess: false });
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");

  // Share menu state
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareMenuPosition, setShareMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedFileForShare, setSelectedFileForShare] =
    useState<FileItem | null>(null);

  const user = realTimeAuth.getCurrentUser();

  // Handle session expired errors
  const handleSessionExpired = (error: any) => {
    if (
      error.message &&
      error.message.includes("Google Drive access expired")
    ) {
      setSessionExpiredMessage(
        "Your Google Drive session has expired. You can continue using files with local storage, or sign in again to sync with Google Drive."
      );
      setShowSessionExpiredModal(true);
      return true; // Indicates session expired was handled
    }
    return false; // Not a session expired error
  };

  // Handle relogin
  const handleRelogin = async () => {
    try {
      setShowSessionExpiredModal(false);
      setSessionExpiredMessage("");

      // Sign out first
      await realTimeAuth.logout();

      // Show a message that user should sign in again
      alert(
        "Please sign in again to refresh your Google Drive access. You will be redirected to the sign-in page."
      );

      // Redirect to sign-in (this will be handled by the auth system)
      // The user will need to manually navigate to sign-in or refresh the page
    } catch (error) {
      console.error("Error during relogin:", error);
      alert(
        "Error during relogin. Please try signing out and signing in again manually."
      );
    }
  };

  // Continue with local storage only
  const continueWithLocalStorage = () => {
    setShowSessionExpiredModal(false);
    setSessionExpiredMessage("");
    alert(
      "You can continue using files with local storage. Your data will be saved locally and can be synced to Google Drive later when you sign in again."
    );
  };

  useEffect(() => {
    if (user) {
      loadFiles();
      // Update storage status
      const status = driveStorageUtils.getStorageStatus();
      console.log("🔍 Initial storage status:", status);
      setStorageStatus(status);
    }
  }, [user, currentFolderId]);

  const loadFiles = async () => {
    if (!user) return;
    console.log("🔄 FileManager: Loading files...");
    try {
      const allFiles = await driveStorageUtils.getFiles(user.id);
      console.log("📁 FileManager: Received files:", allFiles);
      setFiles(allFiles);

      // Update storage status after loading files
      const status = driveStorageUtils.getStorageStatus();
      setStorageStatus({ ...status, needsReauth: false, error: undefined });
      console.log(
        "✅ FileManager: Files state updated, count:",
        allFiles.length,
        "Storage type:",
        status.type
      );
    } catch (error) {
      console.error("❌ FileManager: Error loading files:", error);

      // Check if it's a Google Drive authentication error
      if (error instanceof Error && error.message.includes("expired")) {
        // Handle session expired errors
        if (!handleSessionExpired(error)) {
          // If not a session expired error, show generic error
          setStorageStatus((prev) => ({
            ...prev,
            needsReauth: true,
            error:
              "Google Drive access expired. Please sign out and sign in again.",
          }));
        }
      } else {
        setStorageStatus((prev) => ({
          ...prev,
          error: "Failed to load files. Please try again.",
        }));
      }
    }
  };

  const getCurrentFolderFiles = () => {
    // For Google Drive users, we need to handle the app folder as the root
    const isGoogleDriveUser =
      storageStatus.type === "googleDrive" && storageStatus.hasAccess;

    let filteredFiles;
    if (isGoogleDriveUser && !currentFolderId) {
      // When at root and using Google Drive, show files that are in the app folder
      // We need to identify which parentId represents the app folder
      const parentIds = [
        ...new Set(files.map((f) => f.parentId).filter(Boolean)),
      ];

      if (parentIds.length === 1) {
        // If all files have the same parentId, that's likely the app folder
        filteredFiles = files.filter((file) => file.parentId === parentIds[0]);
      } else {
        // Fallback: show files with any parentId when at root
        filteredFiles = files.filter(
          (file) => !file.parentId || file.parentId === parentIds[0]
        );
      }
    } else {
      // Normal filtering for localStorage or when inside a specific folder
      // At root level (currentFolderId is undefined), show only files without parentId
      // Inside a folder, show only files with matching parentId
      if (currentFolderId === undefined) {
        filteredFiles = files.filter((file) => !file.parentId);
      } else {
        filteredFiles = files.filter(
          (file) => file.parentId === currentFolderId
        );
      }
    }

    console.log("📂 Current folder files:", {
      totalFiles: files.length,
      currentFolderId,
      filteredFiles: filteredFiles.length,
      isGoogleDriveUser,
      storageType: storageStatus.type,
      files: files.map((f) => ({ name: f.name, parentId: f.parentId })),
    });

    return filteredFiles;
  };

  const getFilteredFiles = () => {
    const currentFiles = getCurrentFolderFiles();
    if (!searchQuery.trim()) return currentFiles;

    return currentFiles.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getCurrentPath = (): { name: string; id: string | undefined }[] => {
    if (!currentFolderId) return [{ name: "Home", id: undefined }];

    const path: { name: string; id: string | undefined }[] = [
      { name: "Home", id: undefined },
    ];
    let folderId: string | undefined = currentFolderId;

    while (folderId) {
      const folder = files.find((f) => f.id === folderId);
      if (folder) {
        path.unshift({ name: folder.name, id: folder.id });
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
      const fileId = driveStorageUtils.generateId();

      // Show upload progress
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      try {
        // Simulate progress updates
        for (let progress = 0; progress <= 80; progress += 20) {
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Upload file to Google Drive or localStorage
        console.log("📤 Uploading file:", {
          fileName: file.name,
          currentFolderId,
          userId: user.id,
        });

        const uploadedFile = await driveStorageUtils.uploadFile(
          file,
          user.id,
          currentFolderId
        );

        console.log("✅ Upload result:", uploadedFile);

        if (uploadedFile) {
          // Complete progress
          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Reload files
          await loadFiles();
        }

        // Remove progress after completion
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        // Handle session expired errors
        if (!handleSessionExpired(error)) {
          // If not a session expired error, show generic error
          console.error("Generic error uploading file:", error);
        }
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    }

    // Reset input
    event.target.value = "";
  };

  const createFolder = async () => {
    if (!user || !newFolderName.trim()) return;

    try {
      const newFolder = await driveStorageUtils.createFolder(
        newFolderName.trim(),
        user.id,
        currentFolderId
      );

      if (newFolder) {
        setNewFolderName("");
        setShowNewFolder(false);
        await loadFiles();
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      // Handle session expired errors
      if (!handleSessionExpired(error)) {
        // If not a session expired error, show generic error
        console.error("Generic error creating folder:", error);
      }
    }
  };

  const deleteFile = async (fileId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const success = await driveStorageUtils.deleteFile(fileId);
        if (success) {
          await loadFiles();
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        // Handle session expired errors
        if (!handleSessionExpired(error)) {
          // If not a session expired error, show generic error
          console.error("Generic error deleting file:", error);
        }
      }
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
        if (ocrResult.success && ocrResult.data) {
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

  const handlePreviewFile = async (file: FileItem) => {
    // Immediately show the modal for quick response like Gmail
    setPreviewFile(file);
    setPreviewZoom(100); // Reset zoom

    // If no content is available, try to fetch it
    if (!file.content) {
      console.log("📄 No content found locally, attempting to fetch...", file);

      // Show loading message immediately
      setPreviewContent("Loading file content...");

      // Try to fetch content from Google Drive if it's a Drive file
      if (file.driveFileId && storageStatus.type === "googleDrive") {
        try {
          console.log(
            "☁️ Fetching content from Google Drive for file:",
            file.driveFileId
          );

          // Use the Google Drive service to download the file
          const content = await driveStorageUtils.downloadFileContent(
            file.driveFileId
          );

          if (content) {
            console.log("✅ Successfully fetched file content");
            // Process the fetched content
            processFileContent(file, content);
            return;
          }
        } catch (error) {
          console.error("❌ Error fetching from Google Drive:", error);
          // Handle session expired errors
          if (!handleSessionExpired(error)) {
            // If not a session expired error, show generic error
            console.error("Generic error fetching from Google Drive:", error);
          }
        }
      }

      // If we can't fetch content, show appropriate message
      setPreviewContent(
        "This file cannot be previewed. The content may not be accessible or the file type is not supported for preview. You can download the file to view its contents."
      );
      return;
    }

    // Process existing content immediately
    if (file.content) {
      processFileContent(file, file.content);
    } else {
      setPreviewContent("No content available for preview.");
    }
  };

  const processFileContent = (file: FileItem, content: string) => {
    try {
      if (file.mimeType?.startsWith("image/")) {
        // For images, use the content directly (should be data URL)
        setPreviewContent(content);
      } else if (
        file.mimeType === "text/plain" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".js") ||
        file.name.endsWith(".ts") ||
        file.name.endsWith(".html") ||
        file.name.endsWith(".css") ||
        file.name.endsWith(".csv") ||
        file.mimeType?.includes("text/")
      ) {
        // For text-based files, decode base64 if needed
        try {
          let decodedContent = "";

          if (content.startsWith("data:")) {
            // Handle data URL format (data:text/plain;base64,...)
            const base64Data = content.split(",")[1];
            decodedContent = atob(base64Data);
          } else {
            // Try to decode as base64 first, fallback to raw content
            try {
              decodedContent = atob(content);
            } catch {
              // If it's not base64, use as is
              decodedContent = content;
            }
          }

          // Limit preview to first 10000 characters for performance
          if (decodedContent.length > 10000) {
            decodedContent =
              decodedContent.substring(0, 10000) +
              "\n\n... (content truncated, download file to view all)";
          }

          setPreviewContent(decodedContent);
          // Print decoded text content to console once when previewed
          try {
            console.log(
              "\n===== Preview Text: " +
                (file.name || "Untitled") +
                " =====\n" +
                decodedContent +
                "\n===== End Preview Text =====\n"
            );
          } catch {}
        } catch (e) {
          console.error("Error decoding text content:", e);
          setPreviewContent(
            "Error decoding file content. The file may be corrupted or in an unsupported format."
          );
        }
      } else if (file.mimeType?.includes("pdf") || file.name.endsWith(".pdf")) {
        // For PDF files, we can embed them using the browser's PDF viewer
        if (
          content.startsWith("data:application/pdf") ||
          content.startsWith("data:application/x-pdf")
        ) {
          // If it's a data URL, use it directly for embedding
          setPreviewContent(content);

          // Also try to extract and print text from the PDF once for debugging/verification
          (async () => {
            try {
              const text = await extractTextFromPdfDataUrl(content);
              if (text) {
                console.log(
                  "\n===== Preview PDF Text: " +
                    (file.name || "Untitled") +
                    " =====\n" +
                    text +
                    "\n===== End Preview PDF Text =====\n"
                );
              }
            } catch (e) {
              console.warn(
                "Could not extract text from PDF for console output."
              );
            }
          })();
        } else {
          // If it's not a data URL but we have content, convert it
          try {
            const pdfDataUrl = content.startsWith("data:")
              ? content
              : `data:application/pdf;base64,${content}`;
            setPreviewContent(pdfDataUrl);

            // Attempt to extract and print text from the newly formed data URL
            (async () => {
              try {
                const text = await extractTextFromPdfDataUrl(pdfDataUrl);
                if (text) {
                  console.log(
                    "\n===== Preview PDF Text: " +
                      (file.name || "Untitled") +
                      " =====\n" +
                      text +
                      "\n===== End Preview PDF Text =====\n"
                  );
                }
              } catch (e) {
                console.warn(
                  "Could not extract text from PDF for console output."
                );
              }
            })();
          } catch (error) {
            console.error("Error processing PDF content:", error);
            setPreviewContent("PDF_DOWNLOAD_ONLY");
          }
        }
      } else if (
        file.mimeType?.includes("application/vnd.openxmlformats") ||
        file.mimeType?.includes("application/msword") ||
        file.name.endsWith(".docx") ||
        file.name.endsWith(".doc")
      ) {
        setPreviewContent(
          "Microsoft Word document preview is not available. Please download the file to view its contents."
        );
      } else if (
        file.mimeType?.includes("application/vnd.ms-powerpoint") ||
        file.mimeType?.includes(
          "application/vnd.openxmlformats-officedocument.presentationml"
        ) ||
        file.name.endsWith(".ppt") ||
        file.name.endsWith(".pptx")
      ) {
        setPreviewContent(
          "PowerPoint presentation preview is not available. Please download the file to view its contents."
        );
      } else if (
        file.mimeType?.includes("application/vnd.ms-excel") ||
        file.mimeType?.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml"
        ) ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsx")
      ) {
        setPreviewContent(
          "Excel spreadsheet preview is not available. Please download the file to view its contents."
        );
      } else {
        setPreviewContent(
          `Preview not available for ${
            file.mimeType || "this file type"
          }. Please download the file to view its contents.`
        );
      }
    } catch (error) {
      console.error("Error processing file content:", error);
      setPreviewContent(
        "Error loading file preview. Please try downloading the file."
      );
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewContent("");
    setPreviewZoom(100);
  };

  const downloadFile = (file: FileItem) => {
    if (!file.content) return;

    try {
      const link = document.createElement("a");
      link.href = file.content;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleShareFile = (file: FileItem, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShareMenuPosition({
      x: rect.left,
      y: rect.bottom + 5,
    });
    setSelectedFileForShare(file);
    setShowShareMenu(true);
    setSelectedFile(null);
  };

  return (
    <GeneralLayout>
      <div
        className="min-h-screen flex flex-col scroll-area transition-colors duration-300"
        data-component="file-manager"
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 p-responsive">
          {/* Error Banner */}
          {storageStatus.error && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                storageStatus.needsReauth
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      storageStatus.needsReauth
                        ? "text-red-600 dark:text-red-400"
                        : "text-yellow-600 dark:text-yellow-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span
                    className={`text-sm font-medium ${
                      storageStatus.needsReauth
                        ? "text-red-800 dark:text-red-200"
                        : "text-yellow-800 dark:text-yellow-200"
                    }`}
                  >
                    {storageStatus.error}
                  </span>
                </div>
                {storageStatus.needsReauth && (
                  <button
                    onClick={() => {
                      // Sign out to force re-authentication
                      realTimeAuth.logout();
                    }}
                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
                  >
                    Sign Out & Re-authenticate
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Google Drive Access Warning */}
          {user &&
            !realTimeAuth.hasGoogleDriveAccess() &&
            realTimeAuth.shouldHaveGoogleDriveAccess() && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mx-6 mt-4 rounded-r-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-orange-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-orange-800">
                      <strong>Google Drive Access Expired:</strong> Your session
                      has expired.
                      <button
                        onClick={handleRelogin}
                        className="ml-2 underline hover:no-underline font-medium"
                      >
                        Sign in again
                      </button>
                      to sync your files with Google Drive, or continue using
                      local storage.
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-responsive-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                File Manager
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-responsive-sm text-gray-600 dark:text-gray-400">
                  Storage:
                </span>
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    storageStatus.type === "googleDrive"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                  }`}
                >
                  {storageStatus.type === "googleDrive" ? (
                    <>
                      <svg
                        className="w-3 h-3 mr-1"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6.28 3l5.72 10 5.72-10H6.28zm7.32 11L9 24h11l-6.4-10zm-7.2 0L0 24h9l-2.6-10z" />
                      </svg>
                      Google Drive
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      Local Storage
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
              <button
                onClick={() => setShowNewFolder(true)}
                className="btn-touch flex items-center px-3 sm:px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm touch-manipulation"
              >
                <FolderPlus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">New Folder</span>
                <span className="xs:hidden">New</span>
              </button>
              <label className="btn-touch flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors text-sm touch-manipulation">
                <Upload className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Upload Files</span>
                <span className="xs:hidden">Upload</span>
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
          <div className="flex items-center space-x-2 mb-4 overflow-x-auto scrollbar-hide">
            {getCurrentPath().map((pathItem, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">
                    /
                  </span>
                )}
                <button
                  onClick={() => {
                    console.log(
                      "🧭 Navigating to:",
                      pathItem.name,
                      "ID:",
                      pathItem.id
                    );
                    setCurrentFolderId(pathItem.id);
                  }}
                  className="btn-touch text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base whitespace-nowrap touch-manipulation"
                >
                  {pathItem.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="border-b border-gray-200 p-4">
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
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
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Create New Folder
              </h3>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewFolder(false);
                    setNewFolderName("");
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
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
        <div className="flex-1 overflow-auto scroll-area container-safe py-responsive">
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

          {getFilteredFiles().length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? "No files found" : "No files yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getFilteredFiles().map((file) => (
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
                          console.log(
                            "📁 Opening folder:",
                            file.name,
                            "ID:",
                            file.id
                          );
                          setCurrentFolderId(file.id);
                        }
                      }}
                    >
                      {file.type === "folder" ? (
                        <Folder className="w-8 h-8 text-blue-500 flex-shrink-0" />
                      ) : (
                        <File className="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm"
                          title={file.name}
                        >
                          {file.name}
                        </h3>
                        {file.type === "file" && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setSelectedFile(
                            selectedFile === file.id ? null : file.id
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </button>

                      {selectedFile === file.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
                          {file.type === "folder" ? (
                            <button
                              onClick={() => {
                                setCurrentFolderId(file.id);
                                setSelectedFile(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center"
                            >
                              <FolderOpen className="w-4 h-4 mr-2" />
                              Open
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  handlePreviewFile(file);
                                  setSelectedFile(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </button>
                              <button
                                onClick={() => {
                                  analyzeWithAI(file);
                                  setSelectedFile(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center"
                              >
                                <Brain className="w-4 h-4 mr-2" />
                                Analyze with AI
                              </button>
                              <button
                                onClick={(e) => handleShareFile(file, e)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {files.filter((f) => f.parentId === file.id).length}{" "}
                        items
                      </p>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePreviewFile(file)}
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
          )}
        </div>

        {/* Session Expired Modal */}
        {showSessionExpiredModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Session Expired
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {sessionExpiredMessage}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRelogin}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Sign In Again
                </button>
                <button
                  onClick={continueWithLocalStorage}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 font-medium"
                >
                  Continue with Local Storage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal - now using FilePreviewModal */}
        {previewFile && (
          <FilePreviewModal
            previewFile={previewFile}
            previewContent={previewContent}
            previewZoom={previewZoom}
            onClose={() => setPreviewFile(null)}
            onZoomChange={setPreviewZoom}
            onDownload={downloadFile}
            onAnalyze={() => setShowAIChat((prev) => !prev)}
            formatFileSize={formatFileSize}
            showAIChat={showAIChat}
            setShowAIChat={setShowAIChat}
          />
        )}

        {/* Share Menu */}
        {selectedFileForShare && (
          <ShareMenu
            isOpen={showShareMenu}
            onClose={() => {
              setShowShareMenu(false);
              setSelectedFileForShare(null);
            }}
            fileName={selectedFileForShare.name}
            fileUrl={
              selectedFileForShare.webViewLink || selectedFileForShare.content
            }
            position={shareMenuPosition}
          />
        )}
      </div>
    </GeneralLayout>
  );
};
