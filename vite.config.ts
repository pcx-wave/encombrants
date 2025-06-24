import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Optimize for mobile
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          maps: ['leaflet', 'react-leaflet'],
        },
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
  },
  // Enable compression
  esbuild: {
    legalComments: 'none',
  },
});