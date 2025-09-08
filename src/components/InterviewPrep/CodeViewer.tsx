import React, { useState } from "react";
import { Copy, Check, Code, Info, Zap, Target, Rocket } from "lucide-react";

interface CodeImplementation {
  language: string;
  code: string;
  explanation?: string;
  approach?: string; // Added approach field
}

interface CodeViewerProps {
  implementations: CodeImplementation[];
  title?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  implementations,
  title = "Code Implementation",
}) => {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Group implementations by approach based on explanation content
  const groupByApproach = () => {
    const groups: Record<string, CodeImplementation[]> = {};

    implementations.forEach((impl) => {
      let approach = "General";

      // First try to use the approach field if it exists
      if (impl.approach) {
        switch (impl.approach) {
          case "brute-force":
            approach = "Brute Force";
            break;
          case "moderate":
            approach = "Moderate";
            break;
          case "optimal":
            approach = "Optimal";
            break;
          default:
            approach = "General";
        }
      } else {
        // Enhanced text-based detection for when approach field is missing
        const explanation = (impl.explanation || "").toLowerCase();
        const code = (impl.code || "").toLowerCase();

        // Check explanation first
        if (
          explanation.includes("brute force") ||
          explanation.includes("brute-force") ||
          explanation.includes("naive") ||
          explanation.includes("simple") ||
          explanation.includes("basic") ||
          explanation.includes("check every") ||
          explanation.includes("nested loop")
        ) {
          approach = "Brute Force";
        } else if (
          explanation.includes("optimal") ||
          explanation.includes("efficient") ||
          explanation.includes("best") ||
          explanation.includes("fastest") ||
          explanation.includes("hash map") ||
          explanation.includes("hashmap") ||
          explanation.includes("hash table") ||
          explanation.includes("o(n)") ||
          explanation.includes("linear time")
        ) {
          approach = "Optimal";
        } else if (
          explanation.includes("moderate") ||
          explanation.includes("balanced") ||
          explanation.includes("improved") ||
          explanation.includes("enhanced") ||
          explanation.includes("two pointer") ||
          explanation.includes("sliding window") ||
          explanation.includes("stack") ||
          explanation.includes("queue")
        ) {
          approach = "Moderate";
        } else {
          // Check code comments for approach hints
          if (
            code.includes("// approach 1") ||
            code.includes("// approach 2")
          ) {
            // Extract approach number and assign based on position
            const approachMatch = code.match(/\/\/ approach (\d+)/i);
            if (approachMatch) {
              const approachNum = parseInt(approachMatch[1]);
              if (approachNum === 1) {
                approach = "Optimal";
              } else if (approachNum === 2) {
                approach = "Brute Force";
              } else {
                approach = "Moderate";
              }
            }
          } else if (
            code.includes("// brute force") ||
            code.includes("// brute-force")
          ) {
            approach = "Brute Force";
          } else if (
            code.includes("// optimal") ||
            code.includes("// hash map")
          ) {
            approach = "Optimal";
          } else if (
            code.includes("// moderate") ||
            code.includes("// two pointer")
          ) {
            approach = "Moderate";
          } else {
            // Default grouping based on language if no other hints found
            approach = "General";
          }
        }
      }

      if (!groups[approach]) {
        groups[approach] = [];
      }
      groups[approach].push(impl);
    });

    return groups;
  };

  const approachGroups = groupByApproach();
  const [selectedApproach, setSelectedApproach] = useState(
    Object.keys(approachGroups)[0] || "General"
  );

  // For each approach, select the first implementation as default
  const [selectedLanguages, setSelectedLanguages] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    Object.keys(approachGroups).forEach((approach) => {
      initial[approach] = approachGroups[approach][0]?.language || "";
    });
    return initial;
  });

  const currentImplementation = approachGroups[selectedApproach]?.find(
    (impl) => impl.language === selectedLanguages[selectedApproach]
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
    return (
      colors[language.toLowerCase()] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
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

  const getApproachIcon = (approach: string) => {
    switch (approach) {
      case "Brute Force":
        return <Zap className="w-4 h-4" />;
      case "Optimal":
        return <Rocket className="w-4 h-4" />;
      case "Moderate":
        return <Target className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getApproachColor = (approach: string) => {
    switch (approach) {
      case "Brute Force":
        return "bg-red-100 text-red-800 border-red-200";
      case "Optimal":
        return "bg-green-100 text-green-800 border-green-200";
      case "Moderate":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!implementations || implementations.length === 0) {
    return null;
  }

  return (
    <div className="p-5 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Code className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          {title}
        </h4>
      </div>

      {/* Approach Selector */}
      {Object.keys(approachGroups).length > 1 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Approach:
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 p-1 shadow-sm">
            {Object.keys(approachGroups).map((approach) => (
              <button
                key={approach}
                onClick={() => setSelectedApproach(approach)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                  selectedApproach === approach
                    ? "bg-blue-500 text-white shadow-md transform scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                {getApproachIcon(approach)}
                <span>{approach}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Language Selector for Current Approach */}
      {approachGroups[selectedApproach] &&
        approachGroups[selectedApproach].length > 1 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Language:
              </span>
            </div>
            <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 p-1 shadow-sm">
              {/* Remove duplicates by creating a unique set of languages */}
              {Array.from(
                new Set(
                  approachGroups[selectedApproach].map((impl) => impl.language)
                )
              ).map((language) => {
                const impl = approachGroups[selectedApproach].find(
                  (i) => i.language === language
                );
                return impl ? (
                  <button
                    key={language}
                    onClick={() =>
                      setSelectedLanguages((prev) => ({
                        ...prev,
                        [selectedApproach]: language,
                      }))
                    }
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                      selectedLanguages[selectedApproach] === language
                        ? "bg-blue-500 text-white shadow-md transform scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded">
                      {getLanguageIcon(language)}
                    </span>
                    <span>{language}</span>
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}

      {/* Current Implementation Display */}
      {currentImplementation && (
        <div className="space-y-4">
          {/* Enhanced Code Block Header */}
          <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-3 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${getLanguageColor(
                  currentImplementation.language
                )}`}
              >
                {currentImplementation.language}
              </span>
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${getApproachColor(
                  selectedApproach
                )}`}
              >
                {selectedApproach}
              </span>
              <span className="text-gray-300 text-sm">
                {approachGroups[selectedApproach]?.length > 1 &&
                  `${
                    approachGroups[selectedApproach].findIndex(
                      (impl) =>
                        impl.language === selectedLanguages[selectedApproach]
                    ) + 1
                  } of ${approachGroups[selectedApproach].length} languages`}
              </span>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  currentImplementation.code,
                  currentImplementation.language
                )
              }
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

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Available approaches:</span>
              <div className="flex space-x-1">
                {Object.keys(approachGroups).map((approach) => (
                  <button
                    key={approach}
                    onClick={() => setSelectedApproach(approach)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      selectedApproach === approach
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {approach}
                  </button>
                ))}
              </div>
            </div>

            {/* Approach Navigation */}
            {Object.keys(approachGroups).length > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const approaches = Object.keys(approachGroups);
                    const currentIndex = approaches.indexOf(selectedApproach);
                    const prevIndex =
                      currentIndex > 0
                        ? currentIndex - 1
                        : approaches.length - 1;
                    setSelectedApproach(approaches[prevIndex]);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  ← Previous Approach
                </button>
                <button
                  onClick={() => {
                    const approaches = Object.keys(approachGroups);
                    const currentIndex = approaches.indexOf(selectedApproach);
                    const nextIndex =
                      currentIndex < approaches.length - 1
                        ? currentIndex + 1
                        : 0;
                    setSelectedApproach(approaches[nextIndex]);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Next Approach →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
