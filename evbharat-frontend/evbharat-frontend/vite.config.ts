import { defineConfig, loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const ragTarget = trimTrailingSlash(env.VITE_RAG_API_TARGET || 'http://127.0.0.1:9000');
  const mlTarget = trimTrailingSlash(env.VITE_ML_API_TARGET || 'http://127.0.0.1:8000');
  const nodeTarget = trimTrailingSlash(env.VITE_NODE_API_TARGET || 'http://127.0.0.1:3001');

  return {
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
              const upstream = await fetch(`${ragTarget}/health`, {
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
          target: ragTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/rag/, '')
        },
        '/api/drowsiness': {
          target: mlTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/drowsiness/, '/drowsiness')
        },
        '/api/battery': {
          target: mlTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/battery/, '')
        },
        '/api': {
          target: nodeTarget,
          changeOrigin: true
        }
      }
    }
  };
});
