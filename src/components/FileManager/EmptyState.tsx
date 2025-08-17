import React from "react";
import { FolderOpen, Upload } from "lucide-react";

interface EmptyStateProps {
  searchQuery: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  onFileUpload,
}) => {
  return (
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
            onChange={onFileUpload}
            className="hidden"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
          />
        </label>
      )}
    </div>
  );
};
