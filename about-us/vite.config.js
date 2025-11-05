import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5174,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'gsap': ['gsap']
        }
      }
    }
  }
});



