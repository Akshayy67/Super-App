import React, { useEffect, useRef, useState } from "react";
import { CursorPosition } from "../../utils/pairProgrammingService";

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
  cursors?: CursorPosition[];
  onCursorChange?: (line: number, column: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  readOnly = false,
  cursors,
  onCursorChange,
}) => {
  // Ensure cursors is always an array and code is always a string
  const safeCursors = Array.isArray(cursors) ? cursors : [];
  const safeCode = code || '';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });

  useEffect(() => {
    if (!safeCode) {
      setLineNumbers([1]);
      return;
    }
    const lines = safeCode.split("\n");
    setLineNumbers(Array.from({ length: lines.length }, (_, i) => i + 1));
  }, [safeCode]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!readOnly) {
      onChange(e.target.value);
    }
  };

  const handleCursorMove = () => {
    if (!textareaRef.current || !onCursorChange) return;

    const textarea = textareaRef.current;
    const position = textarea.selectionStart;
    const textBeforeCursor = safeCode.substring(0, position);
    const lines = textBeforeCursor.split("\n");
    const line = lines.length; // 1-indexed: line 1, 2, 3...
    const column = lines[lines.length - 1].length; // 0-indexed: 0 = before first char
    
    // Example: "hello\nworld" with cursor after 'w' (position 6)
    // textBeforeCursor = "hello\nw"
    // lines = ["hello", "w"]
    // line = 2 (second line)
    // column = 1 (1 character before cursor: 'w')

    setCursorPosition({ line, column });
    onCursorChange(line, column);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) {
      e.preventDefault();
      return;
    }

    // Handle tab key
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode =
        safeCode.substring(0, start) + "  " + safeCode.substring(end);
      onChange(newCode);

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const getSyntaxHighlighting = (text: string, lang: string): JSX.Element[] => {
    if (!text) return [<div key="empty" className="min-h-[1.5rem]"><span className="text-gray-300"> </span></div>];
    
    const lines = text.split("\n");
    
    return lines.map((line, index) => {
      let highlightedLine = line;
      const elements: JSX.Element[] = [];
      
      // Simple syntax highlighting based on language
      const patterns = getSyntaxPatterns(lang);
      if (!patterns || patterns.length === 0) {
        return (
          <div key={index} className="min-h-[1.5rem]">
            <span className="text-gray-300">{line}</span>
          </div>
        );
      }
      
      let lastIndex = 0;
      const matches: Array<{ index: number; length: number; className: string }> = [];
      
      // Find all matches
      patterns.forEach(({ pattern, className }) => {
        let match;
        try {
          const regex = new RegExp(pattern, 'g');
          while ((match = regex.exec(line)) !== null) {
            matches.push({
              index: match.index,
              length: match[0].length,
              className
            });
          }
        } catch (e) {
          // Skip invalid regex patterns
        }
      });
      
      // Sort matches by index
      matches.sort((a, b) => a.index - b.index);
      
      // Build highlighted line
      matches.forEach(({ index, length, className }) => {
        if (index > lastIndex) {
          elements.push(
            <span key={`text-${lastIndex}`} className="text-gray-300">
              {line.substring(lastIndex, index)}
            </span>
          );
        }
        elements.push(
          <span key={`match-${index}`} className={className}>
            {line.substring(index, index + length)}
          </span>
        );
        lastIndex = index + length;
      });
      
      // Add remaining text
      if (lastIndex < line.length) {
        elements.push(
          <span key={`text-${lastIndex}`} className="text-gray-300">
            {line.substring(lastIndex)}
          </span>
        );
      }
      
      // If no matches, return the whole line
      if (elements.length === 0) {
        elements.push(
          <span key="full-line" className="text-gray-300">
            {line || ' '}
          </span>
        );
      }
      
      return (
        <div key={index} className="min-h-[1.5rem]">
          {elements}
        </div>
      );
    });
  };

  const getSyntaxPatterns = (lang: string) => {
    const patterns: Array<{ pattern: string; className: string }> = [];
    
    switch (lang) {
      case "javascript":
      case "typescript":
        patterns.push(
          { pattern: '\\b(const|let|var|function|return|if|else|for|while|class|new|async|await|import|export|from|default)\\b', className: 'text-purple-400 font-semibold' },
          { pattern: '\\b(true|false|null|undefined)\\b', className: 'text-orange-400' },
          { pattern: '"[^"]*"', className: 'text-green-400' },
          { pattern: "'[^']*'", className: 'text-green-400' },
          { pattern: '`[^`]*`', className: 'text-green-400' },
          { pattern: '//.*$', className: 'text-gray-500 italic' },
          { pattern: '\\b\\d+\\b', className: 'text-blue-400' },
          { pattern: '\\b[A-Z][a-zA-Z0-9]*\\b', className: 'text-yellow-400' }
        );
        break;
      case "python":
        patterns.push(
          { pattern: '\\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|yield)\\b', className: 'text-purple-400 font-semibold' },
          { pattern: '\\b(True|False|None)\\b', className: 'text-orange-400' },
          { pattern: '"[^"]*"', className: 'text-green-400' },
          { pattern: "'[^']*'", className: 'text-green-400' },
          { pattern: '#.*$', className: 'text-gray-500 italic' },
          { pattern: '\\b\\d+\\b', className: 'text-blue-400' }
        );
        break;
      case "java":
        patterns.push(
          { pattern: '\\b(public|private|protected|static|void|class|interface|extends|implements|new|return|if|else|for|while)\\b', className: 'text-purple-400 font-semibold' },
          { pattern: '\\b(true|false|null)\\b', className: 'text-orange-400' },
          { pattern: '"[^"]*"', className: 'text-green-400' },
          { pattern: '//.*$', className: 'text-gray-500 italic' },
          { pattern: '\\b\\d+\\b', className: 'text-blue-400' }
        );
        break;
      case "html":
        patterns.push(
          { pattern: '<[^>]+>', className: 'text-blue-400' },
          { pattern: '"[^"]*"', className: 'text-green-400' },
          { pattern: "'[^']*'", className: 'text-green-400' },
          { pattern: '<!--[^-]*-->', className: 'text-gray-500 italic' }
        );
        break;
      case "css":
        patterns.push(
          { pattern: '\\b[a-z-]+(?=:)', className: 'text-blue-400' },
          { pattern: '[.#][a-zA-Z0-9_-]+', className: 'text-yellow-400' },
          { pattern: '"[^"]*"', className: 'text-green-400' },
          { pattern: "'[^']*'", className: 'text-green-400' },
          { pattern: '/\\*[^*]*\\*/', className: 'text-gray-500 italic' },
          { pattern: '\\b\\d+(?:px|em|rem|%|vh|vw)?\\b', className: 'text-orange-400' }
        );
        break;
      default:
        patterns.push(
          { pattern: '"[^"]*"', className: 'text-green-400' },
          { pattern: "'[^']*'", className: 'text-green-400' },
          { pattern: '//.*$', className: 'text-gray-500 italic' },
          { pattern: '\\b\\d+\\b', className: 'text-blue-400' }
        );
    }
    
    return patterns;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
      {/* Editor Header */}
      <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Line {cursorPosition.line}, Column {cursorPosition.column + 1}
          </span>
          <span className="text-sm text-gray-400">
            Language: <span className="text-purple-400">{language}</span>
          </span>
        </div>
        {readOnly && (
          <span className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 rounded">
            Read-only
          </span>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="px-4 py-4 bg-slate-800 text-gray-500 text-sm font-mono select-none border-r border-slate-700 min-w-[3rem] text-right">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Code Area Container */}
        <div className="flex-1 relative">
          {/* Actual Textarea (Primary - handles all input and scrolling) */}
          <textarea
            ref={textareaRef}
            value={safeCode}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onMouseUp={handleCursorMove}
            onKeyUp={handleCursorMove}
            onClick={handleCursorMove}
            readOnly={readOnly}
            spellCheck={false}
            className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white font-mono text-sm leading-6 resize-none outline-none whitespace-pre-wrap break-words overflow-auto selection:bg-blue-500/30"
            style={{ 
              zIndex: 3,
              colorScheme: 'dark'
            }}
            placeholder={readOnly ? "" : "Start typing your code..."}
          />

          {/* Syntax Highlighted Preview (Background - pointer-events-none to let clicks through) */}
          <div
            className="absolute inset-0 p-4 font-mono text-sm leading-6 pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
            style={{ zIndex: 1 }}
          >
            {getSyntaxHighlighting(safeCode, language)}
          </div>

          {/* Other users' cursors */}
          {safeCursors && safeCursors.length > 0 && safeCursors.map((cursor) => {
            if (!cursor || !cursor.userId) return null;
            
            const lines = safeCode ? safeCode.split("\n") : [];
            // cursor.line is 1-indexed, so line 1 means index 0
            const cursorLine = (cursor.line || 1) - 1;
            // cursor.column is now 0-indexed (number of characters before cursor)
            const cursorColumn = cursor.column || 0;

            return (
              <div
                key={cursor.userId}
                className="absolute pointer-events-none"
                style={{
                  top: `${cursorLine * 1.5 + 1}rem`,
                  left: '1rem',
                  zIndex: 2,
                }}
              >
                {/* Invisible text to position cursor */}
                <span className="font-mono text-sm leading-6 opacity-0 pointer-events-none" style={{ whiteSpace: 'pre' }}>
                  {lines[cursorLine]?.substring(0, cursorColumn) || ''}
                </span>
                <div
                  className="w-0.5 h-6 animate-pulse"
                  style={{ backgroundColor: cursor.color || '#888' }}
                />
                <div
                  className="absolute -top-6 left-0 px-2 py-0.5 text-xs text-white rounded whitespace-nowrap"
                  style={{ backgroundColor: cursor.color || '#888' }}
                >
                  {cursor.userName || 'User'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Cursors Display */}
      {safeCursors.length > 0 && (
        <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex items-center gap-4">
          <span className="text-xs text-gray-500">Active users:</span>
          {safeCursors.map((cursor) => (
            <div key={cursor.userId} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cursor.color }}
              />
              <span className="text-xs text-gray-400">{cursor.userName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

