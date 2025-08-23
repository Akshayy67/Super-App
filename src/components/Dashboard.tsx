import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { storageUtils } from "../utils/storage"; // still used for short notes
import { driveStorageUtils } from "../utils/driveStorage"; // for accurate file count (Drive or local fallback)
import { firestoreUserTasks } from "../utils/firestoreUserTasks";
import { realTimeAuth } from "../utils/realTimeAuth";
import { format, isAfter, startOfDay, isToday, isTomorrow } from "date-fns";
import { Task } from "../types";

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
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
      action: () => onViewChange("tasks"),
      urgent: stats.todayTasks > 0,
    },
    {
      title: "Due Tomorrow",
      value: stats.tomorrowTasks,
      icon: Clock,
      color: "blue",
      action: () => onViewChange("tasks"),
    },
    {
      title: "High Priority",
      value: stats.highPriorityTasks,
      icon: AlertTriangle,
      color: "red",
      action: () => onViewChange("tasks"),
      urgent: stats.highPriorityTasks > 0,
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: TrendingUp,
      color: "green",
      action: () => onViewChange("tasks"),
    },
  ];

  const getColorClasses = (color: string, urgent?: boolean) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      yellow: "bg-yellow-100 text-yellow-600",
      orange: urgent
        ? "bg-orange-100 text-orange-600"
        : "bg-orange-50 text-orange-500",
      red: urgent ? "bg-red-100 text-red-600" : "bg-red-50 text-red-500",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div
      className="bg-gray-50 h-full overflow-auto scroll-area"
      data-component="dashboard"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-responsive">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-responsive-xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-responsive-sm text-gray-600">
            Here's an overview of your study progress and recent activity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto container-safe py-responsive">
        {/* Stats Grid - Enhanced for all screen sizes */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <button
                key={index}
                onClick={stat.action}
                className="card-responsive text-left touch-manipulation"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                      {stat.title}
                    </p>
                    <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${getColorClasses(
                      stat.color,
                      stat.urgent
                    )}`}
                  >
                    <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Overdue Tasks Alert - Enhanced mobile layout */}
        {stats.overdueTasks > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center">
              <div className="flex items-start sm:items-center flex-1">
                <div className="bg-red-100 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-medium text-red-800">
                    {stats.overdueTasks} overdue task
                    {stats.overdueTasks > 1 ? "s" : ""}
                  </h3>
                  <p className="text-xs sm:text-sm text-red-600 mt-1">
                    You have tasks that are past their due date. Review them to
                    stay on track.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onViewChange("tasks")}
                className="btn-touch px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium self-start sm:self-auto"
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
              <h2 className="text-responsive-base font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-1 gap-3">
                <button
                  onClick={() => onViewChange("files")}
                  className="w-full flex items-center px-3 sm:px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm btn-touch"
                >
                  <Upload className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">Upload New Files</span>
                </button>
                <button
                  onClick={() => onViewChange("tasks")}
                  className="w-full flex items-center px-3 sm:px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm btn-touch"
                >
                  <CheckSquare className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">Add New Task</span>
                </button>
                <button
                  onClick={() => onViewChange("notes")}
                  className="w-full flex items-center px-3 sm:px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm btn-touch"
                >
                  <StickyNote className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">Create Note</span>
                </button>
                <button
                  onClick={() => onViewChange("chat")}
                  className="w-full flex items-center px-3 sm:px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm btn-touch"
                >
                  <Brain className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">Ask AI Assistant</span>
                </button>
                <button
                  onClick={() => onViewChange("team")}
                  className="w-full flex items-center px-3 sm:px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm btn-touch"
                >
                  <Users className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">Team Space</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks - Enhanced mobile-first design */}
          <div className="xl:col-span-2 order-1 xl:order-2">
            <div className="card-responsive">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-responsive-base font-semibold text-gray-900">
                  Upcoming Tasks
                </h2>
                <button
                  onClick={() => onViewChange("tasks")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium btn-touch"
                >
                  View All
                </button>
              </div>

              {upcomingTasks.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <CheckSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-responsive-sm">
                    No upcoming tasks
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
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
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mt-1">
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
          <h2 className="text-responsive-base font-semibold text-gray-900 mb-4 sm:mb-6">
            Study Progress
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-lg sm:text-xl">
                {stats.totalFiles}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Documents Uploaded
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-lg sm:text-xl">
                {stats.totalTasks > 0
                  ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                  : 0}
                %
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Tasks Completed
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-lg sm:text-xl">
                {stats.totalShortNotes}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Short Notes Created
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
