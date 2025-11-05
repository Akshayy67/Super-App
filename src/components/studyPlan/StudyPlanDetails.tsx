import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Trash2,
  Target,
  TrendingUp,
  Sparkles,
  BookOpen,
  ExternalLink,
  Lightbulb,
  Link2,
  AlertCircle,
} from "lucide-react";
import { StudyPlan } from "../../types/studyPlan";
import { studyPlanService } from "../../utils/studyPlanService";
import { studyPlanAIService } from "../../utils/studyPlanAIService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { calendarService } from "../../utils/calendarService";
import { firestoreUserTasks } from "../../utils/firestoreUserTasks";
import { DopamineSpikeCelebration } from "../ui/DopamineSpikeCelebration";

interface StudyPlanDetailsProps {
  plan: StudyPlan;
  onBack: () => void;
  onPlanDeleted: () => void;
  onPlanUpdated: () => void;
}

export const StudyPlanDetails: React.FC<StudyPlanDetailsProps> = ({
  plan,
  onBack,
  onPlanDeleted,
  onPlanUpdated,
}) => {
  const user = realTimeAuth.getCurrentUser();
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
    new Set(plan.weeks && plan.weeks.length > 0 ? [plan.weeks[0].week] : []) // Expand first week by default
  );
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set()); // Format: "weekIndex-dayIndex"
  const [dayDetails, setDayDetails] = useState<Map<string, any>>(new Map());
  const [loadingDayDetails, setLoadingDayDetails] = useState<Set<string>>(new Set());
  const [regenerating, setRegenerating] = useState(false);
  const [syncingToCalendar, setSyncingToCalendar] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTaskTitle, setCelebrationTaskTitle] = useState<string>("");

  // Debug: Log plan data
  useEffect(() => {
    console.log("Study Plan Data:", {
      weeks: plan.weeks?.length || 0,
      weeksData: plan.weeks,
      overview: plan.overview,
      firstWeek: plan.weeks?.[0],
    });
  }, [plan]);

  // Load saved day details from plan data on mount
  useEffect(() => {
    if (!plan.weeks) return;
    
    const savedDetails = new Map<string, any>();
    plan.weeks.forEach((week, weekIndex) => {
      week.dailyPlan.forEach((day, dayIndex) => {
        if (day.dayDetails) {
          const dayKey = `${weekIndex}-${dayIndex}`;
          savedDetails.set(dayKey, day.dayDetails);
        }
      });
    });
    
    if (savedDetails.size > 0) {
      setDayDetails(savedDetails);
      console.log("Loaded saved day details:", savedDetails.size);
    }
  }, [plan]);

  const toggleWeek = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
  };

  const toggleDay = async (weekIndex: number, dayIndex: number) => {
    const dayKey = `${weekIndex}-${dayIndex}`;
    const newExpanded = new Set(expandedDays);
    
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey);
    } else {
      newExpanded.add(dayKey);
      
      // Load day details if not already loaded
      if (!dayDetails.has(dayKey) && !loadingDayDetails.has(dayKey)) {
        await loadDayDetails(weekIndex, dayIndex, dayKey);
      }
    }
    
    setExpandedDays(newExpanded);
  };

  const loadDayDetails = async (weekIndex: number, dayIndex: number, dayKey: string) => {
    if (!user) return;
    
    const week = plan.weeks[weekIndex];
    const day = week.dailyPlan[dayIndex];
    
    // Check if day details are already saved in Firestore
    if (day.dayDetails) {
      console.log("Using saved day details from Firestore for", dayKey);
      setDayDetails(prev => {
        const newMap = new Map(prev);
        newMap.set(dayKey, day.dayDetails);
        return newMap;
      });
      return;
    }
    
    setLoadingDayDetails(prev => new Set(prev).add(dayKey));
    
    try {
      // Generate new day details using AI
      const details = await studyPlanAIService.generateDayDetails(
        plan.goal,
        week.focus,
        day,
        plan.difficulty
      );
      
      // Add generatedAt timestamp
      const detailsWithTimestamp = {
        ...details,
        generatedAt: new Date(),
      };
      
      // Update local state
      setDayDetails(prev => {
        const newMap = new Map(prev);
        newMap.set(dayKey, detailsWithTimestamp);
        return newMap;
      });
      
      // Save to Firestore for persistence
      try {
        await studyPlanService.saveDayDetails(
          user.id,
          plan.id,
          weekIndex,
          dayIndex,
          detailsWithTimestamp
        );
        console.log("Saved day details to Firestore for", dayKey);
      } catch (saveError) {
        console.error("Error saving day details to Firestore:", saveError);
        // Don't fail the whole operation if save fails - user still sees the details
      }
    } catch (error) {
      console.error("Error loading day details:", error);
    } finally {
      setLoadingDayDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(dayKey);
        return newSet;
      });
    }
  };

  const handleTaskToggle = async (
    weekIndex: number,
    dayIndex: number,
    completed: boolean
  ) => {
    if (!user) return;

    // Store task info before update to avoid stale data
    const week = plan.weeks[weekIndex];
    const day = week?.dailyPlan[dayIndex];
    
    // Trigger celebration when task is completed (only when transitioning to completed)
    if (completed && day && !day.completed) {
      setCelebrationTaskTitle(`${day.topic} - ${plan.goal}`);
      setShowCelebration(true);
    }

    try {
      await studyPlanService.updateTask(
        user.id,
        plan.id,
        weekIndex,
        dayIndex,
        {
          completed,
          completedAt: completed ? new Date() : undefined,
        }
      );
      
      onPlanUpdated();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
      // Hide celebration if update failed
      if (completed) {
        setShowCelebration(false);
      }
    }
  };

  const handleWeekToggle = async (weekIndex: number, completed: boolean) => {
    if (!user) return;

    // Store week info before update to avoid stale data
    const week = plan.weeks[weekIndex];
    
    // Trigger celebration when week is completed (only when transitioning to completed)
    if (completed && week && !week.completed) {
      setCelebrationTaskTitle(`Week ${week.week}: ${week.focus}`);
      setShowCelebration(true);
    }

    try {
      await studyPlanService.updateWeek(user.id, plan.id, weekIndex, {
        completed,
        completedAt: completed ? new Date() : undefined,
      });
      
      onPlanUpdated();
    } catch (error) {
      console.error("Error updating week:", error);
      alert("Failed to update week. Please try again.");
      // Hide celebration if update failed
      if (completed) {
        setShowCelebration(false);
      }
    }
  };

  const handleRegenerateWeek = async (weekIndex: number) => {
    if (!user) return;

    try {
      setRegenerating(true);
      const week = plan.weeks[weekIndex];
      const newWeek = await studyPlanAIService.regenerateWeek(
        week.week,
        week.focus,
        plan.difficulty,
        plan.dailyHours
      );

      await studyPlanService.updateWeek(user.id, plan.id, weekIndex, newWeek);
      onPlanUpdated();
    } catch (error) {
      console.error("Error regenerating week:", error);
      alert("Failed to regenerate week. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleSyncToCalendar = async () => {
    if (!user) return;

    try {
      setSyncingToCalendar(true);

      // Create todos from all pending tasks
      for (const week of plan.weeks) {
        for (const day of week.dailyPlan) {
          if (!day.completed) {
            // Calculate due date based on plan start date and day number
            const startDate = plan.startedAt || new Date();
            const weekStart = new Date(startDate);
            weekStart.setDate(weekStart.getDate() + (week.week - 1) * 7);
            const dueDate = new Date(weekStart);
            dueDate.setDate(weekStart.getDate() + day.day - 1);

            // Create todo
            await firestoreUserTasks.addTask(user.id, {
              title: `${day.topic} - ${plan.goal}`,
              description: day.tasks.join("\n"),
              subject: plan.goal,
              dueDate: dueDate.toISOString(),
              priority: plan.difficulty === "advanced" ? "high" : "medium",
              status: "pending",
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      // Sync todos to calendar
      await calendarService.syncTodosToCalendar(user.id);

      alert("✅ Study plan tasks have been synced to your calendar and todos!");
    } catch (error) {
      console.error("Error syncing to calendar:", error);
      alert("Failed to sync to calendar. Please try again.");
    } finally {
      setSyncingToCalendar(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (window.confirm("Are you sure you want to delete this study plan?")) {
      try {
        await studyPlanService.deletePlan(user.id, plan.id);
        onPlanDeleted();
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert("Failed to delete plan. Please try again.");
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const totalTasks = plan.weeks.reduce(
    (sum, week) => sum + week.dailyPlan.length,
    0
  );
  const completedTasks = plan.weeks.reduce(
    (sum, week) =>
      sum + week.dailyPlan.filter((day) => day.completed).length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-4 btn-touch transition-colors duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Plans</span>
        </button>

        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-2xl blur-xl"></div>
          
          {/* Main Card */}
          <div className="relative backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 dark:from-purple-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {plan.goal}
                  </h1>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getDifficultyColor(
                      plan.difficulty
                    )}`}
                  >
                    {plan.difficulty.charAt(0).toUpperCase() +
                      plan.difficulty.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {plan.overview}
                </p>
              </div>
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 btn-touch hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 transform hover:scale-110"
                title="Delete plan"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="p-1.5 bg-purple-500 rounded-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{plan.durationWeeks} weeks</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
              <div className="p-1.5 bg-indigo-500 rounded-lg">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Daily</div>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{plan.dailyHours}h/day</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Tasks</div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {completedTasks}/{totalTasks}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Progress</div>
                <div className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {Math.round(plan.totalProgress || 0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
              <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {Math.round(plan.totalProgress || 0)}%
              </span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 animate-shimmer"></div>
              <div
                className="relative bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg shadow-purple-500/50"
                style={{ width: `${plan.totalProgress || 0}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
              </div>
            </div>
          </div>

          {/* Time Summary */}
          {plan.timeSummary && (
            <div className="grid grid-cols-2 gap-4 mb-4 p-5 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-sm">
              <div className="relative">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Weekly Hours</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {plan.timeSummary.weeklyHours}h
                </div>
              </div>
              <div className="relative">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Hours</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {plan.timeSummary.totalHours}h
                </div>
              </div>
            </div>
          )}

          {/* Tips & Platforms */}
          {(plan.tips && plan.tips.length > 0) || (plan.recommendedPlatforms && plan.recommendedPlatforms.length > 0) ? (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {plan.tips && plan.tips.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Study Tips
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {plan.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.recommendedPlatforms && plan.recommendedPlatforms.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Recommended Platforms
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {plan.recommendedPlatforms.map((platform, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{platform}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* Motivation */}
          {plan.motivation && (
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">{plan.motivation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSyncToCalendar}
              disabled={syncingToCalendar}
              className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 btn-touch font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transform overflow-hidden group"
            >
              <Calendar className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{syncingToCalendar ? "Syncing..." : "Sync to Calendar"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Weeks */}
      {plan.weeks && plan.weeks.length > 0 ? (
        <div className="space-y-4">
        {plan.weeks.map((week, weekIndex) => {
          const isExpanded = expandedWeeks.has(week.week);
          const weekCompletedTasks = week.dailyPlan.filter(
            (d) => d.completed
          ).length;
          const weekTotalTasks = week.dailyPlan.length;
          const weekProgress =
            weekTotalTasks > 0
              ? (weekCompletedTasks / weekTotalTasks) * 100
              : 0;

          return (
            <div
              key={week.week}
              className="relative bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-md border border-gray-200/50 dark:border-slate-700/50 overflow-hidden backdrop-blur-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Week Header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-slate-700/50 transition-all duration-200 btn-touch group"
                onClick={() => toggleWeek(week.week)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                          {week.focus.includes("Week") ? week.focus : `Week ${week.week}: ${week.focus}`}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWeekToggle(weekIndex, !week.completed);
                          }}
                          className="btn-touch hover:scale-110 transition-transform duration-200"
                        >
                          {week.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 hover:text-purple-500 transition-colors duration-200" />
                          )}
                        </button>
                      </div>
                      {week.summary && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                          {week.summary}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {week.description}
                      </p>
                      {week.learningGoals && week.learningGoals.length > 0 && (
                        <div className="mt-3 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800/30">
                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            Learning Goals:
                          </div>
                          <ul className="space-y-1.5">
                            {week.learningGoals.map((goal, idx) => (
                              <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2 leading-relaxed">
                                <span className="text-purple-500 mt-1 flex-shrink-0">•</span>
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {week.recommendedHours && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          <span>Recommended: <span className="font-semibold text-purple-600 dark:text-purple-400">{week.recommendedHours}h</span> this week</span>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-4 pt-3 border-t border-gray-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Target className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-medium">
                            {weekCompletedTasks}/{weekTotalTasks} tasks
                          </span>
                        </div>
                        <div className="flex-1 max-w-xs bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                            style={{ width: `${weekProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerateWeek(weekIndex);
                    }}
                    disabled={regenerating}
                    className="p-2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50 btn-touch hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                    title="Regenerate week plan"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Week Content */}
              {isExpanded && (
                <div className="border-t border-gray-200/50 dark:border-slate-700/50 p-5 bg-gray-50/30 dark:bg-slate-900/30">
                  <div className="space-y-3">
                    {(week.dailyPlan || []).length > 0 ? (
                      week.dailyPlan.map((day, dayIndex) => {
                        const dayKey = `${weekIndex}-${dayIndex}`;
                        const isDayExpanded = expandedDays.has(dayKey);
                        const details = dayDetails.get(dayKey);
                        const isLoading = loadingDayDetails.has(dayKey);
                        
                        return (
                          <div
                            key={day.day}
                            className={`rounded-xl border transition-all duration-200 ${
                              day.completed
                                ? "bg-green-50/80 dark:bg-green-900/10 border-green-200/80 dark:border-green-800/50 shadow-sm"
                                : "bg-white/80 dark:bg-slate-800/50 border-gray-200/80 dark:border-slate-600/50 shadow-sm hover:shadow-md"
                            }`}
                          >
                            {/* Day Header - Clickable */}
                            <div
                              className="p-4 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-all duration-200 rounded-t-xl group"
                              onClick={() => toggleDay(weekIndex, dayIndex)}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskToggle(
                                      weekIndex,
                                      dayIndex,
                                      !day.completed
                                    );
                                  }}
                                  className="mt-0.5 btn-touch hover:scale-110 transition-transform duration-200"
                                >
                                  {day.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                                      Day {day.day}: {day.topic}
                                    </h4>
                                    {day.dayType && (
                                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shadow-sm ${
                                        day.dayType === "rest" 
                                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                          : day.dayType === "review"
                                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                      }`}>
                                        {day.dayType === "rest" ? "☕ Rest" : day.dayType === "review" ? "🧩 Review" : "📚 Study"}
                                      </span>
                                    )}
                                    {day.hours > 0 && (
                                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                                        <span>{day.hours}h</span>
                                      </div>
                                    )}
                                    <div className="ml-auto">
                                      {isDayExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200" />
                                      )}
                                    </div>
                                  </div>
                                  <ul className="list-none space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    {day.tasks.map((task, taskIndex) => (
                                      <li key={taskIndex} className="flex items-start gap-2">
                                        <span className="text-purple-500 mt-1.5 flex-shrink-0">•</span>
                                        <span className="leading-relaxed">{task}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            
                            {/* Expanded Day Details */}
                            {isDayExpanded && (
                              <div className="border-t border-gray-200/50 dark:border-slate-600/50 p-5 bg-white/90 dark:bg-slate-800/90 rounded-b-xl">
                                {isLoading ? (
                                  <div className="flex items-center justify-center py-10">
                                    <div className="relative">
                                      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur"></div>
                                      <div className="relative animate-spin rounded-full h-8 w-8 border-2 border-purple-200 dark:border-purple-800 border-t-purple-500"></div>
                                    </div>
                                    <span className="ml-3 text-gray-600 dark:text-gray-400 font-medium">Loading day details...</span>
                                  </div>
                                ) : details ? (
                                  <div className="space-y-4">
                                    {/* Suggestions */}
                                    {details.suggestions && details.suggestions.length > 0 && (
                                      <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
                                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                          <Lightbulb className="w-4 h-4 text-blue-500" />
                                          Suggestions for Today
                                        </h5>
                                        <ul className="space-y-2">
                                          {details.suggestions.map((suggestion: string, idx: number) => (
                                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                                              <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
                                              <span>{suggestion}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {/* Detailed Tasks */}
                                    {details.detailedTasks && details.detailedTasks.length > 0 && (
                                      <div>
                                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                          <Target className="w-4 h-4 text-purple-500" />
                                          Detailed Task Breakdown
                                        </h5>
                                        <div className="space-y-3">
                                          {details.detailedTasks.map((detailedTask: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-gray-50/80 dark:bg-slate-700/30 rounded-xl border border-gray-200/80 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                                    
                                    {/* Resources with Links */}
                                    {details.resources && details.resources.length > 0 && (
                                      <div>
                                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                          <Link2 className="w-4 h-4 text-green-500" />
                                          Learning Resources
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {details.resources.map((resource: any, idx: number) => (
                                            <a
                                              key={idx}
                                              href={resource.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-4 bg-gray-50/80 dark:bg-slate-700/30 rounded-xl border border-gray-200/80 dark:border-slate-600/50 hover:border-green-500 dark:hover:border-green-500 transition-all duration-200 group shadow-sm hover:shadow-md"
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
                                    {details.tips && details.tips.length > 0 && (
                                      <div className="p-4 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800/30 shadow-sm">
                                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                                          Study Tips
                                        </h5>
                                        <ul className="space-y-2">
                                          {details.tips.map((tip: string, idx: number) => (
                                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                                              <span className="text-yellow-500 mt-1.5 flex-shrink-0">•</span>
                                              <span>{tip}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {/* Motivation */}
                                    {details.motivation && (
                                      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 italic flex items-start gap-2">
                                          <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                          <span>{details.motivation}</span>
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                    <p className="text-sm">Failed to load day details. Please try again.</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-sm">No daily tasks available for this week.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No weekly plan generated yet</p>
            <p className="text-sm">The study plan structure is being prepared. Please refresh or regenerate the plan.</p>
          </div>
        </div>
      )}

      {/* Celebration Effect */}
      <DopamineSpikeCelebration
        isVisible={showCelebration}
        taskTitle={celebrationTaskTitle}
        priority="medium"
        onComplete={() => {
          setShowCelebration(false);
          setCelebrationTaskTitle("");
        }}
      />
    </div>
  );
};

