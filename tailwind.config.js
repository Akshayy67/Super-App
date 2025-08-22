/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
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
        "screen-safe": "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
    },
  },
  plugins: [],
};
