import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey =
      env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    return {
      envPrefix: ['VITE_', 'EXPO_PUBLIC_'],
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
                  VITE_SUPABASE_URL:
                    devEnv.VITE_SUPABASE_URL || devEnv.SUPABASE_URL || devEnv.EXPO_PUBLIC_SUPABASE_URL || '',
                  VITE_SUPABASE_ANON_KEY:
                    devEnv.VITE_SUPABASE_ANON_KEY ||
                    devEnv.SUPABASE_ANON_KEY ||
                    devEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
                    '',
                  EXPO_PUBLIC_SUPABASE_URL: devEnv.EXPO_PUBLIC_SUPABASE_URL || '',
                  EXPO_PUBLIC_SUPABASE_ANON_KEY: devEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
                  VITE_MAPBOX_ACCESS_TOKEN:
                    devEnv.VITE_MAPBOX_ACCESS_TOKEN || devEnv.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
                  EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN: devEnv.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
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
        'import.meta.env.EXPO_PUBLIC_SUPABASE_URL': JSON.stringify(env.EXPO_PUBLIC_SUPABASE_URL || ''),
        'import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''),
        'import.meta.env.VITE_MAPBOX_ACCESS_TOKEN': JSON.stringify(env.VITE_MAPBOX_ACCESS_TOKEN || env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || ''),
        'import.meta.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN': JSON.stringify(env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
