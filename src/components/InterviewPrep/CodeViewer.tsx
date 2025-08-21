import React, { useState } from 'react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ 
  code, 
  language = 'typescript', 
  title,
  showLineNumbers = true 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-300 text-sm font-medium">{title}</span>
            <span className="text-gray-500 text-xs">{language}</span>
          </div>
          
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 text-xs transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Code Content */}
      <div className="relative">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {lines.map((line, index) => (
                <tr key={index} className="hover:bg-gray-800">
                  {showLineNumbers && (
                    <td className="w-12 px-4 py-0.5 text-gray-500 text-xs text-right select-none border-r border-gray-700">
                      {index + 1}
                    </td>
                  )}
                  <td className="px-4 py-0.5">
                    <pre className="text-sm">
                      <code className={`language-${language} text-gray-300`}>
                        {line || ' '}
                      </code>
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Copy button for mobile */}
        {!title && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Syntax highlighting helper (basic)
export const SyntaxHighlighter: React.FC<{ code: string; language: string }> = ({ 
  code, 
  language 
}) => {
  const highlightCode = (code: string, lang: string) => {
    // Basic syntax highlighting patterns
    const patterns = {
      typescript: [
        { regex: /\b(function|const|let|var|if|else|for|while|return|class|interface|type)\b/g, className: 'text-purple-400' },
        { regex: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, className: 'text-gray-500' },
        { regex: /(".*?"|'.*?'|`.*?`)/g, className: 'text-green-300' },
        { regex: /\b(\d+)\b/g, className: 'text-blue-300' },
        { regex: /\b(true|false|null|undefined)\b/g, className: 'text-red-300' },
      ],
    };

    let highlightedCode = code;
    const langPatterns = patterns[lang as keyof typeof patterns] || patterns.typescript;

    langPatterns.forEach(({ regex, className }) => {
      highlightedCode = highlightedCode.replace(regex, `<span class="${className}">$&</span>`);
    });

    return highlightedCode;
  };

  return (
    <pre className="text-sm overflow-x-auto">
      <code 
        dangerouslySetInnerHTML={{ 
          __html: highlightCode(code, language) 
        }}
      />
    </pre>
  );
};