import React from "react";

interface UploadProgressProps {
  uploadProgress: { [key: string]: number };
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  uploadProgress,
}) => {
  if (Object.keys(uploadProgress).length === 0) {
    return null;
  }

  return (
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
  );
};
