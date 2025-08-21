import React, { useState } from 'react';
import { Copy, Check, Code, Clock, Zap, BookOpen, AlertTriangle, TrendingUp } from 'lucide-react';

interface CodeImplementation {
  solution: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  approach?: string;
}

interface CodeViewerProps {
  implementations: { [language: string]: CodeImplementation };
  algorithmSteps?: string[];
  commonMistakes?: string[];
  optimizations?: string[];
  relatedQuestions?: string[];
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  implementations,
  algorithmSteps,
  commonMistakes,
  optimizations,
  relatedQuestions
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    Object.keys(implementations)[0] || 'javascript'
  );
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      javascript: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      python: 'bg-blue-100 text-blue-800 border-blue-200',
      java: 'bg-red-100 text-red-800 border-red-200',
      cpp: 'bg-purple-100 text-purple-800 border-purple-200',
      go: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    };
    return colors[language] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const currentImpl = implementations[selectedLanguage];

  return (
    <div className="space-y-6">
      {/* Language Selector */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(implementations).map((language) => (
          <button
            key={language}
            onClick={() => setSelectedLanguage(language)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
              selectedLanguage === language
                ? getLanguageColor(language)
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </button>
        ))}
      </div>

      {/* Code Implementation */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-800">
          <div className="flex items-center space-x-3">
            <Code className="w-5 h-5 text-gray-300" />
            <span className="text-gray-300 font-medium">
              {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Implementation
            </span>
            {currentImpl?.approach && (
              <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                {currentImpl.approach}
              </span>
            )}
          </div>
          <button
            onClick={() => copyToClipboard(currentImpl?.solution || '')}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        
        <div className="p-4">
          <pre className="text-gray-100 text-sm leading-relaxed overflow-x-auto">
            <code>{currentImpl?.solution}</code>
          </pre>
        </div>
      </div>

      {/* Complexity Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-800">Time Complexity</h4>
          </div>
          <p className="text-green-700 font-mono text-lg">{currentImpl?.timeComplexity}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Space Complexity</h4>
          </div>
          <p className="text-blue-700 font-mono text-lg">{currentImpl?.spaceComplexity}</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-gray-600" />
          Algorithm Explanation
        </h4>
        <p className="text-gray-700 leading-relaxed">{currentImpl?.explanation}</p>
      </div>

      {/* Algorithm Steps */}
      {algorithmSteps && algorithmSteps.length > 0 && (
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Algorithm Steps
          </h4>
          <ol className="space-y-2">
            {algorithmSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-blue-200 text-blue-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Common Mistakes */}
      {commonMistakes && commonMistakes.length > 0 && (
        <div className="bg-red-50 p-5 rounded-xl border border-red-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Common Mistakes to Avoid
          </h4>
          <ul className="space-y-2">
            {commonMistakes.map((mistake, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span className="text-gray-700">{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optimizations */}
      {optimizations && optimizations.length > 0 && (
        <div className="bg-green-50 p-5 rounded-xl border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-green-600" />
            Key Optimizations
          </h4>
          <ul className="space-y-2">
            {optimizations.map((optimization, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span className="text-gray-700">{optimization}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Questions */}
      {relatedQuestions && relatedQuestions.length > 0 && (
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Related Questions
          </h4>
          <div className="flex flex-wrap gap-2">
            {relatedQuestions.map((question, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200"
              >
                {question}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};