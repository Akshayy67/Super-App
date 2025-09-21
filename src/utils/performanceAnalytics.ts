import { SpeechAnalysisResult } from "./speechAnalysis";
import { BodyLanguageAnalysisResult } from "./bodyLanguageAnalysis";

export interface SavedMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface InterviewQuestionData {
  id: string;
  question: string;
  category: string;
  timeLimit: number;
  hints?: string[];
  askedAt?: string; // timestamp when question was asked
  answeredAt?: string; // timestamp when user finished answering
}

export interface InterviewPerformanceData {
  id: string;
  timestamp: string;
  role: string;
  difficulty: string;
  duration: number;

  // Core Performance Metrics
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  behavioralScore: number;

  // Speech Analysis
  speechAnalysis: SpeechAnalysisResult;

  // Body Language Analysis
  bodyLanguageAnalysis: BodyLanguageAnalysisResult;

  // Question Performance
  questionsAnswered: number;
  questionsCorrect: number;
  averageResponseTime: number;

  // Detailed Metrics
  detailedMetrics: {
    confidence: number;
    clarity: number;
    professionalism: number;
    engagement: number;
    adaptability: number;
  };

  // Improvement Areas
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];

  // NEW: Actual Interview Content
  interviewSession?: {
    questions: InterviewQuestionData[];
    messages: SavedMessage[];
    sessionType: string;
    interviewType: string;
  };
}

export interface PerformanceComparison {
  current: InterviewPerformanceData;
  previous?: InterviewPerformanceData;
  improvements: {
    metric: string;
    change: number;
    trend: "improved" | "declined" | "stable";
    significance: "major" | "minor" | "negligible";
  }[];
  overallProgress: {
    score: number;
    trend: "improving" | "declining" | "stable";
    message: string;
  };
}

export interface PerformanceTrends {
  timeRange: string;
  interviews: InterviewPerformanceData[];
  trends: {
    overallScore: { trend: number; direction: "up" | "down" | "stable" };
    technicalScore: { trend: number; direction: "up" | "down" | "stable" };
    communicationScore: { trend: number; direction: "up" | "down" | "stable" };
    speechMetrics: { trend: number; direction: "up" | "down" | "stable" };
    bodyLanguage: { trend: number; direction: "up" | "down" | "stable" };
  };
  insights: string[];
  recommendations: string[];
}

export class PerformanceAnalytics {
  private performanceHistory: InterviewPerformanceData[] = [];
  private readonly STORAGE_KEY = "interview_performance_history";

  constructor() {
    // Clear any existing data to ensure fresh start
    this.clearHistory();
    this.loadPerformanceHistory();
  }

  savePerformanceData(data: InterviewPerformanceData): void {
    this.performanceHistory.push(data);
    this.saveToStorage();
  }

  getPerformanceHistory(): InterviewPerformanceData[] {
    return [...this.performanceHistory];
  }

  getLatestPerformance(): InterviewPerformanceData | null {
    return this.performanceHistory.length > 0
      ? this.performanceHistory[this.performanceHistory.length - 1]
      : null;
  }

  compareWithPrevious(
    currentData: InterviewPerformanceData
  ): PerformanceComparison {
    const previousData = this.getPreviousPerformance(currentData.role);

    if (!previousData) {
      return {
        current: currentData,
        improvements: [],
        overallProgress: {
          score: currentData.overallScore,
          trend: "stable",
          message:
            "This is your first interview for this role. Great job getting started!",
        },
      };
    }

    const improvements = this.calculateImprovements(currentData, previousData);
    const overallProgress = this.calculateOverallProgress(
      currentData,
      previousData
    );

    return {
      current: currentData,
      previous: previousData,
      improvements,
      overallProgress,
    };
  }

  generatePerformanceTrends(
    timeRange: "week" | "month" | "quarter" | "all" = "month"
  ): PerformanceTrends {
    const filteredInterviews = this.filterByTimeRange(timeRange);

    if (filteredInterviews.length < 2) {
      return {
        timeRange,
        interviews: filteredInterviews,
        trends: {
          overallScore: { trend: 0, direction: "stable" },
          technicalScore: { trend: 0, direction: "stable" },
          communicationScore: { trend: 0, direction: "stable" },
          speechMetrics: { trend: 0, direction: "stable" },
          bodyLanguage: { trend: 0, direction: "stable" },
        },
        insights: [
          "Not enough data for trend analysis. Complete more interviews to see trends.",
        ],
        recommendations: [
          "Continue practicing to build your performance history.",
        ],
      };
    }

    const trends = this.calculateTrends(filteredInterviews);
    const insights = this.generateInsights(filteredInterviews, trends);
    const recommendations = this.generateRecommendations(
      filteredInterviews,
      trends
    );

    return {
      timeRange,
      interviews: filteredInterviews,
      trends,
      insights,
      recommendations,
    };
  }

