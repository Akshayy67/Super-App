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
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Clock,
  Lightbulb,
  Target,
  Link2,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Task } from "../../types";
import { firestoreUserTasks } from "../../utils/firestoreUserTasks";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { calendarService } from "../../utils/calendarService";
import { isAfter, startOfDay, isToday, isTomorrow, format, isSameDay, parseISO } from "date-fns";
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
import { MonthlyCompletionTracker } from "../../utils/monthlyCompletionTracker";
import { TodoReminderButton } from "./TodoReminderButton";
import { DopamineSpikeCelebration } from "../ui/DopamineSpikeCelebration";
import { todoDayDetailsService, DayDetails } from "../../utils/todoDayDetailsService";
import { unifiedAIService } from "../../utils/aiConfig";

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
  const [showThreeJSEffect, setShowThreeJSEffect] = useState(false);
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
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "completed">("today");
  
  // Load saved plan from localStorage on mount
  const [todayPlanDetails, setTodayPlanDetails] = useState<DayDetails | null>(() => {
    if (typeof window !== "undefined" && user?.id) {
      const saved = localStorage.getItem(`todayPlanDetails_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Check if plan is for today (not stale)
          const planDate = parsed.generatedAt ? new Date(parsed.generatedAt) : null;
          if (planDate && isToday(planDate)) {
            return parsed;
          } else {
            // Plan is stale, remove it
            localStorage.removeItem(`todayPlan_${user.id}`);
            localStorage.removeItem(`todayPlanDetails_${user.id}`);
          }
        } catch (e) {
          console.error("Error parsing saved plan:", e);
          localStorage.removeItem(`todayPlan_${user.id}`);
          localStorage.removeItem(`todayPlanDetails_${user.id}`);
        }
      }
    }
    return null;
  });
  
  const [showTodayPlan, setShowTodayPlan] = useState(() => {
    // Load visibility state from localStorage
    if (typeof window !== "undefined" && user?.id) {
      const saved = localStorage.getItem(`todayPlan_${user.id}`);
      return saved === "true";
    }
    // Show plan if we have valid details (default to showing if plan exists)
    return todayPlanDetails !== null;
  });
  
  const [loadingTodayPlan, setLoadingTodayPlan] = useState(false);
  
  // Load task suggestions from localStorage (will be cleaned up after tasks load)
  const [taskSuggestions, setTaskSuggestions] = useState<Map<string, any>>(() => {
    if (typeof window !== "undefined" && user?.id) {
      const saved = localStorage.getItem(`taskSuggestions_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const map = new Map();
          Object.entries(parsed).forEach(([taskId, suggestions]: [string, any]) => {
            map.set(taskId, suggestions);
          });
          return map;
        } catch (e) {
          console.error("Error parsing saved task suggestions:", e);
        }
      }
    }
    return new Map();
  });
  
  const [loadingSuggestions, setLoadingSuggestions] = useState<Set<string>>(new Set());
  const [showSuggestionsModal, setShowSuggestionsModal] = useState<string | null>(null);
  
  // Save task suggestions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && user?.id && taskSuggestions.size > 0) {
      const obj = Object.fromEntries(taskSuggestions);
      localStorage.setItem(`taskSuggestions_${user.id}`, JSON.stringify(obj));
    }
  }, [taskSuggestions, user?.id]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-300">
          Please log in to access your tasks.
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sign in to create, view, and manage your personal cloud tasks.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadTasks();
  }, [user]);

  // Check if saved plan is still valid (for today) when tasks change or day changes
  useEffect(() => {
    if (user?.id && todayPlanDetails) {
      const planDate = todayPlanDetails.generatedAt ? new Date(todayPlanDetails.generatedAt) : null;
      if (planDate && !isToday(planDate)) {
        // Plan is stale (not for today), clear it
        setShowTodayPlan(false);
        setTodayPlanDetails(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(`todayPlan_${user.id}`);
          localStorage.removeItem(`todayPlanDetails_${user.id}`);
        }
      }
    }
  }, [tasks, user, todayPlanDetails]);

  // Periodic check to clean up daily plan when day changes (runs every minute)
  useEffect(() => {
    if (!user?.id) return;
    
    const checkDayChange = () => {
      if (todayPlanDetails) {
        const planDate = todayPlanDetails.generatedAt ? new Date(todayPlanDetails.generatedAt) : null;
        if (planDate && !isToday(planDate)) {
          // Day has changed, clear the plan
          setShowTodayPlan(false);
          setTodayPlanDetails(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem(`todayPlan_${user.id}`);
            localStorage.removeItem(`todayPlanDetails_${user.id}`);
          }
        }
      }
    };
    
    // Check immediately
    checkDayChange();
    
    // Check every minute
    const interval = setInterval(checkDayChange, 60000);
    
    return () => clearInterval(interval);
  }, [user?.id, todayPlanDetails]);

  // Clean up completed task suggestions and invalid task suggestions
  useEffect(() => {
    if (user?.id && tasks.length > 0) {
      setTaskSuggestions(prev => {
        const newMap = new Map(prev);
        let changed = false;
        
        // Remove suggestions for tasks that don't exist or are completed
        newMap.forEach((_, taskId) => {
          const task = tasks.find(t => t.id === taskId);
          if (!task || task.status === "completed") {
            newMap.delete(taskId);
            changed = true;
          }
        });
        
        if (changed) {
          // Update localStorage
          if (typeof window !== "undefined") {
            if (newMap.size > 0) {
              const obj = Object.fromEntries(newMap);
              localStorage.setItem(`taskSuggestions_${user.id}`, JSON.stringify(obj));
            } else {
              localStorage.removeItem(`taskSuggestions_${user.id}`);
            }
          }
        }
        
        return newMap;
      });
    }
  }, [tasks, user?.id]);

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
      // Sync to calendar after adding task
      try {
        await calendarService.syncTodosToCalendar(user.id);
      } catch (syncError) {
        console.error("Error syncing to calendar:", syncError);
        // Don't fail the task creation if calendar sync fails
      }
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
      // Sync to calendar after updating task
      try {
        await calendarService.syncTodosToCalendar(user.id);
      } catch (syncError) {
        console.error("Error syncing to calendar:", syncError);
        // Don't fail the task update if calendar sync fails
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";

      // If task is being completed, trigger celebration IMMEDIATELY (before async operations)
      if (newStatus === "completed") {
        // Play completion feedback immediately
        TaskFeedback.taskCompleted(task.priority);

        // Show celebration immediately
        setCelebrationTask(task);
        setShowCelebration(true);
        
        // Trigger Three.js celebration effect immediately
        setShowThreeJSEffect(true);

        // Update streak and check achievements (synchronous operations)
        const { newAchievements, streakData: updatedStreakData } =
          StreakTracker.updateStreak(user.id, task);

        // Update monthly completion tracker (synchronous)
        MonthlyCompletionTracker.incrementCompletion(user.id);

        // Update streak data state
        setStreakData(updatedStreakData);

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

      // Update task status (async operation - happens after celebration starts)
      await firestoreUserTasks.updateTask(user.id, task.id, {
        status: newStatus,
      });

      // Sync to calendar after status change (completed todos should be removed from calendar)
      try {
        await calendarService.syncTodosToCalendar(user.id);
      } catch (syncError) {
        console.error("Error syncing to calendar:", syncError);
        // Don't fail the status change if calendar sync fails
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
      // Sync to calendar after deleting task (removes calendar event)
      try {
        await calendarService.syncTodosToCalendar(user.id);
      } catch (syncError) {
        console.error("Error syncing to calendar:", syncError);
        // Don't fail the task deletion if calendar sync fails
      }
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
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30";
      case "low":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900";
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

  // Group tasks into organized sections
  interface GroupedTasks {
    overdue: Task[];
    today: Task[];
    tomorrow: Task[];
    upcoming: Task[];
    completed: Task[];
  }

  const groupTasks = (tasks: Task[]): GroupedTasks => {
    const grouped: GroupedTasks = {
      overdue: [],
      today: [],
      tomorrow: [],
      upcoming: [],
      completed: [],
    };

    tasks.forEach((task) => {
      if (task.status === "completed") {
        grouped.completed.push(task);
      } else {
        const taskDate = new Date(task.dueDate);
        if (isNaN(taskDate.getTime())) {
          grouped.upcoming.push(task);
        } else if (isOverdue(task)) {
          grouped.overdue.push(task);
        } else if (isToday(taskDate)) {
          grouped.today.push(task);
        } else if (isTomorrow(taskDate)) {
          grouped.tomorrow.push(task);
        } else {
          grouped.upcoming.push(task);
        }
      }
    });

    return grouped;
  };

  const generateTodayPlan = async () => {
    if (!user) return;
    
    const filteredTasks = getFilteredTasks();
    const grouped = groupTasks(filteredTasks);
    const todayTasks = grouped.today.filter(task => task.status !== "completed");
    
    if (todayTasks.length === 0) {
      alert("No tasks for today to generate a plan!");
      return;
    }
    
    setLoadingTodayPlan(true);
    setShowTodayPlan(true);
    
    // Save show state to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(`todayPlan_${user.id}`, "true");
    }
    
    try {
      const today = new Date();
      const details = await todoDayDetailsService.generateDayDetails(today, todayTasks);
      setTodayPlanDetails(details);
      
      // Save plan details to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(`todayPlanDetails_${user.id}`, JSON.stringify(details));
      }
    } catch (error) {
      console.error("Error generating today plan:", error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoadingTodayPlan(false);
    }
  };

  const generateTaskSuggestions = async (task: Task) => {
    if (!user || task.status === "completed") return;
    
    const taskId = task.id;
    
    // Check if already loaded
    if (taskSuggestions.has(taskId)) {
      setShowSuggestionsModal(taskId);
      return;
    }
    
    setLoadingSuggestions(prev => new Set(prev).add(taskId));
    setShowSuggestionsModal(taskId);
    
    try {
      // Generate suggestions for a single task
      const prompt = `You are a productivity expert. Provide helpful suggestions for completing this specific task.

Task: ${task.title}
${task.description ? `Description: ${task.description}` : ''}
${task.subject ? `Subject: ${task.subject}` : ''}
Priority: ${task.priority}
Due Date: ${new Date(task.dueDate).toLocaleDateString()}

Provide:
1. **Step-by-step approach** - Break down the task into 3-5 actionable steps
2. **Tips for success** - 3-4 practical tips specific to this task
3. **Common pitfalls to avoid** - 2-3 things to watch out for
4. **Estimated time** - How long this task might take
5. **Motivation** - A brief encouraging message

Return JSON format:
{
  "steps": ["Step 1", "Step 2", ...],
  "tips": ["Tip 1", "Tip 2", ...],
  "pitfalls": ["Pitfall 1", "Pitfall 2", ...],
  "estimatedTime": "X minutes/hours",
  "motivation": "Motivational message"
}

Return ONLY the JSON object, no additional text.`;

      const response = await unifiedAIService.generateResponse(prompt, "");
      
      if (response.success && response.data) {
        const jsonMatch = response.data.match(/```json\n?([\s\S]*?)\n?```/) || 
                         response.data.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const parsed = JSON.parse(jsonStr);
          
          const suggestions = {
            steps: parsed.steps || [],
            tips: parsed.tips || [],
            pitfalls: parsed.pitfalls || [],
            estimatedTime: parsed.estimatedTime || "30-60 minutes",
            motivation: parsed.motivation || "You've got this!",
            generatedAt: new Date(),
          };
          
          setTaskSuggestions(prev => {
            const newMap = new Map(prev);
            newMap.set(taskId, suggestions);
            // Save to localStorage immediately
            if (typeof window !== "undefined" && user?.id) {
              const obj = Object.fromEntries(newMap);
              localStorage.setItem(`taskSuggestions_${user.id}`, JSON.stringify(obj));
            }
            return newMap;
          });
        } else {
          throw new Error("Failed to parse AI response");
        }
      } else {
        throw new Error(response.error || "Failed to generate suggestions");
      }
    } catch (error) {
      console.error("Error generating task suggestions:", error);
      alert("Failed to generate suggestions. Please try again.");
      setShowSuggestionsModal(null);
    } finally {
      setLoadingSuggestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const isSectionCollapsed = (sectionId: string) => {
    return collapsedSections.has(sectionId);
  };

  const renderTaskSection = (
    title: string,
    sectionId: string,
    tasks: Task[],
    icon: React.ReactNode,
    headerColor: string,
    bgColor: string,
    borderColor: string
  ) => {
    if (tasks.length === 0) return null;

    const isCollapsed = isSectionCollapsed(sectionId);

    return (
      <div className="mb-5 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleSection(sectionId)}
          className={`w-full flex items-center justify-between p-4 sm:p-5 ${headerColor} transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className={`p-2 sm:p-2.5 rounded-lg ${bgColor} flex-shrink-0 shadow-sm`}>
              {icon}
            </div>
            <div className="text-left flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} in this section
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ml-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${bgColor} text-gray-800 dark:text-gray-200 shadow-sm border ${borderColor}`}>
              {tasks.length}
            </span>
            <div className="p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-sm">
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              )}
            </div>
          </div>
        </button>
        {!isCollapsed && (
          <div className={`${bgColor} border-t ${borderColor} p-4 sm:p-5 space-y-3 sm:space-y-4`}>
            {tasks.map((task) => (
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
        )}
      </div>
    );
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
                  className="btn-touch flex items-center px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors text-sm touch-manipulation"
                >
                  <ArrowUpDown className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sort</span>
                </button>
                {showSortOptions && (
                  <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
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
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 ${
                            sortBy === option.key
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300"
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
                      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 border-gray-200 dark:border-gray-700"
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
                  className="flex items-center px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors text-sm"
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
                className="btn-touch flex items-center justify-center px-4 sm:px-4 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-base sm:text-base font-semibold shadow-sm hover:shadow-md touch-manipulation min-w-[120px] sm:min-w-auto"
              >
                <Plus className="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-2" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Tabs for Today, Upcoming, Completed */}
          {(() => {
            const filteredTasks = getFilteredTasks();
            const grouped = groupTasks(filteredTasks);
            return (
              <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
                <div className="tabs-mobile flex-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-1 sm:p-1.5">
                  <button
                    onClick={() => setActiveTab("today")}
                    className={`tab-mobile btn-touch flex items-center justify-center gap-2 w-full sm:w-auto ${
                      activeTab === "today" ? "active" : ""
                    } ${
                      activeTab === "today"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-semibold">
                      Today
                    </span>
                    {grouped.today.length > 0 && (
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        activeTab === "today"
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                      }`}>
                        {grouped.today.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`tab-mobile btn-touch flex items-center justify-center gap-2 w-full sm:w-auto ${
                      activeTab === "upcoming" ? "active" : ""
                    } ${
                      activeTab === "upcoming"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-semibold">
                      Upcoming
                    </span>
                    {grouped.upcoming.length > 0 && (
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        activeTab === "upcoming"
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                      }`}>
                        {grouped.upcoming.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`tab-mobile btn-touch flex items-center justify-center gap-2 w-full sm:w-auto ${
                      activeTab === "completed" ? "active" : ""
                    } ${
                      activeTab === "completed"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-semibold">
                      Completed
                    </span>
                    {grouped.completed.length > 0 && (
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        activeTab === "completed"
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                      }`}>
                        {grouped.completed.length}
                      </span>
                    )}
                  </button>
                </div>
                
                {/* Get Detailed Plan Button - Only show for Today tab */}
                {activeTab === "today" && grouped.today.filter(t => t.status !== "completed").length > 0 && (
                  <button
                    onClick={generateTodayPlan}
                    disabled={loadingTodayPlan}
                    className="btn-touch flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingTodayPlan ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Get Detailed Plan for Today</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })()}

          {/* Search Bar - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 sm:py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base sm:text-sm touch-manipulation"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 sm:w-4 sm:h-4" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors p-1 touch-manipulation"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`btn-touch px-4 sm:px-3 py-3 sm:py-2 text-sm sm:text-sm border rounded-lg transition-colors font-medium ${
                  showAdvancedFilters
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Filter className="w-4 h-4 sm:mr-1 sm:inline" />
                <span className="sm:inline">Filters</span>
              </button>
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="btn-touch px-4 sm:px-3 py-3 sm:py-2 text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center space-x-1 font-medium"
                  title={`Clear ${getActiveFiltersCount()} active filter${
                    getActiveFiltersCount() > 1 ? "s" : ""
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg">
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
                        <span className="text-sm text-gray-700 dark:text-gray-300">{subject}</span>
                      </label>
                    ))}
                    {getAvailableSubjects().length === 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        No subjects available
                      </span>
                    )}
                  </div>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-base sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Priorities ({selectedPriorities.length} selected)
                  </label>
                  <div className="space-y-2 sm:space-y-1">
                    {getAvailablePriorities().map((priority) => (
                      <label
                        key={priority}
                        className="flex items-center space-x-3 cursor-pointer py-1.5 sm:py-0.5 touch-manipulation"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPriorities.includes(priority)}
                          onChange={() => togglePriorityFilter(priority)}
                          className="w-5 h-5 sm:w-4 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span
                          className={`text-base sm:text-sm capitalize ${getPriorityColor(
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
                  <label className="block text-base sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Status ({selectedStatuses.length} selected)
                  </label>
                  <div className="space-y-2 sm:space-y-1">
                    {getAvailableStatuses().map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-3 cursor-pointer py-1.5 sm:py-0.5 touch-manipulation"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => toggleStatusFilter(status)}
                          className="w-5 h-5 sm:w-4 sm:h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 focus:ring-2"
                        />
                        <span
                          className={`text-base sm:text-sm capitalize ${
                            status === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : "text-orange-600 dark:text-orange-400"
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
                  <label className="block text-base sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Date Range
                  </label>
                  <div className="space-y-3 sm:space-y-2">
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 sm:px-2 py-3 sm:py-1.5 text-base sm:text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
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
                      className="w-full px-3 sm:px-2 py-3 sm:py-1.5 text-base sm:text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                      placeholder="End Date"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Filters Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
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
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
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

          {/* Quick Stats - Mobile Optimized */}
          <div className="bg-gray-100 dark:bg-gray-900 p-3 sm:p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total</div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-300">{tasks.length}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</div>
                <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                  {tasks.filter((t) => t.status === "pending").length}
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</div>
                <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                  {tasks.filter((t) => t.status === "completed").length}
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Overdue</div>
                <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                  {tasks.filter((t) => isOverdue(t)).length}
                </div>
              </div>
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
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Try adjusting your search terms or filters
                </p>
              )}
            </div>
          )}

          {showSwipeTip && (
            <div className="mb-4 sm:mb-5 animate-fadeSlideIn relative">
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 italic">
                <ArrowLeftRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span>Swipe right to complete, left to delete.</span>
                <button
                  onClick={dismissSwipeTip}
                  className="absolute top-1 right-1 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                  aria-label="Dismiss swipe tip"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Organized Task Sections */}
          {(() => {
            const filteredTasks = getFilteredTasks();
            const grouped = groupTasks(filteredTasks);
            const hasAnyTasks = Object.values(grouped).some((tasks) => tasks.length > 0);

            if (!hasAnyTasks) {
              return null;
            }

            return (
              <div className="space-y-4">
                {/* Overdue Section - Always show */}
                {renderTaskSection(
                  "⚠️ Overdue",
                  "overdue",
                  grouped.overdue,
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />,
                  "bg-red-50 dark:bg-red-900/20",
                  "bg-red-50/50 dark:bg-red-900/10",
                  "border-red-300 dark:border-red-700"
                )}

                {/* Tomorrow Section - Always show */}
                {renderTaskSection(
                  "⏰ Tomorrow",
                  "tomorrow",
                  grouped.tomorrow,
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
                  "bg-blue-50 dark:bg-blue-900/20",
                  "bg-blue-50/50 dark:bg-blue-900/10",
                  "border-blue-300 dark:border-blue-700"
                )}

                {/* Tab-based sections: Today, Upcoming, Completed */}
                {activeTab === "today" && (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Detailed Plan Panel - Toggleable */}
                    {todayPlanDetails && (
                      <div className="mb-6 rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-lg">
                        <div className="p-4 border-b border-purple-200 dark:border-purple-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              Detailed Plan for Today
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setShowTodayPlan(!showTodayPlan);
                                // Update localStorage
                                if (typeof window !== "undefined" && user?.id) {
                                  localStorage.setItem(`todayPlan_${user.id}`, (!showTodayPlan).toString());
                                }
                              }}
                              className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title={showTodayPlan ? "Hide plan" : "Show plan"}
                            >
                              {showTodayPlan ? (
                                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setShowTodayPlan(false);
                                setTodayPlanDetails(null);
                                // Clear from localStorage
                                if (typeof window !== "undefined" && user?.id) {
                                  localStorage.removeItem(`todayPlan_${user.id}`);
                                  localStorage.removeItem(`todayPlanDetails_${user.id}`);
                                }
                              }}
                              className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Delete plan"
                            >
                              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </div>
                        {showTodayPlan && (
                          <div className="p-5 space-y-4">
                          {/* Suggestions */}
                          {todayPlanDetails.suggestions && todayPlanDetails.suggestions.length > 0 && (
                            <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
                              <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-blue-500" />
                                Suggestions for Today
                              </h5>
                              <ul className="space-y-2">
                                {todayPlanDetails.suggestions.map((suggestion: string, idx: number) => (
                                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                                    <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Detailed Tasks */}
                          {todayPlanDetails.detailedTasks && todayPlanDetails.detailedTasks.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-purple-500" />
                                Detailed Task Breakdown
                              </h5>
                              <div className="space-y-3">
                                {todayPlanDetails.detailedTasks
                                  .sort((a, b) => a.order - b.order)
                                  .map((detailedTask: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-white/80 dark:bg-slate-800/50 rounded-xl border border-gray-200/80 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{detailedTask.task}</h6>
                                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{detailedTask.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 ml-3">
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            detailedTask.priority === "high"
                                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                              : detailedTask.priority === "low"
                                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                          }`}>
                                            {detailedTask.priority}
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {detailedTask.estimatedTime}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Resources */}
                          {todayPlanDetails.resources && todayPlanDetails.resources.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-green-500" />
                                Learning Resources
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {todayPlanDetails.resources.map((resource: any, idx: number) => (
                                  <a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 bg-white/80 dark:bg-slate-800/50 rounded-xl border border-gray-200/80 dark:border-slate-600/50 hover:border-green-500 dark:hover:border-green-500 transition-all duration-200 group shadow-sm hover:shadow-md"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300">
                                            {resource.type}
                                          </span>
                                        </div>
                                        <h6 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 truncate mb-1">
                                          {resource.title}
                                        </h6>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                          {resource.description}
                                        </p>
                                      </div>
                                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-500 flex-shrink-0 mt-1" />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Tips */}
                          {todayPlanDetails.tips && todayPlanDetails.tips.length > 0 && (
                            <div className="p-4 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800/30 shadow-sm">
                              <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                Productivity Tips
                              </h5>
                              <ul className="space-y-2">
                                {todayPlanDetails.tips.map((tip: string, idx: number) => (
                                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                                    <span className="text-yellow-500 mt-1.5 flex-shrink-0">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Motivation */}
                          {todayPlanDetails.motivation && (
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                              <p className="text-sm text-gray-700 dark:text-gray-300 italic flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span>{todayPlanDetails.motivation}</span>
                              </p>
                            </div>
                          )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Regular Todo List */}
                    {grouped.today.length > 0 ? (
                      grouped.today.map((task) => (
                        <div key={task.id} className="space-y-2">
                          <SwipeableTaskItem
                            task={task}
                            onToggleStatus={toggleTaskStatus}
                            onEdit={startEditing}
                            onDelete={deleteTask}
                            getPriorityColor={getPriorityColor}
                          />
                          {task.status !== "completed" && (
                            <button
                              onClick={() => generateTaskSuggestions(task)}
                              disabled={loadingSuggestions.has(task.id)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 border border-purple-200 dark:border-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingSuggestions.has(task.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 dark:border-purple-400 border-t-transparent"></div>
                                  <span>Getting suggestions...</span>
                                </>
                              ) : (
                                <>
                                  <Lightbulb className="w-4 h-4" />
                                  <span>Get Suggestions</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 px-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                        <Calendar className="w-12 h-12 text-orange-300 dark:text-orange-700 mx-auto mb-3" />
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No tasks for today
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          You're all caught up! 🎉
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "upcoming" && (
                  <div className="space-y-3 sm:space-y-4">
                    {grouped.upcoming.length > 0 ? (
                      grouped.upcoming.map((task) => (
                        <div key={task.id} className="space-y-2">
                          <SwipeableTaskItem
                            task={task}
                            onToggleStatus={toggleTaskStatus}
                            onEdit={startEditing}
                            onDelete={deleteTask}
                            getPriorityColor={getPriorityColor}
                          />
                          {task.status !== "completed" && (
                            <button
                              onClick={() => generateTaskSuggestions(task)}
                              disabled={loadingSuggestions.has(task.id)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 border border-purple-200 dark:border-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingSuggestions.has(task.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 dark:border-purple-400 border-t-transparent"></div>
                                  <span>Getting suggestions...</span>
                                </>
                              ) : (
                                <>
                                  <Lightbulb className="w-4 h-4" />
                                  <span>Get Suggestions</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 px-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                        <Calendar className="w-12 h-12 text-purple-300 dark:text-purple-700 mx-auto mb-3" />
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No upcoming tasks
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          All your tasks are scheduled for today or tomorrow
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "completed" && (
                  <div className="space-y-3 sm:space-y-4">
                    {grouped.completed.length > 0 ? (
                      grouped.completed.map((task) => (
                        <SwipeableTaskItem
                          key={task.id}
                          task={task}
                          onToggleStatus={toggleTaskStatus}
                          onEdit={startEditing}
                          onDelete={deleteTask}
                          getPriorityColor={getPriorityColor}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 px-4 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="w-12 h-12 text-green-300 dark:text-green-700 mx-auto mb-3" />
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No completed tasks yet
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Complete your first task to see it here!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

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

        {/* Duolingo-style Dopamine Spike Celebration */}
        <DopamineSpikeCelebration
          isVisible={showThreeJSEffect}
          taskTitle={celebrationTask?.title || ""}
          priority={celebrationTask?.priority || "medium"}
          onComplete={() => {
            setShowThreeJSEffect(false);
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

        {/* Task Suggestions Modal */}
        {showSuggestionsModal && taskSuggestions.has(showSuggestionsModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto scroll-area shadow-xl">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Suggestions for Task
                  </h3>
                </div>
                <button
                  onClick={() => setShowSuggestionsModal(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {(() => {
                  const task = tasks.find(t => t.id === showSuggestionsModal);
                  const suggestions = taskSuggestions.get(showSuggestionsModal);
                  if (!suggestions || !task) return null;

                  return (
                    <>
                      {/* Task Info */}
                      <div className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-600">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Estimated Time */}
                      {suggestions.estimatedTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Estimated time: <strong>{suggestions.estimatedTime}</strong></span>
                        </div>
                      )}

                      {/* Step-by-step Approach */}
                      {suggestions.steps && suggestions.steps.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-500" />
                            Step-by-Step Approach
                          </h5>
                          <ol className="space-y-2">
                            {suggestions.steps.map((step: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center font-semibold text-xs">
                                  {idx + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Tips */}
                      {suggestions.tips && suggestions.tips.length > 0 && (
                        <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-500" />
                            Tips for Success
                          </h5>
                          <ul className="space-y-2">
                            {suggestions.tips.map((tip: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                                <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Pitfalls */}
                      {suggestions.pitfalls && suggestions.pitfalls.length > 0 && (
                        <div className="p-4 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            Common Pitfalls to Avoid
                          </h5>
                          <ul className="space-y-2">
                            {suggestions.pitfalls.map((pitfall: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                                <span className="text-yellow-500 mt-1.5 flex-shrink-0">⚠</span>
                                <span>{pitfall}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Motivation */}
                      {suggestions.motivation && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span>{suggestions.motivation}</span>
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Loading Suggestions Modal */}
        {showSuggestionsModal && loadingSuggestions.has(showSuggestionsModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md p-6 shadow-xl">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur"></div>
                  <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-purple-200 dark:border-purple-800 border-t-purple-500"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Generating suggestions...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </GeneralLayout>
  );
};
