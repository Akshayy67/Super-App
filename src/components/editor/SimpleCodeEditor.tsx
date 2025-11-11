import React, { useState, useEffect } from 'react';
import { Code, Play, RotateCcw } from 'lucide-react';

interface SimpleCodeEditorProps {
  initialCode?: string;
  language?: string;
  onChange: (code: string) => void;
  onRun?: (code: string) => void;
}

export const SimpleCodeEditor: React.FC<SimpleCodeEditorProps> = ({
  initialCode = '',
  language = 'javascript',
  onChange,
  onRun,
}) => {
  const [code, setCode] = useState(initialCode);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  useEffect(() => {
    const lines = code.split('\n');
    setLineNumbers(Array.from({ length: lines.length }, (_, i) => i + 1));
  }, [code]);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleChange = (value: string) => {
    setCode(value);
    onChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      handleChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleReset = () => {
    handleChange(initialCode);
  };

  return (
    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Code className="w-4 h-4" />
          <span>{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 rounded transition"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          {onRun && (
            <button
              onClick={() => onRun(code)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              <Play className="w-3 h-3" />
              Run
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex">
        {/* Line Numbers */}
        <div className="py-4 px-2 bg-gray-100 dark:bg-gray-800 text-right text-gray-500 dark:text-gray-400 font-mono text-sm select-none">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <textarea
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm leading-6 resize-none outline-none"
          style={{ minHeight: '300px' }}
          spellCheck={false}
        />
      </div>

      {/* Info */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
        Lines: {lineNumbers.length} | Characters: {code.length} | Press Tab for indentation
      </div>
    </div>
  );
};