  generateDetailedReport(performanceId: string): any {
    const performance = this.performanceHistory.find(
      (p) => p.id === performanceId
    );
    if (!performance) return null;

    const comparison = this.compareWithPrevious(performance);
    const roleHistory = this.performanceHistory.filter(
      (p) => p.role === performance.role
    );
    const averageScores = this.calculateAverageScores(roleHistory);

    return {
      performance,
      comparison,
      roleHistory: roleHistory.slice(-5), // Last 5 interviews for this role
      averageScores,
      percentileRanking: this.calculatePercentileRanking(performance),
      improvementPlan: this.generateImprovementPlan(performance),
    };
  }

  private getPreviousPerformance(
    role: string
  ): InterviewPerformanceData | null {
    const roleInterviews = this.performanceHistory.filter(
      (p) => p.role === role
    );
    return roleInterviews.length > 1
      ? roleInterviews[roleInterviews.length - 2]
      : null;
  }

  private calculateImprovements(
    current: InterviewPerformanceData,
    previous: InterviewPerformanceData
  ) {
    const metrics = [
      { key: "overallScore", name: "Overall Score" },
      { key: "technicalScore", name: "Technical Skills" },
      { key: "communicationScore", name: "Communication" },
      { key: "behavioralScore", name: "Behavioral Skills" },
    ];

    const speechMetrics = [
      {
        key: "speechAnalysis.confidenceScore.overall",
        name: "Speech Confidence",
      },
      { key: "speechAnalysis.paceAnalysis.paceScore", name: "Speaking Pace" },
      {
        key: "speechAnalysis.pronunciationAssessment.overallScore",
        name: "Pronunciation",
      },
    ];

    const bodyLanguageMetrics = [
      {
        key: "bodyLanguageAnalysis.overallBodyLanguage.score",
        name: "Body Language",
      },
      { key: "bodyLanguageAnalysis.eyeContact.score", name: "Eye Contact" },
      { key: "bodyLanguageAnalysis.posture.score", name: "Posture" },
    ];

    const allMetrics = [...metrics, ...speechMetrics, ...bodyLanguageMetrics];

    return allMetrics.map((metric) => {
      const currentValue = this.getNestedValue(current, metric.key);
      const previousValue = this.getNestedValue(previous, metric.key);
      const change = currentValue - previousValue;

      let trend: "improved" | "declined" | "stable";
      let significance: "major" | "minor" | "negligible";

      if (Math.abs(change) < 2) {
        trend = "stable";
        significance = "negligible";
      } else if (change > 0) {
        trend = "improved";
        significance = change > 10 ? "major" : "minor";
      } else {
        trend = "declined";
        significance = Math.abs(change) > 10 ? "major" : "minor";
      }

      return {
        metric: metric.name,
        change: Math.round(change * 100) / 100,
        trend,
        significance,
      };
    });
  }

  private calculateOverallProgress(
    current: InterviewPerformanceData,
    previous: InterviewPerformanceData
  ) {
    const overallChange = current.overallScore - previous.overallScore;

    let trend: "improving" | "declining" | "stable";
    let message: string;

    if (Math.abs(overallChange) < 3) {
      trend = "stable";
      message =
        "Your performance is consistent. Focus on specific areas for improvement.";
    } else if (overallChange > 0) {
      trend = "improving";
      if (overallChange > 10) {
        message = "Excellent improvement! You're making significant progress.";
      } else {
        message = "Good progress! Keep up the consistent improvement.";
      }
    } else {
      trend = "declining";
      message =
        "Your scores have decreased. Review the feedback and focus on practice.";
    }

    return {
      score: current.overallScore,
      trend,
      message,
    };
  }

  private filterByTimeRange(timeRange: string): InterviewPerformanceData[] {
    if (timeRange === "all") return [...this.performanceHistory];

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case "week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
    }

