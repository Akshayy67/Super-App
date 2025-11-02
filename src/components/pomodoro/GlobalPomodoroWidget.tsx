import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Settings,
  Brain,
  Coffee,
  Target,
  X,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  HelpCircle,
  BarChart3,
  RotateCcw,
} from 'lucide-react';
import { useGlobalPomodoro } from '../../contexts/GlobalPomodoroContext';
import { pomodoroTimer } from '../../utils/pomodoroTimer';

export const GlobalPomodoroWidget: React.FC = () => {
  const {
    currentSession,
    settings,
    stats,
    isWidgetVisible,
    hideWidget,
    toggleEducation,
    startSession,
    pauseResume,
    stopSession,
    updateSettings,
    resetStats,
  } = useGlobalPomodoro();

  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getSessionTypeColor = (type: 'work' | 'shortBreak' | 'longBreak') => {
    switch (type) {
      case 'work':
        return 'bg-gradient-to-br from-red-500 to-red-600 text-white';
      case 'shortBreak':
        return 'bg-gradient-to-br from-green-500 to-green-600 text-white';
      case 'longBreak':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white';
    }
  };

  const getSessionTypeIcon = (type: 'work' | 'shortBreak' | 'longBreak') => {
    switch (type) {
      case 'work':
        return <Brain className="w-4 h-4" />;
      case 'shortBreak':
        return <Coffee className="w-4 h-4" />;
      case 'longBreak':
        return <Target className="w-4 h-4" />;
    }
  };

  const formatTime = (seconds: number): string => {
    return pomodoroTimer.formatTime(seconds);
  };

  const getProgressPercentage = (): number => {
    if (!currentSession) return 0;
    return ((currentSession.duration - currentSession.timeRemaining) / currentSession.duration) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Don't render if widget is not visible
  if (!isWidgetVisible) return null;

  // Minimized view
  if (isMinimized) {
    return (
      <div
        className="fixed z-40 cursor-move"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseDown={handleMouseDown}
      >
        <div className={`rounded-full shadow-2xl ${currentSession ? getSessionTypeColor(currentSession.type) : 'bg-gray-800'} p-4 flex items-center gap-3`}>
          {currentSession && getSessionTypeIcon(currentSession.type)}
          <div className="font-mono font-bold text-lg">
            {currentSession ? formatTime(currentSession.timeRemaining) : '25:00'}
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={hideWidget}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed z-40 cursor-move"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-slate-700 w-80 overflow-hidden">
        {/* Header */}
        <div className={`${currentSession ? getSessionTypeColor(currentSession.type) : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'} p-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            {currentSession ? getSessionTypeIcon(currentSession.type) : <Brain className="w-5 h-5" />}
            <span className="font-semibold text-sm">
              {currentSession
                ? currentSession.type === 'shortBreak'
                  ? 'Short Break'
                  : currentSession.type === 'longBreak'
                  ? 'Long Break'
                  : 'Focus Time'
                : 'Pomodoro Timer'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleEducation}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Learn about Pomodoro"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={hideWidget}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-5xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-2">
              {currentSession ? formatTime(currentSession.timeRemaining) : formatTime(settings.workDuration * 60)}
            </div>
            
            {currentSession && (
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    currentSession.type === 'work' ? 'bg-red-600' : 
                    currentSession.type === 'shortBreak' ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            )}

            {currentSession?.isPaused && (
              <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                ⏸ Paused
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {!currentSession || !currentSession.isActive ? (
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => startSession('work')}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Work
                </button>
                <button
                  onClick={() => startSession('shortBreak')}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Coffee className="w-4 h-4" />
                  Break
                </button>
                <button
                  onClick={() => startSession('longBreak')}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  Long
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={pauseResume}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentSession.isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  )}
                </button>
                <button
                  onClick={stopSession}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-2">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.todaysSessions}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Today</div>
            </div>
            <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-2">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.completedSessions}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Total</div>
            </div>
            <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-2">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {Math.round(stats.totalWorkTime / 60)}h
              </div>
              <div className="text-gray-500 dark:text-gray-400">Focus</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-around pt-2 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Statistics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-3">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Quick Settings</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-gray-700 dark:text-gray-300">Work (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workDuration}
                    onChange={(e) => updateSettings({ workDuration: parseInt(e.target.value) })}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <label className="text-gray-700 dark:text-gray-300">Break (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreakDuration}
                    onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) })}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Auto-start breaks</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    {settings.soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                    Sound
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    {settings.notificationsEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                    Notifications
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Stats Panel */}
          {showStats && (
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Statistics</h4>
                <button
                  onClick={resetStats}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.completedSessions}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Sessions</div>
                </div>
                <div className="text-center bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(stats.totalWorkTime / 60)}h
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Focus Time</div>
                </div>
                <div className="text-center bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.streakDays}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Day Streak</div>
                </div>
                <div className="text-center bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.todaysSessions}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Today</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

