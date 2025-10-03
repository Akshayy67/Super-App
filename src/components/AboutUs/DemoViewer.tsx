import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Brain,
  Video,
  BookOpen,
  BarChart3,
  Play,
  Pause,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { DemoViewerProps, DemoCategory, DemoStep } from "./types";
import { LazyDemoContent } from "./LazyDemoContent";
import { DemoErrorBoundary } from "./DemoErrorBoundary";

export const DemoViewer: React.FC<DemoViewerProps> = ({
  isOpen,
  onClose,
  initialCategory = "interview",
}) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Demo categories and content
  const demoCategories: DemoCategory[] = [
    {
      id: "interview",
      title: "AI Interview Mastery",
      description:
        "Experience intelligent feedback that transforms performance",
      icon: Brain,
      color: "from-blue-500 to-purple-600",
      steps: [
        {
          id: "setup",
          title: "Intelligent Setup",
          description:
            "Personalized interview environment tailored to your profile",
          features: [
            "Resume-based question generation",
            "Industry-specific scenarios",
            "Difficulty adaptation",
            "Custom interview types",
          ],
          category: "interview",
        },
        {
          id: "analysis",
          title: "Real-Time Analysis",
          description:
            "Sophisticated AI evaluation of every aspect of your performance",
          features: [
            "Content quality assessment",
            "Vocal tone and pacing analysis",
            "Confidence level tracking",
            "Body language evaluation",
          ],
          category: "interview",
        },
        {
          id: "feedback",
          title: "Precision Feedback",
          description:
            "Actionable insights that accelerate your professional growth",
          features: [
            "Detailed performance metrics",
            "Personalized improvement suggestions",
            "Comparative industry benchmarks",
            "Progress tracking over time",
          ],
          category: "interview",
        },
      ],
    },
    {
      id: "video",
      title: "Premium Video Collaboration",
      description: "Enterprise-grade video technology, completely free",
      icon: Video,
      color: "from-green-500 to-teal-600",
      steps: [
        {
          id: "connection",
          title: "Seamless Connection",
          description: "Crystal-clear video calls with zero subscription costs",
          features: [
            "WebRTC technology",
            "Free Google STUN servers",
            "HD video quality",
            "Instant room creation",
          ],
          category: "video",
        },
        {
          id: "collaboration",
          title: "Advanced Collaboration",
          description: "Professional features for effective interview practice",
          features: [
            "Screen sharing capabilities",
            "Recording functionality",
            "Multi-participant support",
            "Real-time chat integration",
          ],
          category: "video",
        },
        {
          id: "management",
          title: "Room Management",
          description: "Sophisticated controls for organized practice sessions",
          features: [
            "Custom room URLs",
            "Participant permissions",
            "Session scheduling",
            "Automated transcription",
          ],
          category: "video",
        },
      ],
    },
    {
      id: "study",
      title: "Intelligent Study Tools",
      description: "AI-powered learning that adapts to your style",
      icon: BookOpen,
      color: "from-orange-500 to-red-600",
      steps: [
        {
          id: "assistant",
          title: "AI Study Companion",
          description: "Intelligent assistance that evolves with your learning",
          features: [
            "Contextual question answering",
            "Personalized study plans",
            "Adaptive learning paths",
            "Smart content recommendations",
          ],
          category: "study",
        },
        {
          id: "tools",
          title: "Dynamic Study Tools",
          description:
            "Interactive tools that make learning engaging and effective",
          features: [
            "Smart flashcards",
            "Interactive note-taking",
            "Progress visualization",
            "Knowledge gap analysis",
          ],
          category: "study",
        },
        {
          id: "collaboration",
          title: "Collaborative Learning",
          description: "Connect with peers for enhanced learning experiences",
          features: [
            "Study group formation",
            "Shared resource libraries",
            "Peer review systems",
            "Group progress tracking",
          ],
          category: "study",
        },
      ],
    },
    {
      id: "analytics",
      title: "Executive Analytics",
      description: "Sophisticated insights that drive professional excellence",
      icon: BarChart3,
      color: "from-purple-500 to-pink-600",
      steps: [
        {
          id: "dashboard",
          title: "Performance Dashboard",
          description:
            "Comprehensive overview of your professional development",
          features: [
            "Real-time performance metrics",
            "Trend analysis and insights",
            "Goal tracking and milestones",
            "Comparative benchmarking",
          ],
          category: "analytics",
        },
        {
          id: "insights",
          title: "Intelligent Insights",
          description: "AI-powered recommendations for continuous improvement",
          features: [
            "Personalized growth strategies",
            "Skill gap identification",
            "Industry trend alignment",
            "Career path optimization",
          ],
          category: "analytics",
        },
        {
          id: "reporting",
          title: "Professional Reporting",
          description:
            "Detailed reports that showcase your progress and achievements",
          features: [
            "Comprehensive progress reports",
            "Shareable achievement certificates",
            "Interview readiness scores",
            "Professional portfolio integration",
          ],
          category: "analytics",
        },
      ],
    },
  ];

  const currentCategory = demoCategories.find(
    (cat) => cat.id === activeCategory
  );
  const currentStep = currentCategory?.steps[activeStep];

  // Navigation handlers
  const handlePrevStep = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else if (currentCategory) {
      const currentCategoryIndex = demoCategories.findIndex(
        (cat) => cat.id === activeCategory
      );
      if (currentCategoryIndex > 0) {
        const prevCategory = demoCategories[currentCategoryIndex - 1];
        setActiveCategory(prevCategory.id);
        setActiveStep(prevCategory.steps.length - 1);
      }
    }
  }, [activeStep, activeCategory, currentCategory, demoCategories]);

  const handleNextStep = useCallback(() => {
    if (currentCategory && activeStep < currentCategory.steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      const currentCategoryIndex = demoCategories.findIndex(
        (cat) => cat.id === activeCategory
      );
      if (currentCategoryIndex < demoCategories.length - 1) {
        const nextCategory = demoCategories[currentCategoryIndex + 1];
        setActiveCategory(nextCategory.id);
        setActiveStep(0);
      }
    }
  }, [activeStep, activeCategory, currentCategory, demoCategories]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          event.preventDefault();
          handlePrevStep();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNextStep();
          break;
        case "ArrowUp":
          event.preventDefault();
          // Navigate to previous category
          const currentCategoryIndex = demoCategories.findIndex(
            (cat) => cat.id === activeCategory
          );
          if (currentCategoryIndex > 0) {
            setActiveCategory(demoCategories[currentCategoryIndex - 1].id);
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          // Navigate to next category
          const nextCategoryIndex = demoCategories.findIndex(
            (cat) => cat.id === activeCategory
          );
          if (nextCategoryIndex < demoCategories.length - 1) {
            setActiveCategory(demoCategories[nextCategoryIndex + 1].id);
          }
          break;
        case " ":
          event.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case "Home":
          event.preventDefault();
          setActiveCategory(demoCategories[0].id);
          setActiveStep(0);
          break;
        case "End":
          event.preventDefault();
          const lastCategory = demoCategories[demoCategories.length - 1];
          setActiveCategory(lastCategory.id);
          setActiveStep(lastCategory.steps.length - 1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    isPlaying,
    activeStep,
    activeCategory,
    demoCategories,
    handleNextStep,
    handlePrevStep,
  ]);

  // Reset state when category changes and announce to screen readers
  useEffect(() => {
    setActiveStep(0);
    const category = demoCategories.find((cat) => cat.id === activeCategory);
    if (category) {
      setAnnouncement(
        `Switched to ${category.title} demo. Step 1 of ${category.steps.length}.`
      );
    }
  }, [activeCategory, demoCategories]);

  // Announce step changes to screen readers
  useEffect(() => {
    const category = demoCategories.find((cat) => cat.id === activeCategory);
    const step = category?.steps[activeStep];
    if (category && step) {
      setAnnouncement(
        `${step.title}. Step ${activeStep + 1} of ${category.steps.length}.`
      );
    }
  }, [activeStep, activeCategory, demoCategories]);

  // Prevent body scroll and manage focus when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      // Store the currently focused element
      const previouslyFocusedElement = document.activeElement as HTMLElement;

      // Focus the modal after a brief delay to ensure it's rendered
      const focusTimeout = setTimeout(() => {
        const closeButton = document.querySelector(
          '[aria-label="Close demo viewer"]'
        ) as HTMLElement;
        if (closeButton) {
          closeButton.focus();
        }
      }, 100);

      return () => {
        document.body.style.overflow = "unset";
        clearTimeout(focusTimeout);

        // Restore focus to the previously focused element
        if (previouslyFocusedElement && previouslyFocusedElement.focus) {
          previouslyFocusedElement.focus();
        }
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-viewer-title"
            aria-describedby="demo-viewer-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <div>
                <h2
                  id="demo-viewer-title"
                  className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-playfair"
                >
                  Experience Super Study App
                </h2>
                <p
                  id="demo-viewer-description"
                  className="text-gray-600 dark:text-gray-400 text-premium-light"
                >
                  Discover the sophisticated features that set us apart
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors premium-focus"
                aria-label="Close demo viewer"
                autoFocus
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
              {/* Sidebar - Categories */}
              <div className="w-full lg:w-80 border-r border-gray-200 dark:border-slate-700 overflow-y-auto">
                <div className="p-6">
                  <h3
                    className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 font-playfair"
                    id="demo-categories-heading"
                  >
                    Features
                  </h3>
                  <div
                    className="space-y-3"
                    role="tablist"
                    aria-labelledby="demo-categories-heading"
                  >
                    {demoCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 premium-focus ${
                          activeCategory === category.id
                            ? "bg-gradient-to-r " +
                              category.color +
                              " text-white shadow-lg"
                            : "bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100"
                        }`}
                        role="tab"
                        aria-selected={activeCategory === category.id}
                        aria-controls={`demo-content-${category.id}`}
                        tabIndex={activeCategory === category.id ? 0 : -1}
                      >
                        <div className="flex items-center space-x-3">
                          <category.icon className="w-6 h-6" />
                          <div>
                            <h4 className="font-semibold">{category.title}</h4>
                            <p
                              className={`text-sm ${
                                activeCategory === category.id
                                  ? "text-white/80"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {currentCategory && currentStep && (
                    <motion.div
                      key={`${activeCategory}-${activeStep}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Step Header */}
                      <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentCategory.color} flex items-center justify-center`}
                          >
                            <currentCategory.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-['Playfair_Display']">
                              {currentStep.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-light">
                              {currentStep.description}
                            </p>
                          </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex items-center space-x-2 mb-6">
                          {currentCategory.steps.map((_, index) => (
                            <div
                              key={index}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                index === activeStep
                                  ? "w-8 bg-gradient-to-r " +
                                    currentCategory.color
                                  : index < activeStep
                                  ? "w-4 bg-green-500"
                                  : "w-4 bg-gray-200 dark:bg-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Demo Content */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Interactive Demo Content */}
                        <div className="min-h-[300px]">
                          <DemoErrorBoundary>
                            <LazyDemoContent
                              category={activeCategory}
                              step={currentStep.id}
                            />
                          </DemoErrorBoundary>
                        </div>

                        {/* Features List */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Key Features
                          </h4>
                          <div className="space-y-3">
                            {currentStep.features.map((feature, index) => (
                              <motion.div
                                key={index}
                                className="flex items-start space-x-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: index * 0.1,
                                }}
                              >
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {feature}
                                </span>
                              </motion.div>
                            ))}
                          </div>

                          {/* Call to Action */}
                          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl">
                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              Ready to Experience This?
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              Try this feature in our live application
                            </p>
                            <button
                              className={`w-full px-4 py-2 rounded-lg bg-gradient-to-r ${currentCategory.color} text-white font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5`}
                            >
                              Launch Feature
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                        <button
                          onClick={handlePrevStep}
                          disabled={
                            activeStep === 0 &&
                            demoCategories.findIndex(
                              (cat) => cat.id === activeCategory
                            ) === 0
                          }
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Step {activeStep + 1} of{" "}
                          {currentCategory.steps.length}
                        </div>

                        <button
                          onClick={handleNextStep}
                          disabled={
                            activeStep === currentCategory.steps.length - 1 &&
                            demoCategories.findIndex(
                              (cat) => cat.id === activeCategory
                            ) ===
                              demoCategories.length - 1
                          }
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
