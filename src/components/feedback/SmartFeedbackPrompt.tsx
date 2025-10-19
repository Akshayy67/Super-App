import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Heart, Sparkles, X, Clock, CheckCircle, Star } from "lucide-react";
import { FeedbackSystem } from "./FeedbackSystem";

interface SmartFeedbackPromptProps {
  trigger?: "session_complete" | "task_complete" | "file_upload" | "ai_interaction" | "manual";
  delay?: number;
  onDismiss?: () => void;
  context?: {
    action?: string;
    duration?: number;
    success?: boolean;
  };
}

export const SmartFeedbackPrompt: React.FC<SmartFeedbackPromptProps> = ({
  trigger = "manual",
  delay = 3000,
  onDismiss,
  context,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    onDismiss?.();
  };

  const handleFeedbackClick = () => {
    setIsOpen(true);
    setIsVisible(false);
  };

  if (isDismissed) return null;

  const getPromptContent = () => {
    switch (trigger) {
      case "session_complete":
        return {
          title: "Great session! How was your experience?",
          description: "You've completed a study session. We'd love to hear your feedback.",
          icon: CheckCircle,
          color: "green",
        };
      case "task_complete":
        return {
          title: "Task completed! 🎉",
          description: "Nice work! How was the task experience?",
          icon: Star,
          color: "blue",
        };
      case "file_upload":
        return {
          title: "File uploaded successfully!",
          description: "How was the upload process? Any suggestions for improvement?",
          icon: CheckCircle,
          color: "purple",
        };
      case "ai_interaction":
        return {
          title: "AI interaction complete",
          description: "How helpful was the AI assistant? Your feedback helps us improve.",
          icon: Sparkles,
          color: "orange",
        };
      default:
        return {
          title: "How was your experience?",
          description: "We'd love to hear your feedback to improve Super Study.",
          icon: Heart,
          color: "blue",
        };
    }
  };

  const content = getPromptContent();
  const Icon = content.icon;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 z-50"
          >
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r from-${content.color}-500 to-${content.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {content.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {content.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleFeedbackClick}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Share Feedback
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
                    >
                      Not now
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FeedbackSystem isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

// Hook for triggering feedback prompts based on user actions
export const useFeedbackTrigger = () => {
  const [prompts, setPrompts] = useState<Array<{
    id: string;
    trigger: SmartFeedbackPromptProps["trigger"];
    context?: SmartFeedbackPromptProps["context"];
  }>>([]);

  const triggerFeedback = (
    trigger: SmartFeedbackPromptProps["trigger"],
    context?: SmartFeedbackPromptProps["context"]
  ) => {
    const id = Date.now().toString();
    setPrompts(prev => [...prev, { id, trigger, context }]);
  };

  const dismissPrompt = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  return {
    prompts,
    triggerFeedback,
    dismissPrompt,
  };
};

// Context-aware feedback component that tracks user actions
export const ContextualFeedback: React.FC = () => {
  const { prompts, dismissPrompt } = useFeedbackTrigger();

  // Track user actions and trigger appropriate feedback prompts
  useEffect(() => {
    const handleTaskComplete = () => {
      // This would be called when a task is completed
      // triggerFeedback("task_complete", { action: "task_complete", success: true });
    };

    const handleFileUpload = () => {
      // This would be called when a file is uploaded
      // triggerFeedback("file_upload", { action: "file_upload", success: true });
    };

    const handleAIChat = () => {
      // This would be called after AI interactions
      // triggerFeedback("ai_interaction", { action: "ai_chat", success: true });
    };

    // Add event listeners for different actions
    // These would be set up by the respective components
    document.addEventListener("task-complete", handleTaskComplete);
    document.addEventListener("file-upload", handleFileUpload);
    document.addEventListener("ai-interaction", handleAIChat);

    return () => {
      document.removeEventListener("task-complete", handleTaskComplete);
      document.removeEventListener("file-upload", handleFileUpload);
      document.removeEventListener("ai-interaction", handleAIChat);
    };
  }, []);

  return (
    <>
      {prompts.map((prompt) => (
        <SmartFeedbackPrompt
          key={prompt.id}
          trigger={prompt.trigger}
          context={prompt.context}
          onDismiss={() => dismissPrompt(prompt.id)}
          delay={2000}
        />
      ))}
    </>
  );
};
