# Florasis demo on hOpOn

## Route and deployment

- Intended URL: `https://www.thehoponapp.com/launch/florasis`.
- This is a separate React/Vite entry under `demos/florasis`, with its own dependencies and styles. It does not replace `/launch` or `/launch/demo`.
- The root `npm run build` installs the child app from its lockfile when needed, builds it to the ignored `public/florasis-demo` directory, and then builds the main website. Vite copies the generated child app into `dist/florasis-demo`.
- Vercel rewrites `/launch/florasis` and child paths to that entry. Assets use the `/florasis-demo/` base. Both route trees have `noindex, nofollow` headers, and the child HTML also has a robots meta tag. Noindex is not access control.
- The existing GitHub `main` → Vercel deployment remains the production release path.

## Demo boundaries

- Florasis is an illustrative brand reference, not a client or confirmed partner. Creators, quotes, budgets and performance are fictional examples.
- This public entry is a brand workspace only. It covers curated creator selection, content review and feedback, approval, pending results, and GEO insight samples. There is no role selector, creator submission surface, team management surface, provider-connection form, upload control, publish simulator, reset control, or internal brief/cost editor.
- Progress and previously stored media previews stay in the current browser's IndexedDB. They are not shared between people, devices or browser profiles. Existing browser data remains available, but this public entry does not add a new upload or reset workflow.
- New reporting remains empty while awaiting third-party platform data. Any browser-local historical simulated publication and metrics remain explicitly labeled as fictional examples; they are not real results. The demo does not send messages, post to Instagram, purchase media, pay creators or query a provider.
- GEO is bundled with the promotion in this demo rather than sold as a separate monthly brand subscription. Provider costs are an internal consideration; this change does not introduce a new customer price.
- Legacy ?mode=team, ?mode=creator, section=team, section=data, and section=submit links safely return to the brand overview. Supported brand sections may still be opened with section=overview, section=creators, section=review, section=results, or section=geo.
- Instagram and other provider connections remain absent. There is no API key field or server-side credential handling in this public entry.

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

In a plain Vite preview, open /florasis-demo/index.html; /launch/florasis is the Vercel rewrite. Test brand shortlist selection and confirmation, draft feedback and approval, browser persistence and existing media previews, legacy links returning to the brand overview, empty results waiting for third-party sync, and GEO shown as bundled with the promotion. Also smoke-test /, /launch and /merchant/login on the Vercel deployment.
