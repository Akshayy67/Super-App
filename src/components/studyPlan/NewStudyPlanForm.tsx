import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, X, Clock } from "lucide-react";
import { StudyPlanInput } from "../../types/studyPlan";
import { studyPlanService } from "../../utils/studyPlanService";
import { studyPlanAIService } from "../../utils/studyPlanAIService";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface NewStudyPlanFormProps {
  onPlanCreated: (planId: string) => void;
  onCancel: () => void;
}

export const NewStudyPlanForm: React.FC<NewStudyPlanFormProps> = ({
  onPlanCreated,
  onCancel,
}) => {
  const user = realTimeAuth.getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StudyPlanInput>({
    goal: "",
    duration: 4,
    difficulty: "intermediate",
    currentLevel: "",
    dailyHours: 3,
  });

  // Check for pending study plans from Dream-to-Plan
  useEffect(() => {
    const pendingPlansStr = sessionStorage.getItem("pendingStudyPlans");
    if (pendingPlansStr) {
      try {
        const pendingPlans = JSON.parse(pendingPlansStr);
        if (pendingPlans && pendingPlans.length > 0) {
          const firstPlan = pendingPlans[0];
          if (firstPlan.studyPlanData) {
            const { goal, duration, difficulty, dailyHours, currentLevel } = firstPlan.studyPlanData;
            setFormData({
              goal: goal || "",
              duration: duration || 4,
              difficulty: (difficulty || "intermediate") as "beginner" | "intermediate" | "advanced",
              currentLevel: currentLevel || "",
              dailyHours: dailyHours || 3,
            });
            // Clear the pending plans after using them
            sessionStorage.removeItem("pendingStudyPlans");
          }
        }
      } catch (error) {
        console.error("Error parsing pending study plans:", error);
        sessionStorage.removeItem("pendingStudyPlans");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.goal.trim()) {
      alert("Please enter a study goal");
      return;
    }

    try {
      setLoading(true);

      // Create plan first
      const planId = await studyPlanService.createPlan(formData);

      // Generate AI plan
      const aiPlan = await studyPlanAIService.generateStudyPlan(formData);

      // Debug: Log AI plan data
      console.log("AI Generated Plan:", {
        weeksCount: aiPlan.weeks?.length || 0,
        weeks: aiPlan.weeks,
        overview: aiPlan.overview,
        firstWeek: aiPlan.weeks?.[0],
      });

      // Ensure weeks array exists and is valid
      if (!aiPlan.weeks || aiPlan.weeks.length === 0) {
        throw new Error("AI failed to generate study plan weeks. Please try again.");
      }

      // Update plan with AI-generated content
      await studyPlanService.updatePlan(user.id, planId, {
        overview: aiPlan.overview || "",
        weeks: aiPlan.weeks || [],
        timeSummary: aiPlan.timeSummary,
        tips: aiPlan.tips || [],
        recommendedPlatforms: aiPlan.recommendedPlatforms || [],
        motivation: aiPlan.motivation || "",
        totalProgress: aiPlan.totalProgress || 0,
      });

      console.log("Plan updated successfully with weeks:", aiPlan.weeks.length);

      // Call the callback with the plan ID to auto-open it
      onPlanCreated(planId);
    } catch (error: any) {
      console.error("Error creating study plan:", error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message || "Failed to create study plan. Please try again.";
      
      if (errorMessage.includes("RATE_LIMIT_EXCEEDED") || errorMessage.includes("Our AI servers are busy")) {
        errorMessage = "Our AI servers are busy right now. Please try again in a few moments.";
      } else if (errorMessage.includes("AI_SERVICE_UNAVAILABLE") || errorMessage.includes("AI service")) {
        errorMessage = "Our AI servers are busy right now. Please try again in a few moments.";
      } else if (errorMessage.includes("API_KEY_HTTP_REFERRER_BLOCKED")) {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-2xl blur-2xl"></div>
        
        {/* Main Card */}
        <div className="relative backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-500 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 dark:from-purple-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Create New Study Plan
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Let AI create a personalized roadmap for your learning goal
              </p>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-lg">🎯</span>
              Learning Goal
            </label>
            <textarea
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
              placeholder="e.g., Complete DSA in 1 month, Master React in 6 weeks, Learn Python in 2 months"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700/50 dark:text-gray-100 resize-none transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500"
              rows={3}
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Be specific about what you want to learn and achieve
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-lg">📅</span>
              Duration (Weeks)
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700/50 dark:text-gray-100 transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500"
              required
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span className="text-lg">🧠</span>
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: level })}
                  className={`relative px-4 py-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    formData.difficulty === level
                      ? "border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-400 shadow-lg shadow-purple-500/20"
                      : "border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500 bg-white dark:bg-slate-700/50"
                  }`}
                >
                  {formData.difficulty === level && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl blur"></div>
                  )}
                  <div className="relative font-semibold capitalize">{level}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Level (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-lg">📊</span>
              Current Level (Optional)
            </label>
            <input
              type="text"
              value={formData.currentLevel}
              onChange={(e) =>
                setFormData({ ...formData, currentLevel: e.target.value })
              }
              placeholder="e.g., Beginner, Intermediate, Advanced, or leave empty"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700/50 dark:text-gray-100 transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500"
            />
          </div>

          {/* Daily Hours */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-lg">⏰</span>
              Daily Available Hours
            </label>
            <input
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              value={formData.dailyHours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dailyHours: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700/50 dark:text-gray-100 transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500"
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              How many hours per day can you dedicate to studying?
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 font-semibold hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="relative flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:via-purple-700 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transform overflow-hidden group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                  Generate with AI
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

