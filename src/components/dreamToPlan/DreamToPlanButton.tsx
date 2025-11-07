import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target } from "lucide-react";
import { DreamToPlanModal } from "./DreamToPlanModal";

interface DreamToPlanButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "auto" | "draggable";
  variant?: "floating" | "inline";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const DreamToPlanButton: React.FC<DreamToPlanButtonProps> = ({
  position = "bottom-right",
  variant = "floating",
  size = "md",
  showLabel = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-heading font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>Dream to Plan AI</span>
        </button>
        <DreamToPlanModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  const currentPosition = position === "auto" ? "bottom-right" : position === "draggable" ? "bottom-right" : position;

  return (
    <>
      {/* Floating Dream to Plan AI Button */}
      <motion.div
        className={`fixed ${positionClasses[currentPosition]} z-40`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
        }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <div className="relative">
          {/* Pulse animation */}
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-600 rounded-full opacity-20`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.button
            ref={buttonRef}
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative ${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className={`${iconSizes[size]} text-white`} />
            
            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && showLabel && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: currentPosition.includes("right") ? 10 : -10 }}
                  animate={{ opacity: 1, scale: 1, x: currentPosition.includes("right") ? -10 : 10 }}
                  exit={{ opacity: 0, scale: 0.8, x: currentPosition.includes("right") ? 10 : -10 }}
                  className={`absolute ${
                    currentPosition.includes("right") ? "right-full mr-3" : "left-full ml-3"
                  } top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-body font-medium whitespace-nowrap shadow-lg`}
                >
                  Dream to Plan AI
                  <div
                    className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45 ${
                      currentPosition.includes("right") ? "-right-1" : "-left-1"
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Dream to Plan Modal */}
      <DreamToPlanModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

