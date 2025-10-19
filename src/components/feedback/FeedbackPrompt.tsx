import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  X,
  Send,
  Heart,
  Sparkles,
  Coffee,
  Zap,
  Target,
  Users,
} from "lucide-react";

interface FeedbackPromptProps {
  trigger?: "time" | "action" | "feature" | "session";
  featureName?: string;
  actionName?: string;
  delay?: number;
  onSubmit?: (feedback: any) => void;
  onDismiss?: () => void;
}

export const FeedbackPrompt: React.FC<FeedbackPromptProps> = ({
  trigger = "time",
  featureName,
  actionName,
  delay = 30000, // 30 seconds default
  onSubmit,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<"prompt" | "quick" | "detailed" | "thanks">("prompt");
  const [quickRating, setQuickRating] = useState<number>(0);
  const [feedback, setFeedback] = useState({
    rating: 0,
    experience: "",
    suggestion: "",
    wouldRecommend: null as boolean | null,
    email: "",
  });

  useEffect(() => {
    if (trigger === "time") {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [trigger, delay]);

  const handleQuickFeedback = (rating: number) => {
    setQuickRating(rating);
    setFeedback({ ...feedback, rating });
    
    if (rating >= 4) {
      // Happy path - quick thanks
      setStep("thanks");
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      // Need more details for improvement
      setStep("detailed");
    }
  };

  const handleDetailedSubmit = () => {
    const feedbackData = {
      ...feedback,
      trigger,
      featureName,
      actionName,
      timestamp: new Date().toISOString(),
    };
    
    onSubmit?.(feedbackData);
    setStep("thanks");
    
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getPromptMessage = () => {
    switch (trigger) {
      case "feature":
        return `How was your experience with ${featureName}?`;
      case "action":
        return `How did ${actionName} work for you?`;
      case "session":
        return "How was your study session today?";
      default:
        return "How's your experience with Super Study App?";
    }
  };

  const getPromptIcon = () => {
    switch (trigger) {
      case "feature":
        return Zap;
      case "action":
        return Target;
      case "session":
        return Coffee;
      default:
        return Heart;
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              {React.createElement(getPromptIcon(), {
                className: "w-8 h-8 text-white",
              })}
              <div>
                <h3 className="text-lg font-display font-bold">
                  Quick Feedback
                </h3>
                <p className="text-blue-100 text-sm font-body">
                  Your opinion matters to us
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === "prompt" && (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <h4 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-4">
                    {getPromptMessage()}
                  </h4>
                  
                  <p className="font-body text-gray-600 dark:text-gray-400 mb-6">
                    Rate your experience with a quick tap
                  </p>

                  <div className="flex justify-center gap-3 mb-6">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <motion.button
                        key={rating}
                        onClick={() => {
                          setStep("quick");
                          setTimeout(() => handleQuickFeedback(rating), 300);
                        }}
                        className="p-2 hover:scale-110 transition-transform"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= quickRating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-600 hover:text-yellow-300"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("detailed")}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-heading font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Detailed Feedback
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-heading font-medium transition-colors"
                    >
                      Not now
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "quick" && (
                <motion.div
                  key="quick"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Star className="w-8 h-8 text-white fill-white" />
                  </motion.div>
                  
                  <h4 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-2">
                    Thanks for rating!
                  </h4>
                  
                  <div className="flex justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= quickRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {step === "detailed" && (
                <motion.div
                  key="detailed"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h4 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
                    Tell us more
                  </h4>

                  {/* Rating */}
                  <div className="space-y-2">
                    <label className="block font-heading font-medium text-gray-900 dark:text-white text-sm">
                      Overall Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedback({ ...feedback, rating: star })}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= feedback.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <label className="block font-heading font-medium text-gray-900 dark:text-white text-sm">
                      What did you think?
                    </label>
                    <textarea
                      value={feedback.experience}
                      onChange={(e) => setFeedback({ ...feedback, experience: e.target.value })}
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-body text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-2">
                    <label className="block font-heading font-medium text-gray-900 dark:text-white text-sm">
                      Would you recommend us?
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFeedback({ ...feedback, wouldRecommend: true })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body font-medium transition-all ${
                          feedback.wouldRecommend === true
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-600"
                            : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Yes
                      </button>
                      <button
                        onClick={() => setFeedback({ ...feedback, wouldRecommend: false })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body font-medium transition-all ${
                          feedback.wouldRecommend === false
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-300 dark:border-red-600"
                            : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        No
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-heading font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleDetailedSubmit}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-heading font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "thanks" && (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </motion.div>
                  
                  <h4 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">
                    Thank You!
                  </h4>
                  
                  <p className="font-body text-gray-600 dark:text-gray-400">
                    Your feedback helps us improve Super Study App
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
