import React from "react";
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
} from "lucide-react";
import { Question } from "./InterviewSubjects";

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
  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 ${
        isPracticed
          ? "border-green-200 bg-green-50 shadow-sm"
          : "border-gray-200 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="p-6">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
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
                <span className="text-xs px-3 py-1 rounded-full border bg-gray-100 text-gray-600">
                  {question.estimatedTime} min
                </span>
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-relaxed">
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
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
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
                  : "bg-gray-100 text-gray-400 hover:text-gray-600 border border-gray-200"
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
                  : "bg-gray-100 text-gray-400 hover:text-gray-600 border border-gray-200"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
            </button>

            <button
              onClick={() => copyQuestion(question.question)}
              className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:text-gray-600 transition-all duration-300 border border-gray-200"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-5 mb-4">
          <button
            onClick={() => toggleAnswer(question.id)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 text-sm font-medium border border-blue-200"
          >
            {isExpanded ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide Answer</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>View Answer</span>
              </>
            )}
          </button>

          <button className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm font-medium border border-gray-200">
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
        {isExpanded && question.sampleAnswer && (
          <div className="mt-6 space-y-4">
            {/* Sample Answer */}
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                Sample Answer
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {question.sampleAnswer}
              </p>
            </div>

            {/* Tips */}
            {question.tips && (
              <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Tips for Answering
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="text-gray-700 flex items-start bg-white p-3 rounded-lg border border-yellow-100"
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
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                  Potential Follow-ups
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.followUps.map((followUp, idx) => (
                    <div
                      key={idx}
                      className="text-gray-700 bg-white p-3 rounded-lg border border-purple-100"
                    >
                      <span className="text-sm">• {followUp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
