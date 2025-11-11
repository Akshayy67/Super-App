import React, { useState, useEffect } from 'react';
import { dailyQuestionService, DailyQuestion } from '../../services/dailyQuestionService';
import { realTimeAuth } from '../../utils/realTimeAuth';
import { Calendar, Trophy, Zap, CheckCircle, XCircle, Code, Brain, TrendingUp, Flame, Target, Award, Lightbulb, Eye, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SimpleCodeEditor } from '../editor/SimpleCodeEditor';

export const DailyQuestionComponent: React.FC = () => {
  const [question, setQuestion] = useState<DailyQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; xpEarned: number; explanation: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [stats, setStats] = useState<{
    totalAttempted: number;
    totalCorrect: number;
    currentStreak: number;
    longestStreak: number;
    totalXPEarned: number;
  } | null>(null);

  useEffect(() => {
    // Check authentication first
    const user = realTimeAuth.getCurrentUser();
    if (!user) {
      console.error('❌ No user logged in for Daily Question');
      setError('Please log in to access Daily Challenge');
      setLoading(false);
      return;
    }
    
    loadQuestion();
    loadStats();
  }, []);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const user = realTimeAuth.getCurrentUser();
      const userId = user?.uid || user?.id;
      
      if (!user || !userId) {
        setError('Please log in to access Daily Challenge');
        setLoading(false);
        return;
      }

      console.log('🔐 Loading question for user:', userId);
      
      const q = await dailyQuestionService.getTodayQuestion();
      setQuestion(q);
      
      // Set starter code if it's a coding question
      if (q?.type === 'coding' && q?.starterCode) {
        setCodeAnswer(q.starterCode);
      }
      
      const attempted = await dailyQuestionService.hasUserAttemptedToday(userId);
      setHasAttempted(attempted);
      
      if (attempted) {
        const attempt = await dailyQuestionService.getUserAttempt(userId);
        if (attempt) {
          setUserAnswer(attempt.userAnswer);
          if (q?.type === 'coding') {
            setCodeAnswer(attempt.userAnswer);
          }
          setResult({
            correct: attempt.correct,
            xpEarned: attempt.xpEarned,
            explanation: q?.explanation || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading question:', error);
      setError('Failed to load daily question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const user = realTimeAuth.getCurrentUser();
      const userId = user?.uid || user?.id;
      
      if (!user || !userId) {
        console.warn('⚠️ No user for stats');
        return;
      }
      
      const userStats = await dailyQuestionService.getUserStats(userId);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async () => {
    const finalAnswer = question?.type === 'coding' ? codeAnswer : userAnswer;
    
    if (!question || !finalAnswer.trim()) {
      alert('Please provide an answer!');
      return;
    }

    const user = realTimeAuth.getCurrentUser();
    const userId = user?.uid || user?.id;
    
    if (!user || !userId) {
      console.error('❌ Cannot submit: No user or no userId', { user });
      alert('Please log in to submit your answer');
      return;
    }

    console.log('📤 Submitting answer for user:', userId);
    console.log('   Question ID:', question.id);
    console.log('   User answer:', finalAnswer);

    setSubmitting(true);
    try {
      const answer = question.options && selectedOption !== null 
        ? question.options[selectedOption]
        : finalAnswer;

      const resultData = await dailyQuestionService.submitAnswer(userId, question.id, answer);
      setResult(resultData);
      setHasAttempted(true);
      
      console.log('✅ Answer submitted successfully:', resultData);
      
      // Celebrate if correct!
      if (resultData.correct) {
        celebrateCorrectAnswer();
      }
      
      // Reload stats
      await loadStats();
    } catch (error: any) {
      console.error('❌ Error submitting answer:', error);
      console.error('   Error details:', error.message);
      alert('Failed to submit answer: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const celebrateCorrectAnswer = () => {
    // Confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding': return <Code className="w-6 h-6" />;
      case 'puzzle': return <Brain className="w-6 h-6" />;
      case 'aptitude': return <TrendingUp className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-2xl p-8 border-2 border-red-500">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">Error</h2>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <p className="text-gray-600 dark:text-gray-400 text-center">No question available for today. Check back tomorrow!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Daily Challenge
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Solve today's question and earn +20 XP!</p>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-blue-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Attempted</p>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalAttempted}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-green-200 dark:border-green-700">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Correct</p>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalCorrect}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-orange-200 dark:border-orange-700">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-orange-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Streak</p>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.currentStreak}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-purple-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Best Streak</p>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.longestStreak}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-yellow-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Total XP</p>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalXPEarned}</p>
            </div>
          </div>
        )}

        {/* Main Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Question Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getTypeIcon(question.type)}
                <div>
                  <h2 className="text-2xl font-bold">{question.type.charAt(0).toUpperCase() + question.type.slice(1)} Challenge</h2>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(question.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty.toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 w-fit">
              <Zap className="w-5 h-5" />
              <span className="font-bold">Reward: +20 XP</span>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Question:</h3>
              <p className="text-xl text-gray-800 dark:text-white leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border-l-4 border-blue-600">
                {question.question}
              </p>
            </div>

            {/* Options for MCQ */}
            {question.options && question.options.length > 0 && !hasAttempted && (
              <div className="space-y-3 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Options:</h3>
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedOption(idx);
                      setUserAnswer(option);
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedOption === idx
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    <span className="font-bold text-blue-600 mr-3">{String.fromCharCode(65 + idx)}.</span>
                    <span className="text-gray-800 dark:text-white">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Code Editor for Coding Questions */}
            {question.type === 'coding' && !hasAttempted && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Write Your Code:</h3>
                <SimpleCodeEditor
                  initialCode={question.starterCode || '// Write your code here\n'}
                  language="javascript"
                  onChange={setCodeAnswer}
                />
              </div>
            )}

            {/* Text Answer Input */}
            {question.type !== 'coding' && (!question.options || question.options.length === 0) && !hasAttempted && (
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Your Answer:
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
                  placeholder="Type your answer here..."
                  disabled={hasAttempted}
                />
              </div>
            )}

            {/* Hints Section */}
            {question.hints && question.hints.length > 0 && !hasAttempted && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-300 dark:border-yellow-700">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">Need a Hint?</h3>
                </div>
                <div className="space-y-2">
                  {question.hints.map((hint, idx) => (
                    <div key={idx}>
                      {revealedHints.includes(idx) ? (
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg border border-yellow-400">
                          <div className="flex items-start gap-2">
                            <Eye className="w-4 h-4 text-yellow-700 mt-1" />
                            <p className="text-yellow-900 dark:text-yellow-100 text-sm">{hint}</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRevealHint(idx)}
                          className="w-full px-4 py-2 bg-yellow-200 dark:bg-yellow-800 hover:bg-yellow-300 dark:hover:bg-yellow-700 rounded-lg text-yellow-900 dark:text-yellow-100 font-medium transition flex items-center justify-center gap-2"
                        >
                          <EyeOff className="w-4 h-4" />
                          Reveal Hint {idx + 1}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                  💡 Hints are ordered from least to most helpful
                </p>
              </div>
            )}

            {/* Submit Button */}
            {!hasAttempted && (
              <button
                onClick={handleSubmit}
                disabled={submitting || (question.type === 'coding' ? !codeAnswer.trim() : !userAnswer.trim())}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Submit Answer
                  </>
                )}
              </button>
            )}

            {/* Result Display */}
            {result && hasAttempted && (
              <div className={`mt-6 p-6 rounded-xl border-2 ${
                result.correct
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.correct ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">Correct! 🎉</h3>
                        <p className="text-green-600 dark:text-green-500">You earned +{result.xpEarned} XP</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <h3 className="text-2xl font-bold text-red-700 dark:text-red-400">Incorrect</h3>
                        <p className="text-red-600 dark:text-red-500">Better luck tomorrow!</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Answer:</p>
                    <p className="text-gray-800 dark:text-white bg-white dark:bg-gray-700 p-3 rounded-lg">
                      {userAnswer}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Correct Answer:</p>
                    <p className="text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 p-3 rounded-lg font-medium">
                      {question.correctAnswer}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Explanation:</p>
                    <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-4 rounded-lg leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {question.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Come back tomorrow message */}
        {hasAttempted && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 text-center border-2 border-purple-300 dark:border-purple-700">
            <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-300 mb-2">
              Great Job! 🌟
            </h3>
            <p className="text-purple-700 dark:text-purple-400">
              Come back tomorrow for a new challenge and more XP!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
