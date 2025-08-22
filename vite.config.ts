import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
        },
      },
      // Disable native rollup binaries
      external: [],
      onwarn(warning, warn) {
        // Suppress warnings about missing native binaries
        if (warning.code === 'MODULE_NOT_FOUND' && warning.message.includes('@rollup/rollup-')) {
          return;
        }
        warn(warning);
      }
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  // Force Vite to use pure JavaScript implementation
  define: {
    'process.env.ROLLUP_SKIP_NATIVE': 'true',
    'process.env.ROLLUP_NO_NATIVE': '1'
  }
});
