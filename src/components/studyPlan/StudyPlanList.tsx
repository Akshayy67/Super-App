import React from "react";
import { BookOpen, Calendar, Clock, Target, TrendingUp, Trash2, Edit, Sparkles } from "lucide-react";
import { StudyPlan } from "../../types/studyPlan";
import { format, differenceInDays } from "date-fns";
import { studyPlanService } from "../../utils/studyPlanService";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface StudyPlanListProps {
  plans: StudyPlan[];
  onPlanSelect: (plan: StudyPlan) => void;
  onPlanDeleted: () => void;
}

export const StudyPlanList: React.FC<StudyPlanListProps> = ({
  plans,
  onPlanSelect,
  onPlanDeleted,
}) => {
  const user = realTimeAuth.getCurrentUser();

  const handleDelete = async (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    if (!user) return;
    
    if (window.confirm("Are you sure you want to delete this study plan?")) {
      try {
        await studyPlanService.deletePlan(user.id, planId);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "paused":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (plans.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Study Plans Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first AI-powered study plan to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const daysRemaining = plan.startedAt
            ? differenceInDays(
                new Date(plan.startedAt.getTime() + plan.durationWeeks * 7 * 24 * 60 * 60 * 1000),
                new Date()
              )
            : null;

          return (
            <div
              key={plan.id}
              onClick={() => onPlanSelect(plan)}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer btn-touch group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                    {plan.goal}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {plan.overview || "No description available"}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, plan.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Progress Bar */}
                {plan.totalProgress !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Progress
                      </span>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {Math.round(plan.totalProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${plan.totalProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(
                      plan.difficulty
                    )}`}
                  >
                    {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                      plan.status
                    )}`}
                  >
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{plan.durationWeeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{plan.dailyHours}h/day</span>
                  </div>
                </div>

                {daysRemaining !== null && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <Target className="w-4 h-4" />
                    <span>
                      {daysRemaining > 0
                        ? `${daysRemaining} days remaining`
                        : daysRemaining === 0
                        ? "Ends today"
                        : "Completed"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

