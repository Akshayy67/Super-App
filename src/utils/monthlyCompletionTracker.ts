/**
 * Monthly Completion Tracker
 * Tracks completions throughout the month and resets at the start of each month
 * Goal: 50 completions per month
 */

export interface MonthlyCompletionData {
  currentMonth: string; // Format: "YYYY-MM"
  completions: number;
  goal: number;
  lastResetDate: string;
}

export class MonthlyCompletionTracker {
  private static readonly STORAGE_KEY = 'monthly_completion_data';
  private static readonly GOAL = 50;

  /**
   * Get current month in YYYY-MM format
   */
  private static getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get completion data for a user
   * Automatically resets if it's a new month
   */
  static getCompletionData(userId: string): MonthlyCompletionData {
    const key = `${this.STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    const currentMonth = this.getCurrentMonth();
    const today = new Date().toISOString().split('T')[0];

    if (stored) {
      const data: MonthlyCompletionData = JSON.parse(stored);
      
      // Check if we need to reset for new month
      if (data.currentMonth !== currentMonth) {
        // New month - reset
        const resetData: MonthlyCompletionData = {
          currentMonth,
          completions: 0,
          goal: this.GOAL,
          lastResetDate: today,
        };
        this.saveCompletionData(userId, resetData);
        return resetData;
      }

      return data;
    }

    // First time - initialize
    const initialData: MonthlyCompletionData = {
      currentMonth,
      completions: 0,
      goal: this.GOAL,
      lastResetDate: today,
    };
    this.saveCompletionData(userId, initialData);
    return initialData;
  }

  /**
   * Increment completion count
   * Returns the updated data and whether the goal was reached
   */
  static incrementCompletion(userId: string): {
    data: MonthlyCompletionData;
    goalReached: boolean;
    wasJustReached: boolean;
  } {
    const data = this.getCompletionData(userId);
    const previousCompletions = data.completions;
    
    data.completions += 1;
    const goalReached = data.completions >= data.goal;
    const wasJustReached = !(previousCompletions >= data.goal) && goalReached;

    this.saveCompletionData(userId, data);

    return {
      data,
      goalReached,
      wasJustReached,
    };
  }

  /**
   * Get completion progress (0-1)
   */
  static getProgress(userId: string): number {
    const data = this.getCompletionData(userId);
    return Math.min(data.completions / data.goal, 1);
  }

  /**
   * Get remaining completions needed
   */
  static getRemaining(userId: string): number {
    const data = this.getCompletionData(userId);
    return Math.max(data.goal - data.completions, 0);
  }

  /**
   * Save completion data
   */
  private static saveCompletionData(userId: string, data: MonthlyCompletionData): void {
    const key = `${this.STORAGE_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Reset completion data (for testing or manual reset)
   */
  static reset(userId: string): void {
    const currentMonth = this.getCurrentMonth();
    const today = new Date().toISOString().split('T')[0];
    const resetData: MonthlyCompletionData = {
      currentMonth,
      completions: 0,
      goal: this.GOAL,
      lastResetDate: today,
    };
    this.saveCompletionData(userId, resetData);
  }

  /**
   * Get days remaining in current month
   */
  static getDaysRemainingInMonth(): number {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const today = now.getDate();
    return lastDay.getDate() - today;
  }

  /**
   * Get progress percentage
   */
  static getProgressPercentage(userId: string): number {
    const data = this.getCompletionData(userId);
    return Math.round((data.completions / data.goal) * 100);
  }
}

