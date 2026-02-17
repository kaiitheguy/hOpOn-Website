<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1h-Lbc9M7LEkj8I33Mpnjo2jGTgJaeFqU

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env example and set variables (do not commit real keys):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - **`VITE_SUPABASE_URL`** – Supabase project URL (required for the /verify redeem page)
   - **`VITE_SUPABASE_ANON_KEY`** – Supabase anon/public key (required for /verify)
   - **`GEMINI_API_KEY`** – (optional) Only if you use Gemini elsewhere
3. Run the app:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Redeem page: [http://localhost:3000/verify](http://localhost:3000/verify).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | For /verify | Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | For /verify | Supabase anon key (public, safe in client-side build) |
| `GEMINI_API_KEY` | No | Used only if the app calls Gemini APIs |

Locally, the app reads from `.env` (or `import.meta.env`). On Cloud Run, the server injects them at runtime via `/config.js`. Do not put keys in the repo.

## Cloud Run deployment (runtime config)

Production uses a Node server (`server.js`) that serves `dist`, exposes `/config.js` (runtime env for the frontend), and listens on `$PORT`. **Why?** Vite inlines env at build time; Cloud Run only provides env in the container, so `/config.js` reads `process.env` and sets `window.__RUNTIME_CONFIG__` for the app.

**Env on Cloud Run:** In **Edit & deploy** → **Variables & secrets**, set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optionally `GEMINI_API_KEY`. No keys in repo.

**Build/start:** `npm run build` then `npm run start` (`node server.js`).

---
