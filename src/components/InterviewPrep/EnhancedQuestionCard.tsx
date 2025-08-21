import React, { useState } from 'react';
import { Question } from './InterviewSubjects';

interface EnhancedQuestionCardProps {
  question: Question;
  onSelect?: (question: Question) => void;
}

export const EnhancedQuestionCard: React.FC<EnhancedQuestionCardProps> = ({ 
  question, 
  onSelect 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    hard: 'bg-red-100 text-red-800 border-red-200'
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(question);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {question.question.split(' - ')[0]}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {question.question.includes(' - ') ? question.question.split(' - ').slice(1).join(' - ') : ''}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[question.difficulty]}`}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
            
            {question.estimatedTime && (
              <span className="text-xs text-gray-500">
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
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {question.tags.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                +{question.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Expand/Collapse indicator */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Click to {isExpanded ? 'collapse' : 'expand'}
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Full Question */}
          <div className="p-6 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-2">Problem Statement</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{question.question}</p>
          </div>

          {/* Tips */}
          {question.tips && question.tips.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3">💡 Key Tips</h4>
              <ul className="space-y-2">
                {question.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-700 text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Solution */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">💻 Solution & Implementation</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSolution(!showSolution);
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                {showSolution ? 'Hide Code' : 'Show Code'}
              </button>
            </div>

            {showSolution && (
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{question.sampleAnswer}</code>
                </pre>
              </div>
            )}

            {!showSolution && (
              <p className="text-gray-600 text-sm">
                Click "Show Code" to view detailed implementation with multiple approaches and complexity analysis.
              </p>
            )}
          </div>

          {/* All Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="p-6 pt-0">
              <h4 className="font-semibold text-gray-900 mb-3">🏷️ All Tags</h4>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
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