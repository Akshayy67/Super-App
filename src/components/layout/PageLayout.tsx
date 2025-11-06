import React from "react";
import { useLocation } from "react-router-dom";
import { SuperAppBackground, getThemeClasses } from "./SuperAppBackground";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showBackground?: boolean;
  backgroundVariant?: "default" | "hero" | "minimal" | "subtle";
  backgroundOpacity?: "light" | "medium" | "heavy";
  animated?: boolean;
  gradient?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = "",
  showBackground = true,
  backgroundVariant = "default",
  backgroundOpacity = "light",
  animated = true,
  gradient = false,
}) => {
  const location = useLocation();
  const themeClasses = getThemeClasses();

  // Determine background variant based on route
  const getBackgroundVariant = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "subtle";
      case "/interview":
      case "/interview/overview":
      case "/interview/practice":
        return "default";
      default:
        return backgroundVariant;
    }
  };

  // Determine background opacity based on route
  const getBackgroundOpacity = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "light";
      case "/interview":
      case "/interview/overview":
        return "light";
      default:
        return backgroundOpacity;
    }
  };

  // Determine if gradient should be applied
  const shouldShowGradient = () => {
    return gradient;
  };

  // Get container classes based on route
  const getContainerClasses = () => {
    const baseClasses = `relative ${themeClasses.container} ${className}`;

    if (shouldShowGradient()) {
      return `${baseClasses} ${themeClasses.gradient}`;
    }

    return baseClasses;
  };

  return (
    <div className={getContainerClasses()} style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Background Text (removed) */}
      {showBackground && (
        <SuperAppBackground
          variant={getBackgroundVariant()}
          opacity={getBackgroundOpacity()}
          animated={animated}
        />
      )}

      {/* Page Content */}
      <div className="relative z-10" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: 'clamp(0.75rem, 2vw, 1rem)' }}>
        {children}
      </div>
    </div>
  );
};

// Specialized layout components for different page types
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <PageLayout
    backgroundVariant="subtle"
    backgroundOpacity="light"
    animated={false}
  >
    {children}
  </PageLayout>
);

export const InterviewLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <PageLayout
    backgroundVariant="default"
    backgroundOpacity="light"
    animated={true}
  >
    {children}
  </PageLayout>
);


export const GeneralLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <PageLayout
    backgroundVariant="minimal"
    backgroundOpacity="light"
    animated={false}
  >
    {children}
  </PageLayout>
);

// Enhanced color utilities for consistent theming
export const pageColors = {
  // Page-specific color schemes
  dashboard: {
    background: "bg-gray-50 dark:bg-black",
    surface: "bg-white dark:bg-black",
    accent: "bg-blue-50 dark:bg-blue-900/30",
    text: "text-gray-900 dark:text-gray-300",
    muted: "text-gray-600 dark:text-gray-400",
  },

  interview: {
    background:
      "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-black dark:to-black",
    surface: "bg-white dark:bg-black",
    accent: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-gray-900 dark:text-gray-300",
    muted: "text-gray-600 dark:text-gray-400",
  },

  general: {
    background: "bg-white dark:bg-black",
    surface: "bg-gray-50 dark:bg-black",
    accent: "bg-gray-100 dark:bg-gray-900",
    text: "text-gray-900 dark:text-gray-300",
    muted: "text-gray-600 dark:text-gray-400",
  },
};

// Utility function to get page-specific colors
export const getPageColors = (pathname: string) => {
  if (pathname === "/dashboard") return pageColors.dashboard;
  if (pathname.startsWith("/interview")) return pageColors.interview;
  return pageColors.general;
};

// Enhanced theme classes for components
export const componentThemes = {
  card: {
    default:
      "bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm",
    elevated:
      "bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg",
    glass:
      "bg-white/10 dark:bg-black/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-lg",
  },

  button: {
    primary:
      "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors",
    secondary:
      "bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-300 font-medium px-4 py-2 rounded-lg transition-colors",
    ghost:
      "hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-400 font-medium px-4 py-2 rounded-lg transition-colors",
  },

  input: {
    default:
      "bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
    search:
      "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
  },

  text: {
    heading: "text-gray-900 dark:text-gray-300 font-bold",
    subheading: "text-gray-700 dark:text-gray-400 font-semibold",
    body: "text-gray-600 dark:text-gray-400",
    muted: "text-gray-500 dark:text-gray-500",
    brand: "text-blue-600 dark:text-blue-400",
  },
};
