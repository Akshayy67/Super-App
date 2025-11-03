import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../../utils/themeManager';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'compact';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'button', 
  className = '',
  showLabel = false 
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[2];

  if (variant === 'compact') {
    return (
      <button
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.value === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].value);
        }}
        className={`
          relative p-2 rounded-lg transition-all duration-300 ease-in-out
          bg-gray-100 hover:bg-gray-200 dark:bg-black dark:hover:bg-gray-900
          border border-gray-200 dark:border-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          ${className}
        `}
        title={`Current: ${currentTheme.label} (Click to cycle)`}
        aria-label={`Switch theme. Current: ${currentTheme.label}`}
      >
        <div className="relative w-5 h-5">
          {/* Light mode icon */}
          <Sun className={`
            absolute inset-0 w-5 h-5 transition-all duration-300
            ${resolvedTheme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
            }
            text-amber-500 dark:text-amber-400
          `} />
          
          {/* Dark mode icon */}
          <Moon className={`
            absolute inset-0 w-5 h-5 transition-all duration-300
            ${resolvedTheme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
            }
            text-blue-400 dark:text-blue-300
          `} />
        </div>
        
          {/* Theme indicator dot */}
        <div className={`
          absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-black
          transition-colors duration-300
          ${theme === 'system' ? 'bg-green-500' : 
            theme === 'light' ? 'bg-amber-500' : 'bg-blue-500'}
        `} />
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <button
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.value === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].value);
        }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
          bg-gray-100 hover:bg-gray-200 dark:bg-black dark:hover:bg-gray-900
          border border-gray-200 dark:border-gray-700
          text-gray-700 dark:text-gray-300
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          ${className}
        `}
        aria-label={`Switch theme. Current: ${currentTheme.label}`}
      >
        {currentTheme.icon}
        {showLabel && <span className="text-sm font-medium">{currentTheme.label}</span>}
      </button>
    );
  }

  // Default button variant
  return (
    <button
      onClick={() => {
        const currentIndex = themes.findIndex(t => t.value === theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex].value);
      }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
        bg-gray-100 hover:bg-gray-200 dark:bg-black dark:hover:bg-gray-900
        border border-gray-200 dark:border-gray-700
        text-gray-700 dark:text-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
        ${className}
      `}
      aria-label={`Switch theme. Current: ${currentTheme.label}`}
    >
      {currentTheme.icon}
      {showLabel && <span className="text-sm font-medium">{currentTheme.label}</span>}
    </button>
  );
};
