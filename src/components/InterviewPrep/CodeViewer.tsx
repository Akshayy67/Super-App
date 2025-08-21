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
        
        {/* Language Selector */}
        {implementations.length > 1 && (
          <div className="flex space-x-2">
            {implementations.map((impl) => (
              <button
                key={impl.language}
                onClick={() => setSelectedLanguage(impl.language)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedLanguage === impl.language
                    ? getLanguageColor(impl.language)
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {impl.language}
              </button>
            ))}
          </div>
        )}
      </div>

      {currentImplementation && (
        <div className="space-y-4">
          {/* Code Block */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-1 rounded border ${getLanguageColor(currentImplementation.language)}`}>
                {currentImplementation.language}
              </span>
              <button
                onClick={() => copyToClipboard(currentImplementation.code, currentImplementation.language)}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                {copiedStates[currentImplementation.language] ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{currentImplementation.code}</code>
            </pre>
          </div>

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
        </div>
      )}
    </div>
  );
};