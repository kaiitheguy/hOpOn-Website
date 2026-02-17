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

These are read at **build time** by Vite (the app is a static SPA). Do not put Supabase keys in repo or in code.

## Cloud Run: configuring env

For Cloud Run, the app is built as a static site and served with `serve`. To inject Supabase (or other) env into the build:

1. **Build-time env (recommended)**  
   When Cloud Build runs `npm run build`, ensure the build step has access to env vars. In Cloud Build configuration (e.g. `cloudbuild.yaml` or the Cloud Run “Build” UI), set **Substitution variables** or **Secret manager** and pass them into the build, e.g.:
   - `VITE_SUPABASE_URL` = your Supabase URL  
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key  

   Then in the build step, export them before `npm run build`:
   ```bash
   export VITE_SUPABASE_URL="$ _SUPABASE_URL"
   export VITE_SUPABASE_ANON_KEY="$ _SUPABASE_ANON_KEY"
   npm ci && npm run build
   ```
   (Replace `_SUPABASE_URL` / `_SUPABASE_ANON_KEY` with your actual substitution/secret names in Cloud Build.)

2. **Runtime env**  
   Cloud Run “Runtime” env vars are available in the **running container**, not during `vite build`. Because Vite inlines `import.meta.env.VITE_*` at build time, runtime env alone will not change the client bundle. So for this SPA, use build-time env as above. Do not commit `.env` or any real keys to the repo.
