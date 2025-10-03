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
    }
  };
  return (
    <motion.section
      style={{ y: yTransform }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden parallax-section hero-section"
      aria-label="Hero section with Super Study App introduction"
      role="banner"
    >
      {/* Background gradient - made more transparent to show background text */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-indigo-800/90 dark:from-blue-800/90 dark:via-purple-800/90 dark:to-indigo-900/90" />

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
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-playfair text-shadow-premium">
            Your Complete Student{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Success Platform
            </span>
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto text-premium-light">
            The all-in-one platform where AI-powered study tools, interview
            preparation, video collaboration, and performance analytics
            converge. Transform your academic journey with enterprise-grade
            features—completely free for early users.
          </p>
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={handleStartJourney}
              className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 premium-button premium-focus text-premium-medium"
              aria-label="Start your academic success journey with Super Study App"
            >
              Start Your Success Journey
            </button>
            <button
              onClick={handleViewDemo}
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 premium-button premium-focus text-premium-medium"
              aria-label="Explore all platform features through an interactive demo"
            >
              Explore All Features
            </button>
            <button
              onClick={handleLearnMore}
              className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 premium-button premium-focus text-premium-medium"
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
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2" />
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};
