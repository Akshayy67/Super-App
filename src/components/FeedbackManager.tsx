import React, { useState, useEffect, createContext, useContext } from "react";
import { FeedbackPrompt } from "./FeedbackPrompt";
import { sendFeedbackEmail } from "../services/emailService";

interface FeedbackContextType {
  triggerFeedback: (options: FeedbackTriggerOptions) => void;
  dismissFeedback: () => void;
  recordAction: (action: string) => void;
  recordFeatureUsage: (feature: string) => void;
}

interface FeedbackTriggerOptions {
  type: "time" | "action" | "feature" | "session" | "milestone";
  featureName?: string;
  actionName?: string;
  delay?: number;
  priority?: "low" | "medium" | "high";
}

interface FeedbackState {
  isVisible: boolean;
  trigger?: FeedbackTriggerOptions;
  lastShown?: number;
  dismissedCount: number;
  feedbackGiven: boolean;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    isVisible: false,
    dismissedCount: 0,
    feedbackGiven: false,
  });

  const [userActivity, setUserActivity] = useState({
    sessionStart: Date.now(),
    actionsCount: 0,
    featuresUsed: new Set<string>(),
    timeSpent: 0,
  });

  // Load feedback state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("superapp-feedback-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFeedbackState((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Failed to parse feedback state:", error);
      }
    }
  }, []);

  // Save feedback state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "superapp-feedback-state",
      JSON.stringify({
        lastShown: feedbackState.lastShown,
        dismissedCount: feedbackState.dismissedCount,
        feedbackGiven: feedbackState.feedbackGiven,
      })
    );
  }, [feedbackState]);

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      setUserActivity((prev) => ({
        ...prev,
        timeSpent: Date.now() - prev.sessionStart,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-trigger feedback based on user activity
  useEffect(() => {
    const checkAutoTrigger = () => {
      // Don't show if already given feedback or dismissed too many times
      if (feedbackState.feedbackGiven || feedbackState.dismissedCount >= 3) {
        return;
      }

      // Don't show if shown recently (within 24 hours)
      if (
        feedbackState.lastShown &&
        Date.now() - feedbackState.lastShown < 24 * 60 * 60 * 1000
      ) {
        return;
      }

      // Trigger conditions
      const conditions = [
        // After 5 minutes of usage
        {
          condition: userActivity.timeSpent > 5 * 60 * 1000,
          trigger: { type: "time" as const, delay: 0 },
          priority: "low" as const,
        },
        // After using 3 different features
        {
          condition: userActivity.featuresUsed.size >= 3,
          trigger: { type: "milestone" as const, delay: 0 },
          priority: "medium" as const,
        },
        // After 10 actions
        {
          condition: userActivity.actionsCount >= 10,
          trigger: { type: "milestone" as const, delay: 0 },
          priority: "medium" as const,
        },
        // After 15 minutes (high priority)
        {
          condition: userActivity.timeSpent > 15 * 60 * 1000,
          trigger: { type: "session" as const, delay: 0 },
          priority: "high" as const,
        },
      ];

      // Find the highest priority condition that's met
      const triggeredCondition = conditions
        .filter((c) => c.condition)
        .sort((a, b) => {
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })[0];

      if (triggeredCondition && !feedbackState.isVisible) {
        triggerFeedback(triggeredCondition.trigger);
      }
    };

    const interval = setInterval(checkAutoTrigger, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [userActivity, feedbackState]);

  const triggerFeedback = (options: FeedbackTriggerOptions) => {
    // Don't show if already visible or if user has given feedback
    if (feedbackState.isVisible || feedbackState.feedbackGiven) {
      return;
    }

    setFeedbackState((prev) => ({
      ...prev,
      isVisible: true,
      trigger: options,
    }));
  };

  const dismissFeedback = () => {
    setFeedbackState((prev) => ({
      ...prev,
      isVisible: false,
      lastShown: Date.now(),
      dismissedCount: prev.dismissedCount + 1,
    }));
  };

  const recordAction = (action: string) => {
    setUserActivity((prev) => ({
      ...prev,
      actionsCount: prev.actionsCount + 1,
    }));
  };

  const recordFeatureUsage = (feature: string) => {
    setUserActivity((prev) => ({
      ...prev,
      featuresUsed: new Set([...prev.featuresUsed, feature]),
    }));
  };

  const handleFeedbackSubmit = async (feedback: any) => {
    try {
      console.log("📧 Sending feedback via EmailJS:", feedback);

      // Send feedback via EmailJS
      const success = await sendFeedbackEmail({
        type: feedback.type || "feedback",
        rating: feedback.rating,
        category: feedback.category || "General",
        title: feedback.title || "Quick Feedback",
        description:
          feedback.experience ||
          feedback.description ||
          "No description provided",
        email: feedback.email,
        priority: feedback.priority || "medium",
        timestamp: new Date().toISOString(),
      });

      if (success) {
        console.log("✅ Feedback sent successfully via email");
      } else {
        console.log("⚠️ Feedback saved locally, email failed");
      }
    } catch (error) {
      console.error("❌ Failed to send feedback:", error);
    }

    setFeedbackState((prev) => ({
      ...prev,
      isVisible: false,
      feedbackGiven: true,
      lastShown: Date.now(),
    }));
  };

  return (
    <FeedbackContext.Provider
      value={{
        triggerFeedback,
        dismissFeedback,
        recordAction,
        recordFeatureUsage,
      }}
    >
      {children}

      {feedbackState.isVisible && feedbackState.trigger && (
        <FeedbackPrompt
          trigger={feedbackState.trigger.type}
          featureName={feedbackState.trigger.featureName}
          actionName={feedbackState.trigger.actionName}
          delay={feedbackState.trigger.delay}
          onSubmit={handleFeedbackSubmit}
          onDismiss={dismissFeedback}
        />
      )}
    </FeedbackContext.Provider>
  );
};

// Hook for tracking feature usage
export const useFeatureTracking = (featureName: string) => {
  const { recordFeatureUsage } = useFeedback();

  useEffect(() => {
    recordFeatureUsage(featureName);
  }, [featureName, recordFeatureUsage]);
};

// Hook for tracking actions
export const useActionTracking = () => {
  const { recordAction } = useFeedback();

  return {
    trackAction: (actionName: string) => {
      recordAction(actionName);
    },
  };
};

// Component for manual feedback triggers
export const FeedbackTrigger: React.FC<{
  children: React.ReactNode;
  type: "action" | "feature";
  name: string;
  onClick?: () => void;
}> = ({ children, type, name, onClick }) => {
  const { triggerFeedback, recordAction, recordFeatureUsage } = useFeedback();

  const handleClick = () => {
    onClick?.();

    if (type === "action") {
      recordAction(name);
      // Trigger feedback for important actions
      if (
        [
          "interview-completed",
          "study-session-finished",
          "flashcard-deck-completed",
        ].includes(name)
      ) {
        setTimeout(() => {
          triggerFeedback({
            type: "action",
            actionName: name,
            delay: 0,
            priority: "high",
          });
        }, 2000); // Wait 2 seconds after action
      }
    } else if (type === "feature") {
      recordFeatureUsage(name);
      // Trigger feedback for new feature usage
      setTimeout(() => {
        triggerFeedback({
          type: "feature",
          featureName: name,
          delay: 0,
          priority: "medium",
        });
      }, 5000); // Wait 5 seconds after feature use
    }
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
};

// Smart feedback banner for specific pages
export const SmartFeedbackBanner: React.FC<{
  pageName: string;
  showAfter?: number; // seconds
}> = ({ pageName, showAfter = 30 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { triggerFeedback } = useFeedback();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showAfter * 1000);

    return () => clearTimeout(timer);
  }, [showAfter]);

  const handleFeedbackClick = () => {
    triggerFeedback({
      type: "feature",
      featureName: pageName,
      delay: 0,
      priority: "medium",
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">💭</span>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-gray-900 dark:text-white">
              How's your experience with {pageName}?
            </h4>
            <p className="font-body text-sm text-gray-600 dark:text-gray-400">
              Your feedback helps us improve this feature
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFeedbackClick}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-heading font-medium rounded-lg transition-colors"
          >
            Share Feedback
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-heading font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
