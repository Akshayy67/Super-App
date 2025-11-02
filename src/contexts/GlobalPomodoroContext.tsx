import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  pomodoroTimer, 
  PomodoroSession, 
  PomodoroSettings, 
  PomodoroStats,
  PomodoroEvent 
} from '../utils/pomodoroTimer';

interface GlobalPomodoroContextType {
  currentSession: PomodoroSession | null;
  settings: PomodoroSettings;
  stats: PomodoroStats;
  isWidgetVisible: boolean;
  isEducationVisible: boolean;
  showWidget: () => void;
  hideWidget: () => void;
  toggleWidget: () => void;
  showEducation: () => void;
  hideEducation: () => void;
  toggleEducation: () => void;
  startSession: (type?: 'work' | 'shortBreak' | 'longBreak') => void;
  pauseResume: () => void;
  stopSession: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  resetStats: () => void;
}

const GlobalPomodoroContext = createContext<GlobalPomodoroContextType | undefined>(undefined);

export const useGlobalPomodoro = () => {
  const context = useContext(GlobalPomodoroContext);
  if (!context) {
    throw new Error('useGlobalPomodoro must be used within GlobalPomodoroProvider');
  }
  return context;
};

interface GlobalPomodoroProviderProps {
  children: ReactNode;
}

export const GlobalPomodoroProvider: React.FC<GlobalPomodoroProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [settings, setSettings] = useState<PomodoroSettings>(pomodoroTimer.getSettings());
  const [stats, setStats] = useState<PomodoroStats>(pomodoroTimer.getStats());
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const [isEducationVisible, setIsEducationVisible] = useState(false);

  useEffect(() => {
    // Subscribe to timer events
    const unsubscribe = pomodoroTimer.addEventListener((event: PomodoroEvent) => {
      switch (event.type) {
        case 'sessionStart':
        case 'sessionPause':
        case 'sessionResume':
        case 'timerTick':
          if (event.session) {
            setCurrentSession({ ...event.session });
          }
          break;
        case 'sessionComplete':
          if (event.session) {
            setCurrentSession({ ...event.session });
            setStats(pomodoroTimer.getStats());
          }
          break;
        case 'settingsChange':
          if (event.settings) {
            setSettings({ ...event.settings });
          }
          break;
      }
    });

    // Initialize current session
    setCurrentSession(pomodoroTimer.getCurrentSession());

    // Request notification permission on mount
    pomodoroTimer.requestNotificationPermission();

    return unsubscribe;
  }, []);

  const showWidget = () => setIsWidgetVisible(true);
  const hideWidget = () => setIsWidgetVisible(false);
  const toggleWidget = () => setIsWidgetVisible(prev => !prev);

  const showEducation = () => setIsEducationVisible(true);
  const hideEducation = () => setIsEducationVisible(false);
  const toggleEducation = () => setIsEducationVisible(prev => !prev);

  const startSession = (type: 'work' | 'shortBreak' | 'longBreak' = 'work') => {
    pomodoroTimer.startSession(type);
  };

  const pauseResume = () => {
    if (!currentSession) return;
    
    if (currentSession.isPaused) {
      pomodoroTimer.resumeSession();
    } else {
      pomodoroTimer.pauseSession();
    }
  };

  const stopSession = () => {
    pomodoroTimer.stopSession();
    setCurrentSession(null);
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    pomodoroTimer.updateSettings(newSettings);
  };

  const resetStats = () => {
    pomodoroTimer.resetStats();
    setStats(pomodoroTimer.getStats());
  };

  const value: GlobalPomodoroContextType = {
    currentSession,
    settings,
    stats,
    isWidgetVisible,
    isEducationVisible,
    showWidget,
    hideWidget,
    toggleWidget,
    showEducation,
    hideEducation,
    toggleEducation,
    startSession,
    pauseResume,
    stopSession,
    updateSettings,
    resetStats,
  };

  return (
    <GlobalPomodoroContext.Provider value={value}>
      {children}
    </GlobalPomodoroContext.Provider>
  );
};

