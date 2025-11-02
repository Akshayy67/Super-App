import { SoundEffects } from "./soundEffects";

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PomodoroSession {
  id: string;
  type: "work" | "shortBreak" | "longBreak";
  duration: number; // in seconds
  timeRemaining: number; // in seconds
  isActive: boolean;
  isPaused: boolean;
  sessionCount: number;
  completedSessions: number;
  startTime?: Date;
  endTime?: Date;
}

export interface PomodoroStats {
  totalWorkTime: number; // in minutes
  totalBreakTime: number; // in minutes
  completedSessions: number;
  streakDays: number;
  todaysSessions: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export type PomodoroEventType =
  | "sessionStart"
  | "sessionComplete"
  | "sessionPause"
  | "sessionResume"
  | "timerTick"
  | "settingsChange";

export interface PomodoroEvent {
  type: PomodoroEventType;
  session?: PomodoroSession;
  settings?: PomodoroSettings;
  timeRemaining?: number;
}

export type PomodoroEventListener = (event: PomodoroEvent) => void;

class PomodoroTimerService {
  private settings: PomodoroSettings;
  private currentSession: PomodoroSession | null = null;
  private timer: NodeJS.Timeout | null = null;
  private listeners: PomodoroEventListener[] = [];
  private stats: PomodoroStats;

  constructor() {
    this.settings = this.loadSettings();
    this.stats = this.loadStats();
  }

  // Settings management
  private loadSettings(): PomodoroSettings {
    const saved = localStorage.getItem("pomodoroSettings");
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartWork: false,
      soundEnabled: true,
      notificationsEnabled: true,
      vibrationEnabled: true,
    };
  }

  private saveSettings(): void {
    localStorage.setItem("pomodoroSettings", JSON.stringify(this.settings));
  }

