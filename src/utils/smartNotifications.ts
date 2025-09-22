import { SoundEffects } from './soundEffects';

export interface NotificationSettings {
  hydrationEnabled: boolean;
  hydrationInterval: number; // in minutes
  eyeRestEnabled: boolean;
  eyeRestInterval: number; // in minutes
  movementEnabled: boolean;
  movementInterval: number; // in minutes
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showBrowserNotifications: boolean;
  customReminders: CustomReminder[];
}

export interface CustomReminder {
  id: string;
  title: string;
  message: string;
  interval: number; // in minutes
  enabled: boolean;
  icon?: string;
}

export interface NotificationEvent {
  id: string;
  type: 'hydration' | 'eyeRest' | 'movement' | 'custom';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  customReminderId?: string;
}

export type NotificationEventListener = (event: NotificationEvent) => void;

class SmartNotificationService {
  private settings: NotificationSettings;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private listeners: NotificationEventListener[] = [];
  private notificationHistory: NotificationEvent[] = [];

  constructor() {
    this.settings = this.loadSettings();
    this.initializeTimers();
  }

  private loadSettings(): NotificationSettings {
    const saved = localStorage.getItem('smartNotificationSettings');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      hydrationEnabled: true,
      hydrationInterval: 60, // 1 hour
      eyeRestEnabled: true,
      eyeRestInterval: 20, // 20 minutes
      movementEnabled: true,
      movementInterval: 30, // 30 minutes
      soundEnabled: true,
      vibrationEnabled: true,
      showBrowserNotifications: true,
      customReminders: [],
    };
  }

  private saveSettings(): void {
    localStorage.setItem('smartNotificationSettings', JSON.stringify(this.settings));
  }

  // Event system
  addEventListener(listener: NotificationEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private emit(event: NotificationEvent): void {
    this.listeners.forEach(listener => listener(event));
    this.notificationHistory.unshift(event);
    
    // Keep only last 50 notifications
    if (this.notificationHistory.length > 50) {
      this.notificationHistory = this.notificationHistory.slice(0, 50);
    }
  }

  // Timer management
  private initializeTimers(): void {
    this.clearAllTimers();

    if (this.settings.hydrationEnabled) {
      this.startHydrationTimer();
    }

    if (this.settings.eyeRestEnabled) {
      this.startEyeRestTimer();
    }

    if (this.settings.movementEnabled) {
      this.startMovementTimer();
    }

    // Start custom reminder timers
    this.settings.customReminders.forEach(reminder => {
      if (reminder.enabled) {
        this.startCustomReminderTimer(reminder);
      }
    });
  }

  private clearAllTimers(): void {
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
  }

  private startHydrationTimer(): void {
    const interval = this.settings.hydrationInterval * 60 * 1000; // Convert to milliseconds
    const timer = setInterval(() => {
      this.showHydrationReminder();
    }, interval);
    
    this.timers.set('hydration', timer);
  }

  private startEyeRestTimer(): void {
    const interval = this.settings.eyeRestInterval * 60 * 1000;
    const timer = setInterval(() => {
      this.showEyeRestReminder();
    }, interval);
    
    this.timers.set('eyeRest', timer);
  }

  private startMovementTimer(): void {
    const interval = this.settings.movementInterval * 60 * 1000;
    const timer = setInterval(() => {
      this.showMovementReminder();
    }, interval);
    
    this.timers.set('movement', timer);
  }

  private startCustomReminderTimer(reminder: CustomReminder): void {
    const interval = reminder.interval * 60 * 1000;
    const timer = setInterval(() => {
      this.showCustomReminder(reminder);
    }, interval);
    
    this.timers.set(`custom_${reminder.id}`, timer);
  }

  // Notification methods
  private showHydrationReminder(): void {
    const messages = [
      "Time for a water break! 💧",
      "Stay hydrated! Drink some water 🥤",
      "Your body needs water - take a sip! 💦",
      "Hydration check! Time to drink water 🌊",
      "Don't forget to hydrate! 💧"
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const event: NotificationEvent = {
      id: `hydration_${Date.now()}`,
      type: 'hydration',
      title: 'Hydration Reminder',
      message,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.emit(event);
    this.showNotification(event);
  }

  private showEyeRestReminder(): void {
    const messages = [
      "Give your eyes a break! Look away from the screen 👀",
      "20-20-20 rule: Look at something 20 feet away for 20 seconds 👁️",
      "Time for an eye break! Blink and look around 👀",
      "Rest your eyes - look out the window for a moment 🪟",
      "Eye strain prevention: Take a 20-second break! 👁️"
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const event: NotificationEvent = {
      id: `eyeRest_${Date.now()}`,
      type: 'eyeRest',
      title: 'Eye Rest Reminder',
      message,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.emit(event);
    this.showNotification(event);
  }

  private showMovementReminder(): void {
    const messages = [
      "Time to move! Stand up and stretch 🧘‍♀️",
      "Take a movement break - your body will thank you! 🚶‍♂️",
      "Stretch time! Move those muscles 💪",
      "Stand up and walk around for a minute 🚶‍♀️",
      "Movement break: Do some light stretching 🤸‍♂️"
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const event: NotificationEvent = {
      id: `movement_${Date.now()}`,
      type: 'movement',
      title: 'Movement Reminder',
      message,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.emit(event);
    this.showNotification(event);
  }

  private showCustomReminder(reminder: CustomReminder): void {
    const event: NotificationEvent = {
      id: `custom_${reminder.id}_${Date.now()}`,
      type: 'custom',
      title: reminder.title,
      message: reminder.message,
      timestamp: new Date(),
      acknowledged: false,
      customReminderId: reminder.id,
    };

    this.emit(event);
    this.showNotification(event);
  }

  private showNotification(event: NotificationEvent): void {
    // Play sound if enabled
    if (this.settings.soundEnabled) {
      SoundEffects.playNotification();
    }

    // Show browser notification if enabled and permission granted
    if (this.settings.showBrowserNotifications && 
        'Notification' in window && 
        Notification.permission === 'granted') {
      
      new Notification(event.title, {
        body: event.message,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: event.type, // This replaces previous notifications of the same type
      });
    }

    // Vibrate if enabled and supported
    if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  // Settings management
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.initializeTimers(); // Restart timers with new settings
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Custom reminders management
  addCustomReminder(reminder: Omit<CustomReminder, 'id'>): string {
    const id = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReminder: CustomReminder = { ...reminder, id };
    
    this.settings.customReminders.push(newReminder);
    this.saveSettings();
    
    if (newReminder.enabled) {
      this.startCustomReminderTimer(newReminder);
    }
    
    return id;
  }

  updateCustomReminder(id: string, updates: Partial<CustomReminder>): boolean {
    const index = this.settings.customReminders.findIndex(r => r.id === id);
    if (index === -1) return false;

    // Stop existing timer
    const timerKey = `custom_${id}`;
    if (this.timers.has(timerKey)) {
      clearInterval(this.timers.get(timerKey)!);
      this.timers.delete(timerKey);
    }

    // Update reminder
    this.settings.customReminders[index] = { 
      ...this.settings.customReminders[index], 
      ...updates 
    };
    this.saveSettings();

    // Restart timer if enabled
    if (this.settings.customReminders[index].enabled) {
      this.startCustomReminderTimer(this.settings.customReminders[index]);
    }

    return true;
  }

  removeCustomReminder(id: string): boolean {
    const index = this.settings.customReminders.findIndex(r => r.id === id);
    if (index === -1) return false;

    // Stop timer
    const timerKey = `custom_${id}`;
    if (this.timers.has(timerKey)) {
      clearInterval(this.timers.get(timerKey)!);
      this.timers.delete(timerKey);
    }

    // Remove reminder
    this.settings.customReminders.splice(index, 1);
    this.saveSettings();

    return true;
  }

  // Utility methods
  acknowledgeNotification(notificationId: string): void {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.acknowledged = true;
    }
  }

  getNotificationHistory(): NotificationEvent[] {
    return [...this.notificationHistory];
  }

  clearNotificationHistory(): void {
    this.notificationHistory = [];
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Cleanup
  destroy(): void {
    this.clearAllTimers();
    this.listeners = [];
  }
}

export const smartNotifications = new SmartNotificationService();
