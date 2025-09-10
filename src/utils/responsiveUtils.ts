import { useState, useEffect } from 'react';

// Breakpoint definitions following Tailwind CSS conventions
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook to get current screen size
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
    breakpoint: Breakpoint | 'xs';
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    breakpoint: 'lg',
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint: Breakpoint | 'xs' = 'xs';
      if (width >= breakpoints['2xl']) breakpoint = '2xl';
      else if (width >= breakpoints.xl) breakpoint = 'xl';
      else if (width >= breakpoints.lg) breakpoint = 'lg';
      else if (width >= breakpoints.md) breakpoint = 'md';
      else if (width >= breakpoints.sm) breakpoint = 'sm';

      setScreenSize({ width, height, breakpoint });
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Hook to check if screen is at least a certain breakpoint
export const useMediaQuery = (minBreakpoint: Breakpoint) => {
  const { width } = useScreenSize();
  return width >= breakpoints[minBreakpoint];
};

// Responsive grid utilities
export const getResponsiveGridCols = (
  screenSize: Breakpoint | 'xs',
  config: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  }
) => {
  const breakpointOrder: (Breakpoint | 'xs')[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(screenSize);
  
  // Find the largest breakpoint that's <= current screen size
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (config[bp as keyof typeof config]) {
      return config[bp as keyof typeof config];
    }
  }
  
  return config.xs || 1;
};

// Responsive text size utilities
export const getResponsiveTextSize = (
  screenSize: Breakpoint | 'xs',
  config: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }
) => {
  const breakpointOrder: (Breakpoint | 'xs')[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(screenSize);
  
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (config[bp as keyof typeof config]) {
      return config[bp as keyof typeof config];
    }
  }
  
  return config.xs || 'text-base';
};

// Responsive spacing utilities
export const getResponsiveSpacing = (
  screenSize: Breakpoint | 'xs',
  config: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }
) => {
  const breakpointOrder: (Breakpoint | 'xs')[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(screenSize);
  
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (config[bp as keyof typeof config]) {
      return config[bp as keyof typeof config];
    }
  }
  
  return config.xs || 'p-4';
};

// Chart responsive configurations
export const getChartResponsiveConfig = (screenSize: Breakpoint | 'xs') => {
  const configs = {
    xs: {
      height: 200,
      fontSize: 10,
      margin: { top: 10, right: 10, bottom: 20, left: 20 },
      showLegend: false,
      showTooltip: true,
    },
    sm: {
      height: 250,
      fontSize: 11,
      margin: { top: 15, right: 15, bottom: 25, left: 25 },
      showLegend: true,
      showTooltip: true,
    },
    md: {
      height: 300,
      fontSize: 12,
      margin: { top: 20, right: 20, bottom: 30, left: 30 },
      showLegend: true,
      showTooltip: true,
    },
    lg: {
      height: 400,
      fontSize: 12,
      margin: { top: 20, right: 30, bottom: 40, left: 40 },
      showLegend: true,
      showTooltip: true,
    },
    xl: {
      height: 450,
      fontSize: 14,
      margin: { top: 25, right: 35, bottom: 45, left: 45 },
      showLegend: true,
      showTooltip: true,
    },
    '2xl': {
      height: 500,
      fontSize: 14,
      margin: { top: 30, right: 40, bottom: 50, left: 50 },
      showLegend: true,
      showTooltip: true,
    },
  };

  return configs[screenSize] || configs.md;
};

// Mobile-first responsive classes
export const responsiveClasses = {
  container: "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  grid: {
    cols1: "grid grid-cols-1",
    cols2: "grid grid-cols-1 md:grid-cols-2",
    cols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    cols4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    cols6: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  },
  spacing: {
    section: "space-y-4 md:space-y-6 lg:space-y-8",
    grid: "gap-4 md:gap-6 lg:gap-8",
    inline: "space-x-2 md:space-x-4",
  },
  text: {
    heading: "text-xl md:text-2xl lg:text-3xl font-bold",
    subheading: "text-lg md:text-xl lg:text-2xl font-semibold",
    body: "text-sm md:text-base",
    caption: "text-xs md:text-sm",
  },
  padding: {
    section: "p-4 md:p-6 lg:p-8",
    card: "p-3 md:p-4 lg:p-6",
    button: "px-3 py-2 md:px-4 md:py-2 lg:px-6 lg:py-3",
  },
  margin: {
    section: "mb-4 md:mb-6 lg:mb-8",
    element: "mb-2 md:mb-3 lg:mb-4",
  },
};

// Dark mode utilities
export const darkModeClasses = {
  background: {
    primary: "bg-white dark:bg-gray-900",
    secondary: "bg-gray-50 dark:bg-gray-800",
    tertiary: "bg-gray-100 dark:bg-gray-700",
  },
  text: {
    primary: "text-gray-900 dark:text-white",
    secondary: "text-gray-600 dark:text-gray-300",
    tertiary: "text-gray-500 dark:text-gray-400",
  },
  border: {
    primary: "border-gray-200 dark:border-gray-700",
    secondary: "border-gray-300 dark:border-gray-600",
  },
  hover: {
    background: "hover:bg-gray-50 dark:hover:bg-gray-800",
    text: "hover:text-gray-900 dark:hover:text-white",
  },
};

// Accessibility utilities
export const a11yClasses = {
  focusRing: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
  srOnly: "sr-only",
  skipLink: "sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50",
};

// Animation utilities for responsive design
export const animationClasses = {
  fadeIn: "animate-in fade-in duration-300",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  transition: "transition-all duration-200 ease-in-out",
};

// Utility function to combine responsive classes
export const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Hook for responsive chart dimensions
export const useResponsiveChartDimensions = () => {
  const { breakpoint } = useScreenSize();
  
  const dimensions = {
    xs: { width: '100%', height: 200 },
    sm: { width: '100%', height: 250 },
    md: { width: '100%', height: 300 },
    lg: { width: '100%', height: 400 },
    xl: { width: '100%', height: 450 },
    '2xl': { width: '100%', height: 500 },
  };
  
  return dimensions[breakpoint] || dimensions.md;
};

// Hook for responsive modal sizing
export const useResponsiveModal = () => {
  const { breakpoint } = useScreenSize();
  
  const modalClasses = {
    xs: "fixed inset-0 z-50 overflow-y-auto",
    sm: "fixed inset-0 z-50 overflow-y-auto",
    md: "fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4",
    lg: "fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4",
    xl: "fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4",
    '2xl': "fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4",
  };
  
  const contentClasses = {
    xs: "w-full h-full bg-white dark:bg-gray-900",
    sm: "w-full h-full bg-white dark:bg-gray-900",
    md: "w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl",
    lg: "w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-xl",
    xl: "w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl",
    '2xl': "w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-xl",
  };
  
  return {
    modalClass: modalClasses[breakpoint] || modalClasses.md,
    contentClass: contentClasses[breakpoint] || contentClasses.md,
    isFullScreen: breakpoint === 'xs' || breakpoint === 'sm',
  };
};
