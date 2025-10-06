import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ParallaxSectionProps } from "./types";

export const HeroSection: React.FC<ParallaxSectionProps> = ({
  prefersReducedMotion,
  yTransform,
  onOpenDemo,
}) => {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    navigate("/interview");
  };

  const handleLearnMore = () => {
    // Scroll to the platform guide section
    const platformSection = document.getElementById("platform-guide");
    if (platformSection) {
      platformSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleViewDemo = () => {
    if (onOpenDemo) {
      onOpenDemo("interview");
    } else {
      // Fallback: navigate to interview prep
      navigate("/interview");
    }
  };
  return (
    <motion.section
      style={{ y: yTransform }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden parallax-section hero-section"
      aria-label="Hero section with Super Study App introduction"
      role="banner"
    >
      {/* Clean modern background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700" />

      {/* Background text is now handled by AboutLayout */}

      {/* Animated background particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Hero content */}
      <div className="relative z-10 text-center text-gray-900 dark:text-white container-mobile max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-responsive-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-shadow-premium">
            What if you could unlock your{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Academic Potential?
            </span>
          </h1>
          <div className="text-responsive-lg sm:text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-body space-responsive">
            <p className="font-heading font-medium text-gray-800 dark:text-gray-200">
              🤔 What if one platform could revolutionize your entire academic
              journey?
            </p>
            <p className="font-body">
              ✨ <strong>Here's your answer:</strong> An all-in-one ecosystem
              where AI-powered study tools, interview preparation, video
              collaboration, and performance analytics converge seamlessly.
              Transform your academic potential into measurable success with
              enterprise-grade features— completely free for early users.
            </p>
          </div>
          <motion.div
            className="hero-buttons flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={handleStartJourney}
              className="btn-touch w-full sm:w-auto bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-heading font-semibold text-responsive-base hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 premium-button premium-focus"
              aria-label="Start your academic success journey with Super Study App"
            >
              Start Your Success Journey
            </button>
            <button
              onClick={handleViewDemo}
              className="btn-touch w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-responsive-base hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 premium-button premium-focus text-premium-medium"
              aria-label="Explore all platform features through an interactive demo"
            >
              Explore All Features
            </button>
            <button
              onClick={handleLearnMore}
              className="btn-touch w-full sm:w-auto border-2 border-gray-400 text-gray-700 dark:border-gray-300 dark:text-gray-300 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-heading font-semibold text-responsive-base hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 premium-button premium-focus"
              aria-label="Learn about all the powerful tools available to students"
            >
              Learn More
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 dark:bg-gray-300 rounded-full mt-2" />
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};
