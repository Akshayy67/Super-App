import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTheme, Theme } from '../../utils/themeManager';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeData = useTheme();

  // Add theme switching class to prevent flash
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    
    const timer = setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 100);

    return () => {
      clearTimeout(timer);
      root.classList.remove('theme-switching');
    };
  }, [themeData.resolvedTheme]);

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Theme-aware component utilities
export const themeClasses = {
  // Background classes
  bg: {
    primary: 'bg-white dark:bg-slate-900',
    secondary: 'bg-gray-50 dark:bg-slate-800',
    tertiary: 'bg-gray-100 dark:bg-slate-700',
    surface: 'bg-white dark:bg-slate-800',
    overlay: 'bg-black/50 dark:bg-black/70',
  },
  
  // Text classes
  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-400',
    tertiary: 'text-gray-500 dark:text-gray-500',
    muted: 'text-gray-400 dark:text-gray-600',
    inverse: 'text-white dark:text-slate-900',
  },
  
  // Border classes
  border: {
    primary: 'border-gray-200 dark:border-slate-700',
    secondary: 'border-gray-300 dark:border-slate-600',
    focus: 'border-blue-500 dark:border-blue-400',
    error: 'border-red-500 dark:border-red-400',
  },
  
  // Button classes
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100',
    ghost: 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300',
  },
  
  // Input classes
  input: {
    base: 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
    focus: 'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400',
  },
  
  // Card classes
  card: {
    base: 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/20',
    hover: 'hover:shadow-md dark:hover:shadow-slate-900/40',
  },
  
  // Status colors
  status: {
    success: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
    error: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
    info: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  },
  
  // Navigation classes
  nav: {
    item: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700',
    active: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  },
  
  // Transition classes
  transition: {
    colors: 'transition-colors duration-300',
    all: 'transition-all duration-300',
    fast: 'transition-all duration-150',
  },
};

// Utility function to combine theme classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Theme-aware component wrapper
interface ThemedProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  as?: keyof JSX.IntrinsicElements;
}

export const Themed: React.FC<ThemedProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  as: Component = 'div' 
}) => {
  const baseClasses = {
    primary: cn(themeClasses.bg.primary, themeClasses.text.primary, themeClasses.transition.colors),
    secondary: cn(themeClasses.bg.secondary, themeClasses.text.primary, themeClasses.transition.colors),
    tertiary: cn(themeClasses.bg.tertiary, themeClasses.text.primary, themeClasses.transition.colors),
  };

  return (
    <Component className={cn(baseClasses[variant], className)}>
      {children}
    </Component>
  );
};
