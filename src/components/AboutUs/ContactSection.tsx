import React from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Users, ExternalLink, Send } from "lucide-react";
import { SectionProps, ContactInfo } from "./types";

export const ContactSection: React.FC<SectionProps> = ({
  prefersReducedMotion,
}) => {
  const contactInfo: ContactInfo[] = [
    {
      icon: Mail,
      title: "Executive Support",
      description: "support@supera-app.tech",
      link: "mailto:support@supera-app.tech",
      color: "blue",
    },
    {
      icon: MessageSquare,
      title: "Intelligent Assistance",
      description: "Sophisticated AI support, available around the clock",
      color: "green",
    },
    {
      icon: Users,
      title: "Elite Community",
      description:
        "Connect with ambitious professionals in our exclusive spaces",
      color: "purple",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      green:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      purple:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <motion.section
      className="section-spacing bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm transition-colors duration-300 parallax-section relative z-20"
      aria-label="Contact information and support"
      role="contentinfo"
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
            Connect with Excellence
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-premium-light">
            Experience support that matches our commitment to your success.
            Whether you seek guidance, have inquiries, or wish to join our
            community of exceptional professionals, we're here to elevate your
            journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              Contact Information
            </h3>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(
                      info.color
                    )}`}
                  >
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {info.title}
                    </h4>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {info.description}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        {info.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional support info */}
            <motion.div
              className="mt-8 p-6 bg-gray-50 dark:bg-slate-700 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Response Time
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We typically respond to emails within 24 hours. For urgent
                matters, please use our live chat feature for immediate
                assistance.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Ready to Get Started?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              Join thousands of students and professionals who have already
              transformed their interview preparation with Super Study App.
              Start your journey today!
            </p>

            <div className="space-y-4">
              <motion.button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                aria-label="Start your free trial with Super Study App"
              >
                <Send className="w-5 h-5" aria-hidden="true" />
                Start Free Trial
              </motion.button>
              <motion.button
                className="w-full border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                aria-label="Schedule a demo of Super Study App"
              >
                Schedule Demo
              </motion.button>
            </div>

            {/* Success metrics */}
            <motion.div
              className="mt-8 grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  10K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active Users
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  95%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Success Rate
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
