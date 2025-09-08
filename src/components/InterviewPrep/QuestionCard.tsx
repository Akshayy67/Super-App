import React, { useState } from "react";
import {
  Star,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Volume2,
  Play,
  Lightbulb,
  Zap,
  TrendingUp,
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
  const hasCodeImplementation =
    question.codeImplementation && question.codeImplementation.length > 0;
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 ${
        isPracticed
          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 shadow-sm"
          : "border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="p-6">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                Question #{index + 1}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(
                  question.difficulty
                )}`}
              >
                {question.difficulty}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full border ${getTypeColor(
                  question.type
                )}`}
              >
                {question.type}
              </span>
              {question.estimatedTime && (
                <span className="text-xs px-3 py-1 rounded-full border bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                  {question.estimatedTime} min
                </span>
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 leading-relaxed">
              {question.question}
            </h3>

            {question.tags && (
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setSelectedQuestions && setShowPracticeModal) {
                        // This is a workaround since we're not directly modifying the parent's state
                        // In a real app, you'd pass a proper onSelectTag handler
                        const event = new CustomEvent("tagSelected", {
                          detail: tag,
                        });
                        document.dispatchEvent(event);
                      }
                    }}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-600 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => toggleFavorite(question.id)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isFavorite
                  ? "bg-yellow-100 text-yellow-600 border border-yellow-200"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 border border-gray-200 dark:border-slate-600"
              }`}
            >
              <Star
                className="w-5 h-5"
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>

            <button
              onClick={() => togglePracticed(question.id)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isPracticed
                  ? "bg-green-100 text-green-600 border border-green-200"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 border border-gray-200 dark:border-slate-600"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
            </button>

            <button
              onClick={() => copyQuestion(question.question)}
              className="p-3 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 rounded-xl hover:text-gray-600 dark:hover:text-gray-400 transition-all duration-300 border border-gray-200 dark:border-slate-600"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-5 mb-4 flex-wrap gap-y-2">
          <button
            onClick={() => {
              console.log(
                "QuestionCard expand button clicked!",
                question.id,
                "Current expanded:",
                isExpanded
              );
              toggleAnswer(question.id);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-all duration-300 text-sm font-medium border border-blue-200 dark:border-blue-800"
          >
            {isExpanded ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide Approach</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>View Approach</span>
              </>
            )}
          </button>

          {hasCodeImplementation && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/30 transition-all duration-300 text-sm font-medium border border-green-200 dark:border-green-800"
            >
              {showCode ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide Code</span>
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  <span>View Code</span>
                </>
              )}
            </button>
          )}

          <button className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300 text-sm font-medium border border-gray-200 dark:border-slate-600">
            <Volume2 className="w-4 h-4" />
            <span>Practice Aloud</span>
          </button>

          {setSelectedQuestions && setShowPracticeModal && (
            <button
              onClick={() => {
                setSelectedQuestions([question.id]);
                setShowPracticeModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all duration-300 text-sm font-medium border border-purple-200"
            >
              <Play className="w-4 h-4" />
              <span>Practice This</span>
            </button>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-6 space-y-4">
            {/* Approach Section */}
            {question.approach && (
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                  Approach & Strategy
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {question.approach}
                </p>
              </div>
            )}

            {/* Fallback to Sample Answer if no approach is provided */}
            {!question.approach && question.sampleAnswer && (
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                  Sample Answer
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {question.sampleAnswer}
                </p>
              </div>
            )}

            {/* Tips */}
            {question.tips && (
              <div className="p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Tips for Answering
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="text-gray-700 dark:text-gray-300 flex items-start bg-white dark:bg-slate-700 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Questions */}
            {question.followUps && (
              <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                  Potential Follow-ups
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.followUps.map((followUp, idx) => (
                    <div
                      key={idx}
                      className="text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 p-3 rounded-lg border border-purple-100 dark:border-purple-800"
                    >
                      <span className="text-sm">• {followUp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Code Implementation Section */}
        {showCode && hasCodeImplementation && (
          <div className="mt-6">
            <CodeViewer implementations={question.codeImplementation!} />
          </div>
        )}
      </div>
    </div>
  );
};
