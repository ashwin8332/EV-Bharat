import { defineConfig } from 'vite';

export default defineConfig({
  // No plugins needed for standard Tailwind v3 + PostCSS
  server: {
    host: true,
    proxy: {
      '/api/rag': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rag/, '')
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
