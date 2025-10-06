import React from "react";
import { motion } from "framer-motion";
import { Award, Zap, Shield, Sparkles, Star } from "lucide-react";
import { ParallaxSectionProps, ValueProp } from "./types";

export const WhyChooseUsSection: React.FC<ParallaxSectionProps> = ({
  prefersReducedMotion,
  yTransform,
  onOpenDemo,
}) => {
  const valueProps: ValueProp[] = [
    {
      icon: Award,
      title: "All Premium Features, Completely Free",
      description:
        "Access enterprise-grade AI tutoring, HD video collaboration, advanced analytics, and interview preparation—all the premium features that typically cost hundreds of dollars per month, completely free for early users.",
      highlight: true,
    },
    {
      icon: Zap,
      title: "Everything in One Platform",
      description:
        "Stop juggling multiple apps. From AI study assistance and flashcards to video calls and interview prep, everything you need for academic and career success is unified in one elegant platform.",
      highlight: true,
    },
    {
      icon: Shield,
      title: "AI That Actually Understands You",
      description:
        "Our sophisticated AI learns your study patterns, adapts to your learning style, and provides personalized guidance that evolves with your academic journey—like having a personal tutor available 24/7.",
    },
    {
      icon: Sparkles,
      title: "Built for Student Success",
      description:
        "Designed specifically for students by understanding real academic challenges. From exam preparation and group projects to interview readiness and career planning, we support every aspect of your educational journey.",
    },
  ];

  return (
    <motion.section
      style={{ y: yTransform }}
      className="section-spacing bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 backdrop-blur-sm text-gray-900 dark:text-white relative overflow-hidden parallax-section z-20"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating elements */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-gray-400/20 dark:bg-gray-300/10 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6 text-shadow-premium">
            What Sets Successful Students Apart?
          </h2>
          <div className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-body space-y-4">
            <p className="font-heading font-medium text-gray-800 dark:text-gray-200">
              🌟 Ever wondered what transforms an average student into an
              exceptional one?
            </p>
            <p className="font-body">
              ✨ <strong>The secret is here:</strong> Our platform embodies the
              sophisticated principles that transform potential into
              performance, curiosity into knowledge, and study sessions into
              academic mastery. Discover what sets successful students apart—all
              completely free for early users.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
          {valueProps.map((prop, index) => (
            <motion.div
              key={index}
              className={`value-prop-card p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 ${
                prop.highlight
                  ? "border-blue-400 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm"
                  : "border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${
                  prop.highlight
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                <prop.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center flex-shrink-0">
                {prop.title}
                {prop.highlight && (
                  <Star className="w-5 h-5 text-blue-500 ml-2" />
                )}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">
                {prop.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-600">
            <h3 className="text-2xl font-bold mb-4 font-playfair">
              Join the Academic Excellence Revolution
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto text-premium-light">
              Join thousands of students who have discovered the transformative
              power of AI-enhanced learning. Experience the confidence that
              comes from having every academic tool you need in one
              sophisticated platform— completely free for early users.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 premium-button text-premium-medium">
                Start Learning Free
              </button>
              <button
                onClick={() => {
                  if (onOpenDemo) {
                    onOpenDemo("interview");
                  }
                  // Could add fallback navigation here if needed
                }}
                className="border-2 border-gray-400 text-gray-700 dark:border-gray-300 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 premium-button text-premium-medium"
              >
                Try the Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
