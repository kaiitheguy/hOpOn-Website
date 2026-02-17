import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'config-js',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              if (req.url?.startsWith('/config.js')) {
                const devEnv = loadEnv('development', process.cwd(), '');
                const config = {
                  VITE_SUPABASE_URL: devEnv.VITE_SUPABASE_URL || devEnv.SUPABASE_URL || '',
                  VITE_SUPABASE_ANON_KEY: devEnv.VITE_SUPABASE_ANON_KEY || devEnv.SUPABASE_ANON_KEY || '',
                  GEMINI_API_KEY: devEnv.GEMINI_API_KEY || '',
                };
                res.setHeader('Content-Type', 'application/javascript');
                res.end(`window.__RUNTIME_CONFIG__ = ${JSON.stringify(config)};`);
              } else {
                next();
              }
            });
          },
        },
      ],
      define: {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
