import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Heart, Sparkles } from "lucide-react";
import { FeedbackSystem } from "./FeedbackSystem";

interface FeedbackButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  variant?: "floating" | "inline";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  position = "bottom-right",
  variant = "floating",
  size = "md",
  showLabel = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-14 h-14",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  if (variant === "inline") {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-heading font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback</span>
        </button>
        <FeedbackSystem isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.div
        className={`fixed ${positionClasses[position]} z-40`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <div className="relative">
          {/* Pulse animation */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full ${sizeClasses[size]}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Main button */}
          <motion.button
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative ${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background sparkles */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${30 + i * 20}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>

            {/* Icon with rotation animation */}
            <motion.div
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Heart className={`${iconSizes[size]} fill-current`} />
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && showLabel && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: position.includes("right") ? 10 : -10 }}
                  animate={{ opacity: 1, scale: 1, x: position.includes("right") ? -10 : 10 }}
                  exit={{ opacity: 0, scale: 0.8, x: position.includes("right") ? 10 : -10 }}
                  className={`absolute ${
                    position.includes("right") ? "right-full mr-3" : "left-full ml-3"
                  } top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-body font-medium whitespace-nowrap shadow-lg`}
                >
                  Share your feedback
                  <div
                    className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45 ${
                      position.includes("right") ? "-right-1" : "-left-1"
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notification badge (optional) */}
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2, type: "spring" }}
          >
            !
          </motion.div>
        </div>
      </motion.div>

      {/* Feedback System Modal */}
      <FeedbackSystem isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

// Quick feedback component for specific actions
export const QuickFeedback: React.FC<{
  trigger: React.ReactNode;
  type?: "feedback" | "suggestion" | "bug" | "feature";
}> = ({ trigger, type = "feedback" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger}
      </div>
      <FeedbackSystem isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

// Feedback prompt for specific features
export const FeatureFeedbackPrompt: React.FC<{
  featureName: string;
  onDismiss?: () => void;
}> = ({ featureName, onDismiss }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-1">
              How was your experience with {featureName}?
            </h4>
            <p className="font-body text-sm text-gray-600 dark:text-gray-400 mb-3">
              Your feedback helps us improve this feature for everyone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(true)}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-heading font-medium rounded-lg transition-colors"
              >
                Share Feedback
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-heading font-medium transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      <FeedbackSystem isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