    return this.performanceHistory.filter(
      (p) => new Date(p.timestamp) >= cutoffDate
    );
  }

  private calculateTrends(interviews: InterviewPerformanceData[]) {
    const calculateTrend = (values: number[]) => {
      if (values.length < 2) return { trend: 0, direction: "stable" as const };

      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));

      const firstAvg =
        firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

      const trend = secondAvg - firstAvg;
      const direction =
        Math.abs(trend) < 2 ? "stable" : trend > 0 ? "up" : "down";

      return { trend: Math.round(trend * 100) / 100, direction };
    };

    return {
      overallScore: calculateTrend(interviews.map((i) => i.overallScore)),
      technicalScore: calculateTrend(interviews.map((i) => i.technicalScore)),
      communicationScore: calculateTrend(
        interviews.map((i) => i.communicationScore)
      ),
      speechMetrics: calculateTrend(
        interviews.map((i) => i.speechAnalysis.confidenceScore.overall)
      ),
      bodyLanguage: calculateTrend(
        interviews.map((i) => i.bodyLanguageAnalysis.overallBodyLanguage.score)
      ),
    };
  }

  private generateInsights(
    interviews: InterviewPerformanceData[],
    trends: any
  ): string[] {
    const insights: string[] = [];

    if (trends.overallScore.direction === "up") {
      insights.push(
        "Your overall performance is trending upward - great progress!"
      );
    } else if (trends.overallScore.direction === "down") {
      insights.push(
        "Your overall performance has declined recently. Consider reviewing feedback."
      );
    }

    if (trends.speechMetrics.direction === "up") {
      insights.push(
        "Your speech confidence and clarity are improving consistently."
      );
    }

    if (trends.bodyLanguage.direction === "up") {
      insights.push(
        "Your body language and professional presence are getting stronger."
      );
    }

    // Analyze consistency
    const recentScores = interviews.slice(-3).map((i) => i.overallScore);
    const variance = this.calculateVariance(recentScores);

    if (variance < 25) {
      insights.push(
        "Your performance is becoming more consistent, which is excellent."
      );
    } else {
      insights.push(
        "Your performance varies significantly between interviews. Focus on consistency."
      );
    }

    return insights;
  }

  private generateRecommendations(
    interviews: InterviewPerformanceData[],
    trends: any
  ): string[] {
    const recommendations: string[] = [];
    const latest = interviews[interviews.length - 1];

    if (latest.speechAnalysis.fillerWords.percentage > 10) {
      recommendations.push(
        "Practice reducing filler words - aim for less than 5% of your speech."
      );
    }

    if (latest.bodyLanguageAnalysis.eyeContact.percentage < 60) {
      recommendations.push(
        "Work on maintaining better eye contact - aim for 60-80% of the time."
      );
    }

    if (trends.technicalScore.direction === "down") {
      recommendations.push(
        "Review technical concepts and practice coding problems regularly."
      );
    }

    if (latest.speechAnalysis.paceAnalysis.paceRating !== "optimal") {
      recommendations.push(
        "Practice speaking at an optimal pace - aim for 140-160 words per minute."
      );
    }

    return recommendations;
  }

  private calculateAverageScores(interviews: InterviewPerformanceData[]) {
    if (interviews.length === 0) return null;

    const sums = interviews.reduce(
      (acc, interview) => ({
        overall: acc.overall + interview.overallScore,
        technical: acc.technical + interview.technicalScore,
        communication: acc.communication + interview.communicationScore,
        behavioral: acc.behavioral + interview.behavioralScore,
      }),
      { overall: 0, technical: 0, communication: 0, behavioral: 0 }
    );

    const count = interviews.length;
    return {
      overall: Math.round(sums.overall / count),
      technical: Math.round(sums.technical / count),
      communication: Math.round(sums.communication / count),
      behavioral: Math.round(sums.behavioral / count),
    };
  }

  private calculatePercentileRanking(performance: InterviewPerformanceData) {
    // In a real implementation, this would compare against a larger dataset
    // For now, we'll provide a mock percentile based on the score
    const score = performance.overallScore;
    let percentile: number;

    if (score >= 90) percentile = 95;
    else if (score >= 80) percentile = 80;
    else if (score >= 70) percentile = 65;
    else if (score >= 60) percentile = 45;
    else percentile = 25;

    return {
      percentile,
      message: `You scored better than ${percentile}% of candidates in similar roles.`,
    };
  }

  private generateImprovementPlan(performance: InterviewPerformanceData) {
    const plan: {
      area: string;
      priority: "high" | "medium" | "low";
      actions: string[];
    }[] = [];

    // Analyze weakest areas
    if (performance.speechAnalysis.fillerWords.percentage > 15) {
      plan.push({
        area: "Filler Words",
        priority: "high",
        actions: [
          "Practice speaking with deliberate pauses instead of filler words",
          "Record yourself speaking and count filler words",
          "Use apps that detect and alert you to filler word usage",
        ],
      });
    }

    if (performance.bodyLanguageAnalysis.eyeContact.percentage < 50) {
      plan.push({
        area: "Eye Contact",
        priority: "high",
        actions: [
          "Practice maintaining eye contact during conversations",
          "Use video calls to practice looking at the camera",
          "Set reminders to check your eye contact during interviews",
        ],
      });
    }

    if (performance.technicalScore < 70) {
      plan.push({
        area: "Technical Skills",
        priority: "high",
        actions: [
          "Review fundamental concepts in your field",
          "Practice coding problems daily",
          "Join study groups or technical discussions",
        ],
      });
    }

    return plan;
  }

  private getNestedValue(obj: any, path: string): number {
    return path.split(".").reduce((current, key) => current?.[key], obj) || 0;
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return variance;
  }

  private loadPerformanceHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.performanceHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load performance history:", error);
      this.performanceHistory = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.performanceHistory)
      );
    } catch (error) {
      console.error("Failed to save performance history:", error);
    }
  }

  clearHistory(): void {
    this.performanceHistory = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  exportPerformanceData(): string {
    return JSON.stringify(this.performanceHistory, null, 2);
  }

  importPerformanceData(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        this.performanceHistory = imported;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to import performance data:", error);
      return false;
    }
  }
}
