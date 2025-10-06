import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Video,
  Target,
  BarChart3,
  MessageSquare,
  Users,
} from "lucide-react";
import { ParallaxSectionProps, Feature } from "./types";

export const FeaturesSection: React.FC<ParallaxSectionProps> = ({
  prefersReducedMotion,
  yTransform,
  onOpenDemo,
}) => {
  const features: Feature[] = [
    {
      icon: Brain,
      title: "AI-Powered Interview Preparation",
      description:
        "Master interviews with real-time AI analysis that evaluates content depth, vocal presence, and confidence. Get personalized feedback that transforms your interview performance and career prospects.",
    },
    {
      icon: Video,
      title: "HD Video Collaboration",
      description:
        "Connect with study groups through enterprise-grade WebRTC video technology. Crystal-clear quality, screen sharing, and collaborative features—all free with zero subscription costs.",
    },
    {
      icon: MessageSquare,
      title: "AI Study Assistant",
      description:
        "Your personal AI tutor that adapts to your learning style. Get instant help with homework, explanations of complex concepts, and study strategies tailored to your academic goals.",
    },
    {
      icon: Target,
      title: "Smart Flashcards & Notes",
      description:
        "Create, organize, and review with intelligent flashcard systems and note-taking tools. AI-powered spaced repetition ensures you remember what matters most for exams and beyond.",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description:
        "Track your academic progress with sophisticated analytics. Visualize study patterns, identify strengths and weaknesses, and optimize your learning strategy with data-driven insights.",
    },
    {
      icon: Users,
      title: "Study Group Management",
      description:
        "Create and manage study groups with ease. Coordinate schedules, share resources, collaborate on projects, and build lasting academic relationships that enhance your learning journey.",
    },
  ];

  // Map features to demo categories
  const getFeatureDemoCategory = (index: number): string => {
    const categoryMap = [
      "interview",
      "video",
      "interview",
      "analytics",
      "study",
      "video",
    ];
    return categoryMap[index] || "interview";
  };

  return (
    <motion.section
      style={{ y: yTransform }}
      className="section-spacing bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-sm transition-colors duration-300 parallax-section relative z-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6 text-shadow-premium">
            What Tools Do Successful Students Use?
          </h2>
          <div className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-body space-y-4">
            <p className="font-heading font-medium text-gray-800 dark:text-gray-200">
              🛠️ What if you had access to every tool successful students use,
              all in one place?
            </p>
            <p className="font-body">
              🚀 <strong>Here's what we've built for you:</strong> An
              exquisitely crafted suite of academic and professional tools, each
              designed with meticulous attention to detail and engineered to
              accelerate your journey toward academic excellence, career
              readiness, and lifelong success—all completely free for early
              users.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700 cursor-pointer group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={prefersReducedMotion ? {} : { y: -5 }}
              onClick={() => {
                if (onOpenDemo) {
                  onOpenDemo(getFeatureDemoCategory(index));
                }
                // Could add fallback navigation here if needed
              }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4 flex-shrink-0">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 flex-grow mb-4 font-body">
                {feature.description}
              </p>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-heading font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                Click to see demo →
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional feature highlights */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4 font-playfair">
              Everything You Need, All in One Place
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto text-premium-light">
              Experience the convergence of sophisticated AI intelligence and
              intuitive design. From study assistance and interview prep to
              video collaboration and analytics, every element has been
              meticulously crafted to elevate your academic and professional
              journey—completely free for early users.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Premium Video Experience",
                "Executive Analytics",
                "Intelligent Insights",
                "Elite Collaboration",
              ].map((tag, index) => (
                <span
                  key={index}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
