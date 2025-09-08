import { useState, useEffect } from "react";

/**
 * Theme Manager - Handles dark/light mode switching with system preference detection
 * and localStorage persistence
 */

export type Theme = "light" | "dark" | "system";

class ThemeManager {
  private currentTheme: Theme = "system";
  private listeners: Set<
    (theme: Theme, resolvedTheme: "light" | "dark") => void
  > = new Set();
  private mediaQuery: MediaQueryList;

  constructor() {
    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.init();
  }

  private init() {
    // Load saved theme or default to system
    const savedTheme = localStorage.getItem("theme") as Theme;
    this.currentTheme = savedTheme || "system";

    // Listen for system theme changes
    this.mediaQuery.addEventListener("change", this.handleSystemThemeChange);

    // Apply initial theme
    this.applyTheme();
  }

  private handleSystemThemeChange = () => {
    if (this.currentTheme === "system") {
      this.applyTheme();
      this.notifyListeners();
    }
  };

  private applyTheme() {
    const resolvedTheme = this.getResolvedTheme();
    const root = document.documentElement;

    // Set data attribute for CSS targeting
    root.setAttribute("data-theme", resolvedTheme);

    // Set class for Tailwind dark mode
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(resolvedTheme);
  }

  private updateMetaThemeColor(theme: "light" | "dark") {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = theme === "dark" ? "#0f172a" : "#ffffff";

    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", color);
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
    }
  }

  private getResolvedTheme(): "light" | "dark" {
    if (this.currentTheme === "system") {
      return this.mediaQuery.matches ? "dark" : "light";
    }
    return this.currentTheme;
  }

  private notifyListeners() {
    const resolvedTheme = this.getResolvedTheme();
    this.listeners.forEach((listener) =>
      listener(this.currentTheme, resolvedTheme)
    );
  }

  public setTheme(theme: Theme) {
    this.currentTheme = theme;

    // Save to localStorage
    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }

    this.applyTheme();
    this.notifyListeners();
  }

  public getTheme(): Theme {
    return this.currentTheme;
  }

  public getResolvedThemeValue(): "light" | "dark" {
    return this.getResolvedTheme();
  }

  public subscribe(
    listener: (theme: Theme, resolvedTheme: "light" | "dark") => void
  ) {
    this.listeners.add(listener);

    // Call immediately with current theme
    listener(this.currentTheme, this.getResolvedTheme());

    return () => {
      this.listeners.delete(listener);
    };
  }

  public toggleTheme() {
    const currentResolved = this.getResolvedTheme();
    const newTheme = currentResolved === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  public destroy() {
    this.mediaQuery.removeEventListener("change", this.handleSystemThemeChange);
    this.listeners.clear();
  }
}

// Create singleton instance
export const themeManager = new ThemeManager();

// React hook for theme management
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(themeManager.getTheme());
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    themeManager.getResolvedThemeValue()
  );

  useEffect(() => {
    const unsubscribe = themeManager.subscribe((newTheme, newResolvedTheme) => {
      setTheme(newTheme);
      setResolvedTheme(newResolvedTheme);
    });

    return unsubscribe;
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme: themeManager.setTheme.bind(themeManager),
    toggleTheme: themeManager.toggleTheme.bind(themeManager),
  };
}
