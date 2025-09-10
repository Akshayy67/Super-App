import React, { useEffect, ReactNode } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

/**
 * AuthWrapper component that forces light mode for authentication pages
 * This ensures the authentication flow is always displayed in light mode
 * regardless of the user's theme preference
 */
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Store the current theme state
    const root = document.documentElement;
    const hadDarkClass = root.classList.contains('dark');
    const currentDataTheme = root.getAttribute('data-theme');
    
    // Force light mode for authentication
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    
    // Update meta theme-color for mobile browsers to light mode
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const originalThemeColor = metaThemeColor?.getAttribute('content');
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#ffffff');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#ffffff';
      document.head.appendChild(meta);
    }
    
    // Cleanup function to restore original theme when component unmounts
    return () => {
      if (hadDarkClass) {
        root.classList.add('dark');
      }
      
      if (currentDataTheme) {
        root.setAttribute('data-theme', currentDataTheme);
      }
      
      if (metaThemeColor && originalThemeColor) {
        metaThemeColor.setAttribute('content', originalThemeColor);
      }
    };
  }, []);

  return <>{children}</>;
};
