import { InterviewPerformanceData } from "./performanceAnalytics";

// Storage keys
const STORAGE_KEYS = {
  PERFORMANCE_HISTORY: "interview_performance_history",
  USER_PREFERENCES: "user_preferences",
  ANALYTICS_SETTINGS: "analytics_settings",
  ACHIEVEMENT_PROGRESS: "achievement_progress",
  IMPROVEMENT_MILESTONES: "improvement_milestones",
  FEEDBACK_RESPONSES: "feedback_responses",
} as const;

// User preferences interface
export interface UserPreferences {
  darkMode: boolean;
  defaultTimeRange: "30" | "60" | "90" | "all";
  defaultChartType: "line" | "bar" | "radar";
  showPercentiles: boolean;
  showTrends: boolean;
  showDetailedScores: boolean;
  notificationsEnabled: boolean;
  autoExportEnabled: boolean;
  preferredExportFormat: "pdf" | "json" | "csv";
}

// Analytics settings interface
export interface AnalyticsSettings {
  trackingEnabled: boolean;
  dataRetentionDays: number;
  anonymizeData: boolean;
  shareWithMentors: boolean;
  publicProfile: boolean;
  benchmarkComparisons: boolean;
}

// Achievement progress interface
export interface AchievementProgress {
  [achievementId: string]: {
    progress: number;
    completed: boolean;
    completedDate?: string;
    milestones: string[];
  };
}

// Improvement milestone interface
export interface ImprovementMilestone {
  id: string;
  title: string;
  description: string;
  targetScore: number;
  currentScore: number;
  deadline: string;
  status: "pending" | "in-progress" | "completed";
  category: string;
  createdDate: string;
  completedDate?: string;
}

// Feedback response interface
export interface FeedbackResponse {
  questionId: string;
  response: string;
  timestamp: string;
  category: string;
  sentiment?: "positive" | "neutral" | "negative";
}

// Analytics storage service
export class AnalyticsStorageService {
  private static instance: AnalyticsStorageService;

  private constructor() {}

  public static getInstance(): AnalyticsStorageService {
    if (!AnalyticsStorageService.instance) {
      AnalyticsStorageService.instance = new AnalyticsStorageService();
    }
    return AnalyticsStorageService.instance;
  }

  // Generic storage methods
  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  // Performance data methods
  public savePerformanceData(data: InterviewPerformanceData): void {
    const history = this.getPerformanceHistory();

    // Check if this performance data already exists (by ID)
    const existingIndex = history.findIndex((item) => item.id === data.id);

    if (existingIndex >= 0) {
      // Update existing entry
      history[existingIndex] = data;
    } else {
      // Add new entry
      history.push(data);
    }

    // Sort by timestamp (newest first)
    history.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit to last 100 interviews to prevent storage bloat
    const limitedHistory = history.slice(0, 100);

    this.setItem(STORAGE_KEYS.PERFORMANCE_HISTORY, limitedHistory);
  }

  public getPerformanceHistory(): InterviewPerformanceData[] {
    return this.getItem(STORAGE_KEYS.PERFORMANCE_HISTORY, []);
  }

  public getPerformanceById(id: string): InterviewPerformanceData | null {
    const history = this.getPerformanceHistory();
    return history.find((item) => item.id === id) || null;
  }

  public deletePerformanceData(id: string): boolean {
    const history = this.getPerformanceHistory();
    const filteredHistory = history.filter((item) => item.id !== id);

    if (filteredHistory.length !== history.length) {
      this.setItem(STORAGE_KEYS.PERFORMANCE_HISTORY, filteredHistory);
      return true;
    }
    return false;
  }

  public clearPerformanceHistory(): void {
    this.setItem(STORAGE_KEYS.PERFORMANCE_HISTORY, []);
  }

  // User preferences methods
  public getUserPreferences(): UserPreferences {
    return this.getItem(STORAGE_KEYS.USER_PREFERENCES, {
      darkMode: false,
      defaultTimeRange: "60",
      defaultChartType: "line",
      showPercentiles: true,
      showTrends: true,
      showDetailedScores: true,
      notificationsEnabled: true,
      autoExportEnabled: false,
      preferredExportFormat: "pdf",
    });
  }

  public updateUserPreferences(preferences: Partial<UserPreferences>): void {
    const current = this.getUserPreferences();
    const updated = { ...current, ...preferences };
    this.setItem(STORAGE_KEYS.USER_PREFERENCES, updated);
  }

  // Analytics settings methods
  public getAnalyticsSettings(): AnalyticsSettings {
    return this.getItem(STORAGE_KEYS.ANALYTICS_SETTINGS, {
      trackingEnabled: true,
      dataRetentionDays: 365,
      anonymizeData: false,
      shareWithMentors: false,
      publicProfile: false,
      benchmarkComparisons: true,
    });
  }

  public updateAnalyticsSettings(settings: Partial<AnalyticsSettings>): void {
    const current = this.getAnalyticsSettings();
    const updated = { ...current, ...settings };
    this.setItem(STORAGE_KEYS.ANALYTICS_SETTINGS, updated);
  }

  // Achievement progress methods
  public getAchievementProgress(): AchievementProgress {
    return this.getItem(STORAGE_KEYS.ACHIEVEMENT_PROGRESS, {});
  }

  public updateAchievementProgress(
    achievementId: string,
    progress: Partial<AchievementProgress[string]>
  ): void {
    const current = this.getAchievementProgress();
    current[achievementId] = {
      ...current[achievementId],
      ...progress,
    };
    this.setItem(STORAGE_KEYS.ACHIEVEMENT_PROGRESS, current);
  }

