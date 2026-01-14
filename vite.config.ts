import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill for process.env in browser if needed, though we use import.meta.env normally in Vite.
    // However, the provided code uses process.env.API_KEY, so we define it here to avoid crashes.
    'process.env': process.env
  }
});