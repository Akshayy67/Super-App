import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { StudyPlanInput } from "../../types/studyPlan";
import { studyPlanService } from "../../utils/studyPlanService";
import { studyPlanAIService } from "../../utils/studyPlanAIService";
import { realTimeAuth } from "../../utils/realTimeAuth";

interface NewStudyPlanFormProps {
  onPlanCreated: () => void;
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

      // Call the callback which will handle navigation and closing
      onPlanCreated();
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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create New Study Plan
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Let AI create a personalized roadmap for your learning goal
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎯 Learning Goal
            </label>
            <textarea
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
              placeholder="e.g., Complete DSA in 1 month, Master React in 6 weeks, Learn Python in 2 months"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-gray-100 resize-none"
              rows={3}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Be specific about what you want to learn and achieve
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📅 Duration (Weeks)
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-gray-100"
              required
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🧠 Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: level })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.difficulty === level
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                      : "border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="font-medium capitalize">{level}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Level (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📊 Current Level (Optional)
            </label>
            <input
              type="text"
              value={formData.currentLevel}
              onChange={(e) =>
                setFormData({ ...formData, currentLevel: e.target.value })
              }
              placeholder="e.g., Beginner, Intermediate, Advanced, or leave empty"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-gray-100"
            />
          </div>

          {/* Daily Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ⏰ Daily Available Hours
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-gray-100"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              How many hours per day can you dedicate to studying?
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate with AI
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

