import React, { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Lazy load the demo content component
const DemoContent = lazy(() => 
  import("./DemoContent").then(module => ({ default: module.DemoContent }))
);

interface LazyDemoContentProps {
  category: string;
  step: string;
}

const DemoContentSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <div className="w-5 h-5 bg-gray-300 dark:bg-slate-600 rounded mr-2"></div>
        <div className="h-6 bg-gray-300 dark:bg-slate-600 rounded w-48"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-24"></div>
                <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-20"></div>
                <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-12"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-28"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 text-blue-600"
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
    <span className="ml-3 text-gray-600 dark:text-gray-400 text-premium-body">
      Loading demo content...
    </span>
  </div>
);

export const LazyDemoContent: React.FC<LazyDemoContentProps> = ({ category, step }) => {
  return (
    <Suspense fallback={<DemoContentSkeleton />}>
      <DemoContent category={category} step={step} />
    </Suspense>
  );
};
