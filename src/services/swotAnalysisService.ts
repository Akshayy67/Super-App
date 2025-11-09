// SWOT Analysis Service - Analyzes contest performance and generates recommendations
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export interface ContestResult {
  userId: string;
  contestId: string;
  answers: Record<number, any>;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  timeLimit: number;
  correctAnswers: number;
  wrongAnswers: number;
  categoryPerformance: Record<string, { correct: number; total: number }>;
  timestamp: Date;
}

export interface SWOTAnalysis {
  userId: string;
  contestId: string;
  timestamp: Date;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  overallScore: number;
  performanceMetrics: {
    accuracy: number;
    speed: number;
    consistency: number;
    categoryScores: Record<string, number>;
  };
  recommendations: Recommendation[];
}

export interface Recommendation {
  type: 'skill-development' | 'practice' | 'career' | 'learning-path';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  resources: {
    title: string;
    url: string;
    type: 'course' | 'article' | 'video' | 'practice';
  }[];
  estimatedTime: string;
}

class SWOTAnalysisService {
  private readonly COLLECTIONS = {
    SWOT_ANALYSIS: 'swotAnalysis',
    CONTEST_RESULTS: 'contestResults',
    USER_HISTORY: 'userContestHistory',
  };

  // Generate SWOT analysis after contest completion
  async generateSWOTAnalysis(contestResult: ContestResult): Promise<SWOTAnalysis> {
    try {
      const userHistory = await this.getUserContestHistory(contestResult.userId);
      
      const swotAnalysis: SWOTAnalysis = {
        userId: contestResult.userId,
        contestId: contestResult.contestId,
        timestamp: new Date(),
        strengths: this.identifyStrengths(contestResult, userHistory),
        weaknesses: this.identifyWeaknesses(contestResult, userHistory),
        opportunities: this.identifyOpportunities(contestResult, userHistory),
        threats: this.identifyThreats(contestResult, userHistory),
        overallScore: contestResult.score,
        performanceMetrics: this.calculatePerformanceMetrics(contestResult),
        recommendations: [],
      };

      // Generate recommendations based on SWOT
      swotAnalysis.recommendations = await this.generateRecommendations(swotAnalysis, contestResult);

      // Save to Firestore
      await addDoc(collection(db, this.COLLECTIONS.SWOT_ANALYSIS), {
        ...swotAnalysis,
        timestamp: new Date(),
      });

      return swotAnalysis;
    } catch (error) {
      console.error('Error generating SWOT analysis:', error);
      throw error;
    }
  }

  // Identify strengths based on performance
  private identifyStrengths(result: ContestResult, history: ContestResult[]): string[] {
    const strengths: string[] = [];
    const accuracy = (result.correctAnswers / result.totalQuestions) * 100;

    if (accuracy >= 80) {
      strengths.push('Excellent problem-solving accuracy (>80%)');
    }

    if (result.timeTaken < result.timeLimit * 0.7) {
      strengths.push('Fast problem-solving speed - completed 30% faster than time limit');
    }

    // Category-wise strengths
    Object.entries(result.categoryPerformance).forEach(([category, perf]) => {
      const categoryAccuracy = (perf.correct / perf.total) * 100;
      if (categoryAccuracy >= 85) {
        strengths.push(`Strong proficiency in ${category} (${categoryAccuracy.toFixed(0)}% accuracy)`);
      }
    });

    // Historical improvement
    if (history.length >= 2) {
      const avgPreviousScore = history.reduce((sum, h) => sum + h.score, 0) / history.length;
      if (result.score > avgPreviousScore * 1.2) {
        strengths.push('Significant improvement trend - 20%+ score increase');
      }
    }

    if (strengths.length === 0) {
      strengths.push('Completed the contest and gained valuable experience');
    }

    return strengths;
  }

  // Identify weaknesses
  private identifyWeaknesses(result: ContestResult, history: ContestResult[]): string[] {
    const weaknesses: string[] = [];
    const accuracy = (result.correctAnswers / result.totalQuestions) * 100;

    if (accuracy < 50) {
      weaknesses.push('Low accuracy rate - need to focus on fundamentals');
    }

    if (result.timeTaken >= result.timeLimit * 0.95) {
      weaknesses.push('Time management - used 95%+ of available time');
    }

    // Category-wise weaknesses
    Object.entries(result.categoryPerformance).forEach(([category, perf]) => {
      const categoryAccuracy = (perf.correct / perf.total) * 100;
      if (categoryAccuracy < 50) {
        weaknesses.push(`Needs improvement in ${category} (${categoryAccuracy.toFixed(0)}% accuracy)`);
      }
    });

    // Consistency issues
    if (history.length >= 3) {
      const scores = history.map(h => h.score);
      const variance = this.calculateVariance(scores);
      if (variance > 200) {
        weaknesses.push('Inconsistent performance across contests');
      }
    }

    return weaknesses;
  }

