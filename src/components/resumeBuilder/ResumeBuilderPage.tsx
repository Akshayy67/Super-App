// Resume Builder Page Component
import React from "react";
import { AIResumeBuilder } from "./AIResumeBuilder";

export const ResumeBuilderPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <AIResumeBuilder
        theme="modern"
        aiEnhancementEnabled={true}
        matchScoreEnabled={true}
      />
    </div>
  );
};

