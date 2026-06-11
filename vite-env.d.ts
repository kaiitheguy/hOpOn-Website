/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly EXPO_PUBLIC_SUPABASE_URL?: string;
  readonly EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
  readonly EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