  // Identify opportunities
  private identifyOpportunities(result: ContestResult, history: ContestResult[]): string[] {
    const opportunities: string[] = [];

    // Areas with moderate performance that can be improved
    Object.entries(result.categoryPerformance).forEach(([category, perf]) => {
      const categoryAccuracy = (perf.correct / perf.total) * 100;
      if (categoryAccuracy >= 50 && categoryAccuracy < 75) {
        opportunities.push(`High potential for growth in ${category} - currently at ${categoryAccuracy.toFixed(0)}%`);
      }
    });

    if (result.score >= 60) {
      opportunities.push('Eligible for advanced-level contests and challenges');
    }

    if (history.length >= 3) {
      const recentTrend = this.calculateTrend(history.slice(-3));
      if (recentTrend > 0) {
        opportunities.push('Positive learning curve - capitalize on momentum');
      }
    }

    opportunities.push('Access to peer study groups and mentorship programs');
    opportunities.push('Opportunity to participate in coding competitions and hackathons');

    return opportunities;
  }

  // Identify threats or challenges
  private identifyThreats(result: ContestResult, history: ContestResult[]): string[] {
    const threats: string[] = [];

    if (history.length >= 3) {
      const recentTrend = this.calculateTrend(history.slice(-3));
      if (recentTrend < -5) {
        threats.push('Declining performance trend - need to address learning gaps');
      }
    }

    if (result.wrongAnswers > result.correctAnswers) {
      threats.push('High error rate may indicate foundational knowledge gaps');
    }

    const accuracy = (result.correctAnswers / result.totalQuestions) * 100;
    if (accuracy < 40) {
      threats.push('Risk of losing motivation - recommend targeted practice sessions');
    }

    // Check for weak categories
    const weakCategories = Object.entries(result.categoryPerformance)
      .filter(([_, perf]) => (perf.correct / perf.total) < 0.4)
      .map(([cat]) => cat);

    if (weakCategories.length >= 2) {
      threats.push('Multiple weak areas may require structured learning plan');
    }

    return threats;
  }

  // Calculate performance metrics
  private calculatePerformanceMetrics(result: ContestResult) {
    const accuracy = (result.correctAnswers / result.totalQuestions) * 100;
    const speedScore = ((result.timeLimit - result.timeTaken) / result.timeLimit) * 100;
    
    const categoryScores: Record<string, number> = {};
    Object.entries(result.categoryPerformance).forEach(([category, perf]) => {
      categoryScores[category] = (perf.correct / perf.total) * 100;
    });

    return {
      accuracy: Math.round(accuracy * 100) / 100,
      speed: Math.max(0, Math.round(speedScore * 100) / 100),
      consistency: 85, // Will be calculated from history
      categoryScores,
    };
  }

