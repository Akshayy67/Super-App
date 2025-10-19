import React, { useState, useEffect } from "react";
import {
  Users,
  Video,
  Clock,
  Bell,
  Calendar,
  BookOpen,
  Target,
  BarChart3,
  Settings,
  Play,
  Pause,
  Square,
  MessageSquare,
  Monitor,
  PenTool,
} from "lucide-react";
import { PomodoroTimer } from "../../components/PomodoroTimer";
import { SmartNotifications } from "../../components/notifications/SmartNotifications";
import { StudySessionManager } from "../../components/StudySessionManager";
import { SharedWhiteboard } from "../../components/meeting/SharedWhiteboard";
import { ExternalVideoMeeting } from "../../components/meeting/ExternalVideoMeeting";
import {
  studySessionService,
  StudySession,
} from "../../utils/studySessionService";
import { pomodoroTimer, PomodoroSession } from "../../utils/pomodoroTimer";

interface StudyTeamProps {
  teamId?: string;
  className?: string;
}

export const StudyTeam: React.FC<StudyTeamProps> = ({
  teamId,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "sessions"
    | "meeting"
    | "pomodoro"
    | "notifications"
    | "whiteboard"
  >("overview");
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [pomodoroSession, setPomodoroSession] =
    useState<PomodoroSession | null>(null);
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    sessionsToday: 0,
    currentStreak: 0,
    weeklyGoal: 20,
    weeklyProgress: 12,
  });

  useEffect(() => {
    // Load initial data
    loadStudyTeamData();

    // Subscribe to session updates
    const unsubscribeSession = studySessionService.addEventListener(() => {
      setActiveSession(studySessionService.getActiveSession());
      loadStudyTeamData();
    });

    // Subscribe to pomodoro updates
    const unsubscribePomodoro = pomodoroTimer.addEventListener((event) => {
      if (
        event.type === "sessionStart" ||
        event.type === "timerTick" ||
        event.type === "sessionComplete"
      ) {
        setPomodoroSession(pomodoroTimer.getCurrentSession());
      }
    });

    return () => {
      unsubscribeSession();
      unsubscribePomodoro();
    };
  }, []);

  const loadStudyTeamData = () => {
    const sessionStats = studySessionService.getSessionStats();
    const pomodoroStats = pomodoroTimer.getStats();

    setStats({
      totalStudyTime: sessionStats.totalStudyTime + pomodoroStats.totalWorkTime,
      sessionsToday:
        sessionStats.totalSessions > 0 ? 1 : 0 + pomodoroStats.todaysSessions,
      currentStreak: Math.max(
        sessionStats.streakDays,
        pomodoroStats.streakDays
      ),
      weeklyGoal: 20,
      weeklyProgress: Math.min(
        sessionStats.totalSessions + pomodoroStats.completedSessions,
        20
      ),
    });

    setActiveSession(studySessionService.getActiveSession());
    setPomodoroSession(pomodoroTimer.getCurrentSession());
  };

  const handleStartQuickSession = () => {
    // Start a quick 25-minute focus session
    pomodoroTimer.startSession("work");
    setActiveTab("pomodoro");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "meeting", label: "Video Meeting", icon: Video },
    { id: "pomodoro", label: "Pomodoro", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "whiteboard", label: "Whiteboard", icon: PenTool },
  ];

  const getProgressPercentage = () => {
    return Math.min((stats.weeklyProgress / stats.weeklyGoal) * 100, 100);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Study Team
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Collaborative study sessions with focus tools and analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <button
              onClick={handleStartQuickSession}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Quick Focus
            </button>
            <button
              onClick={() => setActiveTab("meeting")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Video className="w-4 h-4" />
              Video Meeting
            </button>
          </div>
        </div>

        {/* Active Session Banner */}
        {(activeSession || pomodoroSession) && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {activeSession
                      ? `Study Session: ${activeSession.title}`
                      : "Pomodoro Session Active"}
                  </span>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {pomodoroSession &&
                      `${pomodoroTimer.formatTime(
                        pomodoroSession.timeRemaining
                      )} remaining`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setActiveTab(activeSession ? "sessions" : "pomodoro")
                  }
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {Math.round(stats.totalStudyTime / 60)}h
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Total Study Time
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {stats.sessionsToday}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Sessions Today
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {stats.currentStreak}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      Day Streak
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {Math.round(getProgressPercentage())}%
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      Weekly Goal
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Weekly Progress
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.weeklyProgress} / {stats.weeklyGoal} sessions
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab("sessions")}
                className="p-4 text-left bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Schedule Session
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Plan and organize your study sessions
                </p>
              </button>

              <button
                onClick={() => setActiveTab("meeting")}
                className="p-4 text-left bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-green-300 dark:hover:border-green-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Video className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Video Meeting
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start or join a video meeting
                </p>
              </button>

              <button
                onClick={() => setActiveTab("whiteboard")}
                className="p-4 text-left bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <PenTool className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Shared Whiteboard
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Collaborate on a shared whiteboard
                </p>
              </button>
            </div>
          </div>
        )}

        {activeTab === "sessions" && <StudySessionManager />}

        {activeTab === "meeting" && (
          <ExternalVideoMeeting onMeetingEnd={() => setActiveTab("overview")} />
        )}

        {activeTab === "pomodoro" && (
          <PomodoroTimer
            onSessionComplete={(session) => {
              // Handle session completion
              console.log("Pomodoro session completed:", session);
            }}
          />
        )}

        {activeTab === "notifications" && <SmartNotifications />}

        {activeTab === "whiteboard" && (
          <SharedWhiteboard sessionId={activeSession?.id} />
        )}
      </div>
    </div>
  );
};
