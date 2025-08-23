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
        manualChunks: undefined,
      },
      // Force JavaScript implementation
      external: [],
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    force: true,
  },
  server: {
    port: 5173,
    host: true,
  },
  // Force environment variables to disable native rollup
  define: {
    "process.env.ROLLUP_NO_NATIVE": '"1"',
  },
});