  // Generate personalized recommendations
  private async generateRecommendations(
    swot: SWOTAnalysis,
    result: ContestResult
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Identify weakest categories for targeted practice
    const weakCategories = Object.entries(result.categoryPerformance)
      .filter(([_, perf]) => (perf.correct / perf.total) < 0.6)
      .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
      .slice(0, 3);

    if (weakCategories.length > 0) {
      weakCategories.forEach(([category, perf]) => {
        recommendations.push({
          type: 'skill-development',
          priority: 'high',
          title: `Improve ${category} skills`,
          description: `Your performance in ${category} is at ${((perf.correct / perf.total) * 100).toFixed(0)}%. Focus on strengthening fundamentals.`,
          actionItems: [
            `Complete 10 practice problems in ${category}`,
            `Review key concepts and best practices`,
            `Join study group focused on ${category}`,
          ],
          resources: this.getResourcesForCategory(category),
          estimatedTime: '2-3 weeks',
        });
      });
    }

    // Time management recommendations
    if (result.timeTaken >= result.timeLimit * 0.9) {
      recommendations.push({
        type: 'practice',
        priority: 'medium',
        title: 'Improve time management skills',
        description: 'You used most of the available time. Practice solving problems faster.',
        actionItems: [
          'Practice with timed mock tests',
          'Learn to identify and skip difficult questions initially',
          'Master quick problem-solving techniques',
        ],
        resources: [
          { title: 'Effective Time Management for Coding Tests', url: '#', type: 'article' },
          { title: 'Speed Coding Techniques', url: '#', type: 'video' },
        ],
        estimatedTime: '1-2 weeks',
      });
    }

    // Career path recommendations based on strong categories
    const strongCategories = Object.entries(result.categoryPerformance)
      .filter(([_, perf]) => (perf.correct / perf.total) >= 0.8)
      .map(([cat]) => cat);

    if (strongCategories.length > 0 && swot.overallScore >= 70) {
      recommendations.push({
        type: 'career',
        priority: 'medium',
        title: 'Explore career opportunities',
        description: `Your strong performance in ${strongCategories.join(', ')} makes you suitable for related roles.`,
        actionItems: [
          'Build portfolio projects showcasing these skills',
          'Apply for internships or jobs in these domains',
          'Connect with professionals in the field',
        ],
        resources: [
          { title: 'Career Paths in Tech', url: '#', type: 'article' },
          { title: 'Building a Strong Portfolio', url: '#', type: 'course' },
        ],
        estimatedTime: 'Ongoing',
      });
    }

    // Learning path recommendations
    if (swot.overallScore < 60) {
      recommendations.push({
        type: 'learning-path',
        priority: 'high',
        title: 'Follow structured learning path',
        description: 'Consider enrolling in comprehensive courses to build strong foundation.',
        actionItems: [
          'Complete beginner-friendly online courses',
          'Practice daily with coding challenges',
          'Participate in study groups and peer learning',
        ],
        resources: [
          { title: 'Complete DSA Course', url: '#', type: 'course' },
          { title: 'Problem Solving Masterclass', url: '#', type: 'course' },
          { title: 'Daily Coding Practice Platform', url: '#', type: 'practice' },
        ],
        estimatedTime: '3-6 months',
      });
    }

    return recommendations;
  }

  // Get resources for specific category
  private getResourcesForCategory(category: string) {
    const resourceMap: Record<string, any[]> = {
      'Data Structures': [
        { title: 'Data Structures and Algorithms', url: 'https://www.coursera.org/learn/data-structures', type: 'course' },
        { title: 'Visualizing Data Structures', url: 'https://visualgo.net', type: 'practice' },
      ],
      'Algorithms': [
        { title: 'Introduction to Algorithms', url: 'https://www.khanacademy.org/computing/computer-science/algorithms', type: 'course' },
        { title: 'LeetCode Algorithm Practice', url: 'https://leetcode.com/problemset/algorithms/', type: 'practice' },
      ],
      'default': [
        { title: `${category} Fundamentals`, url: '#', type: 'course' },
        { title: `${category} Practice Problems`, url: '#', type: 'practice' },
      ],
    };

    return resourceMap[category] || resourceMap['default'];
  }

  // Get user's contest history
  private async getUserContestHistory(userId: string): Promise<ContestResult[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.CONTEST_RESULTS),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as ContestResult[];
    } catch (error) {
      console.error('Error fetching user history:', error);
      return [];
    }
  }

  // Calculate variance
  private calculateVariance(numbers: number[]): number {
    const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
    return squareDiffs.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  // Calculate trend
  private calculateTrend(results: ContestResult[]): number {
    if (results.length < 2) return 0;
    const first = results[0].score;
    const last = results[results.length - 1].score;
    return last - first;
  }

  // Get SWOT analysis by ID
  async getSWOTAnalysis(userId: string, contestId: string) {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.SWOT_ANALYSIS),
        where('userId', '==', userId),
        where('contestId', '==', contestId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as SWOTAnalysis;
      }
      return null;
    } catch (error) {
      console.error('Error fetching SWOT analysis:', error);
      return null;
    }
  }

  // Get all SWOT analyses for a user
  async getUserSWOTHistory(userId: string) {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.SWOT_ANALYSIS),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as (SWOTAnalysis & { id: string })[];
    } catch (error) {
      console.error('Error fetching SWOT history:', error);
      return [];
    }
  }
}

export const swotAnalysisService = new SWOTAnalysisService();
