// AI Feedback Panel Component
import React, { useState } from "react";
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X,
  Lightbulb,
  FileText,
} from "lucide-react";
import type { AIEnhancementResult } from "../../types/resumeBuilder";
import { motion, AnimatePresence } from "framer-motion";

interface AIFeedbackPanelProps {
  feedback: AIEnhancementResult | null;
  isLoading?: boolean;
  onApplyEnhancements?: (enhancements: AIEnhancementResult) => void;
  onClose?: () => void;
}

export const AIFeedbackPanel: React.FC<AIFeedbackPanelProps> = ({
  feedback,
  isLoading = false,
  onApplyEnhancements,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "improvements" | "insights">(
    "overview"
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 dark:text-gray-300">Analyzing resume...</span>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Paste a job description to get AI feedback</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">AI Feedback</h3>
              <p className="text-sm opacity-90">Resume Analysis & Suggestions</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Match Score */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Match Score</span>
              <span className="text-2xl font-bold">{feedback.matchScore}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${feedback.matchScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        {[
          { id: "overview", label: "Overview", icon: FileText },
          { id: "improvements", label: "Improvements", icon: Sparkles },
          { id: "insights", label: "Insights", icon: Lightbulb },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <StrengthsWeaknesses feedback={feedback} />
              <MissingKeywords keywords={feedback.insights.missingKeywords} />
            </motion.div>
          )}

          {activeTab === "improvements" && (
            <motion.div
              key="improvements"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <GrammarImprovements improvements={feedback.improvements.grammar} />
              <ActionVerbs verbs={feedback.improvements.actionVerbs} />
              <ReadabilityScore readability={feedback.improvements.readability} />
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Suggestions suggestions={feedback.insights.suggestions} />
              <ToneAnalysis tone={feedback.insights.toneAnalysis} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      {onApplyEnhancements && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <button
            onClick={() => onApplyEnhancements(feedback)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Apply AI Enhancements
          </button>
        </div>
      )}
    </motion.div>
  );
};

// Strengths & Weaknesses
const StrengthsWeaknesses: React.FC<{ feedback: AIEnhancementResult }> = ({
  feedback,
}) => {
  return (
    <div className="space-y-3">
      {feedback.insights.strengths.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Strengths</h4>
          </div>
          <ul className="space-y-1 ml-7">
            {feedback.insights.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                • {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.insights.weaknesses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Areas to Improve</h4>
          </div>
          <ul className="space-y-1 ml-7">
            {feedback.insights.weaknesses.map((weakness, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                • {weakness}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Missing Keywords
const MissingKeywords: React.FC<{ keywords: string[] }> = ({ keywords }) => {
  if (keywords.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Missing Keywords</h4>
      </div>
      <div className="flex flex-wrap gap-2 ml-7">
        {keywords.map((keyword, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
};

// Grammar Improvements
const GrammarImprovements: React.FC<{
  improvements: Array<{ text: string; suggestion: string }>;
}> = ({ improvements }) => {
  if (improvements.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No grammar issues found!</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Grammar Suggestions</h4>
      <div className="space-y-2">
        {improvements.map((imp, idx) => (
          <div
            key={idx}
            className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 line-through mb-1">
              {imp.text}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
              → {imp.suggestion}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Action Verbs
const ActionVerbs: React.FC<{
  verbs: Array<{ original: string; suggested: string }>;
}> = ({ verbs }) => {
  if (verbs.length === 0) return null;

  return (
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Action Verb Suggestions</h4>
      <div className="space-y-2">
        {verbs.map((verb, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-900 rounded"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">{verb.original}</span>
            <span className="text-gray-400">→</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {verb.suggested}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Readability Score
const ReadabilityScore: React.FC<{
  readability: { score: number; suggestions: string[] };
}> = ({ readability }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Readability Score</h4>
        <span className="text-lg font-bold text-blue-600">{readability.score}/100</span>
      </div>
      {readability.suggestions.length > 0 && (
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {readability.suggestions.map((suggestion, idx) => (
            <li key={idx}>• {suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Suggestions
const Suggestions: React.FC<{ suggestions: string[] }> = ({ suggestions }) => {
  if (suggestions.length === 0) return null;

  return (
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">AI Suggestions</h4>
      <ul className="space-y-2">
        {suggestions.map((suggestion, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Tone Analysis
const ToneAnalysis: React.FC<{ tone: string }> = ({ tone }) => {
  if (!tone) return null;

  return (
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tone Analysis</h4>
      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 p-3 rounded-lg">
        {tone}
      </p>
    </div>
  );
};

