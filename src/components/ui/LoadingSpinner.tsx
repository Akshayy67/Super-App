import React from "react";
import { LoadingGlobe } from "./LoadingGlobe";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "md",
  className = "",
}) => {
  const sizeMap = {
    sm: 24,
    md: 48,
    lg: 64,
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-2 ${className}`}
    >
      <LoadingGlobe size={sizeMap[size]} />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
};
