# Florasis demo on hOpOn

## Route and deployment

- Intended URL: `https://www.thehoponapp.com/launch/florasis`.
- This is a separate React/Vite entry under `demos/florasis`, with its own dependencies and styles. It does not replace `/launch` or `/launch/demo`.
- The root `npm run build` installs the child app from its lockfile when needed, builds it to the ignored `public/florasis-demo` directory, and then builds the main website. Vite copies the generated child app into `dist/florasis-demo`.
- Vercel rewrites `/launch/florasis` and child paths to that entry. Assets use the `/florasis-demo/` base. Both route trees have `noindex, nofollow` headers, and the child HTML also has a robots meta tag. Noindex is not access control.
- The existing GitHub `main` → Vercel deployment remains the production release path.

## Demo boundaries

- Florasis is an illustrative brand reference, not a client or confirmed partner. Creators, quotes, budgets and performance are fictional examples.
- The brand, team and creator switches are demo perspectives, not authenticated roles. Never enter customer secrets, production files or private commercial data here.
- Progress and optional media previews stay in the current browser's IndexedDB. They are not shared between people, devices or browser profiles. Reset restores the seed campaign and clears this demo's uploaded files.
- A file attachment is a browser-local preview, not a server upload. Accepted files: JPG, PNG, WebP, MP4 and WebM, up to 20 MB.
- Publishing, reporting, fees and GEO tasks are simulations. This demo does not send messages, post to Instagram, purchase media, pay creators or query a provider.
- Instagram data connections remain **waiting for connection**. There is no API key field or server-side credential handling in this public entry.

The earlier owner-only Sites app remains separate. Its ChatGPT authentication, D1 database, R2 files and encrypted provider settings are not migrated or exposed by this frontend port.

## Accounts to arrange later

1. Influencers.club account and API access: the initial discovery/public-content data candidate; confirm trial allowance, commercial quotation and API terms before enabling queries.
2. Meta developer app and appropriate business/account permissions: for the later official Instagram insights or optional paid promotion path. No app or credential is provisioned by this demo.
3. GEO provider access only when that service is selected; it is not required for this Instagram demo.

The detailed registration and pricing follow-up list is maintained separately in the local business notes. Do not commit credentials to this repository.

## Local verification

```sh
npm ci
npm run typecheck
npm run build
npm run verify:crawler-files
npm run preview -- --host 127.0.0.1
```

In a plain Vite preview, open `/florasis-demo/index.html`; `/launch/florasis` is the Vercel rewrite. Add `?mode=team&section=data` to inspect the waiting integration screen. Test brand shortlist confirmation, content revisions and approval, team simulated publishing, a local file preview, refresh persistence and reset. Also smoke-test `/`, `/launch` and `/merchant/login` on the Vercel deployment.
