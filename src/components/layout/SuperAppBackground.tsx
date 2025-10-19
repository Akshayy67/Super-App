import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

interface SuperAppBackgroundProps {
  variant?: "default" | "hero" | "minimal" | "subtle";
  className?: string;
  animated?: boolean;
  opacity?: "light" | "medium" | "heavy";
}

export const SuperAppBackground: React.FC<SuperAppBackgroundProps> = ({
  variant = "default",
  className = "",
  animated = true,
  opacity = "light",
}) => {
  const location = useLocation();
  const getOpacityClass = () => {
    // Special handling for About page with white text - much higher opacity
    if (location.pathname === "/about") {
      switch (opacity) {
        case "light":
          return "opacity-30 dark:opacity-25";
        case "medium":
          return "opacity-40 dark:opacity-35";
        case "heavy":
          return "opacity-50 dark:opacity-45";
        default:
          return "opacity-30 dark:opacity-25";
      }
    }

    // Default opacity for other pages - increased for better visibility
    switch (opacity) {
      case "light":
        return "opacity-10 dark:opacity-8";
      case "medium":
        return "opacity-15 dark:opacity-12";
      case "heavy":
        return "opacity-20 dark:opacity-15";
      default:
        return "opacity-10 dark:opacity-8";
    }
  };

  const getTextSize = () => {
    switch (variant) {
      case "hero":
        return "text-[25vw] sm:text-[22vw] lg:text-[18vw] xl:text-[15vw]";
      case "default":
        return "text-[20vw] sm:text-[18vw] lg:text-[15vw] xl:text-[12vw]";
      case "minimal":
        return "text-[15vw] sm:text-[12vw] lg:text-[10vw] xl:text-[8vw]";
      case "subtle":
        return "text-[12vw] sm:text-[10vw] lg:text-[8vw] xl:text-[6vw]";
      default:
        return "text-[20vw] sm:text-[18vw] lg:text-[15vw] xl:text-[12vw]";
    }
  };

  const getSpacing = () => {
    switch (variant) {
      case "hero":
        return "mt-4 sm:mt-6 lg:mt-8 xl:mt-12";
      case "default":
        return "mt-3 sm:mt-4 lg:mt-6 xl:mt-8";
      case "minimal":
        return "mt-2 sm:mt-3 lg:mt-4 xl:mt-6";
      case "subtle":
        return "mt-1 sm:mt-2 lg:mt-3 xl:mt-4";
      default:
        return "mt-3 sm:mt-4 lg:mt-6 xl:mt-8";
    }
  };

  const getPosition = () => {
    switch (variant) {
      case "hero":
        return "justify-start pl-4 sm:pl-8 lg:pl-12";
      case "default":
        return "justify-center";
      case "minimal":
        return "justify-end pr-4 sm:pr-8 lg:pr-12";
      case "subtle":
        return "justify-center";
      default:
        return "justify-center";
    }
  };

  const backgroundTextContent = (
    <div
      className={`text-left leading-none ${getPosition()}`}
      style={{ fontFamily: "'Bebas Neue', 'Playfair Display', serif" }}
    >
      {/* Super App background text removed */}
    </div>
  );

  return (
    <div
      className={`${
        location.pathname === "/about" ? "fixed" : "absolute"
      } inset-0 flex items-center ${getOpacityClass()} ${className} pointer-events-none super-app-background`}
      aria-hidden="true"
      style={{
        zIndex: location.pathname === "/about" ? 15 : 1,
      }}
    >
      {animated ? (
        <motion.div
          className="w-full flex items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {backgroundTextContent}
        </motion.div>
      ) : (
        <div className="w-full flex items-center">{backgroundTextContent}</div>
      )}
    </div>
  );
};

// Enhanced color scheme for consistent branding
export const superAppColors = {
  // Primary brand colors
  primary: {
    50: "rgb(239 246 255)", // blue-50
    100: "rgb(219 234 254)", // blue-100
    200: "rgb(191 219 254)", // blue-200
    300: "rgb(147 197 253)", // blue-300
    400: "rgb(96 165 250)", // blue-400
    500: "rgb(59 130 246)", // blue-500
    600: "rgb(37 99 235)", // blue-600
    700: "rgb(29 78 216)", // blue-700
    800: "rgb(30 64 175)", // blue-800
    900: "rgb(30 58 138)", // blue-900
  },

  // Secondary brand colors (purple/indigo)
  secondary: {
    50: "rgb(238 242 255)", // indigo-50
    100: "rgb(224 231 255)", // indigo-100
    200: "rgb(199 210 254)", // indigo-200
    300: "rgb(165 180 252)", // indigo-300
    400: "rgb(129 140 248)", // indigo-400
    500: "rgb(99 102 241)", // indigo-500
    600: "rgb(79 70 229)", // indigo-600
    700: "rgb(67 56 202)", // indigo-700
    800: "rgb(55 48 163)", // indigo-800
    900: "rgb(49 46 129)", // indigo-900
  },

  // Accent colors
  accent: {
    emerald: "rgb(16 185 129)", // emerald-500
    amber: "rgb(245 158 11)", // amber-500
    rose: "rgb(244 63 94)", // rose-500
    violet: "rgb(139 92 246)", // violet-500
  },

  // Background gradients
  gradients: {
    primary:
      "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900",
    secondary:
      "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700",
    subtle:
      "bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800",
    hero: "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900",
  },

  // Theme-aware backgrounds
  backgrounds: {
    primary: "bg-white dark:bg-slate-900",
    secondary: "bg-gray-50 dark:bg-slate-800",
    tertiary: "bg-gray-100 dark:bg-slate-700",
    surface: "bg-white dark:bg-slate-800",
    overlay: "bg-black/50 dark:bg-black/70",
  },

  // Text colors
  text: {
    primary: "text-gray-900 dark:text-gray-100",
    secondary: "text-gray-600 dark:text-gray-400",
    tertiary: "text-gray-500 dark:text-gray-500",
    muted: "text-gray-400 dark:text-gray-600",
    inverse: "text-white dark:text-slate-900",
    brand: "text-blue-600 dark:text-blue-400",
  },

  // Border colors
  borders: {
    primary: "border-gray-200 dark:border-slate-700",
    secondary: "border-gray-300 dark:border-slate-600",
    focus: "border-blue-500 dark:border-blue-400",
    brand: "border-blue-200 dark:border-blue-700",
  },
};

// Utility function to get theme-aware classes
export const getThemeClasses = (
  variant: "light" | "dark" | "auto" = "auto"
) => {
  const base = {
    background: superAppColors.backgrounds.primary,
    text: superAppColors.text.primary,
    border: superAppColors.borders.primary,
    transition: "transition-colors duration-300",
  };

  return {
    container: `${base.background} ${base.text} ${base.transition}`,
    surface: `${superAppColors.backgrounds.surface} ${base.text} ${base.border} ${base.transition}`,
    gradient: superAppColors.gradients.primary,
    brand: `${superAppColors.text.brand} ${base.transition}`,
  };
};
