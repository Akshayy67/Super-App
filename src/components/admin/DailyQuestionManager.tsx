import React, { useState, useEffect } from 'react';
import { dailyQuestionService, DailyQuestion } from '../../services/dailyQuestionService';
import { Calendar, Plus, Save, RefreshCw, Zap, Code, Brain, TrendingUp, Lightbulb, FileCode } from 'lucide-react';
import { AIQuestionGenerator } from './AIQuestionGenerator';

export const DailyQuestionManager: React.FC = () => {
  const [todayQuestion, setTodayQuestion] = useState<DailyQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionType, setQuestionType] = useState<'coding' | 'puzzle' | 'aptitude'>('puzzle');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState('');
  const [hints, setHints] = useState<string[]>(['', '', '']);
  const [starterCode, setStarterCode] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [randomPool, setRandomPool] = useState<any[]>([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    loadTodayQuestion();
    loadRandomPool();
  }, []);

  const loadTodayQuestion = async () => {
    setLoading(true);
    try {
      const q = await dailyQuestionService.getTodayQuestion();
      setTodayQuestion(q);
    } catch (error) {
      console.error('Error loading today\'s question:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRandomPool = () => {
    const pool = dailyQuestionService.getRandomQuestionsPool();
    setRandomPool(pool);
  };

  const handleCreateQuestion = async () => {
    if (!question || !correctAnswer || !explanation) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newQuestion = {
        type: questionType,
        question,
        options: questionType !== 'coding' && options.some(o => o.trim()) ? options.filter(o => o.trim()) : undefined,
        correctAnswer,
        explanation,
        difficulty,
        createdBy: 'admin' as const,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        hints: hints.filter(h => h.trim()).length > 0 ? hints.filter(h => h.trim()) : undefined,
        starterCode: questionType === 'coding' && starterCode.trim() ? starterCode : undefined,
      };

      await dailyQuestionService.setDailyQuestion(newQuestion, selectedDate || undefined);
      
      setSuccessMessage('Question created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset form
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setExplanation('');
      setTags('');
      setHints(['', '', '']);
      setStarterCode('');
      setSelectedDate('');
      
      // Reload today's question
      loadTodayQuestion();
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question');
    }
  };

  const handleAIGenerate = (generatedQuestion: any) => {
    setQuestionType(generatedQuestion.type || 'puzzle');
    setDifficulty(generatedQuestion.difficulty || 'medium');
    setQuestion(generatedQuestion.question || '');
    setCorrectAnswer(generatedQuestion.correctAnswer || '');
    setExplanation(generatedQuestion.explanation || '');
    setTags((generatedQuestion.tags || []).join(', '));
    setHints(generatedQuestion.hints || ['', '', '']);
    if (generatedQuestion.options) {
      setOptions(generatedQuestion.options.slice(0, 4).concat(['', '', '', '']).slice(0, 4));
    }
    if (generatedQuestion.starterCode) {
      setStarterCode(generatedQuestion.starterCode);
    }
    setShowAIGenerator(false);
    setSuccessMessage('AI-generated question loaded! Review and edit before saving.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleGenerateRandom = async () => {
    try {
      const newQuestion = await dailyQuestionService.createRandomQuestion();
      setTodayQuestion(newQuestion);
      setSuccessMessage('Random question generated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error generating random question:', error);
      alert('Failed to generate random question');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding': return <Code className="w-5 h-5" />;
      case 'puzzle': return <Brain className="w-5 h-5" />;
      case 'aptitude': return <TrendingUp className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          Daily Question Manager
        </h1>
        <button
          onClick={handleGenerateRandom}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Random
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Zap className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Today's Question Display */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      ) : todayQuestion ? (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              {getTypeIcon(todayQuestion.type)}
              Today's Question ({todayQuestion.date})
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(todayQuestion.difficulty)}`}>
              {todayQuestion.difficulty.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Question:</p>
              <p className="text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 p-4 rounded-lg">{todayQuestion.question}</p>
            </div>
            
            {todayQuestion.options && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Options:</p>
                <ul className="space-y-2">
                  {todayQuestion.options.map((opt, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-2 rounded">
                      {String.fromCharCode(65 + idx)}. {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Correct Answer:</p>
              <p className="text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg font-medium">
                {todayQuestion.correctAnswer}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Explanation:</p>
              <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded-lg">
                {todayQuestion.explanation}
              </p>
            </div>
            
            {todayQuestion.tags && todayQuestion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {todayQuestion.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg">
          No question set for today. Create one below or generate a random question.
        </div>
      )}

      {/* AI Question Generator */}
      {showAIGenerator ? (
        <div className="relative">
          <button
            onClick={() => setShowAIGenerator(false)}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
          <AIQuestionGenerator onGenerate={handleAIGenerate} />
        </div>
      ) : (
        <button
          onClick={() => setShowAIGenerator(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
        >
          <Zap className="w-6 h-6" />
          Generate Question with AI
        </button>
      )}

      {/* Create New Question Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6" />
          Create New Question
        </h2>

        <div className="space-y-4">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date (leave empty for today)
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Type *
            </label>
            <div className="flex gap-3">
              {(['coding', 'puzzle', 'aptitude'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setQuestionType(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    questionType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {getTypeIcon(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty *
            </label>
            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    difficulty === diff
                      ? getDifficultyColor(diff)
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter the question..."
            />
          </div>

          {/* Options (for MCQ) */}
          {questionType !== 'coding' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Options (optional for MCQ)
              </label>
              {options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[idx] = e.target.value;
                    setOptions(newOptions);
                  }}
                  className="w-full px-4 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                />
              ))}
            </div>
          )}

          {/* Correct Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correct Answer *
            </label>
            <textarea
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter the correct answer..."
            />
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Explanation *
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Explain the answer..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., logic, math, algorithms"
            />
          </div>

          {/* Hints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Hints (optional - progressive help for users)
            </label>
            {hints.map((hint, idx) => (
              <input
                key={idx}
                type="text"
                value={hint}
                onChange={(e) => {
                  const newHints = [...hints];
                  newHints[idx] = e.target.value;
                  setHints(newHints);
                }}
                className="w-full px-4 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                placeholder={`Hint ${idx + 1} (least helpful to most helpful)`}
              />
            ))}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add up to 3 hints. Users can reveal them one by one if stuck.
            </p>
          </div>

          {/* Starter Code (for coding questions) */}
          {questionType === 'coding' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Starter Code (optional)
              </label>
              <textarea
                value={starterCode}
                onChange={(e) => setStarterCode(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                placeholder="// Initial code template for users&#10;function solution() {&#10;  // Your code here&#10;}"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Starter code will be pre-filled in the code editor for users.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleCreateQuestion}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-lg"
          >
            <Save className="w-5 h-5" />
            Create Question
          </button>
        </div>
      </div>

      {/* Random Questions Pool Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Random Questions Pool ({randomPool.length} questions)
        </h2>
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {randomPool.map((q, idx) => (
            <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(q.type)}
                  <span className="font-medium text-gray-800 dark:text-white">{q.type.toUpperCase()}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(q.difficulty)}`}>
                  {q.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{q.question}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
