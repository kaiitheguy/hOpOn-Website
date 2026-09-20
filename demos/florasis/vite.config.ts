import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/florasis-demo/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': root,
    },
  },
  build: {
    outDir: '../../public/florasis-demo',
    emptyOutDir: true,
  },
});
