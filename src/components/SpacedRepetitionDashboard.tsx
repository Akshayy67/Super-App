import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Calendar, Clock, Target, Award,
  BarChart3, Activity, Zap, BookOpen, ChevronRight,
  Star, Flame, Trophy, AlertCircle, CheckCircle,
  RefreshCw, Download, Upload, Settings
} from 'lucide-react';
import { spacedRepetition, ReviewCard, ReviewSchedule } from '../utils/spacedRepetition';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  cards: ReviewCard[];
  onCardUpdate: (card: ReviewCard) => void;
  onBatchImport: (cards: ReviewCard[]) => void;
}

export const SpacedRepetitionDashboard: React.FC<Props> = ({ 
  cards, 
  onCardUpdate,
  onBatchImport 
}) => {
  const [schedule, setSchedule] = useState<ReviewSchedule | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [currentCard, setCurrentCard] = useState<ReviewCard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    startTime: new Date()
  });
  const [reviewMode, setReviewMode] = useState<'study' | 'stats'>('stats');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    updateScheduleAndInsights();
  }, [cards]);

  const updateScheduleAndInsights = () => {
    const newSchedule = spacedRepetition.getReviewSchedule(cards);
    const newInsights = spacedRepetition.getLearningInsights(cards);
    setSchedule(newSchedule);
    setInsights(newInsights);
  };

  const startReviewSession = () => {
    if (!schedule) return;
    
    const reviewCards = [
      ...schedule.overdue,
      ...schedule.today,
      ...schedule.new.slice(0, 10) // Limit new cards per session
    ];
    
    const optimalOrder = spacedRepetition.getOptimalReviewOrder(reviewCards);
    
    if (optimalOrder.length > 0) {
      setCurrentCard(optimalOrder[0]);
      setReviewMode('study');
      setShowAnswer(false);
      setSessionStats({
        reviewed: 0,
        correct: 0,
        startTime: new Date()
      });
    }
  };

  const handleReview = (quality: number) => {
    if (!currentCard) return;
    
    const updatedCard = spacedRepetition.calculateNextReview(currentCard, quality);
    onCardUpdate(updatedCard);
    
    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      correct: quality >= 3 ? prev.correct + 1 : prev.correct
    }));
    
    // Move to next card
    const remainingCards = getQueuedCards().filter(c => c.id !== currentCard.id);
    if (remainingCards.length > 0) {
      setCurrentCard(remainingCards[0]);
      setShowAnswer(false);
    } else {
      // Session complete
      setReviewMode('stats');
      setCurrentCard(null);
    }
  };

  const getQueuedCards = (): ReviewCard[] => {
    if (!schedule) return [];
    return [
      ...schedule.overdue,
      ...schedule.today,
      ...schedule.new.slice(0, 10)
    ];
  };

  const importCards = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const imported = spacedRepetition.importFromAnki(text);
        onBatchImport(imported);
      }
    };
    input.click();
  };

  const exportCards = () => {
    const data = spacedRepetition.exportToAnki(cards);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.txt';
    a.click();
  };

  const getQualityColor = (quality: number) => {
    if (quality <= 1) return 'bg-red-500 hover:bg-red-600';
    if (quality === 2) return 'bg-orange-500 hover:bg-orange-600';
    if (quality === 3) return 'bg-yellow-500 hover:bg-yellow-600';
    if (quality === 4) return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getQualityLabel = (quality: number) => {
    const labels = ['Again', 'Hard', 'Good', 'Easy', 'Perfect'];
    return labels[quality] || 'Unknown';
  };

  if (reviewMode === 'study' && currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Session Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setReviewMode('stats')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h2 className="text-2xl font-bold dark:text-white">Study Session</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {sessionStats.reviewed} reviewed • {sessionStats.correct} correct
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  {getQueuedCards().length - sessionStats.reviewed} remaining
                </span>
              </div>
            </div>
          </div>

          {/* Card Display */}
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                  {currentCard.category}
                </span>
                {currentCard.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              
              {currentCard.statistics.streakCount > 0 && (
                <div className="flex items-center space-x-1 text-orange-500">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold">{currentCard.statistics.streakCount}</span>
                </div>
              )}
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Question</h3>
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-lg dark:text-gray-200">{currentCard.question}</p>
              </div>
            </div>

            {/* Answer */}
            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <h3 className="text-xl font-semibold mb-4 dark:text-white">Answer</h3>
                  <div className="p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl">
                    <p className="text-lg dark:text-gray-200">{currentCard.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-lg"
              >
                Show Answer
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                  How difficult was this card?
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4, 5].map(quality => (
                    <button
                      key={quality}
                      onClick={() => handleReview(quality)}
                      className={`py-3 px-2 text-white rounded-lg transition-all transform hover:scale-105 ${getQualityColor(quality)}`}
                    >
                      <div className="text-xs opacity-90">{quality}</div>
                      <div className="text-sm font-medium">{getQualityLabel(quality)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Card Stats */}
            <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-around text-sm text-gray-600 dark:text-gray-400">
              <div className="text-center">
                <div className="font-medium">{currentCard.repetitions}</div>
                <div className="text-xs">Reviews</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{currentCard.easeFactor.toFixed(2)}</div>
                <div className="text-xs">Ease</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{currentCard.interval}d</div>
                <div className="text-xs">Interval</div>
              </div>
              <div className="text-center">
                <div className="font-medium">
                  {currentCard.statistics.totalReviews > 0
                    ? Math.round((currentCard.statistics.correctReviews / currentCard.statistics.totalReviews) * 100)
                    : 0}%
                </div>
                <div className="text-xs">Success</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Spaced Repetition System
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Optimize your learning with scientifically proven techniques
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={importCards}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Import cards"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              onClick={exportCards}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Export cards"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={startReviewSession}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <Brain className="w-5 h-5" />
              <span>Start Review</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Cards Due */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-indigo-500" />
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {insights.cardsToReviewToday}
                </span>
              </div>
              <h3 className="font-semibold dark:text-white">Due Today</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {schedule?.overdue.length || 0} overdue
              </p>
            </motion.div>

            {/* Retention Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {insights.retentionRate.toFixed(1)}%
                </span>
              </div>
              <h3 className="font-semibold dark:text-white">Retention</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overall success rate
              </p>
            </motion.div>

            {/* Current Streak */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {insights.streakStats.currentStreak}
                </span>
              </div>
              <h3 className="font-semibold dark:text-white">Best Streak</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {insights.streakStats.cardsOnStreak} cards active
              </p>
            </motion.div>

            {/* Time Investment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {insights.timeInvestment.todayMinutes}m
                </span>
              </div>
              <h3 className="font-semibold dark:text-white">Time Today</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ~{insights.timeInvestment.averagePerDay}m daily avg
              </p>
            </motion.div>
          </div>
        )}

        {/* Schedule Overview */}
        {schedule && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Review Forecast */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                <span>30-Day Review Forecast</span>
              </h3>
              <div className="h-48 flex items-end space-x-1">
                {insights?.reviewForecast.slice(0, 30).map((count: number, day: number) => {
                  const height = Math.max(5, (count / Math.max(...insights.reviewForecast, 1)) * 100);
                  return (
                    <div
                      key={day}
                      className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t hover:opacity-80 transition-opacity relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Day {day + 1}: {count} cards
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Today</span>
                <span>30 days</span>
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <span>Categories</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(insights?.categoryStats || {}).slice(0, 5).map(([category, stats]: [string, any]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="dark:text-gray-300">{category}</span>
                      <span className="text-gray-600 dark:text-gray-400">{stats.total} cards</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                        style={{ width: `${stats.retention}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Card States */}
        {schedule && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold dark:text-white">{schedule.new.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">New</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold dark:text-white">{schedule.learning.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Learning</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold dark:text-white">{schedule.graduated.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Graduated</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold dark:text-white">{schedule.overdue.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
              <div className="text-2xl font-bold dark:text-white">{schedule.today.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold dark:text-white">{insights?.problemCards || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Difficult</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};