import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { ParallaxSectionProps } from "./types";

export const PlatformGuideSection: React.FC<ParallaxSectionProps> = ({
  prefersReducedMotion,
  yTransform,
}) => {
  const targetAudience = [
    "Ambitious students pursuing prestigious placements and competitive internships",
    "Visionary professionals elevating their careers to executive excellence",
    "Strategic job seekers mastering the art of compelling professional presentation",
    "Elite teams cultivating collaborative mastery and shared success",
  ];

  return (
    <motion.section
      id="platform-guide"
      style={{ y: yTransform }}
      className="section-spacing bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm transition-colors duration-300 parallax-section relative z-20"
      aria-label="Platform guide and mission statement"
      role="main"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-playfair text-shadow-premium">
            The Future of Student Success
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto text-premium-light">
            Super Study App represents the convergence of artificial
            intelligence and academic excellence. We've crafted a comprehensive
            ecosystem where sophisticated AI meets intuitive design, delivering
            everything students need: from interview preparation and study
            assistance to video collaboration and performance analytics.
            Experience the power of personalized learning, seamless teamwork,
            and data-driven insights—all in one elegant platform, completely
            free for early users.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-playfair">
              Built for Every Student
            </h3>
            <ul className="space-y-4">
              {targetAudience.map((item, index) => (
                <motion.li
                  key={index}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-playfair">
              Our Mission
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-premium-light">
              We believe that exceptional academic and professional success
              should be accessible to every student. Our mission transcends
              traditional study tools— we're architecting a future where
              sophisticated AI amplifies learning potential, where personalized
              insights unlock academic strengths, and where every study session
              becomes an opportunity for transformative growth. This is more
              than an app; this is academic evolution, completely free for early
              users.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Intelligent by Design
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sophisticated algorithms crafting personalized excellence
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
