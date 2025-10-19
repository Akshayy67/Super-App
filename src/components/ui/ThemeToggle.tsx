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
          bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
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
            text-amber-500
          `} />
          
          {/* Dark mode icon */}
          <Moon className={`
            absolute inset-0 w-5 h-5 transition-all duration-300
            ${resolvedTheme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
            }
            text-blue-400
          `} />
        </div>
        
        {/* Theme indicator dot */}
        <div className={`
          absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800
          transition-colors duration-300
          ${theme === 'system' ? 'bg-green-500' : 
            theme === 'light' ? 'bg-amber-500' : 'bg-blue-500'}
        `} />
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative group ${className}`}>
        <button
          className="
            flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
            bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
            border border-gray-200 dark:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          "
          aria-label="Theme selector"
        >
          {currentTheme.icon}
          {showLabel && <span className="text-sm font-medium">{currentTheme.label}</span>}
        </button>
        
        <div className="
          absolute right-0 top-full mt-2 py-2 w-40 
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          rounded-lg shadow-lg
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 ease-in-out
          z-50
        ">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`
                w-full flex items-center gap-3 px-4 py-2 text-left
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-150
                ${theme === themeOption.value 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300'
                }
              `}
            >
              {themeOption.icon}
              <span className="text-sm font-medium">{themeOption.label}</span>
              {theme === themeOption.value && (
                <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
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
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        border border-gray-200 dark:border-gray-700
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
