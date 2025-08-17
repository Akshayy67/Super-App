import React, { useEffect, useState } from "react";
import { 
  Sparkles, 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award,
  CheckCircle2,
  Flame
} from "lucide-react";

interface TaskCelebrationProps {
  isVisible: boolean;
  taskTitle: string;
  priority: "low" | "medium" | "high";
  onComplete: () => void;
}

const motivationalMessages = {
  high: [
    "🔥 CRUSHING IT! High priority task completed!",
    "⚡ UNSTOPPABLE! You're on fire!",
    "🎯 BULLSEYE! Another big win!",
    "💪 POWERHOUSE! Nothing can stop you!",
    "🚀 ROCKET MODE! You're flying high!",
  ],
  medium: [
    "✨ FANTASTIC! Keep the momentum going!",
    "🌟 STELLAR WORK! You're making progress!",
    "🎉 AWESOME! Another task conquered!",
    "💫 BRILLIANT! You're building momentum!",
    "🔥 GREAT JOB! Stay focused!",
  ],
  low: [
    "👏 NICE WORK! Every step counts!",
    "✅ PROGRESS! You're moving forward!",
    "🎈 WELL DONE! Building good habits!",
    "🌱 GROWING! Small wins add up!",
    "⭐ SOLID! Consistency is key!",
  ]
};

const getRandomMessage = (priority: "low" | "medium" | "high") => {
  const messages = motivationalMessages[priority];
  return messages[Math.floor(Math.random() * messages.length)];
};

const CelebrationIcon = ({ priority }: { priority: "low" | "medium" | "high" }) => {
  const icons = {
    high: [Trophy, Flame, Zap, Target],
    medium: [Star, Award, Sparkles, CheckCircle2],
    low: [Star, Sparkles, CheckCircle2, Award]
  };
  
  const IconComponent = icons[priority][Math.floor(Math.random() * icons[priority].length)];
  return <IconComponent className="w-16 h-16" />;
};

export const TaskCelebration: React.FC<TaskCelebrationProps> = ({
  isVisible,
  taskTitle,
  priority,
  onComplete,
}) => {
  const [animationPhase, setAnimationPhase] = useState<"enter" | "celebrate" | "exit">("enter");
  const [message] = useState(() => getRandomMessage(priority));

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase("enter");
      
      // Phase 1: Enter animation
      const enterTimer = setTimeout(() => {
        setAnimationPhase("celebrate");
      }, 100);

      // Phase 2: Celebration duration
      const celebrateTimer = setTimeout(() => {
        setAnimationPhase("exit");
      }, 2000);

      // Phase 3: Exit and cleanup
      const exitTimer = setTimeout(() => {
        onComplete();
      }, 2500);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(celebrateTimer);
        clearTimeout(exitTimer);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getColorClasses = () => {
    switch (priority) {
      case "high":
        return "from-red-400 via-pink-500 to-purple-600 text-white";
      case "medium":
        return "from-yellow-400 via-orange-500 to-red-500 text-white";
      case "low":
        return "from-green-400 via-blue-500 to-purple-500 text-white";
      default:
        return "from-blue-400 via-purple-500 to-pink-500 text-white";
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-500 ${
      animationPhase === "enter" ? "opacity-0 scale-95" :
      animationPhase === "celebrate" ? "opacity-100 scale-100" :
      "opacity-0 scale-105"
    }`}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm" />
      
      {/* Celebration content */}
      <div className={`relative bg-gradient-to-br ${getColorClasses()} rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl transform transition-all duration-700 ${
        animationPhase === "celebrate" ? "animate-pulse" : ""
      }`}>
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white rounded-full animate-bounce opacity-80`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative text-center">
          {/* Icon */}
          <div className={`mb-4 flex justify-center transform transition-transform duration-1000 ${
            animationPhase === "celebrate" ? "scale-110 rotate-12" : "scale-100"
          }`}>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <CelebrationIcon priority={priority} />
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold mb-2 animate-bounce">
            {message}
          </h2>

          {/* Task title */}
          <p className="text-lg opacity-90 mb-4 font-medium">
            "{taskTitle}"
          </p>

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 bg-white rounded-full transition-all duration-300 ${
                  animationPhase === "celebrate" ? "animate-ping" : ""
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Sparkle effects */}
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDirection: "reverse" }} />
        </div>
      </div>
    </div>
  );
};
