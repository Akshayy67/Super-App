// Contest Taking Interface - Where users answer questions
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Code, AlertCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface Question {
  id: string;
  questionType: 'multiple-choice' | 'coding';
  text: string;
  options?: string[];
  correctAnswer?: number;
  sampleInput?: string;
  sampleOutput?: string;
  testCases?: Array<{ input: string; output: string; hidden?: boolean }>;
  constraints?: string[];
  points: number;
  explanation?: string;
  category?: string;
}

interface ContestTakingProps {
  contest: any;
  onSubmit: (answers: Record<number, any>, timeTaken: number) => void;
  onClose: () => void;
}

export const ContestTakingInterface: React.FC<ContestTakingProps> = ({ contest, onSubmit, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(contest.totalTime * 60); // Convert to seconds
  const [code, setCode] = useState<Record<number, string>>({});
  const [language, setLanguage] = useState('javascript');
  const [startTime] = useState(Date.now());

  const questions: Question[] = contest.questions || [];
  const currentQ = questions[currentQuestion];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAutoSubmit = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    onSubmit(answers, timeTaken);
  };

  const handleAnswerChange = (questionIndex: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleCodeChange = (questionIndex: number, value: string | undefined) => {
    setCode(prev => ({ ...prev, [questionIndex]: value || '' }));
    setAnswers(prev => ({ ...prev, [questionIndex]: { code: value || '', language } }));
  };

  const handleSubmit = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    onSubmit(answers, timeTaken);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  if (!currentQ) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">No questions available</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold">{contest.title}</h2>
            <p className="text-sm opacity-90">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-bold">{formatTime(timeRemaining)}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Progress: {answeredCount}/{questions.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentQ.questionType === 'coding' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {currentQ.questionType === 'coding' ? <Code className="w-3 h-3 inline mr-1" /> : null}
                    {currentQ.questionType === 'coding' ? 'Coding' : 'Multiple Choice'}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-semibold">
                    {currentQ.points} pts
                  </span>
                  {currentQ.category && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      📁 {currentQ.category}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentQ.text}
                </h3>
              </div>
            </div>

            {/* Multiple Choice Options */}
            {currentQ.questionType === 'multiple-choice' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerChange(currentQuestion, idx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQuestion] === idx
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion] === idx
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {answers[currentQuestion] === idx && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span className="text-gray-900 dark:text-white">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Coding Question */}
            {currentQ.questionType === 'coding' && (
              <div className="space-y-4">
                {/* Sample Input/Output */}
                {(currentQ.sampleInput || currentQ.sampleOutput) && (
                  <div className="grid grid-cols-2 gap-4">
                    {currentQ.sampleInput && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Sample Input:
                        </p>
                        <pre className="text-sm text-gray-900 dark:text-white font-mono">
                          {currentQ.sampleInput}
                        </pre>
                      </div>
                    )}
                    {currentQ.sampleOutput && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Sample Output:
                        </p>
                        <pre className="text-sm text-gray-900 dark:text-white font-mono">
                          {currentQ.sampleOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Constraints */}
                {currentQ.constraints && currentQ.constraints.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Constraints:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {currentQ.constraints.map((constraint, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                          {constraint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Language Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Language:
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>

                {/* Code Editor */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <Editor
                    height="400px"
                    language={language}
                    value={code[currentQuestion] || '// Write your code here'}
                    onChange={(value) => handleCodeChange(currentQuestion, value)}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between rounded-b-lg">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Question Navigator */}
          <div className="flex gap-2 flex-wrap max-w-2xl">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-semibold ${
                  idx === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[idx] !== undefined
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              <Send className="w-4 h-4" />
              Submit Contest
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
