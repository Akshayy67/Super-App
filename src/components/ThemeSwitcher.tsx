import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'light') return <Sun className="w-5 h-5" />;
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const getLabel = () => {
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'System';
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative group flex items-center gap-2 px-4 py-2 rounded-full
        transition-all duration-300 ease-out
        ${actualTheme === 'dark' 
          ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' 
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }
        shadow-lg hover:shadow-xl transform hover:scale-105
        before:absolute before:inset-0 before:rounded-full
        before:bg-gradient-to-r before:from-purple-400 before:to-pink-400
        before:opacity-0 hover:before:opacity-20 before:transition-opacity
        before:duration-300
      `}
      aria-label={`Current theme: ${getLabel()}`}
    >
      <div className="relative z-10 flex items-center gap-2">
        <div className="relative">
          <div className={`
            absolute inset-0 rounded-full
            ${actualTheme === 'dark' 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
              : 'bg-gradient-to-r from-yellow-400 to-orange-400'
            }
            blur-md opacity-50 group-hover:opacity-75
            transition-opacity duration-300
          `} />
          <div className="relative">
            {getIcon()}
          </div>
        </div>
        <span className="text-sm font-medium hidden sm:inline">
          {getLabel()}
        </span>
      </div>
      
      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <div className={`
          absolute inset-0 rounded-full
          bg-gradient-to-r from-white/20 to-transparent
          transform scale-0 group-active:scale-100
          transition-transform duration-500
        `} />
      </div>
    </button>
  );
};

export const FloatingThemeSwitcher: React.FC = () => {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleTheme}
        className={`
          group relative p-4 rounded-full
          transition-all duration-500 ease-out
          ${actualTheme === 'dark' 
            ? 'bg-gray-800 text-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.3)]' 
            : 'bg-white text-gray-800 shadow-[0_0_40px_rgba(0,0,0,0.1)]'
          }
          hover:scale-110 active:scale-95
          before:absolute before:inset-0 before:rounded-full
          before:bg-gradient-to-r 
          ${actualTheme === 'dark'
            ? 'before:from-purple-500 before:to-pink-500'
            : 'before:from-yellow-400 before:to-orange-400'
          }
          before:opacity-0 hover:before:opacity-100
          before:transition-opacity before:duration-500
          before:-z-10 before:blur-xl
        `}
        aria-label="Toggle theme"
      >
        <div className="relative">
          {/* Sun icon */}
          <Sun className={`
            w-6 h-6 absolute inset-0
            transition-all duration-500
            ${actualTheme === 'dark' 
              ? 'opacity-0 rotate-180 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `} />
          
          {/* Moon icon */}
          <Moon className={`
            w-6 h-6
            transition-all duration-500
            ${actualTheme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-180 scale-0'
            }
          `} />
        </div>
        
        {/* Animated ring */}
        <div className={`
          absolute inset-0 rounded-full border-2
          ${actualTheme === 'dark' 
            ? 'border-purple-400' 
            : 'border-yellow-400'
          }
          animate-ping opacity-20
        `} />
      </button>
    </div>
  );
};