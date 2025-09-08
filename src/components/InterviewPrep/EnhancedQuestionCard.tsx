import React, { useState, useEffect } from "react";
import { Question } from "./InterviewSubjects";
import { getPracticeLinks } from "./bank/enhanced/practiceLinks";
import { CodeViewer } from "./CodeViewer";

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
  const [showCode, setShowCode] = useState(false);
  const [isPracticed, setIsPracticed] = useState(false);

  // Get practice links once and store in a variable
  const practiceLinks = getPracticeLinks(question.id);

  // Debug: Check if practice links are found (only for first few questions to reduce noise)
  useEffect(() => {
    if (
      question.id === "enhanced-array-1" ||
      question.id === "enhanced-string-1"
    ) {
      console.log("=== EnhancedQuestionCard Debug ===");
      console.log("Question ID:", question.id);
      console.log("Practice links:", practiceLinks);
      console.log("Has LeetCode link:", !!practiceLinks?.leetcode);
      console.log("Has GeeksforGeeks link:", !!practiceLinks?.geeksforgeeks);

      if (practiceLinks?.leetcode) {
        console.log("✅ LeetCode link found:", practiceLinks.leetcode);
      } else {
        console.log("❌ No LeetCode link found");
      }
    }
  }, [question.id, practiceLinks]);

  // Check if the question has been practiced before
  useEffect(() => {
    const practicedQuestions = localStorage.getItem("practicedQuestions");
    if (practicedQuestions) {
      const parsedPracticed = JSON.parse(practicedQuestions);
      setIsPracticed(parsedPracticed.includes(question.id));
    }
  }, [question.id]);

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hard: "bg-red-100 text-red-800 border-red-200",
  };

  const handleCardClick = () => {
    console.log(
      "EnhancedQuestionCard clicked!",
      question.id,
      "Current expanded:",
      isExpanded
    );
    if (onSelect) {
      console.log("Using onSelect callback");
      onSelect(question);
    } else {
      console.log("Toggling expansion locally");
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className={`p-6 cursor-pointer ${
          isPracticed ? "border-l-4 border-green-500" : ""
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                {question.question.split(" - ")[0]}
              </h3>
              {isPracticed && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Practiced
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {question.question.includes(" - ")
                ? question.question.split(" - ").slice(1).join(" - ")
                : ""}
            </p>
          </div>{" "}
          <div className="flex flex-col items-end gap-2 ml-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                difficultyColors[question.difficulty]
              }`}
            >
              {question.difficulty.charAt(0).toUpperCase() +
                question.difficulty.slice(1)}
            </span>

            {question.estimatedTime && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ~{question.estimatedTime} min
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {question.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {question.tags.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                +{question.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Expand/Collapse indicator */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Click to {isExpanded ? "collapse" : "expand"}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-slate-700">
          {/* Full Question */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Problem Statement
            </h4>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {question.question}
            </p>
          </div>

          {/* Tips */}
          {question.tips && question.tips.length > 0 && (
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                💡 Key Tips
              </h4>
              <ul className="space-y-2">
                {question.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice Links */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              ⚡ Practice Now
            </h4>

            <div className="flex flex-wrap gap-3">
              {practiceLinks?.leetcode && (
                <a
                  href={practiceLinks.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPractice) {
                      onPractice(question.id);
                      setIsPracticed(true);
                    }
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.111.744 1.715.744.604 0 1.205-.229 1.715-.744.944-.945.944-2.471 0-3.416l-2.685-2.685c-.467-.467-1.101-.702-1.823-.702h-4.051c-.722 0-1.357.235-1.823.702l-4.332 4.363C1.804 7.69 1.335 8.867 1.335 10.133s.469 2.467 1.361 3.416l4.363 4.332c.907.951 2.101 1.444 3.416 1.444 1.314 0 2.508-.493 3.416-1.444l2.685-2.697c.944-.945.944-2.471 0-3.416-.945-.945-2.471-.945-3.416 0h-.058z"></path>
                  </svg>
                  LeetCode
                </a>
              )}
              {practiceLinks?.geeksforgeeks && (
                <a
                  href={practiceLinks.geeksforgeeks}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPractice) {
                      onPractice(question.id);
                      setIsPracticed(true);
                    }
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9 0c.828 0 1.5.672 1.5 1.5v10.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V9c0-.828.672-1.5 1.5-1.5h3zm9 0c.828 0 1.5.672 1.5 1.5v10.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V9c0-.828.672-1.5 1.5-1.5h3z"></path>
                  </svg>
                  GeeksforGeeks
                </a>
              )}
              {!practiceLinks?.leetcode && !practiceLinks?.geeksforgeeks && (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  No practice links available for this question.
                </div>
              )}
            </div>
          </div>

          {/* Solution */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                💻 Solution & Implementation
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCode(!showCode);
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                {showCode ? "Hide Code" : "Show Code"}
              </button>
            </div>

            {showCode &&
            question.codeImplementation &&
            question.codeImplementation.length > 0 ? (
              <CodeViewer implementations={question.codeImplementation} />
            ) : showCode && question.sampleAnswer ? (
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{question.sampleAnswer}</code>
                </pre>
              </div>
            ) : showCode ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No code implementation available for this question.
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Click "Show Code" to view detailed implementation with multiple
                approaches and complexity analysis.
              </p>
            )}
          </div>

          {/* All Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="p-6 pt-0">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                🏷️ All Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Could implement tag-based filtering here
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
