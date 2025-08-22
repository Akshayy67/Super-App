import React, { useState } from "react";
import {
  Star,
  CheckCircle,
  Eye,
  EyeOff,
  Code,
} from "lucide-react";
import { Question } from "./InterviewSubjects";
import { CodeViewer } from "./CodeViewer";

interface QuestionCardProps {
  question: Question;
  index: number;
  isExpanded: boolean;
  isPracticed: boolean;
  isFavorite: boolean;
  toggleAnswer: (id: string) => void;
  toggleFavorite: (id: string) => void;
  togglePracticed: (id: string) => void;
  copyQuestion: (text: string) => void;
  getDifficultyColor: (difficulty: string) => string;
  getTypeColor: (type: string) => string;
  setSelectedQuestions?: (questions: string[]) => void;
  setShowPracticeModal?: (show: boolean) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isExpanded,
  isPracticed,
  isFavorite,
  toggleAnswer,
  toggleFavorite,
  togglePracticed,
  copyQuestion,
  getDifficultyColor,
  getTypeColor,
  setSelectedQuestions,
  setShowPracticeModal,
}) => {
  const [showCode, setShowCode] = useState(false);
  const hasCodeImplementation = question.codeImplementation && question.codeImplementation.length > 0;
  
  return (
    <div className={`bg-white rounded-lg border transition-all ${
      isPracticed
        ? "border-green-200 bg-green-50/30"
        : "border-gray-200 hover:border-gray-300"
    }`}>
      <div className="p-4">
        {/* Simple Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">#{index + 1}</span>
              <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
              {question.question}
            </h3>
          </div>
          
          {/* Minimal Actions */}
          <div className="flex items-center gap-1 ml-3">
            <button
              onClick={() => toggleFavorite(question.id)}
              className={`p-2 rounded transition-colors ${
                isFavorite
                  ? "text-yellow-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => togglePracticed(question.id)}
              className={`p-2 rounded transition-colors ${
                isPracticed
                  ? "text-green-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Simple Action Button */}
        <button
          onClick={() => toggleAnswer(question.id)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          {isExpanded ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Answer
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show Answer
            </>
          )}
        </button>

        {/* Simplified Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {/* Answer */}
            {question.approach && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {question.approach}
                </p>
              </div>
            )}

            {!question.approach && question.sampleAnswer && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {question.sampleAnswer}
                </p>
              </div>
            )}

            {/* Code Toggle */}
            {hasCodeImplementation && (
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Code className="w-4 h-4" />
                {showCode ? "Hide Code" : "View Code"}
              </button>
            )}

            {/* Tips (simplified) */}
            {question.tips && question.tips.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tips</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {question.tips.slice(0, 3).map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-gray-400 mr-2 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Code Implementation Section */}
        {showCode && hasCodeImplementation && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <CodeViewer implementations={question.codeImplementation!} />
          </div>
        )}
      </div>
    </div>
  );
};
