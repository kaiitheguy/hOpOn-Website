# Merchant (Restaurant) Web — Migration Notes

This folder implements the merchant-side web app from the Blanc migration audit. All flows use **web-native React + Tailwind**; no React Native code.

## Structure

- **types.ts** — `Restaurant`, `Campaign`, `Application`, `Deliverable`, `DraftPost`, `Creator`, `Notification`, status enums.
- **constants.ts** — Status enums, `COPY_ZH`/`COPY_EN` (official vs 活动), `REVIEW_TABS`, `getApplicationReviewTab()`, `filterOfficialCampaigns()`, `isCampaignEligibleForInvite()`.
- **validation.ts** — `validateCampaignCreate({ title, selectedPlatforms })`.
- **api.ts** — Supabase-backed (or stubbed) store: `getCurrentUserId`, `getRestaurantProfile`, `getCampaignsForRestaurant`, `listApplicantsForRestaurant`, `reviewApplication`, `createCampaign`, `listDiscoverCreators`, `fetchNotifications`, etc.

## Routes

| Path | Screen |
|------|--------|
| `/merchant/login` | Login (email/password) |
| `/merchant` | Home (campaign list; official vs 活动 copy) |
| `/merchant/review` | Review (tabs placeholder) |
| `/merchant/hunt` | Discover creators (placeholder) |
| `/merchant/achievements` | Achievements (placeholder) |
| `/merchant/profile` | Restaurant profile edit + sign out |
| `/merchant/campaign/new` | Create campaign/announcement |
| `/merchant/campaign/:id` | Campaign detail (placeholder content) |
| `/merchant/notifications` | Notifications (placeholder) |
| `/merchant/creator/:id` | Creator profile (placeholder) |
| `/merchant/campaigns` | Redirect → `/merchant` |
| `/merchant/applicants`, `/merchant/deliverables` | Redirect → `/merchant/review` |

## Auth & Data Assumptions

- **Auth**: `getCurrentUserId()` uses Supabase `auth.getSession()`. No session → redirect to `/merchant/login`.
- **Restaurant**: Currently `getRestaurantProfile(getCurrentUserId())` assumes **restaurant_id = user_id** (1:1). If your schema has a separate link (e.g. `user_restaurants` or `users.restaurant_id`), add a helper (e.g. `getRestaurantIdForCurrentUser()`) and use it in Home/Profile/CampaignCreate.

## Backend Wiring

- **Tables**: API uses **`restaurant_profiles`** (not `restaurants`), `campaigns`, `applications`, `deliverables`, `draft_posts`, `creator_profiles`, `notifications`, `locations`. Column names in `api.ts` match Supabase snake_case; Campaign dates are `start_date`/`end_date` in DB, exposed as `starts_at`/`ends_at` on the `Campaign` type.
- **Joins**: `getCampaignsForRestaurant` and `getCampaignById` use `merchant:restaurant_profiles!campaigns_restaurant_id_fkey(id, is_official)` so PostgREST resolves the FK correctly.
- **No RPCs for**: `verifyCreatorPresence` (queries `applications` by `verification_code` + status ACCEPTED), `getCreatorAchievementStats` (counts applications + APPROVED deliverables in JS). `listDiscoverCreators` and `resolveLocationFromInput` remain RPCs; create in SQL or replace with table queries.

## Official / 公告 Logic

- **Source**: `Restaurant.is_official` and `Campaign.merchant?.is_official`.
- **Home**: Section title "我的公告" vs "我的活动"; create button "发布公告" vs "创建活动"; official list hides CLOSED campaigns.
- **Campaign create**: If `profile.is_official`, show checkbox "作为官方公告发布"; copy switches via `COPY_ZH[isOfficial ? 'official' : 'normal']`.
- **Campaign detail**: Header "公告详情" vs "活动详情"; badge "官方" when applicable.

## Next Steps (from audit)

1. **Review** — Implement tabs (申请审核, 待博主探店, 待提交作业, 待提交终稿, 作业审核), list applications with `getApplicationReviewTab()`, verify (manual code entry on web; no camera), revision modals.
2. **Hunt** — `listDiscoverCreators(filters)`, filters UI, invite-to-campaign modal.
3. **Achievements** — Stats API + chart (e.g. Recharts).
4. **Notifications** — `fetchNotifications` / `markNotificationRead`, list UI.
5. **Creator profile** — `getCreatorProfile`, OPEN campaigns, invite action.
6. **Campaign detail** — Applicants list, draft/deliverable review actions, nudge.
