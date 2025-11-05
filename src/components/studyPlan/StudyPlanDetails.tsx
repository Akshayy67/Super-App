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
} from "lucide-react";
import { StudyPlan, WeekPlan, DailyTask } from "../../types/studyPlan";
import { studyPlanService } from "../../utils/studyPlanService";
import { studyPlanAIService } from "../../utils/studyPlanAIService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { calendarService } from "../../utils/calendarService";
import { firestoreUserTasks } from "../../utils/firestoreUserTasks";
import { format } from "date-fns";

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
  const [regenerating, setRegenerating] = useState(false);
  const [syncingToCalendar, setSyncingToCalendar] = useState(false);

  // Debug: Log plan data
  useEffect(() => {
    console.log("Study Plan Data:", {
      weeks: plan.weeks?.length || 0,
      weeksData: plan.weeks,
      overview: plan.overview,
      firstWeek: plan.weeks?.[0],
    });
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

  const handleTaskToggle = async (
    weekIndex: number,
    dayIndex: number,
    completed: boolean
  ) => {
    if (!user) return;

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
    }
  };

  const handleWeekToggle = async (weekIndex: number, completed: boolean) => {
    if (!user) return;

    try {
      await studyPlanService.updateWeek(user.id, plan.id, weekIndex, {
        completed,
        completedAt: completed ? new Date() : undefined,
      });
      onPlanUpdated();
    } catch (error) {
      console.error("Error updating week:", error);
      alert("Failed to update week. Please try again.");
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
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 btn-touch"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {plan.goal}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    plan.difficulty
                  )}`}
                >
                  {plan.difficulty.charAt(0).toUpperCase() +
                    plan.difficulty.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {plan.overview}
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 btn-touch"
              title="Delete plan"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{plan.durationWeeks} weeks</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{plan.dailyHours}h/day</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Target className="w-4 h-4" />
              <span>
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span>{Math.round(plan.totalProgress || 0)}% complete</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${plan.totalProgress || 0}%` }}
              />
            </div>
          </div>

          {/* Time Summary */}
          {plan.timeSummary && (
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Weekly Hours</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {plan.timeSummary.weeklyHours}h
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">{plan.motivation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSyncToCalendar}
              disabled={syncingToCalendar}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 btn-touch"
            >
              <Calendar className="w-4 h-4" />
              {syncingToCalendar ? "Syncing..." : "Sync to Calendar"}
            </button>
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
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Week Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors btn-touch"
                onClick={() => toggleWeek(week.week)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {week.focus.includes("Week") ? week.focus : `Week ${week.week}: ${week.focus}`}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWeekToggle(weekIndex, !week.completed);
                          }}
                          className="btn-touch"
                        >
                          {week.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {week.summary && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {week.summary}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {week.description}
                      </p>
                      {week.learningGoals && week.learningGoals.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Learning Goals:
                          </div>
                          <ul className="space-y-1">
                            {week.learningGoals.map((goal, idx) => (
                              <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <Target className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {week.recommendedHours && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Recommended: {week.recommendedHours} hours this week
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Target className="w-3 h-3" />
                          <span>
                            {weekCompletedTasks}/{weekTotalTasks} tasks
                          </span>
                        </div>
                        <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full transition-all"
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
                    className="p-2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50 btn-touch"
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
                <div className="border-t border-gray-200 dark:border-slate-700 p-4">
                  <div className="space-y-3">
                    {(week.dailyPlan || []).length > 0 ? (
                      week.dailyPlan.map((day, dayIndex) => (
                      <div
                        key={day.day}
                        className={`p-4 rounded-lg border ${
                          day.completed
                            ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                            : "bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() =>
                              handleTaskToggle(
                                weekIndex,
                                dayIndex,
                                !day.completed
                              )
                            }
                            className="mt-0.5 btn-touch"
                          >
                            {day.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                Day {day.day}: {day.topic}
                              </h4>
                              {day.dayType && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  day.dayType === "rest" 
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : day.dayType === "review"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}>
                                  {day.dayType === "rest" ? "☕ Rest" : day.dayType === "review" ? "🧩 Review" : "📚 Study"}
                                </span>
                              )}
                              {day.hours > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{day.hours}h</span>
                                </div>
                              )}
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-1 mb-2">
                              {day.tasks.map((task, taskIndex) => (
                                <li key={taskIndex}>{task}</li>
                              ))}
                            </ul>
                            {day.resources && day.resources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-600">
                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  📚 Resources:
                                </div>
                                <ul className="space-y-1">
                                  {day.resources.map((resource, idx) => (
                                    <li key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                      • {resource}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
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
    </div>
  );
};