  private loadStats(): PomodoroStats {
    const saved = localStorage.getItem("pomodoroStats");
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      totalWorkTime: 0,
      totalBreakTime: 0,
      completedSessions: 0,
      streakDays: 0,
      todaysSessions: 0,
      weeklyGoal: 20,
      weeklyProgress: 0,
    };
  }

  private saveStats(): void {
    localStorage.setItem("pomodoroStats", JSON.stringify(this.stats));
  }

  // Event system
  addEventListener(listener: PomodoroEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private emit(event: PomodoroEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  // Timer management
  startSession(type: "work" | "shortBreak" | "longBreak" = "work"): void {
    if (this.currentSession?.isActive) {
      this.stopSession();
    }

    const duration = this.getDurationForType(type) * 60; // Convert to seconds

    this.currentSession = {
      id: `session_${Date.now()}`,
      type,
      duration,
      timeRemaining: duration,
      isActive: true,
      isPaused: false,
      sessionCount: this.stats.completedSessions + 1,
      completedSessions: this.stats.completedSessions,
      startTime: new Date(),
    };

    this.startTimer();
    this.emit({ type: "sessionStart", session: this.currentSession });

    if (this.settings.soundEnabled) {
      SoundEffects.playPomodoroStart();
    }

    this.showNotification(
      `${type === "work" ? "Work" : "Break"} session started!`,
      `🚀 ${type === "work" ? "Focus time! Let's be productive!" : "Time to relax and recharge!"}`
    );
  }

  private getDurationForType(
    type: "work" | "shortBreak" | "longBreak"
  ): number {
    switch (type) {
      case "work":
        return this.settings.workDuration;
      case "shortBreak":
        return this.settings.shortBreakDuration;
      case "longBreak":
        return this.settings.longBreakDuration;
    }
  }

  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      if (!this.currentSession || this.currentSession.isPaused) {
        return;
      }

      this.currentSession.timeRemaining--;
      this.emit({
        type: "timerTick",
        session: this.currentSession,
        timeRemaining: this.currentSession.timeRemaining,
      });

      if (this.currentSession.timeRemaining <= 0) {
        this.completeSession();
      }
    }, 1000);
  }

  private completeSession(): void {
    if (!this.currentSession) return;

    this.currentSession.isActive = false;
    this.currentSession.endTime = new Date();
    this.currentSession.timeRemaining = 0;

    // Update stats
    if (this.currentSession.type === "work") {
      this.stats.totalWorkTime += this.settings.workDuration;
      this.stats.completedSessions++;
      this.stats.todaysSessions++;
    } else {
      this.stats.totalBreakTime += this.getDurationForType(
        this.currentSession.type
      );
    }

    this.saveStats();

    this.emit({ type: "sessionComplete", session: this.currentSession });

    if (this.settings.soundEnabled) {
      SoundEffects.playPomodoroComplete(this.currentSession.type);
    }

    const messages = {
      work: {
        title: "🎉 Work Session Complete!",
        body: "Great job! Time for a well-deserved break. You've earned it!"
      },
      shortBreak: {
        title: "⏰ Short Break Over!",
        body: "Feeling refreshed? Let's get back to work and maintain that momentum!"
      },
      longBreak: {
        title: "✨ Long Break Complete!",
        body: "You're doing amazing! Ready to start a new focus session?"
      }
    };

    const message = messages[this.currentSession.type];
    this.showNotification(message.title, message.body);

    // Auto-start next session if enabled
    if (this.shouldAutoStartNext()) {
      setTimeout(() => {
        this.startNextSession();
      }, 2000);
    }

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private shouldAutoStartNext(): boolean {
    if (!this.currentSession) return false;

    if (this.currentSession.type === "work") {
      return this.settings.autoStartBreaks;
    } else {
      return this.settings.autoStartWork;
    }
  }

  private startNextSession(): void {
    if (!this.currentSession) return;

    if (this.currentSession.type === "work") {
      // Determine break type
      const isLongBreak =
        this.stats.completedSessions % this.settings.sessionsUntilLongBreak ===
        0;
      this.startSession(isLongBreak ? "longBreak" : "shortBreak");
    } else {
      this.startSession("work");
    }
  }

  pauseSession(): void {
    if (!this.currentSession || !this.currentSession.isActive) return;

    this.currentSession.isPaused = true;
    this.emit({ type: "sessionPause", session: this.currentSession });

    if (this.settings.soundEnabled) {
      SoundEffects.playButtonPress();
    }
  }

  resumeSession(): void {
    if (!this.currentSession || !this.currentSession.isActive) return;

    this.currentSession.isPaused = false;
    this.emit({ type: "sessionResume", session: this.currentSession });

    if (this.settings.soundEnabled) {
      SoundEffects.playButtonPress();
    }
  }

  stopSession(): void {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      this.currentSession.isPaused = false;
    }

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.settings.soundEnabled) {
      SoundEffects.playButtonPress();
    }
  }

  // Getters
  getCurrentSession(): PomodoroSession | null {
    return this.currentSession;
  }

  getSettings(): PomodoroSettings {
    return { ...this.settings };
  }

  getStats(): PomodoroStats {
    return { ...this.stats };
  }

  // Settings updates
  updateSettings(newSettings: Partial<PomodoroSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.emit({ type: "settingsChange", settings: this.settings });
  }

  // Utility methods
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  private showNotification(title: string, body?: string): void {
    if (!this.settings.notificationsEnabled) return;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body || title,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: "pomodoro-timer",
        requireInteraction: true, // Keep notification visible until user interacts
        vibrate: [200, 100, 200], // Vibration pattern for mobile
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // Reset stats
  resetStats(): void {
    this.stats = {
      totalWorkTime: 0,
      totalBreakTime: 0,
      completedSessions: 0,
      streakDays: 0,
      todaysSessions: 0,
      weeklyGoal: 20,
      weeklyProgress: 0,
    };
    this.saveStats();
  }

  // Cleanup
  destroy(): void {
    this.stopSession();
    this.listeners = [];
  }
}

export const pomodoroTimer = new PomodoroTimerService();
