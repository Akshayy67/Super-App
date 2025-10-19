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
        className="min-h-screen overflow-auto scroll-area-mobile transition-colors duration-300"
        data-component="dashboard"
      >
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-responsive transition-colors duration-300">
          <div className="container-mobile">
            <h1 className="text-responsive-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
              Here's an overview of your study progress and recent activity.
            </p>
          </div>
        </div>

        <div className="container-mobile py-responsive">
          {/* Stats Grid - Enhanced for all screen sizes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-responsive mb-6 sm:mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <button
                  key={index}
                  onClick={stat.action}
                  className="card-responsive-compact text-left btn-touch"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-responsive-xs font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">
                        {stat.title}
                      </p>
                      <p className="text-responsive-lg sm:text-responsive-xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${getColorClasses(
                        stat.color,
                        stat.urgent
                      )}`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Overdue Tasks Alert - Enhanced mobile layout */}
          {stats.overdueTasks > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-responsive mb-6 sm:mb-8">
              <div className="flex-responsive items-center">
                <div className="flex items-start sm:items-center flex-1 min-w-0">
                  <div className="bg-red-100 dark:bg-red-900/30 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-responsive-sm font-medium text-red-800 dark:text-red-200">
                      {stats.overdueTasks} overdue task
                      {stats.overdueTasks > 1 ? "s" : ""}
                    </h3>
                    <p className="text-responsive-xs text-red-600 dark:text-red-300 mt-1">
                      You have tasks that are past their due date. Review them
                      to stay on track.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/tasks")}
                  className="btn-touch px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-responsive-sm font-medium flex-shrink-0"
                >
                  View Tasks
                </button>
              </div>
            </div>
          )}

          {/* Main Content Grid - Enhanced responsive layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Quick Actions - Improved mobile layout */}
            <div className="xl:col-span-1 order-2 xl:order-1">
              <div className="card-responsive">
                <h2 className="text-responsive-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-1 gap-3">
                  <button
                    onClick={() => navigate("/files")}
                    className="w-full flex items-center px-3 sm:px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm btn-touch"
                  >
                    <Upload className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Upload New Files</span>
                  </button>
                  <button
                    onClick={() => navigate("/tasks")}
                    className="w-full flex items-center px-3 sm:px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm btn-touch"
                  >
                    <CheckSquare className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Add New Task</span>
                  </button>
                  <button
                    onClick={() => navigate("/notes")}
                    className="w-full flex items-center px-3 sm:px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm btn-touch"
                  >
                    <StickyNote className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Create Note</span>
                  </button>
                  <button
                    onClick={() => navigate("/chat")}
                    className="w-full flex items-center px-3 sm:px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm btn-touch"
                  >
                    <Brain className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Ask AI Assistant</span>
                  </button>
                  <button
                    onClick={() => navigate("/video-call")}
                    className="w-full flex items-center px-3 sm:px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm btn-touch"
                  >
                    <Video className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Start Video Call</span>
                  </button>
                  <button
                    onClick={() => navigate("/team")}
                    className="w-full flex items-center px-3 sm:px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm btn-touch"
                  >
                    <Users className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Team Space</span>
                  </button>
                  <button
                    onClick={() => navigate("/settings")}
                    className="w-full flex items-center px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm btn-touch"
                  >
                    <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Settings</span>
                  </button>
                  <button
                    onClick={() => setShowFilePermissionsFixer(true)}
                    className="w-full flex items-center px-3 sm:px-4 py-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors text-sm btn-touch"
                  >
                    <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Fix File Access</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Tasks - Enhanced mobile-first design */}
            <div className="xl:col-span-2 order-1 xl:order-2">
              <div className="card-responsive">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-responsive-base font-semibold text-gray-900 dark:text-gray-100">
                    Upcoming Tasks
                  </h2>
                  <button
                    onClick={() => navigate("/tasks")}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium btn-touch"
                  >
                    View All
                  </button>
                </div>

                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <CheckSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-responsive-sm">
                      No upcoming tasks
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Great! You're all caught up. Create new tasks to stay
                      organized.
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
                          className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border transition-colors ${
                            isTaskOverdue
                              ? "bg-red-50 border-red-200"
                              : isTaskToday
                              ? "bg-orange-50 border-orange-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              task.priority === "high"
                                ? "bg-red-500"
                                : task.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                              {task.title}
                            </p>
                            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span className="truncate">{task.subject}</span>
                              <span className="hidden xs:inline">•</span>
                              <span
                                className={`font-medium ${
                                  isTaskOverdue
                                    ? "text-red-600"
                                    : isTaskToday
                                    ? "text-orange-600"
                                    : isTaskTomorrow
                                    ? "text-blue-600"
                                    : ""
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
                            className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-600"
                                : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-green-100 text-green-600"
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

          {/* Study Progress - Enhanced responsive grid */}
          <div className="mt-6 sm:mt-8 card-responsive">
            <h2 className="text-responsive-base font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
              Study Progress
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg sm:text-xl">
                  {stats.totalFiles}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Documents Uploaded
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg sm:text-xl">
                  {stats.totalTasks > 0
                    ? Math.round(
                        (stats.completedTasks / stats.totalTasks) * 100
                      )
                    : 0}
                  %
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Tasks Completed
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg sm:text-xl">
                  {stats.totalShortNotes}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Short Notes Created
                </p>
              </div>
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
