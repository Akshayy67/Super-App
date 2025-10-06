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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6 text-shadow-premium">
            Ready to Connect with Excellence?
          </h2>
          <div className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-body space-y-4">
            <p className="font-heading font-medium text-gray-800 dark:text-gray-200">
              💬 Looking for support that truly understands your academic
              ambitions?
            </p>
            <p className="font-body">
              🤝 <strong>We're here for you:</strong> Experience support that
              matches our commitment to your success. Whether you seek guidance,
              have inquiries, or wish to join our community of exceptional
              professionals, we're here to elevate your journey.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100 mb-8">
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
                    <h4 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
                      {info.title}
                    </h4>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="font-body text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
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

          {/* Executive Contact Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl"
          >
            {/* Sophisticated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Elegant accent lines */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>

            <div className="relative z-10 text-center">
              <motion.div
                className="inline-flex items-center gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">📧</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white">
                  Executive Communications
                </h3>
              </motion.div>

              <div className="text-gray-300 mb-8 text-lg leading-relaxed max-w-2xl mx-auto space-y-4 font-body">
                <p className="font-heading font-medium text-blue-400">
                  Require immediate assistance or specialized consultation?
                </p>
                <p className="font-body text-gray-200">
                  <strong className="text-blue-400">
                    Direct Executive Access:
                  </strong>{" "}
                  For urgent inquiries, technical escalations, or specialized
                  support requirements, our executive team maintains dedicated
                  communication channels to ensure your concerns receive
                  immediate attention and expert resolution.
                </p>
              </div>

              <div className="space-y-4 max-w-lg mx-auto">
                <motion.div
                  className="group bg-slate-800/50 border border-slate-600/50 rounded-lg p-4 hover:border-blue-400/50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-sm">🎯</span>
                    </div>
                    <h4 className="font-heading font-semibold text-white">
                      Primary Executive Contact
                    </h4>
                  </div>
                  <a
                    href="mailto:akshay.juluri@super-app.tech"
                    className="font-body text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm"
                  >
                    akshay.juluri@super-app.tech
                  </a>
                </motion.div>

                <motion.div
                  className="group bg-slate-800/50 border border-slate-600/50 rounded-lg p-4 hover:border-blue-400/50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-400 text-sm">⚡</span>
                    </div>
                    <h4 className="font-heading font-semibold text-white">
                      Technical Operations
                    </h4>
                  </div>
                  <a
                    href="mailto:gyanmote.akhil@super-app.tech"
                    className="font-body text-indigo-400 hover:text-indigo-300 transition-colors duration-200 text-sm"
                  >
                    gyanmote.akhil@super-app.tech
                  </a>
                </motion.div>
              </div>

              <motion.div
                className="mt-6 text-xs text-slate-400 font-body italic"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Executive response within 24 hours • Confidential communications
                assured
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
