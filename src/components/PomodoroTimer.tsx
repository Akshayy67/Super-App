import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Settings,
  BarChart3,
  Clock,
  Coffee,
  Brain,
  Target,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  RotateCcw,
  HelpCircle,
  Maximize2,
} from 'lucide-react';
import { 
  pomodoroTimer, 
  PomodoroSession, 
  PomodoroSettings, 
  PomodoroStats,
  PomodoroEvent 
} from '../utils/pomodoroTimer';
import { useGlobalPomodoro } from '../contexts/GlobalPomodoroContext';

interface PomodoroTimerProps {
  onSessionComplete?: (session: PomodoroSession) => void;
  className?: string;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ 
  onSessionComplete, 
  className = '' 
}) => {
  const globalPomodoro = useGlobalPomodoro();
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [settings, setSettings] = useState<PomodoroSettings>(pomodoroTimer.getSettings());
  const [stats, setStats] = useState<PomodoroStats>(pomodoroTimer.getStats());
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);

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
            onSessionComplete?.(event.session);
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

    return unsubscribe;
  }, [onSessionComplete]);

  const handleStartSession = (type: 'work' | 'shortBreak' | 'longBreak' = 'work') => {
    pomodoroTimer.startSession(type);
  };

  const handlePauseResume = () => {
    if (!currentSession) return;
    
    if (currentSession.isPaused) {
      pomodoroTimer.resumeSession();
    } else {
      pomodoroTimer.pauseSession();
    }
  };

  const handleStop = () => {
    pomodoroTimer.stopSession();
    setCurrentSession(null);
  };

  const getSessionTypeColor = (type: 'work' | 'shortBreak' | 'longBreak') => {
    switch (type) {
      case 'work':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'shortBreak':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'longBreak':
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSessionTypeIcon = (type: 'work' | 'shortBreak' | 'longBreak') => {
    switch (type) {
      case 'work':
        return <Brain className="w-5 h-5" />;
      case 'shortBreak':
        return <Coffee className="w-5 h-5" />;
      case 'longBreak':
        return <Target className="w-5 h-5" />;
    }
  };

  const formatTime = (seconds: number): string => {
    return pomodoroTimer.formatTime(seconds);
  };

  const getProgressPercentage = (): number => {
    if (!currentSession) return 0;
    return ((currentSession.duration - currentSession.timeRemaining) / currentSession.duration) * 100;
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Pomodoro Timer
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={globalPomodoro.toggleEducation}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Learn about Pomodoro"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={globalPomodoro.showWidget}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Open Floating Widget"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="View Statistics"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        {currentSession ? (
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg border ${getSessionTypeColor(currentSession.type)}`}>
            {getSessionTypeIcon(currentSession.type)}
            <span className="font-medium capitalize">
              {currentSession.type === 'shortBreak' ? 'Short Break' : 
               currentSession.type === 'longBreak' ? 'Long Break' : 'Work Session'}
            </span>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            Ready to start a session
          </div>
        )}

        <div className="mt-4">
          <div className="text-6xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-2">
            {currentSession ? formatTime(currentSession.timeRemaining) : formatTime(settings.workDuration * 60)}
          </div>
          
          {currentSession && (
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {!currentSession || !currentSession.isActive ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleStartSession('work')}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              Work
            </button>
            <button
              onClick={() => handleStartSession('shortBreak')}
              className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Coffee className="w-5 h-5" />
              Short Break
            </button>
            <button
              onClick={() => handleStartSession('longBreak')}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Target className="w-5 h-5" />
              Long Break
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handlePauseResume}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentSession.isPaused ? (
                <>
                  <Play className="w-5 h-5" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              )}
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Square className="w-5 h-5" />
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.todaysSessions}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Today
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.completedSessions}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round(stats.totalWorkTime / 60)}h
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Focus Time
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Timer Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Work Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.workDuration}
                onChange={(e) => pomodoroTimer.updateSettings({ workDuration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Short Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) => pomodoroTimer.updateSettings({ shortBreakDuration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Long Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) => pomodoroTimer.updateSettings({ longBreakDuration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sessions until Long Break
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={settings.sessionsUntilLongBreak}
                onChange={(e) => pomodoroTimer.updateSettings({ sessionsUntilLongBreak: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => pomodoroTimer.updateSettings({ autoStartBreaks: e.target.checked })}
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-start breaks
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.autoStartWork}
                onChange={(e) => pomodoroTimer.updateSettings({ autoStartWork: e.target.checked })}
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-start work sessions
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => pomodoroTimer.updateSettings({ soundEnabled: e.target.checked })}
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Sound notifications
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => pomodoroTimer.updateSettings({ notificationsEnabled: e.target.checked })}
                className="rounded border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                {settings.notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                Browser notifications
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Stats Panel */}
      {showStats && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Statistics
            </h3>
            <button
              onClick={() => pomodoroTimer.resetStats()}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.completedSessions}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Completed Sessions
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(stats.totalWorkTime / 60)}h
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Focus Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.todaysSessions}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Today's Sessions
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.streakDays}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Day Streak
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
