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
} from "lucide-react";
import { storageUtils } from "../utils/storage";
import { realTimeAuth } from "../utils/realTimeAuth";
import { format, isAfter, startOfDay } from "date-fns";

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalNotes: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = () => {
    if (!user) return;

    const files = storageUtils.getFiles(user.id);
    const tasks = storageUtils.getTasks(user.id);
    const notes = storageUtils.getNotes(user.id);

    const overdueTasks = tasks.filter(
      (task) =>
        task.status === "pending" &&
        isAfter(startOfDay(new Date()), startOfDay(new Date(task.dueDate)))
    );

    setStats({
      totalFiles: files.filter((f) => f.type === "file").length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      overdueTasks: overdueTasks.length,
      totalNotes: notes.length,
    });

    // Generate recent activity
    const activity = [
      ...files.slice(-3).map((file) => ({
        type: "file",
        title: `Uploaded ${file.name}`,
        timestamp: file.uploadedAt,
        icon: FileText,
      })),
      ...tasks.slice(-3).map((task) => ({
        type: "task",
        title: `${
          task.status === "completed" ? "Completed" : "Created"
        } task: ${task.title}`,
        timestamp: task.createdAt,
        icon: CheckSquare,
      })),
      ...notes.slice(-3).map((note) => ({
        type: "note",
        title: `Created note: ${note.title}`,
        timestamp: note.createdAt,
        icon: StickyNote,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5);

    setRecentActivity(activity);
  };

  const statCards = [
    {
      title: "Total Files",
      value: stats.totalFiles,
      icon: FileText,
      color: "blue",
      action: () => onViewChange("files"),
    },
    {
      title: "Active Tasks",
      value: stats.totalTasks - stats.completedTasks,
      icon: CheckSquare,
      color: "green",
      action: () => onViewChange("tasks"),
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: TrendingUp,
      color: "purple",
      action: () => onViewChange("tasks"),
    },
    {
      title: "Notes Created",
      value: stats.totalNotes,
      icon: StickyNote,
      color: "yellow",
      action: () => onViewChange("notes"),
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      yellow: "bg-yellow-100 text-yellow-600",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-gray-50 h-full overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Here's an overview of your study progress and recent activity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <button
                key={index}
                onClick={stat.action}
                className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${getColorClasses(
                      stat.color
                    )}`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Overdue Tasks Alert */}
        {stats.overdueTasks > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex items-center mb-3 sm:mb-0 sm:mr-3">
                <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    {stats.overdueTasks} overdue task
                    {stats.overdueTasks > 1 ? "s" : ""}
                  </h3>
                  <p className="text-sm text-red-600">
                    You have tasks that are past their due date. Review them to
                    stay on track.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onViewChange("tasks")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                View Tasks
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => onViewChange("files")}
                  className="w-full flex items-center px-3 sm:px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  <Upload className="w-5 h-5 mr-3 flex-shrink-0" />
                  Upload New Files
                </button>
                <button
                  onClick={() => onViewChange("tasks")}
                  className="w-full flex items-center px-3 sm:px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                >
                  <CheckSquare className="w-5 h-5 mr-3 flex-shrink-0" />
                  Add New Task
                </button>
                <button
                  onClick={() => onViewChange("notes")}
                  className="w-full flex items-center px-3 sm:px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                >
                  <StickyNote className="w-5 h-5 mr-3 flex-shrink-0" />
                  Create Note
                </button>
                <button
                  onClick={() => onViewChange("chat")}
                  className="w-full flex items-center px-3 sm:px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm"
                >
                  <Brain className="w-5 h-5 mr-3 flex-shrink-0" />
                  Ask AI Assistant
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>

              {recentActivity.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    No recent activity
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Start by uploading files or creating tasks to see your
                    activity here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="bg-gray-100 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(
                              new Date(activity.timestamp),
                              "MMM dd, yyyy • h:mm a"
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Study Progress */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Study Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">{stats.totalFiles}</h3>
              <p className="text-sm text-gray-600">Documents Uploaded</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">
                {stats.totalTasks > 0
                  ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                  : 0}
                %
              </h3>
              <p className="text-sm text-gray-600">Tasks Completed</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">{stats.totalNotes}</h3>
              <p className="text-sm text-gray-600">Notes Created</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
