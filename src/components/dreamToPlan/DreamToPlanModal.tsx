import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Target, BookOpen, Calendar, Briefcase, Send, Loader2 } from "lucide-react";
import { EnhancedAIChat } from "../ai/EnhancedAIChat";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { useNavigate } from "react-router-dom";

interface DreamToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedPrompts = [
  {
    id: "dsa",
    text: "I want to complete DSA in 1 month",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    type: "study_plan",
  },
  {
    id: "assignment",
    text: "I have to submit my OS assignment by some date",
    icon: BookOpen,
    color: "from-purple-500 to-pink-500",
    type: "todo",
  },
  {
    id: "interview",
    text: "I want to prepare for interview",
    icon: Briefcase,
    color: "from-green-500 to-emerald-500",
    type: "interview",
  },
  {
    id: "project",
    text: "I need to finish my project by next week",
    icon: Calendar,
    color: "from-orange-500 to-red-500",
    type: "todo",
  },
  {
    id: "exam",
    text: "I have an exam in 2 weeks, help me create a study plan",
    icon: BookOpen,
    color: "from-indigo-500 to-purple-500",
    type: "study_plan",
  },
  {
    id: "skill",
    text: "I want to learn React in 3 weeks",
    icon: Target,
    color: "from-pink-500 to-rose-500",
    type: "study_plan",
  },
];

export const DreamToPlanModal: React.FC<DreamToPlanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [showChat, setShowChat] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const navigate = useNavigate();
  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (isOpen && !showChat) {
      // Reset state when modal opens
      setShowChat(false);
      setInitialPrompt(undefined);
      setShowInterviewForm(false);
    }
  }, [isOpen]);

  const handlePromptClick = (prompt: typeof suggestedPrompts[0]) => {
    if (prompt.type === "interview") {
      // Navigate to interview prep page with custom interview tab
      navigate("/interview/mock-interview?tab=custom");
      onClose();
      return;
    }

    // For other prompts, open chat with the prompt
    setInitialPrompt(prompt.text);
    setShowChat(true);
  };

  const handleClose = () => {
    setShowChat(false);
    setInitialPrompt(undefined);
    setShowInterviewForm(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Side Panel Modal */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl z-[101] flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-purple-500 to-pink-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Dream to Plan AI
                  </h2>
                  <p className="text-sm text-white/80">
                    Turn your dreams into actionable plans
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {!showChat ? (
                /* Suggested Prompts View */
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      What would you like to plan?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose a prompt or type your own goal below
                    </p>
                  </div>

                  {/* Suggested Prompts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {suggestedPrompts.map((prompt) => {
                      const Icon = prompt.icon;
                      return (
                        <motion.button
                          key={prompt.id}
                          onClick={() => handlePromptClick(prompt)}
                          className="group relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border-2 border-gray-200 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all text-left overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Gradient overlay on hover */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${prompt.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                          />
                          
                          <div className="relative z-10 flex items-start gap-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${prompt.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {prompt.text}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Custom Input */}
                  <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Or type your own goal:
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g., I want to learn Python in 2 months..."
                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            setInitialPrompt(e.currentTarget.value.trim());
                            setShowChat(true);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                          if (input?.value.trim()) {
                            setInitialPrompt(input.value.trim());
                            setShowChat(true);
                          }
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Start
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* AI Chat View */
                <div className="flex-1 overflow-hidden">
                  <EnhancedAIChat
                    initialPrompt={initialPrompt}
                    file={undefined}
                    fileContent={undefined}
                    initialChatType="dream-to-plan"
                    onActionComplete={handleClose}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

