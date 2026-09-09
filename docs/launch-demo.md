# hOpOn / LAUNCH concept demo

## Purpose

A separate consumer-brand launch concept under the existing hOpOn website. The operating model is team-delivered service with brand approvals, with paid Instagram projects organized around a selected product vertical. Creator projects and GEO / English website content are separate workstreams that may be combined.

The current name is provisional. This demo does not change the positioning of the existing local-business product.

## Routes

- `/launch`: bilingual marketing page, English by default.
- `/launch/demo`: Chinese brand workspace. `?view=creators`, `review`, `reports`, and `geo` select views; no query shows the overview.
- `/launch/creator`: English creator brief and guided application-to-payment simulation.

NORTHLINE, City Carry, Creator A/B/C, fees, campaign analytics and GEO responses are fictional examples. No creator recruitment, messaging, file upload, live social analytics, search querying or payment occurs. Form and approval state lives only in React memory and resets when leaving the relevant page or refreshing. Brand and creator demonstrations are independent sessions, not synchronized accounts. Download buttons generate local sample files.

## Design

- Exact hOpOn accent: `#FF2A2A`, with near-black and off-white.
- Editorial imagery and typography inspired by the approved direction; service/workflow patterns informed by Insense.
- An original category marquee follows the restrained logo-cloud motion direction without implying client relationships.
- Marketing has English/Chinese copy; the brand workspace is primarily Chinese; the creator flow is English.
- Lazy route modules and scoped CSS keep the existing app surface separate.
- Vercel sends `X-Robots-Tag: noindex, nofollow` for `/launch/:path*`; demo routes are absent from the sitemap.

## Files and migration

The feature is contained in `features/launch/`, with its imagery in `public/assets/launch/`. Entry routes are mounted in `index.tsx`; the only hosting addition is the isolated noindex header in `vercel.json`. `config.ts` owns the base route, demo route and asset prefix. State transition helpers are framework-independent TypeScript.

To move this frontend demo, copy the feature and assets, install the same React/router/icon dependencies, supply the existing Inter/Space Grotesk/JetBrains Mono fonts, update the route constants and mount points, and retain the demo labels and noindex policy. A later live service will need separate authentication, brand/project data, creator onboarding, asset storage, messaging, usage-right records and analytics integrations; those are not implemented by this prototype.

## Asset provenance

`public/assets/launch/hero.webp` is a 1536×1024 original AI-generated editorial concept, converted to WebP for delivery. It depicts a fictional adult, not an actual partner or creator. The original generation is retained outside this repository as `creator-hero-editorial.png`.

Generation prompt: Landscape 1536×1024 premium editorial creator-marketing photograph. Stylish adult woman with dark natural hair, black casual tailoring, carrying a vivid sculptural red tote while walking along a pale concrete modern New York facade. Medium-wide waist-to-full-body composition with the subject in the right 60%, natural daylight, soft shadows, tactile fabric, fine grain. No text, logo, interface or watermark. Original fictional concept.

## Verification

- `node scripts/launch-demo.test.mjs`: state transitions, URL validation, fee totals and crawler isolation.
- `node scripts/launch-render.test.mjs`: server rendering of all seven route states, local image availability, route destinations and recovery integration.
- `npm run typecheck`
- `npm run build`
- `npm run verify:crawler-files`

These checks do not replace a manual browser/device review. Browser interaction testing is not part of this initial build unless requested.
