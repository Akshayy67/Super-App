// Sound effects utility for task completion feedback
export class SoundEffects {
  private static audioContext: AudioContext | null = null;
  private static isEnabled = true;

  // Initialize audio context
  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Enable/disable sound effects
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  static isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  // Create a tone with specified frequency and duration
  private static createTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine"
  ): void {
    if (!this.isEnabled) return;

    try {
      const audioContext = this.getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn("Audio playback failed:", error);
    }
  }

  // Success sound for task completion
  static playTaskComplete(
    priority: "low" | "medium" | "high" = "medium"
  ): void {
    if (!this.isEnabled) return;

    const sequences = {
      low: [
        { freq: 523, duration: 0.15 }, // C5
        { freq: 659, duration: 0.15 }, // E5
        { freq: 784, duration: 0.3 }, // G5
      ],
      medium: [
        { freq: 523, duration: 0.1 }, // C5
        { freq: 659, duration: 0.1 }, // E5
        { freq: 784, duration: 0.1 }, // G5
        { freq: 1047, duration: 0.3 }, // C6
      ],
      high: [
        { freq: 523, duration: 0.08 }, // C5
        { freq: 659, duration: 0.08 }, // E5
        { freq: 784, duration: 0.08 }, // G5
        { freq: 1047, duration: 0.08 }, // C6
        { freq: 1319, duration: 0.4 }, // E6
      ],
    };

    const sequence = sequences[priority];
    let delay = 0;

    sequence.forEach(({ freq, duration }) => {
      setTimeout(() => {
        this.createTone(freq, duration, "triangle");
      }, delay * 1000);
      delay += duration * 0.8; // Slight overlap
    });
  }

  // Swipe feedback sound
  static playSwipeComplete(): void {
    if (!this.isEnabled) return;
    this.createTone(800, 0.1, "square");
  }

  // Button press feedback
  static playButtonPress(): void {
    if (!this.isEnabled) return;
    this.createTone(400, 0.05, "square");
  }

  // Error/undo sound
  static playUndo(): void {
    if (!this.isEnabled) return;

    setTimeout(() => this.createTone(400, 0.1, "sawtooth"), 0);
    setTimeout(() => this.createTone(300, 0.15, "sawtooth"), 100);
  }

  // Achievement sound for streaks
  static playAchievement(): void {
    if (!this.isEnabled) return;

    const notes = [523, 659, 784, 1047, 1319]; // C major scale
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.createTone(freq, 0.2, "triangle");
      }, index * 100);
    });
  }

  // Gentle notification sound
  static playNotification(): void {
    if (!this.isEnabled) return;

    this.createTone(800, 0.1);
    setTimeout(() => this.createTone(1000, 0.1), 150);
  }

  // Pomodoro session completion alarm (more prominent)
  static playPomodoroComplete(sessionType: 'work' | 'shortBreak' | 'longBreak' = 'work'): void {
    if (!this.isEnabled) return;

    if (sessionType === 'work') {
      // Work session complete - celebratory ascending melody
      const melody = [
        { freq: 523, duration: 0.15 },  // C5
        { freq: 587, duration: 0.15 },  // D5
        { freq: 659, duration: 0.15 },  // E5
        { freq: 784, duration: 0.15 },  // G5
        { freq: 1047, duration: 0.4 },  // C6 (hold)
      ];
      
      let delay = 0;
      melody.forEach(({ freq, duration }) => {
        setTimeout(() => {
          this.createTone(freq, duration, "triangle");
        }, delay * 1000);
        delay += duration * 0.9;
      });
    } else if (sessionType === 'shortBreak') {
      // Short break complete - gentle reminder to get back to work
      const melody = [
        { freq: 659, duration: 0.2 },  // E5
        { freq: 523, duration: 0.3 },  // C5
      ];
      
      let delay = 0;
      melody.forEach(({ freq, duration }) => {
        setTimeout(() => {
          this.createTone(freq, duration, "sine");
        }, delay * 1000);
        delay += duration * 0.95;
      });
    } else {
      // Long break complete - energetic melody
      const melody = [
        { freq: 392, duration: 0.12 },  // G4
        { freq: 523, duration: 0.12 },  // C5
        { freq: 659, duration: 0.12 },  // E5
        { freq: 784, duration: 0.12 },  // G5
        { freq: 1047, duration: 0.12 }, // C6
        { freq: 1319, duration: 0.5 },  // E6 (hold)
      ];
      
      let delay = 0;
      melody.forEach(({ freq, duration }) => {
        setTimeout(() => {
          this.createTone(freq, duration, "triangle");
        }, delay * 1000);
        delay += duration * 0.85;
      });
    }
  }

  // Pomodoro session start sound
  static playPomodoroStart(): void {
    if (!this.isEnabled) return;

    // Quick upward chirp to indicate start
    const startMelody = [
      { freq: 523, duration: 0.08 },  // C5
      { freq: 784, duration: 0.12 },  // G5
    ];

    let delay = 0;
    startMelody.forEach(({ freq, duration }) => {
      setTimeout(() => {
        this.createTone(freq, duration, "sine");
      }, delay * 1000);
      delay += duration * 0.9;
    });
  }

  // Alarm sound for when time is almost up (optional warning)
  static playPomodoroWarning(): void {
    if (!this.isEnabled) return;

    // Three quick beeps as warning
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createTone(880, 0.1, "square");
      }, i * 200);
    }
  }
}

import { VibrationManager } from "./vibrationSettings";

// Haptic feedback for mobile devices
export class HapticFeedback {
  static vibrate(pattern: number | number[] = 50): void {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }

  static taskComplete(priority: "low" | "medium" | "high" = "medium"): void {
    const pattern = VibrationManager.getTaskCompletionPattern(priority);
    if (pattern.length > 0) {
      this.vibrate(pattern);
    }
  }

  static buttonPress(): void {
    const pattern = VibrationManager.getButtonPattern();
    if (pattern.length > 0) {
      this.vibrate(pattern);
    }
  }

  static swipe(): void {
    const pattern = VibrationManager.getSwipePattern();
    if (pattern.length > 0) {
      this.vibrate(pattern);
    }
  }

  // Special celebration vibration for achievements
  static achievement(): void {
    const pattern = VibrationManager.getAchievementPattern();
    if (pattern.length > 0) {
      this.vibrate(pattern);
    }
  }

  // Quick success vibration for streaks
  static streak(): void {
    const pattern = VibrationManager.getStreakPattern();
    if (pattern.length > 0) {
      this.vibrate(pattern);
    }
  }
}

// Combined feedback system
export class TaskFeedback {
  static taskCompleted(priority: "low" | "medium" | "high" = "medium"): void {
    SoundEffects.playTaskComplete(priority);
    HapticFeedback.taskComplete(priority);
  }

  static swipeAction(): void {
    SoundEffects.playSwipeComplete();
    HapticFeedback.swipe();
  }

  static buttonPress(): void {
    SoundEffects.playButtonPress();
    HapticFeedback.buttonPress();
  }

  static taskUndone(): void {
    SoundEffects.playUndo();
    HapticFeedback.vibrate(100);
  }

  static achievement(): void {
    SoundEffects.playAchievement();
    HapticFeedback.achievement(); // Use the new enhanced achievement vibration
  }

  static streakMilestone(): void {
    SoundEffects.playAchievement();
    HapticFeedback.streak(); // Use the new streak vibration pattern
  }
}
