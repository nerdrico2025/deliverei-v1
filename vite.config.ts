/**
 * Vite Configuration
 * 
 * @refactored Phase 2 - Added production optimizations
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.* calls in production
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'date-vendor': ['date-fns'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
});
