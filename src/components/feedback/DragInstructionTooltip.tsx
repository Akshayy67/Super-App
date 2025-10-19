import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, X, Info } from "lucide-react";

export const DragInstructionTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show instruction after 3 seconds if not dismissed
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem("dragInstructionDismissed", "true");
  };

  // Check if user has already dismissed this instruction
  useEffect(() => {
    const dismissed = localStorage.getItem("dragInstructionDismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-24 right-6 z-50 max-w-sm"
        >
          <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4 relative">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Hand className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  💡 Pro Tip: Drag the Feedback Button!
                </h4>
                <p className="text-xs text-blue-100 mb-2">
                  You can grab and drag the feedback button to any position you want. 
                  Perfect for avoiding overlaps with other UI elements!
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-200">
                  <Info className="w-3 h-3" />
                  <span>Position is automatically saved</span>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 text-blue-200 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Arrow pointing to feedback button */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-blue-600 transform rotate-45"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
