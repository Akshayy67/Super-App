import React, { useState } from 'react';

interface SolutionApproach {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  code: string;
  pros: string[];
  cons: string[];
}

interface SolutionApproachCardProps {
  approaches: SolutionApproach[];
  questionTitle: string;
}

export const SolutionApproachCard: React.FC<SolutionApproachCardProps> = ({ 
  approaches, 
  questionTitle 
}) => {
  const [selectedApproach, setSelectedApproach] = useState(0);
  const [showCode, setShowCode] = useState(false);

  const currentApproach = approaches[selectedApproach];

  const getComplexityColor = (complexity: string) => {
    if (complexity.includes('O(1)') || complexity.includes('O(log')) {
      return 'text-green-600 bg-green-50';
    } else if (complexity.includes('O(n)') && !complexity.includes('²') && !complexity.includes('^')) {
      return 'text-blue-600 bg-blue-50';
    } else if (complexity.includes('O(n²)') || complexity.includes('O(n log n)')) {
      return 'text-yellow-600 bg-yellow-50';
    } else {
      return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Solution Approaches: {questionTitle}
        </h3>
        <p className="text-gray-600">
          Multiple implementation strategies with complexity analysis
        </p>
      </div>

      {/* Approach Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {approaches.map((approach, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedApproach(index);
                setShowCode(false);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedApproach === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {approach.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Approach Content */}
      <div className="p-6">
        {/* Complexity Analysis */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Time Complexity</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-mono ${getComplexityColor(currentApproach.timeComplexity)}`}>
              {currentApproach.timeComplexity}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Space Complexity</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-mono ${getComplexityColor(currentApproach.spaceComplexity)}`}>
              {currentApproach.spaceComplexity}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Approach Description</h4>
          <p className="text-gray-700 leading-relaxed">{currentApproach.description}</p>
        </div>

        {/* Pros and Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Advantages
            </h4>
            <ul className="space-y-2">
              {currentApproach.pros.map((pro, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">•</span>
                  <span className="text-gray-700 text-sm">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-red-500 mr-2">✗</span>
              Disadvantages
            </h4>
            <ul className="space-y-2">
              {currentApproach.cons.map((con, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2 mt-0.5">•</span>
                  <span className="text-gray-700 text-sm">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Code Implementation */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Implementation</h4>
            <button
              onClick={() => setShowCode(!showCode)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              {showCode ? 'Hide Code' : 'Show Code'}
            </button>
          </div>

          {showCode ? (
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{currentApproach.code}</code>
              </pre>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">
                Click "Show Code" to view the complete implementation
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(currentApproach.code);
            }}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            📋 Copy Code
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Could implement practice mode here
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            🚀 Practice
          </button>
        </div>
      </div>
    </div>
  );
};