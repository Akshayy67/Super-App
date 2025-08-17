// Vibration settings and preferences management
export interface VibrationSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'strong';
  taskCompletion: boolean;
  achievements: boolean;
  streaks: boolean;
  buttons: boolean;
}

export class VibrationManager {
  private static readonly STORAGE_KEY = 'vibration_settings';
  private static settings: VibrationSettings | null = null;

  // Default settings
  private static getDefaultSettings(): VibrationSettings {
    return {
      enabled: true,
      intensity: 'strong', // Default to strong for maximum dopamine impact
      taskCompletion: true,
      achievements: true,
      streaks: true,
      buttons: true,
    };
  }

  // Get current settings
  static getSettings(): VibrationSettings {
    if (this.settings) {
      return this.settings;
    }

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.settings = { ...this.getDefaultSettings(), ...JSON.parse(stored) };
    } else {
      this.settings = this.getDefaultSettings();
    }

    return this.settings;
  }

  // Save settings
  static saveSettings(settings: VibrationSettings): void {
    this.settings = settings;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  // Check if vibration is supported
  static isSupported(): boolean {
    return 'vibrate' in navigator;
  }

  // Get intensity multiplier
  static getIntensityMultiplier(): number {
    const settings = this.getSettings();
    switch (settings.intensity) {
      case 'light': return 0.5;
      case 'medium': return 0.75;
      case 'strong': return 1.0;
      default: return 1.0;
    }
  }

  // Enhanced vibration patterns based on settings
  static getTaskCompletionPattern(priority: 'low' | 'medium' | 'high'): number[] {
    const settings = this.getSettings();
    
    if (!settings.enabled || !settings.taskCompletion || !this.isSupported()) {
      return [];
    }

    const multiplier = this.getIntensityMultiplier();
    
    const basePatterns = {
      low: [200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200],
      medium: [300, 100, 300, 100, 300, 100, 300, 100, 300, 100, 300],
      high: [400, 50, 400, 50, 400, 50, 400, 50, 400, 50, 400, 50, 400]
    };

    // Apply intensity multiplier to vibration durations (not pauses)
    return basePatterns[priority].map((duration, index) => 
      index % 2 === 0 ? Math.round(duration * multiplier) : duration
    );
  }

  // Achievement vibration pattern
  static getAchievementPattern(): number[] {
    const settings = this.getSettings();
    
    if (!settings.enabled || !settings.achievements || !this.isSupported()) {
      return [];
    }

    const multiplier = this.getIntensityMultiplier();
    const basePattern = [500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500];
    
    return basePattern.map((duration, index) => 
      index % 2 === 0 ? Math.round(duration * multiplier) : duration
    );
  }

  // Streak milestone vibration pattern
  static getStreakPattern(): number[] {
    const settings = this.getSettings();
    
    if (!settings.enabled || !settings.streaks || !this.isSupported()) {
      return [];
    }

    const multiplier = this.getIntensityMultiplier();
    const basePattern = [150, 50, 150, 50, 150, 50, 300, 100, 300];
    
    return basePattern.map((duration, index) => 
      index % 2 === 0 ? Math.round(duration * multiplier) : duration
    );
  }

  // Button press vibration
  static getButtonPattern(): number[] {
    const settings = this.getSettings();
    
    if (!settings.enabled || !settings.buttons || !this.isSupported()) {
      return [];
    }

    const multiplier = this.getIntensityMultiplier();
    return [Math.round(25 * multiplier)];
  }

  // Swipe action vibration
  static getSwipePattern(): number[] {
    const settings = this.getSettings();
    
    if (!settings.enabled || !this.isSupported()) {
      return [];
    }

    const multiplier = this.getIntensityMultiplier();
    return [Math.round(30 * multiplier)];
  }

  // Test vibration for settings
  static testVibration(): void {
    const pattern = this.getTaskCompletionPattern('medium');
    if (pattern.length > 0) {
      navigator.vibrate(pattern);
    }
  }

  // Quick settings toggles
  static toggleEnabled(): boolean {
    const settings = this.getSettings();
    settings.enabled = !settings.enabled;
    this.saveSettings(settings);
    return settings.enabled;
  }

  static setIntensity(intensity: 'light' | 'medium' | 'strong'): void {
    const settings = this.getSettings();
    settings.intensity = intensity;
    this.saveSettings(settings);
  }

  static toggleTaskCompletion(): boolean {
    const settings = this.getSettings();
    settings.taskCompletion = !settings.taskCompletion;
    this.saveSettings(settings);
    return settings.taskCompletion;
  }

  // Get user-friendly description
  static getIntensityDescription(intensity: 'light' | 'medium' | 'strong'): string {
    switch (intensity) {
      case 'light': return 'Gentle vibrations (1 second)';
      case 'medium': return 'Moderate vibrations (1.5 seconds)';
      case 'strong': return 'Strong vibrations (2 seconds) - Maximum dopamine!';
      default: return '';
    }
  }
}
