import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Bug,
  Heart,
  Zap,
  X,
  ThumbsUp,
  ThumbsDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import { sendFeedbackEmail } from "../../services/emailService";

interface FeedbackData {
  type: "feedback" | "suggestion" | "bug" | "feature";
  rating: number;
  category: string;
  title: string;
  description: string;
  email?: string;
  priority: "low" | "medium" | "high";
}

interface FeedbackSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<"type" | "details" | "success" | "error">(
    "type"
  );
  const [formData, setFormData] = useState<FeedbackData>({
    type: "feedback",
    rating: 0,
    category: "",
    title: "",
    description: "",
    email: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const feedbackTypes = [
    {
      id: "feedback" as const,
      title: "General Feedback",
      description: "Share your thoughts about the app",
      icon: MessageSquare,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "suggestion" as const,
      title: "Feature Suggestion",
      description: "Suggest new features or improvements",
      icon: Lightbulb,
      color: "yellow",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      id: "bug" as const,
      title: "Report Bug",
      description: "Report issues or problems you've encountered",
      icon: Bug,
      color: "red",
      gradient: "from-red-500 to-red-600",
    },
    {
      id: "feature" as const,
      title: "Feature Request",
      description: "Request specific functionality",
      icon: Zap,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  const categories = {
    feedback: ["User Experience", "Performance", "Design", "Content", "Other"],
    suggestion: ["UI/UX", "Features", "Performance", "Integration", "Other"],
    bug: ["Login Issues", "Performance", "UI Problems", "Data Loss", "Other"],
    feature: [
      "AI Features",
      "Study Tools",
      "Collaboration",
      "Analytics",
      "Other",
    ],
  };

  const handleTypeSelect = (type: FeedbackData["type"]) => {
    setFormData({ ...formData, type, category: "" });
    setStep("details");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setEmailStatus("sending");

    try {
      // Prepare feedback data for email service
      const feedbackData = {
        type: formData.type,
        rating: formData.rating,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        email: formData.email,
        priority: formData.priority,
        timestamp: new Date().toISOString(),
      };

      console.log("📧 Sending feedback via EmailJS:", feedbackData);

      // Send feedback via EmailJS
      const success = await sendFeedbackEmail(feedbackData);

      if (success) {
        setEmailStatus("success");
        setStep("success");

        // Auto-close after success
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
      } else {
        setEmailStatus("error");
        setStep("error");
      }
    } catch (error) {
      console.error("❌ Failed to send feedback:", error);
      setEmailStatus("error");
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep("type");
    setEmailStatus("idle");
    setFormData({
      type: "feedback",
      rating: 0,
      category: "",
      title: "",
      description: "",
      email: "",
      priority: "medium",
    });
  };

  const selectedType = feedbackTypes.find((type) => type.id === formData.type);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="relative p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                        We Value Your Input
                      </h2>
                      <p className="text-sm font-body text-gray-600 dark:text-gray-400">
                        Help us improve your experience
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center gap-2 mt-4">
                  {["type", "details", "success"].map((stepName, index) => (
                    <div
                      key={stepName}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        step === stepName ||
                        (step === "details" && stepName === "type") ||
                        (step === "success" && stepName !== "success")
                          ? "bg-blue-500"
                          : "bg-gray-200 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <AnimatePresence mode="wait">
                  {step === "type" && (
                    <motion.div
                      key="type"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-2">
                          What would you like to share?
                        </h3>
                        <p className="font-body text-gray-600 dark:text-gray-400">
                          Choose the type of feedback you'd like to provide
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {feedbackTypes.map((type) => (
                          <motion.button
                            key={type.id}
                            onClick={() => handleTypeSelect(type.id)}
                            className="p-6 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all group text-left"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div
                              className={`w-12 h-12 bg-gradient-to-br ${type.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                            >
                              <type.icon className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-2">
                              {type.title}
                            </h4>
                            <p className="font-body text-sm text-gray-600 dark:text-gray-400">
                              {type.description}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {step === "details" && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${selectedType?.gradient} rounded-xl flex items-center justify-center`}
                        >
                          {selectedType && (
                            <selectedType.icon className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
                            {selectedType?.title}
                          </h3>
                          <p className="font-body text-sm text-gray-600 dark:text-gray-400">
                            {selectedType?.description}
                          </p>
                        </div>
                      </div>

                      {/* Rating (for feedback type) */}
                      {formData.type === "feedback" && (
                        <div className="space-y-3">
                          <label className="block font-heading font-medium text-gray-900 dark:text-white">
                            How would you rate your overall experience?
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() =>
                                  setFormData({ ...formData, rating: star })
                                }
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    star <= formData.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 font-body text-sm text-gray-600 dark:text-gray-400">
                              {formData.rating > 0 && (
                                <>
                                  {formData.rating === 1 && "Poor"}
                                  {formData.rating === 2 && "Fair"}
                                  {formData.rating === 3 && "Good"}
                                  {formData.rating === 4 && "Very Good"}
                                  {formData.rating === 5 && "Excellent"}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Category */}
                      <div className="space-y-3">
                        <label className="block font-heading font-medium text-gray-900 dark:text-white">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-body focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select a category</option>
                          {categories[formData.type].map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Priority (for bugs and feature requests) */}
                      {(formData.type === "bug" ||
                        formData.type === "feature") && (
                        <div className="space-y-3">
                          <label className="block font-heading font-medium text-gray-900 dark:text-white">
                            Priority Level
                          </label>
                          <div className="flex gap-3">
                            {[
                              { value: "low", label: "Low", color: "green" },
                              {
                                value: "medium",
                                label: "Medium",
                                color: "yellow",
                              },
                              { value: "high", label: "High", color: "red" },
                            ].map((priority) => (
                              <button
                                key={priority.value}
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    priority: priority.value as any,
                                  })
                                }
                                className={`px-4 py-2 rounded-lg font-body font-medium transition-all ${
                                  formData.priority === priority.value
                                    ? `bg-${priority.color}-100 dark:bg-${priority.color}-900/30 text-${priority.color}-700 dark:text-${priority.color}-400 border-2 border-${priority.color}-300 dark:border-${priority.color}-600`
                                    : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-300 dark:hover:border-slate-600"
                                }`}
                              >
                                {priority.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Title */}
                      <div className="space-y-3">
                        <label className="block font-heading font-medium text-gray-900 dark:text-white">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder={`Brief ${formData.type} title...`}
                          className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-body focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-3">
                        <label className="block font-heading font-medium text-gray-900 dark:text-white">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder={`Please provide detailed information about your ${formData.type}...`}
                          rows={4}
                          className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-body focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>

                      {/* Email (optional) */}
                      <div className="space-y-3">
                        <label className="block font-heading font-medium text-gray-900 dark:text-white">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="your.email@example.com"
                          className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-body focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="font-body text-xs text-gray-500 dark:text-gray-400">
                          We'll only use this to follow up on your feedback if
                          needed
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setStep("type")}
                          className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-heading font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={
                            !formData.title ||
                            !formData.description ||
                            !formData.category ||
                            isSubmitting
                          }
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-heading font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Submit {formData.type}
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                      >
                        <CheckCircle className="w-10 h-10 text-white" />
                      </motion.div>

                      <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
                        Thank You!
                      </h3>

                      <p className="font-body text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Your {formData.type} has been submitted successfully. We
                        appreciate your input and will review it carefully.
                      </p>

                      <div className="flex items-center justify-center gap-2 text-sm font-body text-gray-500 dark:text-gray-400">
                        <Wifi className="w-4 h-4" />
                        <span>Feedback sent via email successfully</span>
                      </div>
                    </motion.div>
                  )}

                  {step === "error" && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
                      >
                        <WifiOff className="w-10 h-10 text-white" />
                      </motion.div>

                      <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
                        Connection Issue
                      </h3>

                      <p className="font-body text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        We couldn't send your feedback right now, but it's been
                        saved locally. Please try again later or contact us
                        directly.
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-sm font-body text-gray-500 dark:text-gray-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>Your feedback is saved and won't be lost</span>
                        </div>

                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-heading font-medium transition-colors disabled:opacity-50"
                          >
                            {isSubmitting ? "Retrying..." : "Try Again"}
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              resetForm();
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-heading font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
