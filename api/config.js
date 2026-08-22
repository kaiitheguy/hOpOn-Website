export default function handler(_req, res) {
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
  };

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(200).send(`window.__RUNTIME_CONFIG__ = ${JSON.stringify(config)};`);
}
