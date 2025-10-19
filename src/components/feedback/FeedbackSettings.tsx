import React, { useState, useEffect } from "react";
import { Settings, MessageSquare, Heart, Sparkles } from "lucide-react";

interface FeedbackSettingsProps {
  onPositionChange?: (position: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "auto" | "draggable") => void;
  onSizeChange?: (size: "sm" | "md" | "lg") => void;
  onShowLabelChange?: (showLabel: boolean) => void;
  currentPosition?: string;
  currentSize?: string;
  currentShowLabel?: boolean;
}

export const FeedbackSettings: React.FC<FeedbackSettingsProps> = ({
  onPositionChange,
  onSizeChange,
  onShowLabelChange,
  currentPosition = "auto",
  currentSize = "md",
  currentShowLabel = true,
}) => {
  const [position, setPosition] = useState(currentPosition);
  const [size, setSize] = useState(currentSize);
  const [showLabel, setShowLabel] = useState(currentShowLabel);

  useEffect(() => {
    setPosition(currentPosition);
  }, [currentPosition]);

  useEffect(() => {
    setSize(currentSize);
  }, [currentSize]);

  useEffect(() => {
    setShowLabel(currentShowLabel);
  }, [currentShowLabel]);

  const handlePositionChange = (newPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "auto") => {
    setPosition(newPosition);
    onPositionChange?.(newPosition);
  };

  const handleSizeChange = (newSize: "sm" | "md" | "lg") => {
    setSize(newSize);
    onSizeChange?.(newSize);
  };

  const handleShowLabelChange = (newShowLabel: boolean) => {
    setShowLabel(newShowLabel);
    onShowLabelChange?.(newShowLabel);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Feedback Button Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Customize the position and appearance of the feedback button
          </p>
        </div>
      </div>

      {/* Position Settings */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Button Position
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "auto", label: "Auto (Smart)", description: "Automatically avoids input areas" },
              { value: "draggable", label: "Draggable", description: "Drag to any position you want" },
              { value: "bottom-right", label: "Bottom Right", description: "Traditional position" },
              { value: "bottom-left", label: "Bottom Left", description: "Alternative bottom position" },
              { value: "top-right", label: "Top Right", description: "Top corner position" },
              { value: "top-left", label: "Top Left", description: "Top left corner" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handlePositionChange(option.value as any)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  position === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs opacity-75 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Size Settings */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Button Size
          </label>
          <div className="flex gap-3">
            {[
              { value: "sm", label: "Small", size: "w-12 h-12" },
              { value: "md", label: "Medium", size: "w-14 h-14" },
              { value: "lg", label: "Large", size: "w-16 h-16" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSizeChange(option.value as any)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                  size === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className={`${option.size} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center`}>
                  <Heart className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Show Label Toggle */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Display Options
          </label>
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <div>
              <div className="font-medium text-sm text-gray-900 dark:text-white">
                Show Tooltip Label
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Display "Share your feedback" tooltip on hover
              </div>
            </div>
            <button
              onClick={() => handleShowLabelChange(!showLabel)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showLabel ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showLabel ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Preview
          </label>
          <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
              Feedback button preview area
            </div>
            <div
              className={`absolute ${
                position === "auto" ? "bottom-6 right-6" :
                position === "draggable" ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :
                position === "bottom-right" ? "bottom-6 right-6" :
                position === "bottom-left" ? "bottom-6 left-6" :
                position === "top-right" ? "top-6 right-6" :
                "top-6 left-6"
              }`}
            >
              <div
                className={`${
                  size === "sm" ? "w-12 h-12" :
                  size === "md" ? "w-14 h-14" :
                  "w-16 h-16"
                } bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg`}
              >
                <Heart className={`${
                  size === "sm" ? "w-5 h-5" :
                  size === "md" ? "w-6 h-6" :
                  "w-7 h-7"
                } text-white fill-current`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
