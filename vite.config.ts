import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2015",
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable manual chunks to avoid issues
      },
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    port: 5173,
    host: true,
  },
});
