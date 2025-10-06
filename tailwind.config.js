/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      // Premium Zara-like font families
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        heading: [
          "Montserrat",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        body: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        sans: [
          "Montserrat",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: ["Playfair Display", "Georgia", "Times New Roman", "serif"],
      },
      // Custom theme colors using CSS variables
      colors: {
        // Primary theme colors
        primary: {
          50: "rgb(var(--color-primary-light) / <alpha-value>)",
          500: "rgb(var(--color-primary) / <alpha-value>)",
          600: "rgb(var(--color-primary-hover) / <alpha-value>)",
          700: "rgb(var(--color-primary-dark) / <alpha-value>)",
        },
        // Secondary theme colors
        secondary: {
          500: "rgb(var(--color-secondary) / <alpha-value>)",
          600: "rgb(var(--color-secondary-hover) / <alpha-value>)",
        },
        // Accent colors
        accent: {
          500: "rgb(var(--color-accent) / <alpha-value>)",
          600: "rgb(var(--color-accent-hover) / <alpha-value>)",
        },
        // Background colors
        bg: {
          primary: "rgb(var(--color-bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-bg-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--color-bg-tertiary) / <alpha-value>)",
          quaternary: "rgb(var(--color-bg-quaternary) / <alpha-value>)",
        },
        // Surface colors
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          hover: "rgb(var(--color-surface-hover) / <alpha-value>)",
          active: "rgb(var(--color-surface-active) / <alpha-value>)",
        },
        // Text colors
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--color-text-tertiary) / <alpha-value>)",
          quaternary: "rgb(var(--color-text-quaternary) / <alpha-value>)",
          inverse: "rgb(var(--color-text-inverse) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        },
        // Border colors
        border: {
          primary: "rgb(var(--color-border-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-border-secondary) / <alpha-value>)",
          focus: "rgb(var(--color-border-focus) / <alpha-value>)",
          error: "rgb(var(--color-border-error) / <alpha-value>)",
        },
      },
      // Custom gradients
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-surface": "var(--gradient-surface)",
      },
      // Custom shadows
      boxShadow: {
        "theme-sm": "var(--shadow-sm)",
        "theme-md": "var(--shadow-md)",
        "theme-lg": "var(--shadow-lg)",
        "theme-xl": "var(--shadow-xl)",
      },
      screens: {
        xs: "475px", // Extra small devices (large phones)
        sm: "640px", // Small devices (tablets)
        md: "768px", // Medium devices (small laptops)
        lg: "1024px", // Large devices (laptops/desktops)
        xl: "1280px", // Extra large devices (large desktops)
        "2xl": "1536px", // 2X large devices (larger desktops)
        // Custom breakpoints for specific use cases
        mobile: "320px", // Very small mobile devices
        tablet: "768px", // Tablet devices
        desktop: "1024px", // Desktop devices
        // Height-based breakpoints for better mobile experience
        "h-sm": { raw: "(max-height: 640px)" },
        "h-md": { raw: "(max-height: 768px)" },
        "h-lg": { raw: "(min-height: 768px)" },
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      minHeight: {
        "screen-safe":
          "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
    },
  },
  plugins: [],
};
