import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Clock,
  Target,
  Zap,
  Brain,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { useAnalyticsDataReadOnly } from "../../hooks/useAnalyticsData";
import { unifiedAnalyticsStorage } from "../../utils/unifiedAnalyticsStorage";
import { performanceAnalytics } from "../../utils/performanceAnalytics";
import { calendarService, DateSummary } from "../../utils/calendarService";
import { studySessionService } from "../../utils/studySessionService";
import { firestoreUserTasks } from "../../utils/firestoreUserTasks";
import { format, subDays, subWeeks, startOfWeek, endOfWeek } from "date-fns";

// Activity Feed Widget
export const ActivityFeedWidget: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    // Load recent activities from various sources
    const recentActivities = [];
    
    try {
      // Get recent tasks
      const tasks = await firestoreUserTasks.getTasks(user!.id);
      const recentTasks = tasks.slice(0, 5).map(task => ({
        id: task.id,
        type: 'task',
        action: task.status === 'completed' ? 'completed task' : 'updated task',
        title: task.title,
        timestamp: new Date(task.dueDate),
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400'
      }));
      recentActivities.push(...recentTasks);

      // Get recent study sessions
      const sessions = studySessionService.getUserSessions();
      const recentSessions = sessions.slice(0, 5).map(session => ({
        id: session.id,
        type: 'session',
        action: 'joined study session',
        title: session.title,
        timestamp: session.createdAt,
        icon: Brain,
        color: 'text-blue-600 dark:text-blue-400'
      }));
      recentActivities.push(...recentSessions);

      // Sort by timestamp and limit
      recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setActivities(recentActivities.slice(0, 10));
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
          Recent Activity
        </h3>
        <Activity className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
      </div>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-500 text-sm">
            No recent activity
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                <div className={`w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate">{activity.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{format(activity.timestamp, 'MMM d, h:mm a')}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Productivity Metrics Widget
export const ProductivityMetricsWidget: React.FC = () => {
  const { performanceHistory } = useAnalyticsDataReadOnly();
  const [metrics, setMetrics] = useState({
    focusScore: 0,
    productivity: 0,
    improvement: 0,
    consistency: 0,
  });

  useEffect(() => {
    calculateMetrics();
  }, [performanceHistory]);

  const calculateMetrics = () => {
    if (performanceHistory.length === 0) {
      // Set default metrics when no data
      setMetrics({
        focusScore: 0,
        productivity: 0,
        improvement: 0,
        consistency: 0,
      });
      return;
    }

    const recentPerformances = performanceHistory.slice(0, 10);
    const avgScore = recentPerformances.reduce((sum, p) => sum + p.overallScore, 0) / recentPerformances.length;
    
    const improvement = recentPerformances.length >= 2
      ? recentPerformances[0].overallScore - recentPerformances[recentPerformances.length - 1].overallScore
      : 0;

    setMetrics({
      focusScore: Math.round(avgScore * 0.8),
      productivity: Math.round(avgScore * 1.2),
      improvement: Math.round(improvement * 5),
      consistency: Math.round(avgScore),
    });
  };

  const metricsList = [
    { name: 'Focus Score', value: metrics.focusScore, icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { name: 'Productivity', value: metrics.productivity, icon: Target, color: 'from-green-500 to-emerald-500' },
    { name: 'Improvement', value: `${metrics.improvement > 0 ? '+' : ''}${metrics.improvement}%`, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { name: 'Consistency', value: metrics.consistency, icon: Activity, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
          Productivity Metrics
        </h3>
        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {metricsList.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-1">
                {metric.value}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{metric.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Performance Chart Widget
export const PerformanceChartWidget: React.FC = () => {
  const { performanceHistory } = useAnalyticsDataReadOnly();
  const navigate = useNavigate();

  // Get last 7 days of data
  const getWeeklyData = () => {
    if (performanceHistory.length === 0) {
      return Array(7).fill(0).map((_, i) => ({
        day: format(subDays(new Date(), 6 - i), 'EEE'),
        score: 0
      }));
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayData = performanceHistory.filter(p => {
        const perfDate = new Date(p.timestamp);
        return format(perfDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      const avgScore = dayData.length > 0
        ? dayData.reduce((sum, p) => sum + p.overallScore, 0) / dayData.length
        : 0;
      
      return {
        day: format(date, 'EEE'),
        score: Math.round(avgScore)
      };
    });

    return last7Days;
  };

  const weeklyData = getWeeklyData();
  const maxScore = Math.max(...weeklyData.map(d => d.score), 100);

  return (
    <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
          Weekly Performance
        </h3>
        <button
          onClick={() => navigate('/interview')}
          className="text-xs text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors"
        >
          View Details
        </button>
      </div>
      
      {/* Simple bar chart */}
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyData.map((day, index) => {
            const height = (day.score / maxScore) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 dark:from-cyan-500 dark:to-blue-500 rounded-t transition-all duration-300 hover:opacity-80"
                  style={{ height: `${height}%` }}
                  title={`${day.day}: ${day.score}%`}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{day.day}</span>
                <span className="text-xs text-gray-900 dark:text-white font-semibold mt-1">{day.score}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Smart Insights Widget
export const SmartInsightsWidget: React.FC = () => {
  const { performanceHistory } = useAnalyticsDataReadOnly();
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    generateInsights();
  }, [performanceHistory]);

  const generateInsights = async () => {
    if (performanceHistory.length < 2) {
      setInsights([
        "Complete your first interview practice to see insights",
        "Track your progress over time to get personalized recommendations"
      ]);
      return;
    }

    const recent = performanceHistory.slice(0, 5);
    const avgScore = recent.reduce((sum, p) => sum + p.overallScore, 0) / recent.length;
    const trend = recent[0].overallScore > recent[recent.length - 1].overallScore ? 'improving' : 'declining';

    const newInsights = [];
    
    if (avgScore < 60) {
      newInsights.push("Your confidence needs work - practice answering common questions");
    } else if (avgScore > 80) {
      newInsights.push("Excellent performance! Try challenging yourself with advanced scenarios");
    } else {
      newInsights.push("Good progress! Focus on maintaining consistency across all categories");
    }

    if (trend === 'improving') {
      newInsights.push("Keep up the great work! Your skills are improving steadily");
    } else {
      newInsights.push("Focus on consistent practice to maintain your performance level");
    }

    // Add session insights
    const sessions = studySessionService.getUserSessions();
    if (sessions.length > 0) {
      newInsights.push(`You've completed ${sessions.length} study sessions this month`);
    }

    setInsights(newInsights.slice(0, 4));
  };

  return (
    <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
          AI Insights
        </h3>
        <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-cyan-400 mt-2 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Upcoming Events Widget
export const UpcomingEventsWidget: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const user = realTimeAuth.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadUpcomingEvents();
    }
  }, [user]);

  const loadUpcomingEvents = async () => {
    if (!user) return;

    try {
      const calendarEvents = await calendarService.getEvents(user.id);
      const now = new Date();
      const upcomingEvents = calendarEvents
        .filter(event => new Date(event.startDate) > now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5);

      setEvents(upcomingEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
          Upcoming Events
        </h3>
        <button
          onClick={() => navigate('/calendar')}
          className="text-xs text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-500 text-sm">
            No upcoming events
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer" onClick={() => navigate('/calendar')}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{format(new Date(event.startDate), 'MMM d, h:mm a')}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Quick Stats Overview
export const QuickStatsOverview: React.FC = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingMeetings: 0,
    studySessions: 0,
  });

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const tasks = await firestoreUserTasks.getTasks(user.id);
      const events = await calendarService.getEvents(user.id);
      const sessions = studySessionService.getUserSessions();

      const now = new Date();
      const upcomingMeetings = events.filter(
        e => e.type === 'meeting' && new Date(e.startDate) > now
      ).length;

      setStats({
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        upcomingMeetings,
        studySessions: sessions.length,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
        Quick Overview
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Completed Tasks</p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingMeetings}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Upcoming Meetings</p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.studySessions}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Study Sessions</p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <Target className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTasks - stats.completedTasks}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Pending Tasks</p>
        </div>
      </div>
    </div>
  );
};

