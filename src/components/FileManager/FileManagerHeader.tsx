import React from "react";
import { FolderPlus, Upload } from "lucide-react";

interface StorageStatus {
  type: "localStorage" | "googleDrive";
  hasAccess: boolean;
}

interface FileManagerHeaderProps {
  storageStatus: StorageStatus;
  onCreateFolder: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileManagerHeader: React.FC<FileManagerHeaderProps> = ({
  storageStatus,
  onCreateFolder,
  onFileUpload,
}) => {
  return (
    <div className="border-b border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">File Manager</h2>
          <div className="flex items-center mt-1">
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                storageStatus.type === "googleDrive"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
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
        <div className="flex items-center space-x-3">
          <button
            onClick={onCreateFolder}
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
              onChange={onFileUpload}
              className="hidden"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
