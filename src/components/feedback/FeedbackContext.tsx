import React, { createContext, useContext, useState, useEffect } from "react";

interface FeedbackSettings {
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "auto" | "draggable";
  size: "sm" | "md" | "lg";
  showLabel: boolean;
  avoidInputAreas: boolean;
}

interface FeedbackContextType {
  settings: FeedbackSettings;
  updateSettings: (newSettings: Partial<FeedbackSettings>) => void;
  resetSettings: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const defaultSettings: FeedbackSettings = {
  position: "draggable",
  size: "md",
  showLabel: true,
  avoidInputAreas: true,
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FeedbackSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("feedbackSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to parse feedback settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("feedbackSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<FeedbackSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <FeedbackContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedbackSettings = () => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error("useFeedbackSettings must be used within a FeedbackProvider");
  }
  return context;
};
