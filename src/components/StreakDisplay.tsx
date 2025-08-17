import React from "react";
import { Flame, Target, Trophy, Star } from "lucide-react";
import { StreakData } from "../utils/streakTracker";

interface StreakDisplayProps {
  streakData: StreakData;
  className?: string;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streakData,
  className = "",
}) => {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-purple-600 bg-purple-100";
    if (streak >= 14) return "text-red-600 bg-red-100";
    if (streak >= 7) return "text-orange-600 bg-orange-100";
    if (streak >= 3) return "text-yellow-600 bg-yellow-100";
    return "text-blue-600 bg-blue-100";
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return Trophy;
    if (streak >= 14) return Flame;
    if (streak >= 7) return Target;
    return Star;
  };

  const StreakIcon = getStreakIcon(streakData.currentStreak);

  return (
    <div className={`flex items-center space-x-3 sm:space-x-4 ${className}`}>
      {/* Current Streak */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <div
          className={`p-1.5 sm:p-2 rounded-full ${getStreakColor(
            streakData.currentStreak
          )}`}
        >
          <StreakIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
        <div>
          <div className="text-xs sm:text-sm font-semibold text-gray-900">
            {streakData.currentStreak} day
            {streakData.currentStreak !== 1 ? "s" : ""}
          </div>
          <div className="text-xs text-gray-500">streak</div>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <div className="bg-green-100 p-1.5 sm:p-2 rounded-full">
          <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
        </div>
        <div>
          <div className="text-xs sm:text-sm font-semibold text-gray-900">
            {streakData.tasksCompletedToday}
          </div>
          <div className="text-xs text-gray-500">today</div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
        </div>
        <div>
          <div className="text-xs sm:text-sm font-semibold text-gray-900">
            {streakData.tasksCompletedThisWeek}/{streakData.weeklyGoal}
          </div>
          <div className="text-xs text-gray-500">weekly</div>
        </div>
      </div>
    </div>
  );
};
