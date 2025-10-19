import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Heart, Sparkles } from "lucide-react";
import { FeedbackSystem } from "./FeedbackSystem";
import { useFeedbackSettings } from "./FeedbackContext";

interface FeedbackButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "auto" | "draggable";
  variant?: "floating" | "inline";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  avoidInputAreas?: boolean;
  customOffset?: { x?: number; y?: number };
  draggable?: boolean;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  position,
  variant = "floating",
  size,
  showLabel,
  avoidInputAreas,
  customOffset = {},
  draggable = true,
}) => {
  const { settings } = useFeedbackSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [smartPosition, setSmartPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left">("bottom-right");
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Use props if provided, otherwise use context settings
  const finalPosition = position ?? settings.position;
  const finalSize = size ?? settings.size;
  const finalShowLabel = showLabel ?? settings.showLabel;
  const finalAvoidInputAreas = avoidInputAreas ?? settings.avoidInputAreas;

  const positionClasses = {
    "bottom-right": `bottom-${6 + (customOffset.y || 0)} right-${6 + (customOffset.x || 0)}`,
    "bottom-left": `bottom-${6 + (customOffset.y || 0)} left-${6 + (customOffset.x || 0)}`,
    "top-right": `top-${6 + (customOffset.y || 0)} right-${6 + (customOffset.x || 0)}`,
    "top-left": `top-${6 + (customOffset.y || 0)} left-${6 + (customOffset.x || 0)}`,
  };

  // Smart positioning logic to avoid input areas
  React.useEffect(() => {
    if (finalPosition === "auto" && finalAvoidInputAreas) {
      const detectInputAreas = () => {
        const inputElements = document.querySelectorAll('input, textarea, [role="textbox"]');
        const chatInputs = document.querySelectorAll('[data-component="ai-chat"] input, [data-component="ai-chat"] textarea');
        
        if (chatInputs.length > 0) {
          // If we're in a chat interface, prefer top positions
          const chatContainer = document.querySelector('[data-component="ai-chat"]');
          if (chatContainer) {
            const rect = chatContainer.getBoundingClientRect();
            const isBottomInput = Array.from(chatInputs).some(input => {
              const inputRect = input.getBoundingClientRect();
              return inputRect.bottom > window.innerHeight - 100;
            });
            
            if (isBottomInput) {
              setSmartPosition("top-right");
            } else {
              setSmartPosition("bottom-left");
            }
          }
        } else {
          // Default to bottom-right for other pages
          setSmartPosition("bottom-right");
        }
      };

      detectInputAreas();
      
      // Re-check on resize
      const handleResize = () => detectInputAreas();
      window.addEventListener('resize', handleResize);
      
      return () => window.removeEventListener('resize', handleResize);
    } else if (finalPosition !== "auto") {
      setSmartPosition(finalPosition);
    }
  }, [finalPosition, finalAvoidInputAreas]);

  const currentPosition = finalPosition === "auto" ? smartPosition : finalPosition;

  // Load saved drag position from localStorage
  React.useEffect(() => {
    const savedPosition = localStorage.getItem("feedbackButtonPosition");
    if (savedPosition && finalPosition === "draggable") {
      try {
        const { x, y } = JSON.parse(savedPosition);
        setDragPosition({ x, y });
      } catch (error) {
        console.error("Failed to parse saved position:", error);
      }
    }
  }, [finalPosition]);

  // Save drag position to localStorage
  const saveDragPosition = (position: { x: number; y: number }) => {
    localStorage.setItem("feedbackButtonPosition", JSON.stringify(position));
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable || finalPosition !== "draggable") return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const newPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 60, (dragPosition?.x || 0) + deltaX)),
      y: Math.max(0, Math.min(window.innerHeight - 60, (dragPosition?.y || 0) + deltaY))
    };
    
    setDragPosition(newPosition);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragPosition) {
      saveDragPosition(dragPosition);
    }
  };

  // Add global mouse event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart, dragPosition]);

  // Get the actual position for rendering
  const getButtonPosition = () => {
    if (finalPosition === "draggable" && dragPosition) {
      return {
        position: "fixed" as const,
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        transform: "none",
      };
    }
    return {};
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
        className={`fixed ${finalPosition === "draggable" ? "" : positionClasses[currentPosition]} z-40 ${isDragging ? "cursor-grabbing" : draggable && finalPosition === "draggable" ? "cursor-grab" : ""}`}
        style={getButtonPosition()}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isDragging ? 1.1 : 1, 
          opacity: 1,
          rotate: isDragging ? 5 : 0
        }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <div className="relative">
          {/* Pulse animation */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full ${sizeClasses[finalSize]}`}
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
            onClick={() => !isDragging && setIsOpen(true)}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative ${sizeClasses[finalSize]} bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${isDragging ? "shadow-2xl" : ""}`}
            whileHover={{ scale: isDragging ? 1.1 : 1.1 }}
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
              <Heart className={`${iconSizes[finalSize]} fill-current`} />
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && finalShowLabel && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: currentPosition.includes("right") ? 10 : -10 }}
                  animate={{ opacity: 1, scale: 1, x: currentPosition.includes("right") ? -10 : 10 }}
                  exit={{ opacity: 0, scale: 0.8, x: currentPosition.includes("right") ? 10 : -10 }}
                  className={`absolute ${
                    currentPosition.includes("right") ? "right-full mr-3" : "left-full ml-3"
                  } top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-body font-medium whitespace-nowrap shadow-lg`}
                >
                  Share your feedback
                  <div
                    className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45 ${
                      currentPosition.includes("right") ? "-right-1" : "-left-1"
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
