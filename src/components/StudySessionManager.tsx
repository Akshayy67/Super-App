import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Target,
  BookOpen,
  Plus,
  Play,
  Pause,
  Square,
  BarChart3,
  Settings,
  Edit3,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import { 
  studySessionService, 
  StudySession, 
  StudySessionStats,
  SessionEvent 
} from '../utils/studySessionService';
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns';

interface StudySessionManagerProps {
  className?: string;
}

export const StudySessionManager: React.FC<StudySessionManagerProps> = ({ 
  className = '' 
}) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<StudySessionStats | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);

  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    subject: '',
    scheduledStart: '',
    scheduledEnd: '',
    type: 'individual' as StudySession['type'],
    goals: [''],
    isPublic: false,
    maxParticipants: 5,
    allowLateJoin: true,
    sendReminders: true,
    pomodoroEnabled: false,
    workDuration: 25,
    breakDuration: 5,
  });

  useEffect(() => {
    // Subscribe to session events
    const unsubscribe = studySessionService.addEventListener((event: SessionEvent) => {
      loadData();
    });

    loadData();

    return unsubscribe;
  }, []);

  const loadData = () => {
    setSessions(studySessionService.getUserSessions());
    setActiveSession(studySessionService.getActiveSession());
    setUpcomingSessions(studySessionService.getUpcomingSessions());
    setStats(studySessionService.getSessionStats());
  };

  const handleCreateSession = async () => {
    if (!newSession.title.trim() || !newSession.scheduledStart || !newSession.scheduledEnd) {
      return;
    }

    try {
      const sessionData = {
        title: newSession.title,
        description: newSession.description,
        subject: newSession.subject || 'General',
        scheduledStart: new Date(newSession.scheduledStart),
        scheduledEnd: new Date(newSession.scheduledEnd),
        type: newSession.type,
        settings: {
          isPublic: newSession.isPublic,
          maxParticipants: newSession.maxParticipants,
          allowLateJoin: newSession.allowLateJoin,
          requireApproval: false,
          sendReminders: newSession.sendReminders,
        },
        goals: newSession.goals.filter(goal => goal.trim()),
        ...(newSession.pomodoroEnabled && {
          pomodoroConfig: {
            workDuration: newSession.workDuration,
            breakDuration: newSession.breakDuration,
            longBreakDuration: newSession.breakDuration * 3,
            sessionsUntilLongBreak: 4,
          },
        }),
      };

      await studySessionService.createSession(sessionData);
      
      // Reset form
      setNewSession({
        title: '',
        description: '',
        subject: '',
        scheduledStart: '',
        scheduledEnd: '',
        type: 'individual',
        goals: [''],
        isPublic: false,
        maxParticipants: 5,
        allowLateJoin: true,
        sendReminders: true,
        pomodoroEnabled: false,
        workDuration: 25,
        breakDuration: 5,
      });
      
      setShowCreateSession(false);
      loadData();
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await studySessionService.startSession(sessionId);
      loadData();
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await studySessionService.endSession(sessionId);
      loadData();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      await studySessionService.joinSession(sessionId);
      loadData();
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  const addGoal = () => {
    setNewSession({
      ...newSession,
      goals: [...newSession.goals, ''],
    });
  };

  const updateGoal = (index: number, value: string) => {
    const updatedGoals = [...newSession.goals];
    updatedGoals[index] = value;
    setNewSession({
      ...newSession,
      goals: updatedGoals,
    });
  };

  const removeGoal = (index: number) => {
    const updatedGoals = newSession.goals.filter((_, i) => i !== index);
    setNewSession({
      ...newSession,
      goals: updatedGoals.length > 0 ? updatedGoals : [''],
    });
  };

  const getSessionStatusColor = (session: StudySession) => {
    switch (session.status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getSessionTypeIcon = (type: StudySession['type']) => {
    switch (type) {
      case 'group':
        return <Users className="w-4 h-4" />;
      case 'pomodoro':
        return <Clock className="w-4 h-4" />;
      case 'meeting':
        return <Users className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const formatSessionTime = (session: StudySession) => {
    const start = format(session.scheduledStart, 'HH:mm');
    const end = format(session.scheduledEnd, 'HH:mm');
    return `${start} - ${end}`;
  };

  const getSessionDate = (session: StudySession) => {
    if (isToday(session.scheduledStart)) {
      return 'Today';
    } else if (isTomorrow(session.scheduledStart)) {
      return 'Tomorrow';
    } else {
      return format(session.scheduledStart, 'MMM dd');
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Study Sessions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="View Statistics"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCreateSession(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>
      </div>

      {/* Active Session */}
      {activeSession && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                {activeSession.title}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Active session • {activeSession.participants.length} participant{activeSession.participants.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => handleEndSession(activeSession.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              End Session
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Upcoming Sessions
          </h3>
          <div className="space-y-3">
            {upcomingSessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getSessionStatusColor(session)}`}>
                    {getSessionTypeIcon(session.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {session.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getSessionDate(session)} • {formatSessionTime(session)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPast(session.scheduledStart) && session.status === 'scheduled' && (
                    <button
                      onClick={() => handleStartSession(session.id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedSession(session)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalSessions}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Sessions
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(stats.totalStudyTime / 60)}h
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Study Time
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.streakDays}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Day Streak
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(stats.completionRate)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Completion
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Recent Sessions
        </h3>
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${getSessionStatusColor(session)}`}>
                  {getSessionTypeIcon(session.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {session.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.subject} • {getSessionDate(session)} • {formatSessionTime(session)}
                  </p>
                  {session.goals.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Target className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {session.progress.goalsCompleted}/{session.goals.length} goals completed
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${getSessionStatusColor(session)}`}>
                  {session.status}
                </span>
                <button
                  onClick={() => setSelectedSession(session)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Create Study Session
              </h3>
              <button
                onClick={() => setShowCreateSession(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Math Study Session"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newSession.subject}
                    onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Mathematics"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  placeholder="What will you be studying?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newSession.scheduledStart}
                    onChange={(e) => setNewSession({ ...newSession, scheduledStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newSession.scheduledEnd}
                    onChange={(e) => setNewSession({ ...newSession, scheduledEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Session Type
                  </label>
                  <select
                    value={newSession.type}
                    onChange={(e) => setNewSession({ ...newSession, type: e.target.value as StudySession['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                    <option value="pomodoro">Pomodoro</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newSession.maxParticipants}
                    onChange={(e) => setNewSession({ ...newSession, maxParticipants: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Study Goals
                  </label>
                  <button
                    onClick={addGoal}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Plus className="w-3 h-3" />
                    Add Goal
                  </button>
                </div>
                <div className="space-y-2">
                  {newSession.goals.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => updateGoal(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        placeholder={`Goal ${index + 1}`}
                      />
                      {newSession.goals.length > 1 && (
                        <button
                          onClick={() => removeGoal(index)}
                          className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newSession.isPublic}
                    onChange={(e) => setNewSession({ ...newSession, isPublic: e.target.checked })}
                    className="rounded border-gray-300 dark:border-slate-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Make session public
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newSession.allowLateJoin}
                    onChange={(e) => setNewSession({ ...newSession, allowLateJoin: e.target.checked })}
                    className="rounded border-gray-300 dark:border-slate-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Allow late joining
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newSession.sendReminders}
                    onChange={(e) => setNewSession({ ...newSession, sendReminders: e.target.checked })}
                    className="rounded border-gray-300 dark:border-slate-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Send reminders
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newSession.pomodoroEnabled}
                    onChange={(e) => setNewSession({ ...newSession, pomodoroEnabled: e.target.checked })}
                    className="rounded border-gray-300 dark:border-slate-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable Pomodoro timer
                  </span>
                </label>
              </div>

              {/* Pomodoro Settings */}
              {newSession.pomodoroEnabled && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Work Duration (min)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={newSession.workDuration}
                      onChange={(e) => setNewSession({ ...newSession, workDuration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Break Duration (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={newSession.breakDuration}
                      onChange={(e) => setNewSession({ ...newSession, breakDuration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateSession}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Session
              </button>
              <button
                onClick={() => setShowCreateSession(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Study Statistics
              </h3>
              <button
                onClick={() => setShowStats(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalSessions}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Total Sessions
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(stats.totalStudyTime / 60)}h
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Total Study Time
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.streakDays}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Current Streak
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(stats.averageSessionLength)}m
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  Avg Session Length
                </div>
              </div>
            </div>

            {/* Favorite Subjects */}
            {stats.favoriteSubjects.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Favorite Subjects
                </h4>
                <div className="space-y-2">
                  {stats.favoriteSubjects.map((subject, index) => (
                    <div key={subject.subject} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {subject.subject}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {subject.count} session{subject.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowStats(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
