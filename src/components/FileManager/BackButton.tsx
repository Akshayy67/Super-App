import React from "react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  currentFolderId: string | undefined;
  onNavigateBack: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({
  currentFolderId,
  onNavigateBack,
}) => {
  if (!currentFolderId) return null;

  return (
    <button
      onClick={onNavigateBack}
      className="flex items-center mb-4 text-blue-600 hover:text-blue-700 transition-colors"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </button>
  );
};
