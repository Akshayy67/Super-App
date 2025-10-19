import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { Task } from "../../types";
import { format, isAfter, startOfDay, isToday, isTomorrow } from "date-fns";
import { TaskFeedback } from "../../utils/soundEffects";
import "./SwipeableTaskItem.css";

interface SwipeableTaskItemProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  getPriorityColor: (priority: string) => string;
}

export const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  getPriorityColor,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState<"left" | "right" | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const isOverdue = (task: Task) => {
    if (task.status === "completed") return false;
    return isAfter(startOfDay(new Date()), startOfDay(new Date(task.dueDate)));
  };

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
    currentX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;

    currentX.current = clientX;
    const deltaX = currentX.current - startX.current;

    // Limit swipe distance
    const maxSwipe = 120; // Keep in sync with color interpolation logic
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    setSwipeOffset(clampedDelta);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = currentX.current - startX.current;
    const threshold = 60;

    if (deltaX > threshold) {
      // Swipe right - toggle status (complete/undo)
      setShowActions("right");
      setIsCompleting(true);

      // Play swipe feedback
      TaskFeedback.swipeAction();

      setTimeout(() => {
        onToggleStatus(task);

        // Show celebration for completion
        if (task.status === "pending") {
          setShowSparkles(true);
          setTimeout(() => setShowSparkles(false), 1000);
        }

        setIsCompleting(false);
        resetSwipe();
      }, 200);
    } else if (deltaX < -threshold) {
      // Swipe left - delete
      setShowActions("left");
      TaskFeedback.swipeAction();

      setTimeout(() => {
        if (window.confirm("Are you sure you want to delete this task?")) {
          onDelete(task.id);
        }
        resetSwipe();
      }, 200);
    } else {
      resetSwipe();
    }
  };

  const resetSwipe = () => {
    setSwipeOffset(0);
    setShowActions(null);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Add global mouse move and up listeners when dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX);
      };

      const handleGlobalMouseUp = () => {
        handleEnd();
      };

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  // Dynamic color classes based on swipe direction & progress
  const computeSwipeColorClasses = () => {
    if (swipeOffset === 0) return "";
    const maxSwipe = 120; // Same as in handleMove
    const progress = Math.min(Math.abs(swipeOffset) / maxSwipe, 1);

    // Threshold steps for intensifying color
    const step = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;

    if (swipeOffset > 0) {
      // Swipe right (complete / undo) => green emphasis (or yellow if undoing completed?)
      // If task is completed and user is undoing (swipe right), we can use yellow accents
      if (task.status === "completed") {
        return [
          "bg-yellow-50 border-yellow-200",
          "bg-yellow-100 border-yellow-300",
          "bg-yellow-200 border-yellow-400",
        ][step];
      }
      return [
        "bg-green-50 border-green-200",
        "bg-green-100 border-green-300",
        "bg-green-200 border-green-400",
      ][step];
    } else {
      // Swipe left (delete) => red emphasis
      return [
        "bg-red-50 border-red-200",
        "bg-red-100 border-red-300",
        "bg-red-200 border-red-400",
      ][step];
    }
  };

  const swipeColorClasses = computeSwipeColorClasses();

  // Opacity for action labels based on swipe distance
  const actionLabelOpacity = Math.min(Math.abs(swipeOffset) / 40, 1);

  // Base status/overdue classes (used when not actively swiping)
  const baseStateClasses =
    task.status === "completed"
      ? "bg-gray-50 border-gray-200"
      : isOverdue(task)
      ? "bg-red-50 border-red-200"
      : "bg-white border-gray-200";

  // Date category caching
  const dueDateObj = new Date(task.dueDate);
  const isTaskToday = isToday(dueDateObj);
  const isTaskTomorrow = isTomorrow(dueDateObj);
  const overdue = isOverdue(task);

  return (
    <div className="relative overflow-hidden rounded-lg swipeable-task-item">
      {/* Background Actions */}
      <div className="absolute inset-0 flex swipe-action-bg">
        {/* Right action (complete/undo) */}
        <div
          className={`flex items-center justify-center w-20 sm:w-24 transition-all duration-200 ${
            task.status === "completed" ? "bg-yellow-500" : "bg-green-500"
          } ${showActions === "right" ? "swipe-action-active" : ""}`}
        >
          <div className="flex flex-col items-center text-white select-none">
            <Check className="w-6 h-6 sm:w-7 sm:h-7" />
            <span
              className="text-[10px] sm:text-xs font-semibold tracking-wide mt-1"
              style={{
                opacity: swipeOffset > 5 ? actionLabelOpacity : 0,
                transform: `translateY(${swipeOffset > 5 ? 0 : 4}px)`,
                transition: "opacity 0.15s ease, transform 0.2s ease",
              }}
            >
              {task.status === "completed" ? "Undo" : "Done"}
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Left action (delete) */}
        <div
          className={`flex items-center justify-center w-20 sm:w-24 bg-red-500 transition-all duration-200 ${
            showActions === "left" ? "swipe-action-active" : ""
          }`}
        >
          <div className="flex flex-col items-center text-white select-none">
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
            <span
              className="text-[10px] sm:text-xs font-semibold tracking-wide mt-1"
              style={{
                opacity: swipeOffset < -5 ? actionLabelOpacity : 0,
                transform: `translateY(${swipeOffset < -5 ? 0 : 4}px)`,
                transition: "opacity 0.15s ease, transform 0.2s ease",
              }}
            >
              Delete
            </span>
          </div>
        </div>
      </div>

      {/* Main Task Content */}
      <div
        ref={containerRef}
        className={`relative border rounded-lg p-3 sm:p-4 transition-all cursor-grab active:cursor-grabbing ${
          isDragging ? "shadow-lg dragging" : "hover:shadow-md"
        } ${swipeOffset !== 0 ? swipeColorClasses : baseStateClasses}`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start space-x-2 sm:space-x-3">
          <button
            onClick={() => {
              TaskFeedback.buttonPress();
              onToggleStatus(task);

              // Show celebration for completion
              if (task.status === "pending") {
                setShowSparkles(true);
                setTimeout(() => setShowSparkles(false), 1000);
              }
            }}
            className={`mt-1 transition-all duration-300 transform hover:scale-110 ${
              task.status === "completed"
                ? "text-green-600 hover:text-green-700"
                : "text-blue-600 hover:text-blue-700"
            } ${isCompleting ? "animate-pulse scale-110" : ""}`}
          >
            {task.status === "completed" ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Circle className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          <div className="flex-1 min-w-0 task-content">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium text-sm sm:text-base ${
                    task.status === "completed"
                      ? "text-gray-500 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {task.title}
                  {isOverdue(task) && (
                    <AlertTriangle className="inline w-3 h-3 sm:w-4 sm:h-4 text-red-500 ml-1 sm:ml-2" />
                  )}
                </h3>
                {task.description && (
                  <p
                    className={`text-xs sm:text-sm mt-1 ${
                      task.status === "completed"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0">
                <button
                  onClick={() => onEdit(task)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
              {task.status === "pending" && overdue && (
                <span className="px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-rose-500 to-red-600 text-white shadow flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Overdue
                </span>
              )}
              {task.status === "pending" && !overdue && isTaskToday && (
                <span className="px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow flex items-center gap-1">
                  Today
                </span>
              )}
              {task.status === "pending" &&
                !overdue &&
                !isTaskToday &&
                isTaskTomorrow && (
                  <span className="px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow flex items-center gap-1">
                    Tomorrow
                  </span>
                )}
              {task.subject && (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full flex-shrink-0">
                  {task.subject}
                </span>
              )}
              <span
                className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority} priority
              </span>
              <div className="flex items-center text-xs text-gray-500 flex-shrink-0">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">
                  {format(new Date(task.dueDate), "MMM dd, yyyy")}
                </span>
                <span className="sm:hidden">
                  {format(new Date(task.dueDate), "MMM dd")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* (Removed textual swipe hint and progress labels as requested) */}

        {/* Sparkle Effects for Completion */}
        {showSparkles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {[...Array(8)].map((_, i) => (
              <Sparkles
                key={i}
                className={`absolute text-yellow-400 animate-ping w-4 h-4`}
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${0.8 + Math.random() * 0.4}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Completion Glow Effect */}
        {task.status === "completed" && (
          <div className="absolute inset-0 bg-green-100 opacity-20 rounded-lg animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default SwipeableTaskItem;
