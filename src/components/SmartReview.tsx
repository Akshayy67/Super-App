import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Calendar, 
  BarChart, 
  Clock, 
  Award, 
  RefreshCw,
  BookOpen,
  TrendingUp,
  Target,
  Zap,
  Star,
  AlertCircle
} from 'lucide-react';
import { realTimeAuth } from '../utils/realTimeAuth';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

interface ReviewItem {
  id: string;
  type: 'flashcard' | 'note' | 'task' | 'file';
  title: string;
  content: string;
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  difficulty: number; // 1-5
  interval: number; // days until next review
  easeFactor: number; // SM-2 algorithm factor
  category?: string;
  tags?: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  itemsReviewed: number;
  performance: number; // percentage
  items: ReviewResult[];
}

interface ReviewResult {
  itemId: string;
  quality: number; // 0-5 rating
  timeSpent: number; // seconds
  correct: boolean;
}

interface ReviewStats {
  totalReviews: number;
  streakDays: number;
  averageAccuracy: number;
  itemsToReview: number;
  itemsMastered: number;
  weeklyProgress: number[];
}

export const SmartReview: React.FC = () => {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [currentItem, setCurrentItem] = useState<ReviewItem | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<ReviewSession | null>(null);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    streakDays: 0,
    averageAccuracy: 0,
    itemsToReview: 0,
    itemsMastered: 0,
    weeklyProgress: []
  });
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadReviewItems();
      loadStats();
    }
  }, [user]);

  const loadReviewItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const itemsRef = collection(db, 'reviewItems');
      const q = query(
        itemsRef,
        where('userId', '==', user.id),
        where('nextReview', '<=', Timestamp.fromDate(today)),
        orderBy('nextReview', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const items: ReviewItem[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          lastReviewed: data.lastReviewed?.toDate(),
          nextReview: data.nextReview?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as ReviewItem);
      });
      
      setReviewItems(items);
    } catch (error) {
      console.error('Error loading review items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const statsDoc = await getDoc(doc(db, 'userStats', user.id));
      if (statsDoc.exists()) {
        setStats(statsDoc.data() as ReviewStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // SM-2 Algorithm Implementation
  const calculateNextReview = (item: ReviewItem, quality: number): Partial<ReviewItem> => {
    let { interval = 1, easeFactor = 2.5, reviewCount = 0 } = item;
    
    // Quality: 0-5 (0-2 = fail, 3-5 = pass)
    if (quality < 3) {
      interval = 1;
      reviewCount = 0;
    } else {
      if (reviewCount === 0) {
        interval = 1;
      } else if (reviewCount === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      reviewCount++;
    }
    
    // Update ease factor
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    return {
      interval,
      easeFactor,
      reviewCount,
      nextReview,
      lastReviewed: new Date(),
      difficulty: 5 - quality
    };
  };

  const startReviewSession = () => {
    if (reviewItems.length === 0) return;
    
    const session: ReviewSession = {
      id: Date.now().toString(),
      userId: user?.id || '',
      startTime: new Date(),
      itemsReviewed: 0,
      performance: 0,
      items: []
    };
    
    setCurrentSession(session);
    setSessionActive(true);
    setCurrentItem(reviewItems[0]);
    setSessionStartTime(new Date());
    setShowAnswer(false);
  };

  const submitReview = async (quality: number) => {
    if (!currentItem || !currentSession) return;
    
    const timeSpent = sessionStartTime ? 
      Math.floor((Date.now() - sessionStartTime.getTime()) / 1000) : 0;
    
    // Update item with SM-2 algorithm
    const updates = calculateNextReview(currentItem, quality);
    
    try {
      // Save to Firestore
      await setDoc(doc(db, 'reviewItems', currentItem.id), {
        ...currentItem,
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update session
      const result: ReviewResult = {
        itemId: currentItem.id,
        quality,
        timeSpent,
        correct: quality >= 3
      };
      
      const updatedSession = {
        ...currentSession,
        itemsReviewed: currentSession.itemsReviewed + 1,
        items: [...currentSession.items, result]
      };
      
      setCurrentSession(updatedSession);
      
      // Move to next item
      const currentIndex = reviewItems.findIndex(item => item.id === currentItem.id);
      if (currentIndex < reviewItems.length - 1) {
        setCurrentItem(reviewItems[currentIndex + 1]);
        setShowAnswer(false);
        setSessionStartTime(new Date());
      } else {
        // End session
        endReviewSession();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const endReviewSession = async () => {
    if (!currentSession) return;
    
    const endTime = new Date();
    const performance = currentSession.items.filter(r => r.correct).length / 
                       currentSession.items.length * 100;
    
    const finalSession = {
      ...currentSession,
      endTime,
      performance
    };
    
    try {
      // Save session to Firestore
      await setDoc(doc(db, 'reviewSessions', currentSession.id), finalSession);
      
      // Update user stats
      await updateUserStats(finalSession);
      
      setSessionActive(false);
      setCurrentItem(null);
      setCurrentSession(null);
      
      // Reload items
      loadReviewItems();
      loadStats();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const updateUserStats = async (session: ReviewSession) => {
    if (!user) return;
    
    try {
      const statsRef = doc(db, 'userStats', user.id);
      const statsDoc = await getDoc(statsRef);
      
      let currentStats = stats;
      if (statsDoc.exists()) {
        currentStats = statsDoc.data() as ReviewStats;
      }
      
      // Update stats
      const newStats: ReviewStats = {
        ...currentStats,
        totalReviews: currentStats.totalReviews + session.itemsReviewed,
        averageAccuracy: (currentStats.averageAccuracy * currentStats.totalReviews + 
                         session.performance * session.itemsReviewed) / 
                        (currentStats.totalReviews + session.itemsReviewed),
        itemsToReview: reviewItems.length - session.itemsReviewed
      };
      
      await setDoc(statsRef, newStats, { merge: true });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const getQualityLabel = (quality: number) => {
    switch (quality) {
      case 0: return 'Complete blackout';
      case 1: return 'Incorrect, but familiar';
      case 2: return 'Incorrect, easy once revealed';
      case 3: return 'Correct, with difficulty';
      case 4: return 'Correct, after hesitation';
      case 5: return 'Perfect recall';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Brain className="w-7 h-7 text-purple-600" />
          Smart Review System
        </h1>
        <p className="text-gray-600">
          AI-powered spaced repetition for optimal learning retention
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.itemsToReview}</span>
          </div>
          <p className="text-sm text-gray-600">Items to Review</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.itemsMastered}</span>
          </div>
          <p className="text-sm text-gray-600">Items Mastered</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              {stats.averageAccuracy.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Accuracy</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.streakDays}</span>
          </div>
          <p className="text-sm text-gray-600">Day Streak</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.totalReviews}</span>
          </div>
          <p className="text-sm text-gray-600">Total Reviews</p>
        </div>
      </div>

      {/* Review Session */}
      {!sessionActive ? (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {reviewItems.length > 0 
                ? `${reviewItems.length} items ready for review`
                : 'No items due for review'}
            </h2>
            <p className="text-gray-600 mb-6">
              {reviewItems.length > 0
                ? 'Start your review session to strengthen your memory'
                : 'Great job! Check back tomorrow for more reviews'}
            </p>
            {reviewItems.length > 0 && (
              <button
                onClick={startReviewSession}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Start Review Session
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{currentSession?.itemsReviewed + 1} / {reviewItems.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${((currentSession?.itemsReviewed || 0) + 1) / reviewItems.length * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Review Item */}
          {currentItem && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 mb-4">
                  {currentItem.type === 'flashcard' && <BookOpen className="w-4 h-4" />}
                  {currentItem.type === 'note' && <AlertCircle className="w-4 h-4" />}
                  {currentItem.category || currentItem.type}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentItem.title}
                </h3>
                
                <div className="text-gray-700 mb-6">
                  {currentItem.content.split('\n').slice(0, showAnswer ? undefined : 1).map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
                
                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Show Answer
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      How well did you recall this?
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((quality) => (
                        <button
                          key={quality}
                          onClick={() => submitReview(quality)}
                          className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                            quality < 3 
                              ? 'border-red-200 hover:bg-red-50 hover:border-red-300' 
                              : 'border-green-200 hover:bg-green-50 hover:border-green-300'
                          }`}
                        >
                          <div className="font-semibold mb-1">{quality}</div>
                          <div className="text-xs text-gray-600">
                            {getQualityLabel(quality)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skip/End Session */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                const currentIndex = reviewItems.findIndex(item => item.id === currentItem?.id);
                if (currentIndex < reviewItems.length - 1) {
                  setCurrentItem(reviewItems[currentIndex + 1]);
                  setShowAnswer(false);
                }
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={endReviewSession}
              className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      )}

      {/* Weekly Progress Chart */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Weekly Progress
        </h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {[...Array(7)].map((_, i) => {
            const height = Math.random() * 100; // Replace with actual weekly data
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-600 rounded-t"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-600 mt-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};