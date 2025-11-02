import React, { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  ArrowUpDown,
  Filter,
  Smartphone,
  ArrowLeftRight,
  X,
  Search,
} from "lucide-react";
import { Task } from "../../types";
import { firestoreUserTasks } from "../../utils/firestoreUserTasks";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { isAfter, startOfDay, isToday, isTomorrow } from "date-fns";
import SwipeableTaskItem from "./SwipeableTaskItem";
import { TaskCelebration } from "./TaskCelebration";
import { AchievementNotification } from "../notifications/AchievementNotification";
import { StreakDisplay } from "../StreakDisplay";
import { MotivationalToast } from "../notifications/MotivationalToast";
import { GeneralLayout } from "../layout/PageLayout";
import { VibrationSettings } from "../VibrationSettings";
import { StreakTracker, Achievement, StreakData } from "../../utils/streakTracker";
import { TaskFeedback } from "../../utils/soundEffects";
import { VibrationManager } from "../../utils/vibrationSettings";
import { TodoReminderButton } from "./TodoReminderButton";

export const TaskManager: React.FC = () => {
  const user = realTimeAuth.getCurrentUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  // Removed basic filter - only using advanced filters now
  const [sortBy, setSortBy] = useState<
    "smart" | "dueDate" | "priority" | "created" | "alphabetical"
  >("smart");
  const [showSortOptions, setShowSortOptions] = useState(false);
  // Removed showFilterOptions - not needed with advanced filters only
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({ startDate: "", endDate: "" });
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
    try {
      // Completed tasks are never overdue
      if (task.status === "completed") return false;

      // Check if dueDate is valid
      if (!task.dueDate || isNaN(new Date(task.dueDate).getTime())) {
        return false;
      }

      const taskDate = new Date(task.dueDate);
      const today = new Date();

      // Compare dates at start of day for accurate comparison
      const taskStartOfDay = startOfDay(taskDate);
      const todayStartOfDay = startOfDay(today);

      // Task is overdue if today is after the due date
      return isAfter(todayStartOfDay, taskStartOfDay);
    } catch (error) {
      console.error("Error checking if task is overdue:", error, task);
      return false;
    }
  };

  const sortTasks = (tasks: Task[]) => {
    try {
      const sortedTasks = [...tasks];

      switch (sortBy) {
        case "smart":
          return sortedTasks.sort((a, b) => {
            try {
              const aDate = new Date(a.dueDate);
              const bDate = new Date(b.dueDate);

              // Check for invalid dates
              if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) {
                return 0; // Keep original order for invalid dates
              }

              // 1. Pending before completed
              if (a.status !== b.status) {
                return a.status === "pending" ? -1 : 1;
              }

              // If both completed keep most recently created first (fallback behaviour)
              if (a.status === "completed" && b.status === "completed") {
                return (
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
                );
              }

              // Both pending -> apply new smart grouping
              const priorityOrder = { high: 3, medium: 2, low: 1 } as const;
              const group = (t: Task) => {
                try {
                  const d = new Date(t.dueDate);
                  if (isNaN(d.getTime())) return 6; // Invalid dates at the end
                  if (isOverdue(t)) return 0; // Overdue
                  if (isToday(d)) return 1; // Today
                  if (isTomorrow(d)) return 2; // Tomorrow
                  // Future (after tomorrow) grouped by priority sequence
                  if (t.priority === "high") return 3; // Future High
                  if (t.priority === "medium") return 4; // Future Medium
                  return 5; // Future Low (or any other)
                } catch (error) {
                  console.error("Error grouping task:", error, t);
                  return 6; // Error cases at the end
                }
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
            } catch (error) {
              console.error("Error in smart sort comparison:", error, { a, b });
              return 0; // Keep original order on error
            }
          });

        case "dueDate":
          return sortedTasks.sort((a, b) => {
            try {
              const aDate = new Date(a.dueDate);
              const bDate = new Date(b.dueDate);

              // Handle invalid dates
              if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
              if (isNaN(aDate.getTime())) return 1; // Invalid dates at the end
              if (isNaN(bDate.getTime())) return -1;

              return aDate.getTime() - bDate.getTime();
            } catch (error) {
              console.error("Error in dueDate sort:", error, { a, b });
              return 0;
            }
          });

        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return sortedTasks.sort((a, b) => {
            try {
              const priorityDiff =
                priorityOrder[b.priority] - priorityOrder[a.priority];
              if (priorityDiff !== 0) return priorityDiff;

              // Secondary sort by due date
              const aDate = new Date(a.dueDate);
              const bDate = new Date(b.dueDate);

              if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
              if (isNaN(aDate.getTime())) return 1;
              if (isNaN(bDate.getTime())) return -1;

              return aDate.getTime() - bDate.getTime();
            } catch (error) {
              console.error("Error in priority sort:", error, { a, b });
              return 0;
            }
          });

        case "created":
          return sortedTasks.sort((a, b) => {
            try {
              const aDate = new Date(a.createdAt);
              const bDate = new Date(b.createdAt);

              if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
              if (isNaN(aDate.getTime())) return 1;
              if (isNaN(bDate.getTime())) return -1;

              return bDate.getTime() - aDate.getTime();
            } catch (error) {
              console.error("Error in created sort:", error, { a, b });
              return 0;
            }
          });

        case "alphabetical":
          return sortedTasks.sort((a, b) => {
            try {
              return a.title.localeCompare(b.title);
            } catch (error) {
              console.error("Error in alphabetical sort:", error, { a, b });
              return 0;
            }
          });

        default:
          return sortedTasks;
      }
    } catch (error) {
      console.error("Error in sortTasks:", error);
      return tasks; // Return original order on error
    }
  };

  const getFilteredTasks = () => {
    try {
      // Start with all tasks
      let filteredTasks: Task[] = [...tasks];

      // Apply advanced filters

      // Subject filter (multiple selection)
      if (selectedSubjects.length > 0) {
        filteredTasks = filteredTasks.filter(
          (task) =>
            task.subject && selectedSubjects.includes(task.subject.trim())
        );
      }

      // Priority filter (multiple selection)
      if (selectedPriorities.length > 0) {
        filteredTasks = filteredTasks.filter((task) =>
          selectedPriorities.includes(task.priority)
        );
      }

      // Status filter (multiple selection)
      if (selectedStatuses.length > 0) {
        filteredTasks = filteredTasks.filter((task) =>
          selectedStatuses.includes(task.status)
        );
      }

      // Date range filter
      if (dateRange.startDate || dateRange.endDate) {
        filteredTasks = filteredTasks.filter((task) => {
          const taskDate = new Date(task.dueDate);
          if (isNaN(taskDate.getTime())) return false;

          const startDate = dateRange.startDate
            ? new Date(dateRange.startDate)
            : null;
          const endDate = dateRange.endDate
            ? new Date(dateRange.endDate)
            : null;

          if (startDate && endDate) {
            return taskDate >= startDate && taskDate <= endDate;
          } else if (startDate) {
            return taskDate >= startDate;
          } else if (endDate) {
            return taskDate <= endDate;
          }

          return true;
        });
      }

      // Then apply search filter if there's a search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredTasks = filteredTasks.filter((task) => {
          const titleMatch = task.title.toLowerCase().includes(query);
          const descriptionMatch = task.description
            .toLowerCase()
            .includes(query);
          const subjectMatch = task.subject.toLowerCase().includes(query);
          const priorityMatch = task.priority.toLowerCase().includes(query);
          const statusMatch = task.status.toLowerCase().includes(query);

          return (
            titleMatch ||
            descriptionMatch ||
            subjectMatch ||
            priorityMatch ||
            statusMatch
          );
        });
      }

      return sortTasks(filteredTasks);
    } catch (error) {
      console.error("Error filtering tasks:", error);
      // Return all tasks if filtering fails
      return sortTasks(tasks);
    }
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

  // Removed getStatusCounts - no longer needed with advanced filters only
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

  const clearAllFilters = () => {
    setSearchQuery("");
    setSortBy("smart");
    clearAdvancedFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (sortBy !== "smart") count++;
    if (selectedSubjects.length > 0) count++;
    if (selectedPriorities.length > 0) count++;
    if (selectedStatuses.length > 0) count++;
    if (dateRange.startDate || dateRange.endDate) count++;
    return count;
  };

  // Dynamic filter options
  const getAvailableSubjects = () => {
    const subjects = new Set<string>();
    tasks.forEach((task) => {
      if (task.subject && task.subject.trim()) {
        subjects.add(task.subject.trim());
      }
    });
    return Array.from(subjects).sort();
  };

  const getAvailablePriorities = () => {
    const priorities = new Set<string>();
    tasks.forEach((task) => {
      if (task.priority) {
        priorities.add(task.priority);
      }
    });
    return Array.from(priorities).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (
        priorityOrder[b as keyof typeof priorityOrder] -
        priorityOrder[a as keyof typeof priorityOrder]
      );
    });
  };

  const getAvailableStatuses = () => {
    const statuses = new Set<string>();
    tasks.forEach((task) => {
      if (task.status) {
        statuses.add(task.status);
      }
    });
    return Array.from(statuses).sort();
  };

  const toggleSubjectFilter = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const togglePriorityFilter = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearAdvancedFilters = () => {
    setSelectedSubjects([]);
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setDateRange({ startDate: "", endDate: "" });
  };

  return (
    <GeneralLayout>
      <div
        className="min-h-screen flex flex-col scroll-area transition-colors duration-300"
        data-component="tasks"
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 p-responsive">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-responsive-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                To-Do List
              </h2>
              <div className="overflow-x-auto scrollbar-hide">
                <StreakDisplay streakData={streakData} className="min-w-max" />
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 overflow-x-auto">
              {/* Sort Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  className="btn-touch flex items-center px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors text-sm touch-manipulation"
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

              {/* Advanced Filters Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center px-2 sm:px-3 py-2 border rounded-lg transition-colors text-sm ${
                    showAdvancedFilters
                      ? "bg-purple-50 text-purple-600 border-purple-200"
                      : "text-gray-600 hover:text-gray-900 border-gray-200"
                  }`}
                >
                  <Filter className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Advanced Filters</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>
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

              {/* Todo Reminder Button */}
              <TodoReminderButton
                userId={user?.id}
                userEmail={user?.email}
                variant="icon"
              />

              <button
                onClick={() => setShowAddTask(true)}
                className="btn-touch flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base touch-manipulation"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Add Task</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search tasks by title, description, subject, priority, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                showSearchBar
                  ? "bg-blue-50 text-blue-600 border-blue-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {showSearchBar ? "Hide" : "Search"}
            </button>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                showAdvancedFilters
                  ? "bg-purple-50 text-purple-600 border-purple-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Advanced Filters
            </button>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-sm border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-1"
                title={`Clear ${getActiveFiltersCount()} active filter${
                  getActiveFiltersCount() > 1 ? "s" : ""
                }`}
              >
                <X className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subjects ({selectedSubjects.length} selected)
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {getAvailableSubjects().map((subject) => (
                      <label
                        key={subject}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject)}
                          onChange={() => toggleSubjectFilter(subject)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                    {getAvailableSubjects().length === 0 && (
                      <span className="text-sm text-gray-500">
                        No subjects available
                      </span>
                    )}
                  </div>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorities ({selectedPriorities.length} selected)
                  </label>
                  <div className="space-y-1">
                    {getAvailablePriorities().map((priority) => (
                      <label
                        key={priority}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPriorities.includes(priority)}
                          onChange={() => togglePriorityFilter(priority)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span
                          className={`text-sm capitalize ${getPriorityColor(
                            priority
                          )}`}
                        >
                          {priority}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status ({selectedStatuses.length} selected)
                  </label>
                  <div className="space-y-1">
                    {getAvailableStatuses().map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => toggleStatusFilter(status)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span
                          className={`text-sm capitalize ${
                            status === "completed"
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="End Date"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Filters Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {getActiveFiltersCount() > 0 && (
                    <span>
                      {getActiveFiltersCount()} active filter
                      {getActiveFiltersCount() > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={clearAdvancedFilters}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Clear Advanced
                  </button>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="flex space-x-1 bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                Total: <strong className="text-gray-900">{tasks.length}</strong>
              </span>
              <span>
                Pending:{" "}
                <strong className="text-orange-600">
                  {tasks.filter((t) => t.status === "pending").length}
                </strong>
              </span>
              <span>
                Completed:{" "}
                <strong className="text-green-600">
                  {tasks.filter((t) => t.status === "completed").length}
                </strong>
              </span>
              <span>
                Overdue:{" "}
                <strong className="text-red-600">
                  {tasks.filter((t) => isOverdue(t)).length}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-auto scroll-area container-safe py-responsive">
          {/* Search Results Indicator */}
          {(searchQuery.trim() || getActiveFiltersCount() > 0) && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">
                    Active Filters & Search
                  </span>
                </div>
                <div className="text-sm text-blue-600">
                  {getFilteredTasks().length} of {tasks.length} tasks
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="flex flex-wrap gap-2 mb-2">
                {searchQuery.trim() && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    🔍 "{searchQuery}"
                  </span>
                )}
                {selectedSubjects.map((subject) => (
                  <span
                    key={subject}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                  >
                    📚 {subject}
                  </span>
                ))}
                {selectedPriorities.map((priority) => (
                  <span
                    key={priority}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800"
                  >
                    ⚡ {priority}
                  </span>
                ))}
                {selectedStatuses.map((status) => (
                  <span
                    key={status}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                  >
                    📋 {status}
                  </span>
                ))}
                {(dateRange.startDate || dateRange.endDate) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    📅 {dateRange.startDate || "Any"} -{" "}
                    {dateRange.endDate || "Any"}
                  </span>
                )}
              </div>

              {getFilteredTasks().length === 0 && (
                <p className="text-xs text-blue-600">
                  Try adjusting your search terms or filters
                </p>
              )}
            </div>
          )}

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
                {tasks.length === 0
                  ? "No tasks yet"
                  : "No tasks match your current filters"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto">
                {tasks.length === 0
                  ? "Create your first task to get started with organized studying"
                  : "Try adjusting your search terms or clearing some filters to see more tasks"}
              </p>
              {tasks.length === 0 && (
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto scroll-area">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingTask ? "Edit Task" : "Add New Task"}
                </h3>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
    </GeneralLayout>
  );
};
