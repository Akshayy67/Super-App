// SM-2 Algorithm Implementation for Spaced Repetition System
// Based on SuperMemo 2 algorithm: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

export interface ReviewCard {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  difficulty: number; // 0-5, where 0 is hardest
  easeFactor: number; // E-Factor in SM-2, starts at 2.5
  repetitions: number; // Number of successful reviews
  interval: number; // Days until next review
  nextReviewDate: Date;
  lastReviewDate?: Date;
  createdAt: Date;
  statistics: {
    totalReviews: number;
    correctReviews: number;
    averageResponseTime: number; // in seconds
    streakCount: number;
  };
}

export interface ReviewSession {
  id: string;
  cards: ReviewCard[];
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  correctAnswers: number;
  averageConfidence: number;
}

export interface ReviewSchedule {
  today: ReviewCard[];
  overdue: ReviewCard[];
  upcoming: ReviewCard[];
  new: ReviewCard[];
  learning: ReviewCard[];
  graduated: ReviewCard[];
}

export class SpacedRepetitionSystem {
  private readonly MIN_EASE_FACTOR = 1.3;
  private readonly MAX_EASE_FACTOR = 2.5;
  private readonly GRADUATING_INTERVAL = 4; // Days before card is considered "graduated"
  
  /**
   * SM-2 Algorithm implementation
   * @param card The card being reviewed
   * @param quality User's self-assessment (0-5)
   * 0 - Complete blackout
   * 1 - Incorrect response with serious difficulty
   * 2 - Incorrect response but feels familiar
   * 3 - Correct response with serious difficulty
   * 4 - Correct response with some hesitation
   * 5 - Perfect response
   */
  calculateNextReview(card: ReviewCard, quality: number): ReviewCard {
    const updatedCard = { ...card };
    
    // Update ease factor
    const newEaseFactor = this.calculateEaseFactor(card.easeFactor, quality);
    updatedCard.easeFactor = Math.max(this.MIN_EASE_FACTOR, newEaseFactor);
    
    // Update repetitions and interval
    if (quality >= 3) {
      // Correct response
      updatedCard.repetitions += 1;
      
      if (updatedCard.repetitions === 1) {
        updatedCard.interval = 1;
      } else if (updatedCard.repetitions === 2) {
        updatedCard.interval = 6;
      } else {
        updatedCard.interval = Math.round(updatedCard.interval * updatedCard.easeFactor);
      }
      
      updatedCard.statistics.correctReviews += 1;
      updatedCard.statistics.streakCount += 1;
    } else {
      // Incorrect response - reset
      updatedCard.repetitions = 0;
      updatedCard.interval = 1;
      updatedCard.statistics.streakCount = 0;
    }
    
    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + updatedCard.interval);
    updatedCard.nextReviewDate = nextDate;
    updatedCard.lastReviewDate = new Date();
    
    // Update statistics
    updatedCard.statistics.totalReviews += 1;
    
