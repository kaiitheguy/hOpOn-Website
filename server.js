import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, 'dist');

// 1) /config.js 优先：运行时配置，不被静态或 SPA fallback 吃掉
app.get('/config.js', (_req, res) => {
  const config = {
    VITE_SUPABASE_URL:
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    VITE_SUPABASE_ANON_KEY:
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      '',
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    VITE_MAPBOX_ACCESS_TOKEN: process.env.VITE_MAPBOX_ACCESS_TOKEN || process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
    EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  };
  const body = `window.__RUNTIME_CONFIG__ = ${JSON.stringify(config)};`;
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.send(body);
});

// 2) 静态文件（dist）
app.use(express.static(distPath, { index: false }));

// 3) SPA fallback：仅当请求路径无扩展名时返回 index.html，避免 /assets/*.js 等被误伤
app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).end();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
