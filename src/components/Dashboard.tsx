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
    if (urgent) {
      return "bg-red-50 text-red-600 border border-red-200";
    }
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="bg-gray-50 h-full overflow-auto" data-component="dashboard">
      {/* Simplified Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-sm text-gray-600">
            Here's an overview of your study progress and recent activity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Simplified Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <button
                key={index}
                onClick={stat.action}
                className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${getColorClasses(stat.color, stat.urgent)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Simplified Overdue Alert */}
        {stats.overdueTasks > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-red-600" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    {stats.overdueTasks} overdue task{stats.overdueTasks > 1 ? "s" : ""}
                  </h3>
                  <p className="text-xs text-red-600">Review them to stay on track</p>
                </div>
              </div>
              <button
                onClick={() => onViewChange("tasks")}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                View Tasks
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Simplified Quick Actions */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-base font-medium text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => onViewChange("files")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Files</span>
                </button>
                <button
                  onClick={() => onViewChange("tasks")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
                <button
                  onClick={() => onViewChange("notes")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  <StickyNote className="w-4 h-4" />
                  <span>Create Note</span>
                </button>
                <button
                  onClick={() => onViewChange("chat")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simplified Upcoming Tasks */}
          <div className="xl:col-span-2 order-1 xl:order-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-gray-900">
                  Upcoming Tasks
                </h2>
                <button
                  onClick={() => onViewChange("tasks")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>

              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No upcoming tasks</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You're all caught up! Create new tasks to stay organized.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
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
                        className={`flex items-center gap-3 p-3 rounded border ${
                          isTaskOverdue
                            ? "bg-red-50 border-red-200"
                            : isTaskToday
                            ? "bg-orange-50 border-orange-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            task.priority === "high"
                              ? "bg-red-500"
                              : task.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="truncate">{task.subject}</span>
                            <span>•</span>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simplified Study Progress */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-base font-medium text-gray-900 mb-4">
            Study Progress
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-gray-100 w-12 h-12 rounded flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-lg">{stats.totalFiles}</h3>
              <p className="text-xs text-gray-600">Files</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 w-12 h-12 rounded flex items-center justify-center mx-auto mb-2">
                <CheckSquare className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-lg">
                {stats.totalTasks > 0
                  ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                  : 0}%
              </h3>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 w-12 h-12 rounded flex items-center justify-center mx-auto mb-2">
                <StickyNote className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-lg">{stats.totalShortNotes}</h3>
              <p className="text-xs text-gray-600">Notes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