  public markAchievementCompleted(achievementId: string): void {
    this.updateAchievementProgress(achievementId, {
      progress: 100,
      completed: true,
      completedDate: new Date().toISOString(),
    });
  }

  // Improvement milestones methods
  public getImprovementMilestones(): ImprovementMilestone[] {
    return this.getItem(STORAGE_KEYS.IMPROVEMENT_MILESTONES, []);
  }

  public addImprovementMilestone(
    milestone: Omit<ImprovementMilestone, "id" | "createdDate">
  ): string {
    const milestones = this.getImprovementMilestones();
    const newMilestone: ImprovementMilestone = {
      ...milestone,
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString(),
    };

    milestones.push(newMilestone);
    this.setItem(STORAGE_KEYS.IMPROVEMENT_MILESTONES, milestones);

    return newMilestone.id;
  }

  public updateImprovementMilestone(
    id: string,
    updates: Partial<ImprovementMilestone>
  ): boolean {
    const milestones = this.getImprovementMilestones();
    const index = milestones.findIndex((m) => m.id === id);

    if (index >= 0) {
      milestones[index] = { ...milestones[index], ...updates };

      // If marking as completed, add completion date
      if (updates.status === "completed" && !milestones[index].completedDate) {
        milestones[index].completedDate = new Date().toISOString();
      }

      this.setItem(STORAGE_KEYS.IMPROVEMENT_MILESTONES, milestones);
      return true;
    }
    return false;
  }

  public deleteImprovementMilestone(id: string): boolean {
    const milestones = this.getImprovementMilestones();
    const filteredMilestones = milestones.filter((m) => m.id !== id);

    if (filteredMilestones.length !== milestones.length) {
      this.setItem(STORAGE_KEYS.IMPROVEMENT_MILESTONES, filteredMilestones);
      return true;
    }
    return false;
  }

  // Feedback responses methods
  public getFeedbackResponses(): FeedbackResponse[] {
    return this.getItem(STORAGE_KEYS.FEEDBACK_RESPONSES, []);
  }

  public addFeedbackResponse(
    response: Omit<FeedbackResponse, "timestamp">
  ): void {
    const responses = this.getFeedbackResponses();
    const newResponse: FeedbackResponse = {
      ...response,
      timestamp: new Date().toISOString(),
    };

    responses.push(newResponse);

    // Keep only last 500 responses to prevent storage bloat
    const limitedResponses = responses.slice(-500);

    this.setItem(STORAGE_KEYS.FEEDBACK_RESPONSES, limitedResponses);
  }

  public getFeedbackResponsesByCategory(category: string): FeedbackResponse[] {
    const responses = this.getFeedbackResponses();
    return responses.filter((r) => r.category === category);
  }

  // Data export methods
  public exportAllData(): string {
    const data = {
      performanceHistory: this.getPerformanceHistory(),
      userPreferences: this.getUserPreferences(),
      analyticsSettings: this.getAnalyticsSettings(),
      achievementProgress: this.getAchievementProgress(),
      improvementMilestones: this.getImprovementMilestones(),
      feedbackResponses: this.getFeedbackResponses(),
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    return JSON.stringify(data, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      // Validate data structure
      if (!data.version || !data.exportDate) {
        throw new Error("Invalid data format");
      }

      // Import each data type if present
      if (data.performanceHistory) {
        this.setItem(STORAGE_KEYS.PERFORMANCE_HISTORY, data.performanceHistory);
      }

      if (data.userPreferences) {
        this.setItem(STORAGE_KEYS.USER_PREFERENCES, data.userPreferences);
      }

      if (data.analyticsSettings) {
        this.setItem(STORAGE_KEYS.ANALYTICS_SETTINGS, data.analyticsSettings);
      }

      if (data.achievementProgress) {
        this.setItem(
          STORAGE_KEYS.ACHIEVEMENT_PROGRESS,
          data.achievementProgress
        );
      }

      if (data.improvementMilestones) {
        this.setItem(
          STORAGE_KEYS.IMPROVEMENT_MILESTONES,
          data.improvementMilestones
        );
      }

      if (data.feedbackResponses) {
        this.setItem(STORAGE_KEYS.FEEDBACK_RESPONSES, data.feedbackResponses);
      }

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  // Data cleanup methods
  public cleanupOldData(): void {
    const settings = this.getAnalyticsSettings();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - settings.dataRetentionDays);

    // Clean up old performance data
    const history = this.getPerformanceHistory();
    const filteredHistory = history.filter(
      (item) => new Date(item.timestamp) > cutoffDate
    );
    this.setItem(STORAGE_KEYS.PERFORMANCE_HISTORY, filteredHistory);

    // Clean up old feedback responses
    const responses = this.getFeedbackResponses();
    const filteredResponses = responses.filter(
      (response) => new Date(response.timestamp) > cutoffDate
    );
    this.setItem(STORAGE_KEYS.FEEDBACK_RESPONSES, filteredResponses);
  }

  // Storage usage methods
  public getStorageUsage(): {
    used: number;
    available: number;
    percentage: number;
  } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }

      // Estimate available storage (5MB is typical localStorage limit)
      const available = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error("Error calculating storage usage:", error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Clear all analytics data from localStorage
   */
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      console.log("✅ All analytics data cleared from localStorage");
    } catch (error) {
      console.error("❌ Error clearing analytics data:", error);
    }
  }
}

// Export singleton instance
export const analyticsStorage = AnalyticsStorageService.getInstance();