    return updatedCard;
  }
  
  private calculateEaseFactor(currentEF: number, quality: number): number {
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    return currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  }
  
  /**
   * Get cards organized by review schedule
   */
  getReviewSchedule(cards: ReviewCard[]): ReviewSchedule {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const schedule: ReviewSchedule = {
      today: [],
      overdue: [],
      upcoming: [],
      new: [],
      learning: [],
      graduated: []
    };
    
    cards.forEach(card => {
      const reviewDate = new Date(card.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);
      
      if (card.repetitions === 0 && !card.lastReviewDate) {
        schedule.new.push(card);
      } else if (card.interval < this.GRADUATING_INTERVAL) {
        schedule.learning.push(card);
      } else if (reviewDate < now) {
        schedule.overdue.push(card);
      } else if (reviewDate.getTime() === now.getTime()) {
        schedule.today.push(card);
      } else if (card.interval >= this.GRADUATING_INTERVAL) {
        schedule.graduated.push(card);
      } else {
        schedule.upcoming.push(card);
      }
    });
    
    // Sort overdue by how overdue they are
    schedule.overdue.sort((a, b) => 
      a.nextReviewDate.getTime() - b.nextReviewDate.getTime()
    );
    
    return schedule;
  }
  
  /**
   * Get optimal review order using interleaving
   */
  getOptimalReviewOrder(cards: ReviewCard[]): ReviewCard[] {
    // Group by category for interleaving
    const categoryMap = new Map<string, ReviewCard[]>();
    
    cards.forEach(card => {
      if (!categoryMap.has(card.category)) {
        categoryMap.set(card.category, []);
      }
      categoryMap.get(card.category)!.push(card);
    });
    
    // Interleave categories for better learning
    const result: ReviewCard[] = [];
    const categories = Array.from(categoryMap.values());
    let maxLength = Math.max(...categories.map(c => c.length));
    
    for (let i = 0; i < maxLength; i++) {
      categories.forEach(categoryCards => {
        if (i < categoryCards.length) {
          result.push(categoryCards[i]);
        }
      });
    }
    
    return result;
  }
  
  /**
   * Calculate retention rate for a set of cards
   */
  calculateRetention(cards: ReviewCard[]): number {
    const totalReviews = cards.reduce((sum, card) => sum + card.statistics.totalReviews, 0);
    const correctReviews = cards.reduce((sum, card) => sum + card.statistics.correctReviews, 0);
    
    if (totalReviews === 0) return 0;
    return (correctReviews / totalReviews) * 100;
  }
  
  /**
   * Get learning statistics and insights
   */
  getLearningInsights(cards: ReviewCard[]) {
    const schedule = this.getReviewSchedule(cards);
    const retention = this.calculateRetention(cards);
    
    // Calculate average ease factor
    const avgEaseFactor = cards.reduce((sum, card) => sum + card.easeFactor, 0) / cards.length || 0;
    
    // Find problem cards (low ease factor)
    const problemCards = cards.filter(card => card.easeFactor < 2.0);
    
    // Calculate daily review load for next 30 days
    const reviewForecast = this.calculateReviewForecast(cards, 30);
    
    // Find best and worst categories
    const categoryStats = this.getCategoryStatistics(cards);
    
    return {
      totalCards: cards.length,
      cardsToReviewToday: schedule.today.length + schedule.overdue.length,
      newCards: schedule.new.length,
      learningCards: schedule.learning.length,
      graduatedCards: schedule.graduated.length,
      retentionRate: retention,
      averageEaseFactor: avgEaseFactor,
      problemCards: problemCards.length,
      reviewForecast,
      categoryStats,
      streakStats: this.getStreakStatistics(cards),
      timeInvestment: this.calculateTimeInvestment(cards)
    };
  }
  
  private calculateReviewForecast(cards: ReviewCard[], days: number): number[] {
    const forecast = new Array(days).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    cards.forEach(card => {
      const reviewDate = new Date(card.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);
      
      const daysUntilReview = Math.floor(
        (reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilReview >= 0 && daysUntilReview < days) {
        forecast[daysUntilReview]++;
      }
    });
    
    return forecast;
  }
  
  private getCategoryStatistics(cards: ReviewCard[]) {
    const stats = new Map<string, {
      total: number;
      retention: number;
      avgEaseFactor: number;
    }>();
    
    cards.forEach(card => {
      if (!stats.has(card.category)) {
        stats.set(card.category, {
          total: 0,
          retention: 0,
          avgEaseFactor: 0
        });
      }
      
      const catStats = stats.get(card.category)!;
      catStats.total++;
      
      if (card.statistics.totalReviews > 0) {
        catStats.retention += (card.statistics.correctReviews / card.statistics.totalReviews);
      }
      catStats.avgEaseFactor += card.easeFactor;
    });
    
    // Calculate averages
    stats.forEach((value, key) => {
      value.retention = (value.retention / value.total) * 100;
      value.avgEaseFactor = value.avgEaseFactor / value.total;
    });
    
    return Object.fromEntries(stats);
  }
  
  private getStreakStatistics(cards: ReviewCard[]) {
    const streaks = cards.map(c => c.statistics.streakCount);
    return {
      currentStreak: Math.max(...streaks, 0),
      averageStreak: streaks.reduce((a, b) => a + b, 0) / streaks.length || 0,
      cardsOnStreak: streaks.filter(s => s > 0).length
    };
  }
  
  private calculateTimeInvestment(cards: ReviewCard[]) {
    const avgTimePerCard = 15; // seconds
    const schedule = this.getReviewSchedule(cards);
    const todayTime = (schedule.today.length + schedule.overdue.length) * avgTimePerCard;
    
    return {
      todayMinutes: Math.ceil(todayTime / 60),
      weeklyMinutes: Math.ceil(this.calculateReviewForecast(cards, 7).reduce((a, b) => a + b, 0) * avgTimePerCard / 60),
      averagePerDay: Math.ceil(cards.length * avgTimePerCard / 30 / 60) // Assuming review cycle of 30 days
    };
  }
  
  /**
   * Create a new card with default values
   */
  createCard(question: string, answer: string, category: string, tags: string[] = []): ReviewCard {
    return {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question,
      answer,
      category,
      tags,
      difficulty: 3,
      easeFactor: 2.5,
      repetitions: 0,
      interval: 0,
      nextReviewDate: new Date(),
      createdAt: new Date(),
      statistics: {
        totalReviews: 0,
        correctReviews: 0,
        averageResponseTime: 0,
        streakCount: 0
      }
    };
  }
  
  /**
   * Import cards from Anki format
   */
  importFromAnki(ankiData: string): ReviewCard[] {
    // Parse Anki's tab-separated format
    const lines = ankiData.split('\n');
    const cards: ReviewCard[] = [];
    
    lines.forEach(line => {
      const [question, answer, ...tags] = line.split('\t');
      if (question && answer) {
        cards.push(this.createCard(
          question.trim(),
          answer.trim(),
          'Imported',
          tags.map(t => t.trim())
        ));
      }
    });
    
    return cards;
  }
  
  /**
   * Export cards to Anki format
   */
  exportToAnki(cards: ReviewCard[]): string {
    return cards.map(card => 
      `${card.question}\t${card.answer}\t${card.tags.join('\t')}`
    ).join('\n');
  }
}

// Singleton instance
export const spacedRepetition = new SpacedRepetitionSystem();