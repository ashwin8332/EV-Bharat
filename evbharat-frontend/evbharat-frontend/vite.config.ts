
import { defineConfig } from 'vite';

export default defineConfig({
  // No plugins needed for standard Tailwind v3 + PostCSS
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
