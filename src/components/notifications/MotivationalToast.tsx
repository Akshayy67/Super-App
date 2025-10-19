import React, { useEffect, useState } from "react";
import { X, Flame, Star, Target } from "lucide-react";
import { StreakData, StreakTracker } from "../../utils/streakTracker";

interface MotivationalToastProps {
  streakData: StreakData;
  isVisible: boolean;
  onClose: () => void;
}

export const MotivationalToast: React.FC<MotivationalToastProps> = ({
  streakData,
  isVisible,
  onClose,
}) => {
  const [animationPhase, setAnimationPhase] = useState<"enter" | "show" | "exit">("enter");

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase("enter");

      // Enter animation
      const enterTimer = setTimeout(() => {
        setAnimationPhase("show");
      }, 100);

      // Auto-hide after 3 seconds
      const hideTimer = setTimeout(() => {
        setAnimationPhase("exit");
      }, 3000);

      // Complete hide
      const completeTimer = setTimeout(() => {
        onClose();
      }, 3500);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(hideTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const message = StreakTracker.getMotivationalMessage(streakData);
  
  const getIcon = () => {
    if (streakData.currentStreak >= 7) return Flame;
    if (streakData.tasksCompletedToday >= 3) return Target;
    return Star;
  };

  const Icon = getIcon();

  return (
    <div className={`fixed bottom-4 right-4 z-40 max-w-sm transition-all duration-500 ${
      animationPhase === "enter" ? "transform translate-y-full opacity-0" :
      animationPhase === "show" ? "transform translate-y-0 opacity-100" :
      "transform translate-y-full opacity-0"
    }`}>
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-4 text-white relative">
        {/* Close button */}
        <button
          onClick={() => {
            setAnimationPhase("exit");
            setTimeout(onClose, 500);
          }}
          className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-center space-x-3 pr-6">
          <div className="bg-white bg-opacity-20 rounded-full p-2 flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium leading-relaxed">
              {message}
            </p>
            {streakData.currentStreak > 1 && (
              <p className="text-xs opacity-90 mt-1">
                {streakData.currentStreak} day streak • {streakData.tasksCompletedToday} tasks today
              </p>
            )}
          </div>
        </div>

        {/* Progress indicator for weekly goal */}
        {streakData.weeklyGoal > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs opacity-75 mb-1">
              <span>Weekly Progress</span>
              <span>{streakData.tasksCompletedThisWeek}/{streakData.weeklyGoal}</span>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full h-1.5">
              <div
                className="bg-white rounded-full h-1.5 transition-all duration-1000"
                style={{
                  width: `${Math.min((streakData.tasksCompletedThisWeek / streakData.weeklyGoal) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
