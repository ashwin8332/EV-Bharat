import { defineConfig } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

export default defineConfig({
  plugins: [
    {
      name: 'rag-health-fallback',
      configureServer(server) {
        server.middlewares.use('/api/rag/health', async (req: IncomingMessage, res: ServerResponse, next) => {
          if (req.method !== 'GET') {
            next();
            return;
          }

          try {
            const upstream = await fetch('http://127.0.0.1:8001/health', {
              signal: AbortSignal.timeout(1500)
            });

            const payload = await upstream.text();
            res.statusCode = upstream.status;
            res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
            res.end(payload);
          } catch {
            // Keep dev UX quiet when optional RAG backend is not running.
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              status: 'offline',
              active_sessions: 0,
              timestamp: Math.floor(Date.now() / 1000)
            }));
          }
        });
      }
    }
  ],
  // No plugins needed for standard Tailwind v3 + PostCSS
  server: {
    host: true,
    proxy: {
      '/api/rag': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rag/, '')
      },
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  }
});
