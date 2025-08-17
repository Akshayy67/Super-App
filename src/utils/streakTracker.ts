import { Task } from "../types";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  tasksCompletedToday: number;
  lastCompletionDate: string;
  totalTasksCompleted: number;
  weeklyGoal: number;
  tasksCompletedThisWeek: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export class StreakTracker {
  private static readonly STORAGE_KEY = 'task_streak_data';
  private static readonly ACHIEVEMENTS_KEY = 'task_achievements';

  // Get current streak data
  static getStreakData(userId: string): StreakData {
    const key = `${this.STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      return JSON.parse(stored);
    }

    // Default streak data
    return {
      currentStreak: 0,
      longestStreak: 0,
      tasksCompletedToday: 0,
      lastCompletionDate: '',
      totalTasksCompleted: 0,
      weeklyGoal: 7, // Default weekly goal
      tasksCompletedThisWeek: 0,
    };
  }

  // Update streak when task is completed
  static updateStreak(userId: string, task: Task): { newAchievements: Achievement[], streakData: StreakData } {
    const streakData = this.getStreakData(userId);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    // Update basic counters
    streakData.totalTasksCompleted++;
    
    // Check if this is the first task today
    if (streakData.lastCompletionDate !== today) {
      // Reset daily counter
      streakData.tasksCompletedToday = 1;
      
      // Update streak
      if (streakData.lastCompletionDate === yesterday) {
        // Consecutive day - increment streak
        streakData.currentStreak++;
      } else if (streakData.lastCompletionDate === '') {
        // First ever task
        streakData.currentStreak = 1;
      } else {
        // Streak broken - reset to 1
        streakData.currentStreak = 1;
      }
      
      streakData.lastCompletionDate = today;
    } else {
      // Additional task today
      streakData.tasksCompletedToday++;
    }

    // Update longest streak
    if (streakData.currentStreak > streakData.longestStreak) {
      streakData.longestStreak = streakData.currentStreak;
    }

    // Update weekly counter
    streakData.tasksCompletedThisWeek = this.getTasksCompletedThisWeek(userId);

    // Save updated data
    this.saveStreakData(userId, streakData);

    // Check for new achievements
    const newAchievements = this.checkAchievements(userId, streakData, task);

    return { newAchievements, streakData };
  }

  // Save streak data
  private static saveStreakData(userId: string, data: StreakData): void {
    const key = `${this.STORAGE_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Get tasks completed this week
  private static getTasksCompletedThisWeek(userId: string): number {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // This would ideally query the database, but for now we'll use a simple counter
    // In a real implementation, you'd query completed tasks from this week
    return this.getStreakData(userId).tasksCompletedThisWeek + 1;
  }

  // Define available achievements
  private static getAchievementDefinitions(): Achievement[] {
    return [
      {
        id: 'first_task',
        title: 'Getting Started',
        description: 'Complete your first task',
        icon: '🎯',
        unlocked: false,
        target: 1,
      },
      {
        id: 'streak_3',
        title: 'On a Roll',
        description: 'Complete tasks for 3 days in a row',
        icon: '🔥',
        unlocked: false,
        target: 3,
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Complete tasks for 7 days in a row',
        icon: '⚡',
        unlocked: false,
        target: 7,
      },
      {
        id: 'streak_30',
        title: 'Consistency Champion',
        description: 'Complete tasks for 30 days in a row',
        icon: '👑',
        unlocked: false,
        target: 30,
      },
      {
        id: 'daily_5',
        title: 'Productive Day',
        description: 'Complete 5 tasks in a single day',
        icon: '💪',
        unlocked: false,
        target: 5,
      },
      {
        id: 'total_10',
        title: 'Task Master',
        description: 'Complete 10 tasks total',
        icon: '🏆',
        unlocked: false,
        target: 10,
      },
      {
        id: 'total_50',
        title: 'Productivity Pro',
        description: 'Complete 50 tasks total',
        icon: '🌟',
        unlocked: false,
        target: 50,
      },
      {
        id: 'total_100',
        title: 'Century Club',
        description: 'Complete 100 tasks total',
        icon: '💎',
        unlocked: false,
        target: 100,
      },
      {
        id: 'high_priority_10',
        title: 'Priority Master',
        description: 'Complete 10 high priority tasks',
        icon: '🎖️',
        unlocked: false,
        target: 10,
      },
      {
        id: 'weekly_goal',
        title: 'Weekly Winner',
        description: 'Reach your weekly task goal',
        icon: '🎊',
        unlocked: false,
      },
    ];
  }

  // Get user achievements
  static getAchievements(userId: string): Achievement[] {
    const key = `${this.ACHIEVEMENTS_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      const userAchievements = JSON.parse(stored);
      const definitions = this.getAchievementDefinitions();
      
      // Merge with definitions to ensure we have all achievements
      return definitions.map(def => {
        const userAchievement = userAchievements.find((a: Achievement) => a.id === def.id);
        return userAchievement || def;
      });
    }

    return this.getAchievementDefinitions();
  }

  // Check for new achievements
  private static checkAchievements(userId: string, streakData: StreakData, task: Task): Achievement[] {
    const achievements = this.getAchievements(userId);
    const newAchievements: Achievement[] = [];

    achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;
      let progress = 0;

      switch (achievement.id) {
        case 'first_task':
          shouldUnlock = streakData.totalTasksCompleted >= 1;
          progress = streakData.totalTasksCompleted;
          break;
        case 'streak_3':
          shouldUnlock = streakData.currentStreak >= 3;
          progress = streakData.currentStreak;
          break;
        case 'streak_7':
          shouldUnlock = streakData.currentStreak >= 7;
          progress = streakData.currentStreak;
          break;
        case 'streak_30':
          shouldUnlock = streakData.currentStreak >= 30;
          progress = streakData.currentStreak;
          break;
        case 'daily_5':
          shouldUnlock = streakData.tasksCompletedToday >= 5;
          progress = streakData.tasksCompletedToday;
          break;
        case 'total_10':
          shouldUnlock = streakData.totalTasksCompleted >= 10;
          progress = streakData.totalTasksCompleted;
          break;
        case 'total_50':
          shouldUnlock = streakData.totalTasksCompleted >= 50;
          progress = streakData.totalTasksCompleted;
          break;
        case 'total_100':
          shouldUnlock = streakData.totalTasksCompleted >= 100;
          progress = streakData.totalTasksCompleted;
          break;
        case 'weekly_goal':
          shouldUnlock = streakData.tasksCompletedThisWeek >= streakData.weeklyGoal;
          progress = streakData.tasksCompletedThisWeek;
          break;
      }

      // Update progress
      achievement.progress = progress;

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        newAchievements.push(achievement);
      }
    });

    // Save updated achievements
    this.saveAchievements(userId, achievements);

    return newAchievements;
  }

  // Save achievements
  private static saveAchievements(userId: string, achievements: Achievement[]): void {
    const key = `${this.ACHIEVEMENTS_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(achievements));
  }

  // Get motivational message based on streak
  static getMotivationalMessage(streakData: StreakData): string {
    const { currentStreak, tasksCompletedToday } = streakData;

    if (currentStreak === 1 && tasksCompletedToday === 1) {
      return "Great start! You're building momentum! 🚀";
    }

    if (currentStreak >= 30) {
      return `INCREDIBLE! ${currentStreak} days strong! You're unstoppable! 👑`;
    }

    if (currentStreak >= 14) {
      return `AMAZING! ${currentStreak} day streak! You're on fire! 🔥`;
    }

    if (currentStreak >= 7) {
      return `FANTASTIC! ${currentStreak} days in a row! Keep it up! ⚡`;
    }

    if (currentStreak >= 3) {
      return `AWESOME! ${currentStreak} day streak! You're building great habits! 💪`;
    }

    if (tasksCompletedToday >= 5) {
      return `WOW! ${tasksCompletedToday} tasks today! You're crushing it! 🎯`;
    }

    return "Well done! Every task completed is progress! ✨";
  }
}
