import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Skip type checking during build
    minify: true,
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      // Ignore TypeScript errors during build
      onwarn(warning, warn) {
        if (warning.code === 'TS_ERROR') return;
        warn(warning);
      }
    }
  },
  esbuild: {
    // Drop console.log in production
    drop: ['console', 'debugger'],
    // Ignore TypeScript errors
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
