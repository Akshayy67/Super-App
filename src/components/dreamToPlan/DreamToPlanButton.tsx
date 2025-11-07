import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, animate } from "framer-motion";
import { Sparkles, Target } from "lucide-react";
import { DreamToPlanModal } from "./DreamToPlanModal";

interface DreamToPlanButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "auto" | "draggable";
  variant?: "floating" | "inline";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  avoidInputAreas?: boolean;
  customOffset?: { x?: number; y?: number };
  draggable?: boolean;
}

export const DreamToPlanButton: React.FC<DreamToPlanButtonProps> = ({
  position,
  variant = "floating",
  size = "md",
  showLabel = true,
  avoidInputAreas = true,
  customOffset = {},
  draggable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [smartPosition, setSmartPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left">("bottom-left");
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);

  // Button position (for moving the entire button)
  const buttonPositionX = useMotionValue(0);
  const buttonPositionY = useMotionValue(0);
  const smoothButtonX = useSpring(buttonPositionX, { stiffness: 80, damping: 20 });
  const smoothButtonY = useSpring(buttonPositionY, { stiffness: 80, damping: 20 });

  // Use props if provided, otherwise use defaults
  const finalPosition = position ?? "bottom-left";
  const finalSize = size;
  const finalShowLabel = showLabel;

  const positionClasses = {
    "bottom-right": `bottom-${6 + (customOffset.y || 0)} right-${6 + (customOffset.x || 0)}`,
    "bottom-left": `bottom-${6 + (customOffset.y || 0)} left-${6 + (customOffset.x || 0)}`,
    "top-right": `top-${6 + (customOffset.y || 0)} right-${6 + (customOffset.x || 0)}`,
    "top-left": `top-${6 + (customOffset.y || 0)} left-${6 + (customOffset.x || 0)}`,
  };

  // Smart positioning logic to avoid input areas
  React.useEffect(() => {
    if (finalPosition === "auto" && avoidInputAreas) {
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
              setSmartPosition("top-left");
            } else {
              setSmartPosition("bottom-left");
            }
          }
        } else {
          // Default to bottom-left for other pages
          setSmartPosition("bottom-left");
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
  }, [finalPosition, avoidInputAreas]);

  const currentPosition = finalPosition === "auto" ? smartPosition : finalPosition;

  // Load saved drag position from localStorage
  React.useEffect(() => {
    const savedPosition = localStorage.getItem("dreamToPlanButtonPosition");
    if (savedPosition && finalPosition === "draggable") {
      try {
        const { x, y } = JSON.parse(savedPosition);
        setDragPosition({ x, y });
      } catch (error) {
        console.error("Failed to parse saved position:", error);
      }
    } else if (finalPosition === "draggable" && !dragPosition) {
      // Set default position for dream to plan button (bottom-left) if no saved position
      // Offset from feedback button to prevent clash
      const setDefaultPosition = () => {
        const defaultX = 20; // 20px from left
        const defaultY = Math.max(20, window.innerHeight - 80); // 80px from bottom (same height as feedback button)
        setDragPosition({ x: defaultX, y: defaultY });
      };
      // Wait for window to be available
      if (typeof window !== 'undefined') {
        setDefaultPosition();
      }
    }
  }, [finalPosition]);

  // Save drag position to localStorage
  const saveDragPosition = (position: { x: number; y: number }) => {
    localStorage.setItem("dreamToPlanButtonPosition", JSON.stringify(position));
  };

  // Drag handlers - unified for both mouse and touch
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!draggable || finalPosition !== "draggable") return;
    setIsDragging(true);
    isDraggingRef.current = true;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (finalPosition === "draggable") {
      e.preventDefault();
      handleDragStart(e.clientX, e.clientY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (finalPosition === "draggable") {
      e.preventDefault();
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragStart) return;
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    const newPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 60, (dragPosition?.x || 0) + deltaX)),
      y: Math.max(0, Math.min(window.innerHeight - 60, (dragPosition?.y || 0) + deltaY))
    };
    
    setDragPosition(newPosition);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    isDraggingRef.current = false;
    if (dragPosition) {
      saveDragPosition(dragPosition);
    }
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Add global mouse and touch event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("touchcancel", handleTouchEnd);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("touchcancel", handleTouchEnd);
      };
    }
  }, [isDragging, dragStart, dragPosition]);

  // Track hover state
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

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
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-heading font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>Dream to Plan AI</span>
        </button>
        <DreamToPlanModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      {/* Floating Dream to Plan AI Button */}
      <motion.div
        className={`fixed ${finalPosition === "draggable" ? "" : positionClasses[currentPosition]} z-40 ${isDragging ? "cursor-grabbing" : draggable && finalPosition === "draggable" ? "cursor-grab" : ""}`}
        style={{
          ...getButtonPosition(),
          x: smoothButtonX,
          y: smoothButtonY,
        }}
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
            className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full ${sizeClasses[finalSize]} opacity-20`}
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
            onClick={() => {
              if (!isDragging) {
                setIsOpen(true);
              }
            }}
            onMouseEnter={() => {
              setIsHovered(true);
              isHoveredRef.current = true;
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              isHoveredRef.current = false;
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className={`relative ${sizeClasses[finalSize]} bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className={`${iconSizes[finalSize]} text-white`} />
            
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
