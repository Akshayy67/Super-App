import React, { useState } from "react";
import { Copy, Check, Code, Info } from "lucide-react";

interface CodeImplementation {
  language: string;
  code: string;
  explanation?: string;
}

interface CodeViewerProps {
  implementations: CodeImplementation[];
  title?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  implementations,
  title = "Code Implementation",
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    implementations[0]?.language || ""
  );
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const currentImplementation = implementations.find(
    (impl) => impl.language === selectedLanguage
  );

  const copyToClipboard = async (code: string, language: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedStates((prev) => ({ ...prev, [language]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [language]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: "bg-yellow-100 text-yellow-800 border-yellow-200",
      typescript: "bg-blue-100 text-blue-800 border-blue-200",
      python: "bg-green-100 text-green-800 border-green-200",
      java: "bg-orange-100 text-orange-800 border-orange-200",
      cpp: "bg-purple-100 text-purple-800 border-purple-200",
      "c++": "bg-purple-100 text-purple-800 border-purple-200",
      go: "bg-cyan-100 text-cyan-800 border-cyan-200",
      rust: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[language.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getLanguageIcon = (language: string) => {
    const icons: Record<string, string> = {
      javascript: "JS",
      typescript: "TS",
      python: "Py",
      java: "Java",
      cpp: "C++",
      "c++": "C++",
      go: "Go",
      rust: "Rust",
    };
    return icons[language.toLowerCase()] || language;
  };

  if (!implementations || implementations.length === 0) {
    return null;
  }

  return (
    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <Code className="w-5 h-5 mr-2 text-gray-600" />
          {title}
        </h4>
        
        {/* Enhanced Language Selector */}
        {implementations.length > 1 && (
          <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            {implementations.map((impl, index) => (
              <button
                key={impl.language}
                onClick={() => setSelectedLanguage(impl.language)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                  selectedLanguage === impl.language
                    ? "bg-blue-500 text-white shadow-md transform scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded">
                  {getLanguageIcon(impl.language)}
                </span>
                <span>{impl.language}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {currentImplementation && (
        <div className="space-y-4">
          {/* Enhanced Code Block Header */}
          <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-3 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${getLanguageColor(currentImplementation.language)}`}>
                {currentImplementation.language}
              </span>
              <span className="text-gray-300 text-sm">
                {implementations.length > 1 && `${implementations.findIndex(impl => impl.language === selectedLanguage) + 1} of ${implementations.length}`}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(currentImplementation.code, currentImplementation.language)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm"
            >
              {copiedStates[currentImplementation.language] ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm font-mono border-t-0">
            <code>{currentImplementation.code}</code>
          </pre>

          {/* Code Explanation */}
          {currentImplementation.explanation && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2 text-blue-600" />
                Code Explanation
              </h5>
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentImplementation.explanation}
              </p>
            </div>
          )}

          {/* Language Navigation Footer */}
          {implementations.length > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Available in:</span>
                <div className="flex space-x-1">
                  {implementations.map((impl) => (
                    <button
                      key={impl.language}
                      onClick={() => setSelectedLanguage(impl.language)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        selectedLanguage === impl.language
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {getLanguageIcon(impl.language)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const currentIndex = implementations.findIndex(impl => impl.language === selectedLanguage);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : implementations.length - 1;
                    setSelectedLanguage(implementations[prevIndex].language);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    const currentIndex = implementations.findIndex(impl => impl.language === selectedLanguage);
                    const nextIndex = currentIndex < implementations.length - 1 ? currentIndex + 1 : 0;
                    setSelectedLanguage(implementations[nextIndex].language);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};