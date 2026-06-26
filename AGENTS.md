# hOpOn Website Repo Agent Guide

This repo follows hOpOn Office at `/Users/tojaki/Projects/hOpOs`.

Before meaningful work in this repo:

1. Read `/Users/tojaki/Projects/hOpOs/README.md`.
2. Use `/Users/tojaki/Projects/hOpOs/index/memory-index.md` to choose only relevant memory files.
3. Select the relevant agent from `/Users/tojaki/Projects/hOpOs/agents/`.
4. Select the relevant goal from `/Users/tojaki/Projects/hOpOs/goals/`.
5. Read the latest worklog for that goal from `/Users/tojaki/Projects/hOpOs/worklogs/`.
6. Complete one meaningful unit of work.
7. Update or create a HopOS worklog after meaningful progress.
8. Update HopOS memory only when reusable website, positioning, or merchant-web knowledge changed.

Default HopOS goals for this repo:

- `/Users/tojaki/Projects/hOpOs/goals/website/website-positioning-and-conversion.md`
- `/Users/tojaki/Projects/hOpOs/goals/app/instagram-oauth-and-social-data.md` when Website work touches merchant web or creator/merchant social data.

Use these agents most often:

- Frontend Engineer for homepage, merchant web UI, routing, layout, and conversion polish.
- Backend Engineer for Supabase data access, merchant web auth gates, and API behavior.
- QA Engineer for signup/login flows, visual checks, and smoke tests.

Stop for human approval before:

- Materially changing hOpOn brand positioning.
- Publishing exact pricing.
- Changing auth/security behavior.
- Deploying to production.
- Modifying secrets or environment variable behavior.
- Deleting production data.

Do not copy secrets, tokens, private customer data, or production credentials into HopOS worklogs or memory.

