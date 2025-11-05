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
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full shadow-lg">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-3">
            No Study Plans Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Create your first AI-powered study plan to get started on your learning journey!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>✨</span>
            <span>Let AI create a personalized roadmap for you</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>✨</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
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
              className="relative group cursor-pointer btn-touch"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Animated Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Main Card */}
              <div className="relative backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2 truncate group-hover:scale-105 transition-transform duration-300">
                    {plan.goal}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {plan.overview || "No description available"}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, plan.id)}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transform hover:scale-110"
                  title="Delete plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Progress Bar */}
                {plan.totalProgress !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Progress
                      </span>
                      <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        {Math.round(plan.totalProgress)}%
                      </span>
                    </div>
                    <div className="relative w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 animate-shimmer"></div>
                      <div
                        className="relative bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out shadow-lg shadow-purple-500/50"
                        style={{ width: `${plan.totalProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-transform duration-300 hover:scale-105 ${getDifficultyColor(
                      plan.difficulty
                    )}`}
                  >
                    {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-transform duration-300 hover:scale-105 ${getStatusColor(
                      plan.status
                    )}`}
                  >
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                      <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium">{plan.durationWeeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-medium">{plan.dailyHours}h/day</span>
                  </div>
                </div>

                {daysRemaining !== null && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-200/50 dark:border-slate-700/50 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                      <Target className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-medium">
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
          </div>
          );
        })}
      </div>
    </div>
  );
};

