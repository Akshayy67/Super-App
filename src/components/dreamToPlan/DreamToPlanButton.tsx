import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, animate } from "framer-motion";
import { Cloud, Wand2, Zap } from "lucide-react";
import { DreamToPlanModal } from "./DreamToPlanModal";

// Rotating helpful messages
const helpMessages = [
  "Need help?",
  "Let me assist ✨",
  "I'm here to help!",
  "Want some guidance?",
  "How can I help?",
  "Ready to help!",
  "Here to support you 🌟",
  "What can I do for you?",
];

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
  const [currentHelpMessage, setCurrentHelpMessage] = useState(0);
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

  // Rotate help messages
  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setCurrentHelpMessage((prev) => (prev + 1) % helpMessages.length);
      }, 2500); // Change message every 2.5 seconds
      return () => clearInterval(interval);
    }
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
        <motion.button
          onClick={() => setIsOpen(true)}
          className="relative inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 hover:from-blue-600 hover:via-cyan-600 hover:to-sky-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 backdrop-blur-sm border-2 border-white/20 overflow-hidden group"
          style={{
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4), 0 0 20px rgba(6, 182, 212, 0.3)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Sparkle effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative z-10 flex items-center gap-2">
            <div className="relative">
              <Cloud className="w-5 h-5" />
              {/* Sparkle on cloud */}
              <motion.div
                className="absolute -top-0.5 -right-0.5"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Zap className="w-2.5 h-2.5 text-yellow-200" />
              </motion.div>
            </div>
            <span className="font-semibold">Dream to Plan AI</span>
          </div>
        </motion.button>
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
        <div className="relative" style={{ overflow: 'visible', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          {/* Dreamy glow layers - centered on button */}
          <motion.div
            className={`absolute bg-gradient-to-r from-blue-400/30 via-cyan-400/30 to-sky-400/30 rounded-full ${sizeClasses[finalSize]} blur-xl`}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Secondary glow */}
          <motion.div
            className={`absolute bg-gradient-to-br from-blue-300/40 to-cyan-300/40 rounded-full ${sizeClasses[finalSize]} blur-lg`}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Soft cloud-like pulse */}
          <motion.div
            className={`absolute bg-gradient-to-r from-blue-200/50 to-cyan-200/50 rounded-full ${sizeClasses[finalSize]}`}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.1, 0, 0.1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Dream bubbles emerging from button on hover - outside button */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(5)].map((_, i) => {
                  const angle = (i * 360) / 5;
                  const radians = (angle * Math.PI) / 180;
                  const baseDistance = 70;
                  const maxDistance = 120;
                  return (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ 
                        scale: 0.2,
                        opacity: 0.9 
                      }}
                      animate={{ 
                        x: [0, Math.cos(radians) * baseDistance, Math.cos(radians) * maxDistance],
                        y: [0, Math.sin(radians) * baseDistance, Math.sin(radians) * maxDistance],
                        scale: [0.2, 0.8, 1.5, 2, 2.5],
                        opacity: [0.9, 1, 0.8, 0.4, 0],
                      }}
                      exit={{ 
                        scale: 0,
                        opacity: 0 
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.2,
                        repeat: Infinity,
                        ease: "easeOut",
                        times: [0, 0.3, 0.6, 0.8, 1],
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {/* Dream bubble shape */}
                      <div className="relative">
                        {/* Main bubble */}
                        <motion.div 
                          className="w-10 h-10 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md rounded-full border-2 border-white/50 shadow-xl"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        {/* Smaller bubble */}
                        <motion.div 
                          className="absolute -top-2 -right-2 w-5 h-5 bg-white/30 backdrop-blur-sm rounded-full border border-white/40"
                          animate={{
                            scale: [1, 1.3, 1],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.3,
                          }}
                        />
                        {/* Tiny bubble */}
                        <motion.div 
                          className="absolute top-3 -left-2 w-4 h-4 bg-white/25 backdrop-blur-sm rounded-full"
                          animate={{
                            scale: [1, 1.4, 1],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.6,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
                
                {/* Floating dream clouds */}
                {[...Array(3)].map((_, i) => {
                  const startAngle = (i * 120) * Math.PI / 180;
                  const distance = 60 + i * 20;
                  return (
                    <motion.div
                      key={`cloud-${i}`}
                      className="absolute"
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        scale: 0,
                        opacity: 0 
                      }}
                      animate={{ 
                        x: Math.cos(startAngle) * distance,
                        y: Math.sin(startAngle) * distance,
                        scale: [0, 1.2, 1.5],
                        opacity: [0, 0.7, 0],
                      }}
                      exit={{ 
                        scale: 0,
                        opacity: 0 
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <Cloud className="w-6 h-6 text-white/60 drop-shadow-lg" />
                    </motion.div>
                  );
                })}
              </>
            )}
          </AnimatePresence>

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
              // Reset to first message on hover
              setCurrentHelpMessage(0);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              isHoveredRef.current = false;
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className={`relative ${sizeClasses[finalSize]} bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500 hover:from-blue-600 hover:via-cyan-600 hover:to-sky-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group backdrop-blur-sm border-2 border-white/20 z-10`}
            style={{
              boxShadow: isHovered 
                ? '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(6, 182, 212, 0.4), 0 0 90px rgba(14, 165, 233, 0.3)'
                : '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(6, 182, 212, 0.3)',
              pointerEvents: 'auto',
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >

            {/* Dream icon - Cloud with sparkle */}
            <motion.div
              className="relative z-10"
              animate={{
                scale: isHovered ? [1, 1.1, 1] : 1,
                y: isHovered ? [0, -2, 0] : 0,
              }}
              transition={{
                duration: 1.5,
                repeat: isHovered ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <div className="relative">
                <Cloud className={`${iconSizes[finalSize]} text-white drop-shadow-lg`} />
                {/* Sparkle on cloud */}
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Zap className="w-3 h-3 text-yellow-200 drop-shadow-lg" />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Dreamy tooltip with rotating messages */}
            <AnimatePresence mode="wait">
              {isHovered && finalShowLabel && (
                <motion.div
                  key={currentHelpMessage}
                  initial={{ opacity: 0, scale: 0.8, y: 10, x: currentPosition.includes("right") ? 10 : -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: currentPosition.includes("right") ? -10 : 10 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10, x: currentPosition.includes("right") ? 10 : -10 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute ${
                    currentPosition.includes("right") ? "right-full mr-4" : "left-full ml-4"
                  } top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600/95 to-cyan-600/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap shadow-2xl border border-white/20`}
                  style={{
                    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Wand2 className="w-4 h-4" />
                    </motion.div>
                    <span>{helpMessages[currentHelpMessage]}</span>
                  </div>
                  {/* Arrow */}
                  <div
                    className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-blue-600/95 to-cyan-600/95 rotate-45 border-r border-b border-white/20 ${
                      currentPosition.includes("right") ? "-right-1.5" : "-left-1.5"
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
