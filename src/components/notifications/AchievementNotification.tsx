import React, { useEffect, useState } from "react";
import { Trophy, X, Star } from "lucide-react";
import { Achievement } from "../../utils/streakTracker";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<"enter" | "show" | "exit">("enter");

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setAnimationPhase("enter");

      // Enter animation
      const enterTimer = setTimeout(() => {
        setAnimationPhase("show");
      }, 100);

      // Auto-hide after 4 seconds
      const hideTimer = setTimeout(() => {
        setAnimationPhase("exit");
      }, 4000);

      // Complete hide
      const completeTimer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 4500);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(hideTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [achievement, onClose]);

  if (!achievement || !isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm transition-all duration-500 ${
      animationPhase === "enter" ? "transform translate-x-full opacity-0" :
      animationPhase === "show" ? "transform translate-x-0 opacity-100" :
      "transform translate-x-full opacity-0"
    }`}>
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg shadow-2xl p-4 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <Star
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${8 + Math.random() * 8}px`,
              }}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setAnimationPhase("exit");
            setTimeout(() => {
              setIsVisible(false);
              onClose();
            }, 500);
          }}
          className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="relative">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <Trophy className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-2xl">{achievement.icon}</div>
            <div>
              <h4 className="font-semibold text-base">{achievement.title}</h4>
              <p className="text-sm opacity-90">{achievement.description}</p>
            </div>
          </div>

          {/* Progress bar if applicable */}
          {achievement.target && achievement.progress !== undefined && (
            <div className="mt-3">
              <div className="bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-1000"
                  style={{
                    width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs mt-1 opacity-75">
                {achievement.progress} / {achievement.target}
              </p>
            </div>
          )}
        </div>

        {/* Shine effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 transition-transform duration-1000 ${
          animationPhase === "show" ? "translate-x-full" : "-translate-x-full"
        }`} />
      </div>
    </div>
  );
};
