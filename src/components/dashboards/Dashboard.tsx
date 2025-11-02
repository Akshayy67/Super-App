import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  CheckSquare,
  StickyNote,
  TrendingUp,
  Calendar,
  Brain,
  Upload,
  Clock,
  AlertTriangle,
  Users,
  Settings,
  X,
  Video,
} from "lucide-react";
import { storageUtils } from "../../utils/storage"; // still used for short notes
import { driveStorageUtils } from "../../utils/driveStorage"; // for accurate file count (Drive or local fallback)
import { firestoreUserTasks } from "../../utils/firestoreUserTasks";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { format, isAfter, startOfDay, isToday, isTomorrow } from "date-fns";
import { Task } from "../types";
import { FilePermissionsFixer } from "../file/FilePermissionsFixer";
import { DashboardLayout, pageColors, componentThemes } from "../layout/PageLayout";
import { Motivational3DComponent } from "../ui/Motivational3DComponent";
import { MouseFollowingBird } from "../ui/MouseFollowingBird";
import {
  ActivityFeedWidget,
  ProductivityMetricsWidget,
  PerformanceChartWidget,
  SmartInsightsWidget,
  UpcomingEventsWidget,
  QuickStatsOverview,
} from "./EnterpriseDashboardWidgets";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    todayTasks: 0,
    tomorrowTasks: 0,
    highPriorityTasks: 0,
    totalShortNotes: 0,
  });
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [showFilePermissionsFixer, setShowFilePermissionsFixer] =
    useState(false);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Use driveStorageUtils (async, Drive-aware with fallback) for file list
      const files = await driveStorageUtils.getFiles(user.id);
      const tasks = await firestoreUserTasks.getTasks(user.id);
      const notes = storageUtils.getShortNotes(user.id);

      const pendingTasks = tasks.filter((task) => task.status === "pending");

      const overdueTasks = pendingTasks.filter((task) =>
        isAfter(startOfDay(new Date()), startOfDay(new Date(task.dueDate)))
      );

      const todayTasks = pendingTasks.filter((task) =>
        isToday(new Date(task.dueDate))
      );

      const tomorrowTasks = pendingTasks.filter((task) =>
        isTomorrow(new Date(task.dueDate))
      );

      const highPriorityTasks = pendingTasks.filter(
        (task) => task.priority === "high"
      );

      // Get upcoming tasks (next 7 days, excluding overdue)
      const upcoming = pendingTasks
        .filter(
          (task) =>
            !isAfter(startOfDay(new Date()), startOfDay(new Date(task.dueDate)))
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )
        .slice(0, 5);

      setStats({
        totalFiles: files.filter((f) => f.type === "file").length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === "completed").length,
        overdueTasks: overdueTasks.length,
        todayTasks: todayTasks.length,
        tomorrowTasks: tomorrowTasks.length,
        highPriorityTasks: highPriorityTasks.length,
        totalShortNotes: notes.length,
      });

      setUpcomingTasks(upcoming);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      return;
    }
  };

  const statCards = [
    {
      title: "Due Today",
      value: stats.todayTasks,
      icon: Calendar,
      color: "orange",
      action: () => navigate("/tasks"),
      urgent: stats.todayTasks > 0,
    },
    {
      title: "Due Tomorrow",
      value: stats.tomorrowTasks,
      icon: Clock,
      color: "blue",
      action: () => navigate("/tasks"),
    },
    {
      title: "High Priority",
      value: stats.highPriorityTasks,
      icon: AlertTriangle,
      color: "red",
      action: () => navigate("/tasks"),
      urgent: stats.highPriorityTasks > 0,
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: TrendingUp,
      color: "green",
      action: () => navigate("/tasks"),
    },
  ];

  const getColorClasses = (color: string, urgent?: boolean) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      green:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      purple:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      yellow:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      orange: urgent
        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        : "bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400",
      red: urgent
        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <DashboardLayout>
      <div
        className="min-h-screen transition-colors duration-300 bg-white dark:bg-black"
        data-component="dashboard"
      >
        {/* Futuristic 3D Component at the top */}
        <div className="relative w-full bg-white dark:bg-black overflow-hidden">
          <Motivational3DComponent height="500px" className="w-full" userName={user?.username || "User"} />
        </div>

        {/* Welcome Section with Futuristic Design */}
        <div className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-900 dark:to-black border-t border-gray-200 dark:border-cyan-500/20">
          <div className="container-mobile py-12">
            <div className="text-center">
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mb-4">
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent" 
                    style={{ 
                      fontFamily: 'system-ui, sans-serif',
                      letterSpacing: '-0.02em',
                      textShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
                    }}>
                  Welcome back, {user?.username}!
                </h1>
                <div className="mt-2 md:mt-0">
                  <MouseFollowingBird className="w-12 h-12 md:w-16 md:h-16" />
                </div>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" 
                 style={{ fontFamily: 'system-ui, sans-serif' }}>
                Your personalized dashboard is ready
              </p>
            </div>
          </div>
        </div>

        <div className="container-mobile py-12">
          {/* Stats Grid - Futuristic Design */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const glowColors = {
                orange: "from-orange-500",
                blue: "from-blue-500", 
                red: "from-red-500",
                green: "from-green-500"
              };
              const borderColors = {
                orange: "border-orange-500/50",
                blue: "border-blue-500/50",
                red: "border-red-500/50",
                green: "border-green-500/50"
              };
              return (
                <button
                  key={index}
                  onClick={stat.action}
                  className="relative group bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-blue-400 dark:hover:border-cyan-500/50 transition-all duration-300 overflow-hidden shadow-sm dark:shadow-none"
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${glowColors[stat.color as keyof typeof glowColors]} opacity-0 group-hover:opacity-10 blur-xl transition-opacity`} />
                  
                  <div className="relative flex flex-col">
                    <div className={`w-12 h-12 ${glowColors[stat.color as keyof typeof glowColors]} rounded-lg flex items-center justify-center mb-3 opacity-20`}>
                      <Icon className="w-6 h-6 text-gray-700 dark:text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Overdue Tasks Alert - Futuristic Design */}
          {stats.overdueTasks > 0 && (
            <div className="relative bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-300 dark:border-red-500/50 rounded-lg p-6 mb-8 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 opacity-5 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="bg-red-100 dark:bg-red-500/20 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 border border-red-300 dark:border-red-500/30">
                    <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-red-700 dark:text-red-300 mb-1">
                      {stats.overdueTasks} overdue task{stats.overdueTasks > 1 ? "s" : ""}
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400/80">
                      Review tasks past their due date
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/tasks")}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-500 hover:to-orange-500 transition-all duration-300 font-medium text-sm border border-red-400/30"
                >
                  View Tasks
                </button>
              </div>
            </div>
          )}

          {/* Main Content Grid - Futuristic Design */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="xl:col-span-1 order-2 xl:order-1">
              <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-1 gap-3">
                  <button
                    onClick={() => navigate("/files")}
                    className="group w-full flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 text-sm"
                  >
                    <Upload className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                    <span className="truncate">Upload New Files</span>
                  </button>
                  <button
                    onClick={() => navigate("/tasks")}
                    className="group w-full flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-green-400 dark:hover:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 text-sm"
                  >
                    <CheckSquare className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-green-500 transition-colors" />
                    <span className="truncate">Add New Task</span>
                  </button>
                  <button
                    onClick={() => navigate("/notes")}
                    className="group w-full flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 text-sm"
                  >
                    <StickyNote className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-purple-500 transition-colors" />
                    <span className="truncate">Create Note</span>
                  </button>
                  <button
                    onClick={() => navigate("/chat")}
                    className="group w-full flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-orange-400 dark:hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 text-sm"
                  >
                    <Brain className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-orange-500 transition-colors" />
                    <span className="truncate">Ask AI Assistant</span>
                  </button>
                  <button
                    onClick={() => navigate("/video-call")}
                    className="group w-full flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-red-400 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 text-sm"
                  >
                    <Video className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-red-500 transition-colors" />
                    <span className="truncate">Start Video Call</span>
                  </button>
                  <button
                    onClick={() => navigate("/team")}
                    className="group w-full flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 text-sm"
                  >
                    <Users className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-indigo-500 transition-colors" />
                    <span className="truncate">Team Space</span>
                  </button>
                  <button
                    onClick={() => navigate("/settings")}
                    className="group w-full flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 dark:hover:border-gray-500/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 text-sm"
                  >
                    <Settings className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
                    <span className="truncate">Settings</span>
                  </button>
                  <button
                    onClick={() => setShowFilePermissionsFixer(true)}
                    className="group w-full flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-yellow-400 dark:hover:border-yellow-500/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-300 text-sm"
                  >
                    <Settings className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-yellow-500 transition-colors" />
                    <span className="truncate">Fix File Access</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="xl:col-span-2 order-1 xl:order-2">
              <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Upcoming Tasks
                  </h2>
                  <button
                    onClick={() => navigate("/tasks")}
                    className="text-sm text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 font-medium transition-colors"
                  >
                    View All
                  </button>
                </div>

                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-2">
                      No upcoming tasks
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Great! You're all caught up. Create new tasks to stay organized.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => {
                      const isTaskToday = isToday(new Date(task.dueDate));
                      const isTaskTomorrow = isTomorrow(new Date(task.dueDate));
                      const isTaskOverdue = isAfter(
                        startOfDay(new Date()),
                        startOfDay(new Date(task.dueDate))
                      );

                      return (
                        <div
                          key={task.id}
                          className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300 ${
                            isTaskOverdue
                              ? "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-500/30 hover:border-red-500 dark:hover:border-red-500/60"
                              : isTaskToday
                              ? "bg-orange-50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-500/30 hover:border-orange-500 dark:hover:border-orange-500/60"
                              : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-cyan-500/30"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              task.priority === "high"
                                ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                                : task.priority === "medium"
                                ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"
                                : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-gray-900 dark:text-white truncate mb-1">
                              {task.title}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="truncate">{task.subject}</span>
                              <span>•</span>
                              <span
                                className={`font-medium ${
                                  isTaskOverdue
                                    ? "text-red-600 dark:text-red-400"
                                    : isTaskToday
                                    ? "text-orange-600 dark:text-orange-400"
                                    : isTaskTomorrow
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 dark:text-gray-300"
                                }`}
                              >
                                {isTaskOverdue
                                  ? "Overdue"
                                  : isTaskToday
                                  ? "Due Today"
                                  : isTaskTomorrow
                                  ? "Due Tomorrow"
                                  : format(new Date(task.dueDate), "MMM d")}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full flex-shrink-0 border ${
                              task.priority === "high"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30"
                                : task.priority === "medium"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30"
                                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Study Progress - Futuristic Design */}
          <div className="mt-8 relative bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
              Study Progress
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/20 dark:to-cyan-500/20 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-3xl mb-2">
                  {stats.totalFiles}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Documents Uploaded
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/20 dark:to-emerald-500/20 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <CheckSquare className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-3xl mb-2">
                  {stats.totalTasks > 0
                    ? Math.round(
                        (stats.completedTasks / stats.totalTasks) * 100
                      )
                    : 0}
                  %
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tasks Completed
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/20 dark:to-pink-500/20 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                  <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-3xl mb-2">
                  {stats.totalShortNotes}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Short Notes Created
                </p>
              </div>
            </div>
          </div>

          {/* Enterprise Grade Widgets */}
          <div className="mt-8">
            {/* Quick Stats and Performance Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <QuickStatsOverview />
              <PerformanceChartWidget />
            </div>

            {/* Productivity and Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ProductivityMetricsWidget />
              <SmartInsightsWidget />
            </div>

            {/* Activity and Events Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeedWidget />
              <UpcomingEventsWidget />
            </div>
          </div>
        </div>

        {/* File Permissions Fixer Modal */}
        {showFilePermissionsFixer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Fix File Access Issues
                </h2>
                <button
                  onClick={() => setShowFilePermissionsFixer(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <FilePermissionsFixer />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
