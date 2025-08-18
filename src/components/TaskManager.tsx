import React, { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  ArrowUpDown,
  Filter,
  Smartphone,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { Task } from "../types";
import { firestoreUserTasks } from "../utils/firestoreUserTasks";
import { realTimeAuth } from "../utils/realTimeAuth";
import { isAfter, startOfDay, isToday, isTomorrow } from "date-fns";
import SwipeableTaskItem from "./SwipeableTaskItem";
import { TaskCelebration } from "./TaskCelebration";
import { AchievementNotification } from "./AchievementNotification";
import { StreakDisplay } from "./StreakDisplay";
import { MotivationalToast } from "./MotivationalToast";
import { VibrationSettings } from "./VibrationSettings";
import { StreakTracker, Achievement, StreakData } from "../utils/streakTracker";
import { TaskFeedback } from "../utils/soundEffects";
import { VibrationManager } from "../utils/vibrationSettings";

export const TaskManager: React.FC = () => {
  const user = realTimeAuth.getCurrentUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<
    | "all"
    | "pending"
    | "completed"
    | "overdue"
    | "today"
    | "tomorrow"
    | "high-priority"
  >("all");
  const [sortBy, setSortBy] = useState<
    "smart" | "dueDate" | "priority" | "created" | "alphabetical"
  >("smart");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [celebrationTask, setCelebrationTask] = useState<Task | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(
    null
  );
  const [streakData, setStreakData] = useState<StreakData>(() =>
    StreakTracker.getStreakData(user?.id || "")
  );
  const [showMotivationalToast, setShowMotivationalToast] = useState(false);
  const [showVibrationSettings, setShowVibrationSettings] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">
          Please log in to access your tasks.
        </h2>
        <p className="text-gray-600 mb-6">
          Sign in to create, view, and manage your personal cloud tasks.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadTasks();
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setShowSortOptions(false);
        setShowFilterOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadTasks = async () => {
    try {
      const userTasks = await firestoreUserTasks.getTasks(user.id);
      setTasks(userTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const resetForm = () => {
    setTaskForm({
      title: "",
      description: "",
      subject: "",
      dueDate: "",
      priority: "medium",
    });
  };

  const handleAddTask = async () => {
    if (!taskForm.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (!taskForm.dueDate) {
      alert("Due Date is required.");
      return;
    }

    const newTask = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      subject: taskForm.subject.trim(),
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      status: "pending" as "pending" | "completed",
      createdAt: new Date().toISOString(),
    };

    try {
      await firestoreUserTasks.addTask(user.id, newTask);
      resetForm();
      setShowAddTask(false);
      await loadTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  const handleEditTask = async () => {
    if (!editingTask) return;

    if (!taskForm.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (!taskForm.dueDate) {
      alert("Due Date is required.");
      return;
    }

    const updates = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      subject: taskForm.subject.trim(),
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
    };

    try {
      await firestoreUserTasks.updateTask(user.id, editingTask.id, updates);
      setEditingTask(null);
      resetForm();
      await loadTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";

      await firestoreUserTasks.updateTask(user.id, task.id, {
        status: newStatus,
      });

      // If task is being completed, trigger celebration
      if (newStatus === "completed") {
        // Play completion feedback
        TaskFeedback.taskCompleted(task.priority);

        // Update streak and check achievements
        const { newAchievements, streakData: updatedStreakData } =
          StreakTracker.updateStreak(user.id, task);

        // Update streak data state
        setStreakData(updatedStreakData);

        // Show celebration
        setCelebrationTask(task);
        setShowCelebration(true);

        // Show achievement if any
        if (newAchievements.length > 0) {
          // Trigger special achievement feedback
          TaskFeedback.achievement();

          // Show the first new achievement
          setTimeout(() => {
            setNewAchievement(newAchievements[0]);
          }, 2500); // Show after celebration
        }

        // Check for streak milestones and trigger special feedback
        if (
          updatedStreakData.currentStreak > 0 &&
          updatedStreakData.currentStreak % 7 === 0
        ) {
          // Weekly streak milestone - extra celebration
          setTimeout(() => {
            TaskFeedback.streakMilestone();
          }, 1000);
        }

        // Show motivational toast after celebration
        setTimeout(() => {
          setShowMotivationalToast(true);
        }, 3000);
      } else {
        // Task uncompleted - play undo feedback
        TaskFeedback.taskUndone();
      }

      await loadTasks();
    } catch (error) {
      console.error("Error toggling task status:", error);
      alert("Failed to update task status. Please try again.");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await firestoreUserTasks.deleteTask(user.id, taskId);
      await loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      subject: task.subject,
      dueDate: task.dueDate,
      priority: task.priority,
    });
  };

  const isOverdue = (task: Task) => {
    if (task.status === "completed") return false;
    return isAfter(startOfDay(new Date()), startOfDay(new Date(task.dueDate)));
  };

  const sortTasks = (tasks: Task[]) => {
    const sortedTasks = [...tasks];

    switch (sortBy) {
      case "smart":
        return sortedTasks.sort((a, b) => {
          const aDate = new Date(a.dueDate);
          const bDate = new Date(b.dueDate);

          // 1. Pending before completed
          if (a.status !== b.status) {
            return a.status === "pending" ? -1 : 1;
          }

          // If both completed keep most recently created first (fallback behaviour)
          if (a.status === "completed" && b.status === "completed") {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }

          // Both pending -> apply new smart grouping
          const priorityOrder = { high: 3, medium: 2, low: 1 } as const;
          const group = (t: Task) => {
            const d = new Date(t.dueDate);
            if (isOverdue(t)) return 0; // Overdue
            if (isToday(d)) return 1; // Today
            if (isTomorrow(d)) return 2; // Tomorrow
            // Future (after tomorrow) grouped by priority sequence
            if (t.priority === "high") return 3; // Future High
            if (t.priority === "medium") return 4; // Future Medium
            return 5; // Future Low (or any other)
          };

          const aGroup = group(a);
          const bGroup = group(b);
          if (aGroup !== bGroup) return aGroup - bGroup;

          // Within same group rules
          if (aGroup === 0) {
            // Overdue
            // Earlier due date first (older overdue first) then priority
            const dateDiff = aDate.getTime() - bDate.getTime();
            if (dateDiff !== 0) return dateDiff;
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }

          if (aGroup === 1 || aGroup === 2) {
            // Today / Tomorrow
            // Higher priority first then earlier time
            const prDiff =
              priorityOrder[b.priority] - priorityOrder[a.priority];
            if (prDiff !== 0) return prDiff;
            return aDate.getTime() - bDate.getTime();
          }

          if (aGroup >= 3 && aGroup <= 5) {
            // Future grouped by priority segments
            // Already separated by priority: just earliest due date inside each segment
            return aDate.getTime() - bDate.getTime();
          }

          return 0; // Fallback
        });

      case "dueDate":
        return sortedTasks.sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );

      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sortedTasks.sort((a, b) => {
          const priorityDiff =
            priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

      case "created":
        return sortedTasks.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case "alphabetical":
        return sortedTasks.sort((a, b) => a.title.localeCompare(b.title));

      default:
        return sortedTasks;
    }
  };

  const getFilteredTasks = () => {
    let filteredTasks: Task[];

    switch (filter) {
      case "pending":
        filteredTasks = tasks.filter((task) => task.status === "pending");
        break;
      case "completed":
        filteredTasks = tasks.filter((task) => task.status === "completed");
        break;
      case "overdue":
        filteredTasks = tasks.filter((task) => isOverdue(task));
        break;
      case "today":
        filteredTasks = tasks.filter(
          (task) => task.status === "pending" && isToday(new Date(task.dueDate))
        );
        break;
      case "tomorrow":
        filteredTasks = tasks.filter(
          (task) =>
            task.status === "pending" && isTomorrow(new Date(task.dueDate))
        );
        break;
      case "high-priority":
        filteredTasks = tasks.filter(
          (task) => task.status === "pending" && task.priority === "high"
        );
        break;
      default:
        filteredTasks = tasks;
    }

    return sortTasks(filteredTasks);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusCounts = () => {
    return {
      all: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter((t) => isOverdue(t)).length,
      today: tasks.filter(
        (t) => t.status === "pending" && isToday(new Date(t.dueDate))
      ).length,
      tomorrow: tasks.filter(
        (t) => t.status === "pending" && isTomorrow(new Date(t.dueDate))
      ).length,
      "high-priority": tasks.filter(
        (t) => t.status === "pending" && t.priority === "high"
      ).length,
    };
  };

  const counts = getStatusCounts();
  const [showSwipeTip, setShowSwipeTip] = useState<boolean>(() => {
    try {
      return !localStorage.getItem("hideSwipeTip");
    } catch {
      return true;
    }
  });

  const dismissSwipeTip = () => {
    setShowSwipeTip(false);
    try {
      localStorage.setItem("hideSwipeTip", "1");
    } catch {}
  };

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              To-Do List
            </h2>
            <div className="overflow-x-auto">
              <StreakDisplay streakData={streakData} className="min-w-max" />
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Sort Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="flex items-center px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors text-sm"
              >
                <ArrowUpDown className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sort</span>
              </button>
              {showSortOptions && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    {[
                      { key: "smart", label: "Smart (Recommended)" },
                      { key: "dueDate", label: "Due Date" },
                      { key: "priority", label: "Priority" },
                      { key: "created", label: "Date Created" },
                      { key: "alphabetical", label: "Alphabetical" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => {
                          setSortBy(option.key as any);
                          setShowSortOptions(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          sortBy === option.key
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                className="flex items-center px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors text-sm"
              >
                <Filter className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              {showFilterOptions && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    {[
                      { key: "all", label: "All Tasks", count: counts.all },
                      { key: "today", label: "Due Today", count: counts.today },
                      {
                        key: "tomorrow",
                        label: "Due Tomorrow",
                        count: counts.tomorrow,
                      },
                      {
                        key: "high-priority",
                        label: "High Priority",
                        count: counts["high-priority"],
                      },
                      {
                        key: "pending",
                        label: "Pending",
                        count: counts.pending,
                      },
                      {
                        key: "completed",
                        label: "Completed",
                        count: counts.completed,
                      },
                      {
                        key: "overdue",
                        label: "Overdue",
                        count: counts.overdue,
                      },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => {
                          setFilter(option.key as any);
                          setShowFilterOptions(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                          filter === option.key
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        <span>{option.label}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            option.key === "overdue" && option.count > 0
                              ? "bg-red-100 text-red-600"
                              : option.key === "today" && option.count > 0
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {option.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vibration Settings Button (Mobile Only) */}
            {VibrationManager.isSupported() && (
              <button
                onClick={() => setShowVibrationSettings(true)}
                className="flex items-center px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors text-sm"
                title="Vibration Settings"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Add Task</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto scrollbar-hide">
          {[
            { key: "all", label: "All", count: counts.all },
            { key: "today", label: "Today", count: counts.today },
            { key: "tomorrow", label: "Tomorrow", count: counts.tomorrow },
            {
              key: "high-priority",
              label: "High Priority",
              count: counts["high-priority"],
            },
            { key: "pending", label: "Pending", count: counts.pending },
            { key: "overdue", label: "Overdue", count: counts.overdue },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-shrink-0 flex items-center justify-center px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  tab.key === "overdue" && tab.count > 0
                    ? "bg-red-100 text-red-600"
                    : tab.key === "today" && tab.count > 0
                    ? "bg-orange-100 text-orange-600"
                    : tab.key === "high-priority" && tab.count > 0
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {showSwipeTip && (
          <div className="mb-4 sm:mb-5 animate-fadeSlideIn relative">
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-[11px] sm:text-xs text-gray-600 italic">
              <ArrowLeftRight className="w-3.5 h-3.5 text-gray-400" />
              <span>Swipe right to complete, left to delete.</span>
              <button
                onClick={dismissSwipeTip}
                className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600"
                aria-label="Dismiss swipe tip"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        <div className="space-y-3 sm:space-y-4">
          {getFilteredTasks().map((task) => (
            <SwipeableTaskItem
              key={task.id}
              task={task}
              onToggleStatus={toggleTaskStatus}
              onEdit={startEditing}
              onDelete={deleteTask}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </div>

        {getFilteredTasks().length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {filter === "all"
                ? "No tasks yet"
                : filter === "today"
                ? "No tasks due today"
                : filter === "tomorrow"
                ? "No tasks due tomorrow"
                : filter === "high-priority"
                ? "No high priority tasks"
                : `No ${filter} tasks`}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto">
              {filter === "all"
                ? "Create your first task to get started with organized studying"
                : filter === "today"
                ? "Great! You have no tasks due today. Enjoy your free time!"
                : filter === "tomorrow"
                ? "No tasks scheduled for tomorrow yet."
                : filter === "high-priority"
                ? "No high priority tasks at the moment."
                : filter === "completed"
                ? "No completed tasks yet. Start working on your pending tasks!"
                : filter === "overdue"
                ? "Great! No overdue tasks. Keep up the good work!"
                : `You don't have any ${filter} tasks at the moment`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => setShowAddTask(true)}
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add Your First Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {(showAddTask || editingTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold">
                {editingTask ? "Edit Task" : "Add New Task"}
              </h3>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={taskForm.subject}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mathematics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  if (editingTask) {
                    setEditingTask(null);
                  } else {
                    setShowAddTask(false);
                  }
                  resetForm();
                }}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={editingTask ? handleEditTask : handleAddTask}
                disabled={!taskForm.title.trim() || !taskForm.dueDate}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {editingTask ? "Update" : "Add"} Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Celebration */}
      <TaskCelebration
        isVisible={showCelebration}
        taskTitle={celebrationTask?.title || ""}
        priority={celebrationTask?.priority || "medium"}
        onComplete={() => {
          setShowCelebration(false);
          setCelebrationTask(null);
        }}
      />

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />

      {/* Motivational Toast */}
      <MotivationalToast
        streakData={streakData}
        isVisible={showMotivationalToast}
        onClose={() => setShowMotivationalToast(false)}
      />

      {/* Vibration Settings */}
      <VibrationSettings
        isOpen={showVibrationSettings}
        onClose={() => setShowVibrationSettings(false)}
      />
    </div>
  );
};
