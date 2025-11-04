/**
 * Interview Aspect Scores Manager
 * 
 * Manages AI-generated scores for various interview aspects.
 * Stores scores in a structured list format for better graph analysis and visualization.
 */

export interface AspectScore {
  aspectName: string;
  score: number; // 0-100 scale
  timestamp: string; // ISO timestamp
  interviewId: string;
  category: "communication" | "technical" | "behavioral" | "overall" | "detailed";
  subScores?: Record<string, number>; // Optional granular sub-scores
  metadata?: {
    confidence: number;
    analysisQuality: "high" | "medium" | "low";
    notes?: string;
  };
}

export interface AspectScoreHistory {
  aspectName: string;
  scores: AspectScore[];
  averageScore: number;
  trend: "improving" | "declining" | "stable";
  latestScore: number;
}

export class InterviewAspectScores {
  private scores: AspectScore[] = [];
  private readonly STORAGE_KEY = "interview_aspect_scores";

  constructor() {
    this.loadScores();
  }

  /**
   * Add a new aspect score to the collection
   */
  addScore(score: AspectScore): void {
    this.scores.push(score);
    this.saveScores();
  }

  /**
   * Add multiple aspect scores at once (for a single interview)
   */
  addScoresForInterview(
    interviewId: string,
    timestamp: string,
    aspectScores: {
      [aspectName: string]: {
        score: number;
        category: AspectScore["category"];
        subScores?: Record<string, number>;
        metadata?: AspectScore["metadata"];
      };
    }
  ): void {
    Object.entries(aspectScores).forEach(([aspectName, data]) => {
      this.addScore({
        aspectName,
        score: data.score,
        timestamp,
        interviewId,
        category: data.category,
        subScores: data.subScores,
        metadata: data.metadata,
      });
    });
  }

