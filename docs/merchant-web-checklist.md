# Merchant Web Migration Checklist

Scope: web-only migration from `Blanc/app/(restaurant)` into `hOpOn-Website`. No Supabase schema changes and no app changes.

| App merchant function | Web route/module | Status | Notes |
|---|---|---:|---|
| Merchant signup | `/merchant/signup` | Complete | Creates Supabase auth user, `app_users`, and `restaurant_profiles`; redirects to pending. |
| Merchant login | `/merchant/login` | Complete | Password login, forgot-password email, status-based routing. |
| Email callback | `/auth/callback` | Complete | Handles signup/recovery links; routes ready/pending/rejected merchants. |
| Reset password | `/reset-password` | Complete | Web-native password update flow. |
| Pending/rejected states | `/pending`, `/rejected` | Complete | AuthGate blocks pending/rejected merchants from protected app routes. |
| Auth gate | `MerchantAuthGate` | Complete | Checks session, merchant role/status, and missing profile state. |
| Growth home | `/merchant` | Complete | Growth dashboard, platform scores, report generation, drafts, generated pages, SEO opportunities. |
| Growth scoring | `lib/merchant/growthScoring.ts` | Complete | Local fallback scoring and summary logic split out from page. |
| Growth API | `lib/merchant/growthApi.ts` | Complete | Page loads through web-native data API wrappers. |
| Campaign drafts | `campaign_drafts` API + Growth cards | Complete | Save generated draft ideas to existing table. |
| Generated pages | `generated_pages` API + panel | Complete | List, publish, and link to published pages. |
| Campaign list | `/merchant/campaigns` | Complete | Separate Campaigns route matching current app nav. |
| Campaign create | `/merchant/campaign/new` | Complete | Web form, platform/type/date/requirements, image upload. |
| Campaign detail | `/merchant/campaign/:id` | Complete | Info, accepted creators, nudge, preview, approve/revision, chat/draft links. |
| Review workflow | `/merchant/review` | Complete | Application tabs, check-in manual code, draft/final review, revision modal, nudge. |
| Creator hunt | `/merchant/hunt` | Complete | Discover, filter, sort, invite to open campaigns. |
| Creator profile | `/merchant/creator/:id` | Complete | Profile view, social links, stats, campaign invite. |
| Achievements | `/merchant/achievements` | Complete | KPI/badge summary from campaigns/applications/deliverables. |
| Merchant profile | `/merchant/profile` | Complete | Edit profile, avatar upload, gallery upload/delete, settings/logout. |
| Notifications | `/merchant/notifications` | Complete | List and mark read. |
| Application chat | `/merchant/application/:applicationId/chat` | Complete | Messages, quick prompts, schedule proposal, confirm, reopen. |
| Draft-post review | `/merchant/application/:applicationId/draft-post` | Complete | Draft display, images, AI/local analysis, cached result, approve/revision. |
| Draft agent cache | `ai_draft_post_results` API | Complete | Reads cached analysis and upserts new results; table-missing fallback is safe. |
| Web media differences | Campaign/Profile upload helpers | Complete | Uses file inputs + Supabase storage; QR uses manual code; links use browser anchors/window behavior. |

Residual risk:
- Live success depends on existing Supabase RLS allowing the same authenticated merchant operations as the app.
- Browser camera QR scan is intentionally not implemented yet; manual code verification is the current web equivalent.
- Growth report and draft-post AI call edge functions when available and fall back locally when unavailable.
