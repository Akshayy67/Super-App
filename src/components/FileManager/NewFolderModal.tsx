import React from "react";

interface NewFolderModalProps {
  isVisible: boolean;
  folderName: string;
  onFolderNameChange: (name: string) => void;
  onCreateFolder: () => void;
  onCancel: () => void;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isVisible,
  folderName,
  onFolderNameChange,
  onCreateFolder,
  onCancel,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
        <input
          type="text"
          placeholder="Folder name"
          value={folderName}
          onChange={(e) => onFolderNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          onKeyDown={(e) => e.key === "Enter" && onCreateFolder()}
          autoFocus
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCreateFolder}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
