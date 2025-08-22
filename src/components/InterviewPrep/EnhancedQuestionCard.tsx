import React, { useState, useEffect } from "react";
import { Question } from "./InterviewSubjects";
import { getPracticeLinks } from "./bank/enhanced/practiceLinks";

interface EnhancedQuestionCardProps {
  question: Question;
  onSelect?: (question: Question) => void;
  onPractice?: (questionId: string) => void;
}

export const EnhancedQuestionCard: React.FC<EnhancedQuestionCardProps> = ({
  question,
  onSelect,
  onPractice,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isPracticed, setIsPracticed] = useState(false);

  // Check if the question has been practiced before
  useEffect(() => {
    const practicedQuestions = localStorage.getItem("practicedQuestions");
    if (practicedQuestions) {
      const parsedPracticed = JSON.parse(practicedQuestions);
      setIsPracticed(parsedPracticed.includes(question.id));
    }
  }, [question.id]);

  const difficultyColors = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(question);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      {/* Simplified Header */}
      <div
        className={`p-4 cursor-pointer ${
          isPracticed ? "border-l-2 border-green-500" : ""
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-900 mb-2 leading-relaxed">
              {question.question.split(" - ")[0]}
            </h3>
            {question.question.includes(" - ") && (
              <p className="text-sm text-gray-600 mb-3">
                {question.question.split(" - ").slice(1).join(" - ")}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-3">
            <span className={`px-2 py-1 rounded text-xs ${difficultyColors[question.difficulty]}`}>
              {question.difficulty}
            </span>
            {isPracticed && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </div>
        </div>

        {/* Minimal Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex gap-1 mt-2">
            {question.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {question.tags.length > 3 && (
              <span className="px-2 py-1 text-gray-400 text-xs">
                +{question.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Simplified Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          {/* Full Question */}
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* Tips (minimal) */}
          {question.tips && question.tips.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Tips</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {question.tips.slice(0, 2).map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice Links (simplified) */}
          <div className="flex gap-2 pt-2">
            {getPracticeLinks(question.id)?.leetcode && (
              <a
                href={getPracticeLinks(question.id)?.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPractice) {
                    onPractice(question.id);
                    setIsPracticed(true);
                  }
                }}
              >
                LeetCode
              </a>
            )}
            {getPracticeLinks(question.id)?.geeksforgeeks && (
              <a
                href={getPracticeLinks(question.id)?.geeksforgeeks}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPractice) {
                    onPractice(question.id);
                    setIsPracticed(true);
                  }
                }}
              >
                GeeksforGeeks
              </a>
            )}
          </div>

          {/* Simple Solution Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSolution(!showSolution);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showSolution ? "Hide Solution" : "Show Solution"}
          </button>

          {/* Minimal Solution Display */}
          {showSolution && (
            <div className="bg-gray-50 rounded p-3">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                <code>{question.sampleAnswer}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