  /**
   * Get all scores for a specific aspect
   */
  getScoresForAspect(aspectName: string): AspectScore[] {
    return this.scores
      .filter((s) => s.aspectName === aspectName)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get all scores for a specific interview
   */
  getScoresForInterview(interviewId: string): AspectScore[] {
    return this.scores.filter((s) => s.interviewId === interviewId);
  }

  /**
   * Get aspect score history with trend analysis
   */
  getAspectHistory(aspectName: string): AspectScoreHistory {
    const aspectScores = this.getScoresForAspect(aspectName);

    if (aspectScores.length === 0) {
      return {
        aspectName,
        scores: [],
        averageScore: 0,
        trend: "stable",
        latestScore: 0,
      };
    }

    const averageScore =
      aspectScores.reduce((sum, s) => sum + s.score, 0) / aspectScores.length;

    // Calculate trend (compare last 3 scores with previous 3 scores)
    let trend: "improving" | "declining" | "stable" = "stable";
    if (aspectScores.length >= 6) {
      const recent = aspectScores.slice(-3).map((s) => s.score);
      const previous = aspectScores.slice(-6, -3).map((s) => s.score);
      const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
      const previousAvg = previous.reduce((sum, s) => sum + s, 0) / previous.length;
      const change = recentAvg - previousAvg;

      if (change > 5) trend = "improving";
      else if (change < -5) trend = "declining";
    } else if (aspectScores.length >= 2) {
      const change = aspectScores[aspectScores.length - 1].score - aspectScores[0].score;
      if (change > 5) trend = "improving";
      else if (change < -5) trend = "declining";
    }

    return {
      aspectName,
      scores: aspectScores,
      averageScore: Math.round(averageScore * 100) / 100,
      trend,
      latestScore: aspectScores[aspectScores.length - 1].score,
    };
  }

  /**
   * Get all aspect histories for graph visualization
   */
  getAllAspectHistories(): AspectScoreHistory[] {
    const aspectNames = new Set(this.scores.map((s) => s.aspectName));
    return Array.from(aspectNames).map((name) => this.getAspectHistory(name));
  }

  /**
   * Get scores grouped by category for category-based analysis
   */
  getScoresByCategory(
    category: AspectScore["category"]
  ): AspectScore[] {
    return this.scores
      .filter((s) => s.category === category)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get data formatted for time-series charts (line charts)
   */
  getTimeSeriesData(
    aspectNames: string[],
    timeRange?: "30" | "60" | "90" | "all"
  ): Array<{
    timestamp: string;
    date: string;
    [aspectName: string]: string | number;
  }> {
    const cutoffDate = this.getCutoffDate(timeRange);
    const filteredScores = this.scores.filter(
      (s) => !cutoffDate || new Date(s.timestamp) >= cutoffDate
    );

    // Group by timestamp
    const timestampMap = new Map<string, Record<string, number>>();

    filteredScores.forEach((score) => {
      if (aspectNames.includes(score.aspectName)) {
        const dateKey = new Date(score.timestamp).toISOString().split("T")[0];
        if (!timestampMap.has(dateKey)) {
          timestampMap.set(dateKey, {});
        }
        const entry = timestampMap.get(dateKey)!;
        // If multiple scores for same aspect on same day, take average
        if (entry[score.aspectName] !== undefined) {
          entry[score.aspectName] =
            (entry[score.aspectName] + score.score) / 2;
        } else {
          entry[score.aspectName] = score.score;
        }
      }
    });

    // Convert to array format
    return Array.from(timestampMap.entries())
      .map(([date, scores]) => {
        const entry: any = {
          timestamp: date,
          date: new Date(date).toLocaleDateString(),
        };
        aspectNames.forEach((name) => {
          entry[name] = scores[name] || 0;
        });
        return entry;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get data formatted for radar charts
   */
  getRadarChartData(interviewId?: string): Array<{
    aspect: string;
    score: number;
    fullMark: number;
  }> {
    const scoresToUse = interviewId
      ? this.getScoresForInterview(interviewId)
      : this.getLatestScores();

    const aspectMap = new Map<string, number[]>();
    scoresToUse.forEach((score) => {
      if (!aspectMap.has(score.aspectName)) {
        aspectMap.set(score.aspectName, []);
      }
      aspectMap.get(score.aspectName)!.push(score.score);
    });

    return Array.from(aspectMap.entries()).map(([aspect, scores]) => ({
      aspect,
      score: Math.round(
        scores.reduce((sum, s) => sum + s, 0) / scores.length
      ),
      fullMark: 100,
    }));
  }

  /**
   * Get data formatted for bar charts (category comparison)
   */
  getCategoryComparisonData(): Array<{
    category: string;
    averageScore: number;
    count: number;
  }> {
    const categoryMap = new Map<string, number[]>();
    this.scores.forEach((score) => {
      if (!categoryMap.has(score.category)) {
        categoryMap.set(score.category, []);
      }
      categoryMap.get(score.category)!.push(score.score);
    });

    return Array.from(categoryMap.entries()).map(([category, scores]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      averageScore: Math.round(
        scores.reduce((sum, s) => sum + s, 0) / scores.length
      ),
      count: scores.length,
    }));
  }

  /**
   * Get latest scores for each aspect (for current snapshot)
   */
  getLatestScores(): AspectScore[] {
    const aspectMap = new Map<string, AspectScore>();
    this.scores.forEach((score) => {
      const existing = aspectMap.get(score.aspectName);
      if (!existing || new Date(score.timestamp) > new Date(existing.timestamp)) {
        aspectMap.set(score.aspectName, score);
      }
    });
    return Array.from(aspectMap.values());
  }

  /**
   * Get overall statistics
   */
  getStatistics(): {
    totalScores: number;
    totalInterviews: number;
    aspectsTracked: number;
    averageScore: number;
    bestAspect: string;
    worstAspect: string;
  } {
    if (this.scores.length === 0) {
      return {
        totalScores: 0,
        totalInterviews: 0,
        aspectsTracked: 0,
        averageScore: 0,
        bestAspect: "",
        worstAspect: "",
      };
    }

    const interviewIds = new Set(this.scores.map((s) => s.interviewId));
    const aspectNames = new Set(this.scores.map((s) => s.aspectName));

    const averageScore =
      this.scores.reduce((sum, s) => sum + s.score, 0) / this.scores.length;

    const aspectAverages = Array.from(aspectNames).map((name) => {
      const aspectScores = this.getScoresForAspect(name);
      const avg =
        aspectScores.reduce((sum, s) => sum + s.score, 0) / aspectScores.length;
      return { name, avg };
    });

    const sortedAspects = aspectAverages.sort((a, b) => b.avg - a.avg);

    return {
      totalScores: this.scores.length,
      totalInterviews: interviewIds.size,
      aspectsTracked: aspectNames.size,
      averageScore: Math.round(averageScore * 100) / 100,
      bestAspect: sortedAspects[0]?.name || "",
      worstAspect: sortedAspects[sortedAspects.length - 1]?.name || "",
    };
  }

  /**
   * Clear all scores (for testing/reset)
   */
  clearScores(): void {
    this.scores = [];
    this.saveScores();
  }

  /**
   * Export scores as JSON
   */
  exportScores(): string {
    return JSON.stringify(this.scores, null, 2);
  }

  /**
   * Import scores from JSON
   */
  importScores(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        this.scores = imported;
        this.saveScores();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to import aspect scores:", error);
      return false;
    }
  }

  private getCutoffDate(timeRange?: "30" | "60" | "90" | "all"): Date | null {
    if (!timeRange || timeRange === "all") return null;

    const now = new Date();
    const cutoff = new Date();

    switch (timeRange) {
      case "30":
        cutoff.setDate(now.getDate() - 30);
        break;
      case "60":
        cutoff.setDate(now.getDate() - 60);
        break;
      case "90":
        cutoff.setDate(now.getDate() - 90);
        break;
    }

    return cutoff;
  }

  private loadScores(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.scores = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load aspect scores:", error);
      this.scores = [];
    }
  }

  private saveScores(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scores));
    } catch (error) {
      console.error("Failed to save aspect scores:", error);
    }
  }
}

// Singleton instance for global use
export const aspectScoresManager = new InterviewAspectScores();

