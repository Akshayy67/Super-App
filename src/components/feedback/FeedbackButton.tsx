import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { MessageSquare, Sparkles } from "lucide-react";
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

// Component to render eye tracking with motion values
const EyeTracking: React.FC<{
  highlightX: any;
  highlightY: any;
  pupilX: any;
  pupilY: any;
}> = ({ highlightX, highlightY, pupilX, pupilY }) => {
  const [highlightPos, setHighlightPos] = React.useState({ x: 19, y: 15 });
  const [pupilPos, setPupilPos] = React.useState({ x: 18.5, y: 15.5 });

  React.useEffect(() => {
    const unsubscribeHighlightX = highlightX.on("change", (latest: number) => {
      setHighlightPos(prev => ({ ...prev, x: latest }));
    });
    const unsubscribeHighlightY = highlightY.on("change", (latest: number) => {
      setHighlightPos(prev => ({ ...prev, y: latest }));
    });
    const unsubscribePupilX = pupilX.on("change", (latest: number) => {
      setPupilPos(prev => ({ ...prev, x: latest }));
    });
    const unsubscribePupilY = pupilY.on("change", (latest: number) => {
      setPupilPos(prev => ({ ...prev, y: latest }));
    });

    return () => {
      unsubscribeHighlightX();
      unsubscribeHighlightY();
      unsubscribePupilX();
      unsubscribePupilY();
    };
  }, [highlightX, highlightY, pupilX, pupilY]);

  return (
    <>
      {/* Eye white highlight - moves with eye tracking */}
      <circle
        cx={highlightPos.x}
        cy={highlightPos.y}
        r="1.2"
        fill="#FFF"
      />
      {/* Eye pupil (blue) - tracks mouse cursor */}
      <circle
        cx={pupilPos.x}
        cy={pupilPos.y}
        r="0.5"
        fill="#4A90E2"
      />
    </>
  );
};

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
  const [isBirdFlying, setIsBirdFlying] = useState(false);
  const [isCageFollowing, setIsCageFollowing] = useState(false);
  const [isButtonMoving, setIsButtonMoving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const originalButtonPositionRef = useRef<{ x: number; y: number } | null>(null);
  
  // Smooth bird position tracking
  const birdX = useMotionValue(0);
  const birdY = useMotionValue(0);
  const smoothBirdX = useSpring(birdX, { stiffness: 150, damping: 20 });
  const smoothBirdY = useSpring(birdY, { stiffness: 150, damping: 20 });
  
  // Cage position (follows bird when bird is flying)
  const cageX = useMotionValue(0);
  const cageY = useMotionValue(0);
  const smoothCageX = useSpring(cageX, { stiffness: 100, damping: 15 });
  const smoothCageY = useSpring(cageY, { stiffness: 100, damping: 15 });
  
  // Button position (for moving the entire button)
  const buttonPositionX = useMotionValue(0);
  const buttonPositionY = useMotionValue(0);
  const smoothButtonX = useSpring(buttonPositionX, { stiffness: 80, damping: 20 });
  const smoothButtonY = useSpring(buttonPositionY, { stiffness: 80, damping: 20 });
  
  // Eye tracking - position of pupils looking at cursor
  const eyeX = useMotionValue(0);
  const eyeY = useMotionValue(0);
  const smoothEyeX = useSpring(eyeX, { stiffness: 200, damping: 25 });
  const smoothEyeY = useSpring(eyeY, { stiffness: 200, damping: 25 });
  
  // Transform eye positions for SVG attributes (base position + offset)
  const eyeHighlightX = useTransform(smoothEyeX, (x) => 19 + x);
  const eyeHighlightY = useTransform(smoothEyeY, (y) => 15 + y);
  const eyePupilX = useTransform(smoothEyeX, (x) => 18.5 + x);
  const eyePupilY = useTransform(smoothEyeY, (y) => 15.5 + y);
  
  // Wing animation motion values - ensure rx/ry are always defined
  const wingRx = useMotionValue(7);
  const wingRy = useMotionValue(12);
  const wingDetailRx = useMotionValue(4);
  const wingDetailRy = useMotionValue(8);
  
  // Animate wing values
  useEffect(() => {
    const controls = {
      wingRx: animate(wingRx, [7, 6, 7], {
        duration: 0.7,
        repeat: Infinity,
        ease: "easeInOut",
      }),
      wingRy: animate(wingRy, [12, 9, 12], {
        duration: 0.7,
        repeat: Infinity,
        ease: "easeInOut",
      }),
      wingDetailRy: animate(wingDetailRy, [8, 6, 8], {
        duration: 0.7,
        repeat: Infinity,
        ease: "easeInOut",
      }),
    };
    
    return () => {
      controls.wingRx.stop();
      controls.wingRy.stop();
      controls.wingDetailRy.stop();
    };
  }, [wingRx, wingRy, wingDetailRy]);

  // Function to make bird fly away
  const makeBirdFlyAway = (returnToCenter: boolean = true) => {
    setIsBirdFlying(true);
    
    // Calculate opposite position (random opposite direction)
    const angle = Math.random() * Math.PI * 2;
    const distance = 150; // Distance to fly
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;
    
    // Animate bird flying away
    animate(birdX, targetX, {
      duration: 1.5,
      ease: "easeOut",
    });
    animate(birdY, targetY, {
      duration: 1.5,
      ease: "easeOut",
    });

    // If returnToCenter is true, return after a delay (for 7-minute timer)
    if (returnToCenter) {
      setTimeout(() => {
        setIsCageFollowing(true);
        animate(cageX, targetX, {
          duration: 1.5,
          ease: "easeInOut",
          onComplete: () => {
            // After cage catches up, move the entire button to a new position
            moveButtonToNewPosition(() => {
              // After button moves, bird returns to center
              setTimeout(() => {
                makeBirdReturn();
              }, 1000); // Wait 1 second before bird returns
            });
          },
        });
        animate(cageY, targetY, {
          duration: 1.5,
          ease: "easeInOut",
        });
      }, 2000);
    }
  };

  // Function to move the entire button to a new position
  const moveButtonToNewPosition = (onComplete?: () => void) => {
    if (!buttonRef.current) {
      onComplete?.();
      return;
    }

    setIsButtonMoving(true);
    
    // Get current button position (accounting for any existing transform)
    const rect = buttonRef.current.getBoundingClientRect();
    const currentX = rect.left;
    const currentY = rect.top;
    
    // Store original position if not already stored (before any movement)
    if (!originalButtonPositionRef.current) {
      originalButtonPositionRef.current = { x: currentX, y: currentY };
    }

    // Calculate new position (random position on screen, but keep it visible)
    // Use a reasonable distance from current position (not too far, not too close)
    const buttonSize = Math.max(rect.width, rect.height);
    const minDistance = 100; // Minimum distance to move
    const maxDistance = 300; // Maximum distance to move
    const angle = Math.random() * Math.PI * 2;
    const distance = minDistance + Math.random() * (maxDistance - minDistance);
    
    // Calculate new position relative to current
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    
    // Make sure the new position stays within screen bounds
    const newX = currentX + offsetX;
    const newY = currentY + offsetY;
    const maxX = window.innerWidth - buttonSize - 20;
    const maxY = window.innerHeight - buttonSize - 20;
    
    // Clamp to screen bounds if needed
    const finalOffsetX = Math.max(-currentX + 20, Math.min(maxX - currentX, offsetX));
    const finalOffsetY = Math.max(-currentY + 20, Math.min(maxY - currentY, offsetY));
    
    // Animate button to new position
    animate(buttonPositionX, finalOffsetX, {
      duration: 2,
      ease: "easeInOut",
    });
    animate(buttonPositionY, finalOffsetY, {
      duration: 2,
      ease: "easeInOut",
      onComplete: () => {
        onComplete?.();
      },
    });
  };

  // Function to return button to original position
  const returnButtonToOriginal = () => {
    if (!originalButtonPositionRef.current) {
      setIsButtonMoving(false);
      return;
    }

    // Animate button back to original position
    animate(buttonPositionX, 0, {
      duration: 2,
      ease: "easeInOut",
    });
    animate(buttonPositionY, 0, {
      duration: 2,
      ease: "easeInOut",
      onComplete: () => {
        setIsButtonMoving(false);
        originalButtonPositionRef.current = null;
      },
    });
  };

  // Function to make bird return to center
  const makeBirdReturn = () => {
    animate(birdX, 0, {
      duration: 1.5,
      ease: "easeIn",
      onComplete: () => {
        // Then cage returns
        animate(cageX, 0, {
          duration: 1.5,
          ease: "easeInOut",
          onComplete: () => {
            // After cage returns, return button to original position
            returnButtonToOriginal();
            setIsBirdFlying(false);
            setIsCageFollowing(false);
            birdY.set(0);
            cageY.set(0);
          },
        });
      },
    });
    animate(birdY, 0, {
      duration: 1.5,
      ease: "easeIn",
    });
  };

  // 7-minute timer for bird to fly away
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    
    const flyAway = () => {
      // Check if user is interacting - use refs to avoid stale closures
      if (isHoveredRef.current || isDraggingRef.current) {
        // Reschedule for later
        timeoutId = setTimeout(flyAway, 10000); // Try again in 10 seconds
        return;
      }
      
      makeBirdFlyAway(true);
    };

    // Set up 7-minute interval (420000 milliseconds = 7 minutes)
    intervalId = setInterval(() => {
      flyAway();
    }, 420000);
    
    // Also trigger on mount after 7 minutes
    timeoutId = setTimeout(flyAway, 420000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - only run once on mount
  
  // Unique gradient IDs for each button instance (generated once)
  const gradientIdRef = useRef<string | null>(null);
  const wingGradientIdRef = useRef<string | null>(null);
  
  if (!gradientIdRef.current) {
    gradientIdRef.current = `bird-gradient-${Math.random().toString(36).substr(2, 9)}`;
    wingGradientIdRef.current = `wing-gradient-${Math.random().toString(36).substr(2, 9)}`;
  }

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

  // Drag handlers - unified for both mouse and touch
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!draggable || finalPosition !== "draggable") return;
    setIsDragging(true);
    isDraggingRef.current = true;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
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

  // Track mouse position when hovering over button
  useEffect(() => {
    if (!isHovered || !buttonRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const buttonRect = buttonRef.current?.getBoundingClientRect();
      if (!buttonRect) return;

      // Calculate relative position from button center
      const centerX = buttonRect.left + buttonRect.width / 2;
      const centerY = buttonRect.top + buttonRect.height / 2;
      
      const relativeX = e.clientX - centerX;
      const relativeY = e.clientY - centerY;

      // Clamp the bird position to stay near the button area
      const maxDistance = 60;
      const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
      
      let targetX = relativeX - 20; // Offset to make bird look natural
      let targetY = relativeY - 25;
      
      // If cursor is too far, keep bird at max distance
      if (distance > maxDistance) {
        const angle = Math.atan2(relativeY, relativeX);
        targetX = Math.cos(angle) * maxDistance - 20;
        targetY = Math.sin(angle) * maxDistance - 25;
      }

      // Update bird position with smooth tracking
      birdX.set(targetX);
      birdY.set(targetY);

      // Calculate eye direction
      // Bird position in SVG: center is around (20, 17), eye is at (18, 16)
      // Scale factor based on bird size
      const birdScale = finalSize === "sm" ? 36/48 : finalSize === "lg" ? 44/48 : 40/48;
      
      // Calculate eye position in screen coordinates
      // Eye offset from bird center in SVG: (18-20, 16-17) = (-2, -1)
      const eyeOffsetX = -2 * birdScale;
      const eyeOffsetY = -1 * birdScale;
      const eyeScreenX = centerX + targetX + eyeOffsetX;
      const eyeScreenY = centerY + targetY + eyeOffsetY;
      
      // Vector from eye to cursor
      const eyeToCursorX = e.clientX - eyeScreenX;
      const eyeToCursorY = e.clientY - eyeScreenY;
      const eyeToCursorDistance = Math.sqrt(eyeToCursorX * eyeToCursorX + eyeToCursorY * eyeToCursorY);
      
      // Eye pupil max movement radius (eye radius is 3 in SVG, pupil should move within ~1.2 units)
      const maxEyeMovement = 1.2;
      
      if (eyeToCursorDistance > 5) { // Only track if cursor is not too close
        // Normalize direction vector
        const normalizedX = eyeToCursorX / eyeToCursorDistance;
        const normalizedY = eyeToCursorY / eyeToCursorDistance;
        
        // Calculate movement amount (further away = more movement, but clamped to max)
        // Scale by distance but keep within eye bounds
        const movementAmount = Math.min(eyeToCursorDistance * 0.015, maxEyeMovement);
        
        eyeX.set(normalizedX * movementAmount);
        eyeY.set(normalizedY * movementAmount);
      } else {
        // Center the eye when cursor is very close
        eyeX.set(0);
        eyeY.set(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    
    // Reset eye position when not hovering
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      eyeX.set(0);
      eyeY.set(0);
    };
  }, [isHovered, birdX, birdY, eyeX, eyeY, finalSize]);

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
        style={{
          ...getButtonPosition(),
          x: isButtonMoving ? smoothButtonX : 0,
          y: isButtonMoving ? smoothButtonY : 0,
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
            className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg ${sizeClasses[finalSize]}`}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Cage bars - positioned around the button */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-10 rounded-lg"
            style={{
              x: isCageFollowing ? smoothCageX : 0,
              y: isCageFollowing ? smoothCageY : 0,
            }}
          >
            <svg
              className={`absolute inset-0 ${sizeClasses[finalSize]}`}
              viewBox="0 0 100 100"
              style={{ overflow: "visible" }}
              preserveAspectRatio="none"
            >
              {/* Vertical bars */}
              <line
                x1="8"
                y1="5"
                x2="8"
                y2="95"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="25"
                y1="5"
                x2="25"
                y2="95"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="42"
                y1="5"
                x2="42"
                y2="95"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="58"
                y1="5"
                x2="58"
                y2="95"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="75"
                y1="5"
                x2="75"
                y2="95"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="92"
                y1="5"
                x2="92"
                y2="95"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Horizontal bars */}
              <line
                x1="5"
                y1="8"
                x2="95"
                y2="8"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="5"
                y1="25"
                x2="95"
                y2="25"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="5"
                y1="42"
                x2="95"
                y2="42"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="5"
                y1="58"
                x2="95"
                y2="58"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="5"
                y1="75"
                x2="95"
                y2="75"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="5"
                y1="92"
                x2="95"
                y2="92"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Corner decorations - cage corners */}
              <rect x="3" y="3" width="4" height="4" rx="1" fill="rgba(255, 255, 255, 0.9)" />
              <rect x="93" y="3" width="4" height="4" rx="1" fill="rgba(255, 255, 255, 0.9)" />
              <rect x="3" y="93" width="4" height="4" rx="1" fill="rgba(255, 255, 255, 0.9)" />
              <rect x="93" y="93" width="4" height="4" rx="1" fill="rgba(255, 255, 255, 0.9)" />
            </svg>
          </motion.div>

          {/* Main button */}
          <motion.button
            ref={buttonRef}
            onClick={() => {
              if (!isDragging) {
                // Make bird fly away when button is clicked
                makeBirdFlyAway(false);
                setIsOpen(true);
              }
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseEnter={() => {
              setIsHovered(true);
              isHoveredRef.current = true;
              if (!isBirdFlying) {
                birdX.set(0);
                birdY.set(0);
              }
              eyeX.set(0);
              eyeY.set(0);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              isHoveredRef.current = false;
              if (!isBirdFlying) {
                birdX.set(0);
                birdY.set(0);
              }
              eyeX.set(0);
              eyeY.set(0);
            }}
            className={`relative ${sizeClasses[finalSize]} bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${isDragging ? "shadow-2xl" : ""} border-2 border-white/30`}
            whileHover={{ scale: isDragging ? 1.1 : 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background sparkles */}
            <div className="absolute inset-0 rounded-lg overflow-hidden">
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

            {/* Cute Bird - replaces Heart icon, follows mouse cursor on hover or flies away every 7 minutes */}
            <motion.div
              style={{
                position: (isHovered && !isDragging) || isBirdFlying ? "absolute" : "relative",
                x: (isHovered && !isDragging) || isBirdFlying ? smoothBirdX : 0,
                y: (isHovered && !isDragging) || isBirdFlying ? smoothBirdY : 0,
                pointerEvents: "none",
                zIndex: 50,
              }}
              animate={{
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ 
                scale: { duration: 0.3 }
              }}
            >
                  <motion.svg
                    width={finalSize === "sm" ? "36" : finalSize === "lg" ? "44" : "40"}
                    height={finalSize === "sm" ? "36" : finalSize === "lg" ? "44" : "40"}
                    viewBox="0 0 48 48"
                    className="drop-shadow-xl"
                    style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}
                    animate={{
                      y: [0, -4, 0],
                      rotate: [0, 8, -8, 0],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <defs>
                      <linearGradient id={gradientIdRef.current!} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFE8A0" />
                        <stop offset="100%" stopColor="#FFD700" />
                      </linearGradient>
                      <linearGradient id={wingGradientIdRef.current!} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFC107" />
                        <stop offset="100%" stopColor="#FF8C00" />
                      </linearGradient>
                    </defs>
                    
                    {/* Tail feathers - Adds charm */}
                    <path
                      d="M 32 28 Q 38 22 42 26 Q 38 28 36 32 Z"
                      fill={`url(#${wingGradientIdRef.current!})`}
                      opacity="0.9"
                    />
                    
                    {/* Bird Body - Cute rounded body with gradient */}
                    <ellipse
                      cx="22"
                      cy="26"
                      rx="11"
                      ry="9"
                      fill={`url(#${gradientIdRef.current!})`}
                      stroke="#FFC107"
                      strokeWidth="2"
                    />
                    
                    {/* Bird Head - Round and cute */}
                    <circle
                      cx="20"
                      cy="17"
                      r="9"
                      fill={`url(#${gradientIdRef.current!})`}
                      stroke="#FFC107"
                      strokeWidth="2"
                    />
                    
                    {/* Wing - Flapping animation with gradient */}
                    <motion.ellipse
                      cx="24"
                      cy="26"
                      rx={wingRx}
                      ry={wingRy}
                      fill={`url(#${wingGradientIdRef.current!})`}
                      opacity="0.85"
                      initial={{ rotate: 0 }}
                      animate={{
                        rotate: [0, 5, 0],
                      }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    
                    {/* Wing detail */}
                    <motion.ellipse
                      cx="24"
                      cy="26"
                      rx={wingDetailRx}
                      ry={wingDetailRy}
                      fill="#FFA500"
                      opacity="0.6"
                    />
                    
                    {/* Eye - Cute and expressive, tracks mouse cursor */}
                    <circle
                      cx="18"
                      cy="16"
                      r="3"
                      fill="#1A1A1A"
                    />
                    {/* Eye white highlight and pupil - moves with eye tracking */}
                    <EyeTracking 
                      highlightX={eyeHighlightX}
                      highlightY={eyeHighlightY}
                      pupilX={eyePupilX}
                      pupilY={eyePupilY}
                    />
                    
                    {/* Beak - Small and cute */}
                    <path
                      d="M 14 18 L 10 19.5 L 14 21 Z"
                      fill="#FF6B35"
                    />
                    <path
                      d="M 14 18 L 10 19.5 L 14 19.2 Z"
                      fill="#FF8C42"
                    />
                    
                    {/* Cheek blush - Makes it cuter */}
                    <ellipse
                      cx="16"
                      cy="19"
                      rx="2.5"
                      ry="2"
                      fill="#FFB6C1"
                      opacity="0.7"
                    />
                    <ellipse
                      cx="16"
                      cy="19"
                      rx="1.5"
                      ry="1"
                      fill="#FF9DB0"
                      opacity="0.5"
                    />
                    
                    {/* Tiny sparkles for extra cuteness */}
                    <motion.circle
                      cx="23"
                      cy="13"
                      r="2"
                      fill="#FFF"
                      animate={{
                        opacity: [0.4, 1, 0.4],
                        scale: [1, 1.4, 1],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.circle
                      cx="26"
                      cy="15"
                      r="1.2"
                      fill="#FFF"
                      animate={{
                        opacity: [0.3, 0.9, 0.3],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3,
                      }}
                    />
                    
                    {/* Feet - Tiny and cute */}
                    <path
                      d="M 18 32 L 19 35 L 20 32"
                      stroke="#FF6B35"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 24 32 L 25 35 L 26 32"
                      stroke="#FF6B35"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </motion.svg>
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
      <FeedbackSystem 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          // Make bird return when modal closes
          makeBirdReturn();
        }} 
      />
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
