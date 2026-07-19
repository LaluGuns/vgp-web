# Gemini deployment handoff — Flow global SEO

## Release identity

- Objective: deploy the existing `/founder` SEO and Flow enhancements, aggregate acquisition measurement, and page-level country SEO gates without creating a new dashboard.
- Branch: `codex/flow-seo-creator-music`
- Implementation commit: `7875304` (`feat: add global SEO measurement and rollout gates`)
- Production UI to verify: `https://www.virzyguns.com/founder`
- Codex performed no deployment, production migration, provider mutation, sitemap submission, URL Inspection request, or feature-flag activation.

## Legal state and hard boundary

The final legal package has **not** been uploaded or approved in this task. Treat every existing local legal ZIP, draft, migration, and creator-license edit as non-final user-owned work. Do not include or deploy those files from the dirty worktree. `CREATOR_LICENSE_ENABLED` must remain `false`/off. Do not activate private downloads, creator grants, or transactional localized license pages.

The deployment in this handoff is limited to commit `7875304`. Legal manifest, canonical digest, document versions, and translation approval are intentionally `PENDING FINAL UPLOAD`; this is a stop condition for legal-dependent work, not for measurement/dashboard/SEO routing.

## Exact implementation files

```text
.env.example
app/api/cron/seo-ingest/route.ts
app/api/founder/seo/route.ts
app/founder/FounderDashboardClient.tsx
components/founder/seo/SeoDashboard.tsx
flowstate/app/[lang]/alternatives/[slug]/page.tsx
flowstate/app/[lang]/creator-music/[genre]/page.tsx
flowstate/app/[lang]/creator-music/page.tsx
flowstate/app/[lang]/deep-work-timer/page.tsx
flowstate/app/[lang]/layout.tsx
flowstate/app/[lang]/license/page.tsx
flowstate/app/[lang]/pomodoro-timer-with-music/page.tsx
flowstate/app/[lang]/pricing/layout.tsx
flowstate/app/[lang]/pricing/page.tsx
flowstate/app/[lang]/study-timer/page.tsx
flowstate/app/[lang]/timer/[slug]/page.tsx
flowstate/app/api/checkout/route.ts
flowstate/app/api/webhooks/lemonsqueezy/route.ts
flowstate/app/sitemap.ts
flowstate/components/analytics/analytics-provider.tsx
flowstate/lib/analytics-acquisition.ts
flowstate/lib/analytics.ts
flowstate/lib/marketing/seo-registry.ts
flowstate/lib/marketing/seo.ts
flowstate/lib/security/checkout.ts
flowstate/lib/server-analytics.ts
flowstate/lib/translations/server.ts
flowstate/middleware.ts
flowstate/scripts/release/analytics-acquisition.test.mjs
flowstate/scripts/release/checkout.test.mjs
flowstate/scripts/release/country-seo.test.mjs
flowstate/scripts/release/server-analytics.test.mjs
lib/blog-posts/102-producing-city-pop-background-music-for-creators.ts
lib/blog-posts/103-cyberpunk-jazz-production-for-creator-videos.ts
lib/blog-posts/104-neo-synthwave-music-for-coding-and-tech-content.ts
lib/blog-posts/105-spotify-streaming-vs-flow-creator-license.ts
lib/seo/dashboard.ts
lib/seo/ingestion-utils.ts
lib/seo/ingestion.ts
lib/seo/types.ts
scripts/migrate-seo-analytics.js
scripts/release/seo-ingestion.test.mjs
vercel.json
```

## Local validation evidence

- `flowstate/npm.cmd ci`: success; 674 packages installed, 2 moderate npm audit findings. Do not run a force upgrade during this release.
- `flowstate/npm.cmd run predeploy`: success.
  - TypeScript: pass.
  - ESLint: zero warnings/errors.
  - Release tests: 38/38 pass.
  - i18n parity: 11 locales, 429 keys each.
  - Next 15.5.19 production build: pass; 522 static pages generated.
- Root `npm.cmd run lint`: zero errors; one unrelated pre-existing anonymous-default-export warning in the campaign cron worker.
- Root Next 16.2.9 production build: pass; 160 static pages generated and `/api/cron/seo-ingest`, `/api/founder/seo`, and `/founder` included.
- `git diff --cached --check`: pass before commit.

## Required environment names (never paste values into reports)

Root VGP project:

- `DATABASE_URL`
- `CRON_SECRET`
- `FOUNDER_PASSCODE`
- `JWT_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_JSON` — exact raw JSON object; the current local value is malformed and must not be copied or silently repaired.
- `GSC_SITE_URL` — default is `sc-domain:virzyguns.com`.
- `POSTHOG_PERSONAL_API_KEY` — server-only, `query:read`.
- `POSTHOG_PROJECT_ID`
- `POSTHOG_QUERY_HOST`

Flow project:

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- Existing Lemon Squeezy webhook/API/variant variables.
- `CREATOR_LICENSE_ENABLED=false` (mandatory until the final legal package passes review).

## Migration and deployment sequence

1. Confirm the checkout is exactly commit `7875304` plus no user-owned legal/licensing files. Stop on any scope drift.
2. Back up the intended root dashboard database and record its project/region without exposing credentials.
3. Set the root production `DATABASE_URL` only for the intended database, then run `node scripts/migrate-seo-analytics.js` once.
4. Verify tables, indexes, RLS, and grants:
   - required daily/run tables plus dimension, lock, and `seo_indexing_evidence` tables exist;
   - RLS is enabled;
   - `anon` and `authenticated` have no table privileges;
   - the server database connection can select/upsert.
5. Worker/R2: no change for this non-legal release. Do not deploy the dirty licensing worker tree.
6. Deploy Flow from the `flowstate` root, keeping licensing off.
7. Smoke Flow country routes and acquisition/checkout payloads before deploying root VGP.
8. Deploy root VGP, including the existing `/founder` client, protected SEO API, migration-backed data layer, and daily cron configuration.
9. Trigger `GET /api/cron/seo-ingest` with `Authorization: Bearer <CRON_SECRET>` once. Verify seven finalized UTC dates, pagination, connector states, sanitized errors, and idempotent rerun.
10. Verify `/founder` using the existing founder authentication. Do not create another dashboard or route.

## Country/indexing smoke matrix

- `/en` is global English and `x-default`.
- `/es` is neutral Spanish catchall but remains noindex until its page release is native-reviewed.
- Render and verify `en-US`, `en-GB`, `ja-JP`, `de-DE`, `es-MX`, `es-ES`, `pt-BR`, and `ko-KR` on desktop and mobile.
- Regional releases are intentionally draft/noindex. Do not flip a registry status until native title, description, H1, body, CTA, internal links, local evidence, schema, reviewer, and review date are complete.
- `ja/de/pt/ko` redirects must remain gated until the destination page is indexable. No geo-IP redirect.
- Verify self-canonical, absolute reciprocal hreflang, `x-default`, robots, and sitemap consistency. Draft regional/fallback pages must not appear in the sitemap.
- Verify the four root VGP authority articles link directly to `/en/creator-music...`; retain the unlocalized vanity URL only where contract attribution requires it.

## GSC provider operations

Use a fully authorized human/operator GSC account for mutations. The read-only service account is only for ingestion.

1. Submit `https://flow.virzyguns.com/sitemap.xml`.
2. Run URL Inspection for existing priority EN/ID pages and every released country beachhead only.
3. Record submission time, indexing state, declared/Google canonical, crawl time, mobile result, sitemap status, robots result, and schema result in `seo_indexing_evidence` through the server database connection.
4. Re-open `/founder` and verify evidence plus alerts render. Never attach a GSC query/keyword to a PostHog person, user ID, or PII.

## Smoke tests

- Founder auth and unchanged tab navigation.
- SEO 7/28/90 and custom range; previous-period line; market/locale/country/device/cluster/brand filters.
- Weighted position and CTR from totals, page/query-page mapping, ranking buckets, non-brand share, opportunity/action rules, connector freshness, honest empty/error states.
- Flow tab aggregate organic → focus, creator preview, checkout, and activated Pro funnel; brand-query filter must show funnel unavailable rather than global values.
- Acquisition: first touch immutable; new document entry or 30-minute inactivity starts a new acquisition session; SPA navigation retains it; `seo_landing_view` fires once per organic acquisition session.
- Checkout → Lemon Squeezy webhook preserves bounded non-PII acquisition context; server lifecycle events remain idempotent.
- Mobile tables scroll or render labeled cards; no placeholder metrics.

## Stop conditions

- Any migration/RLS/grant mismatch or unexpected database target.
- Invalid GSC raw JSON, missing property access, PostHog query failure, or unsanitized connector error.
- Any regional fallback page becomes indexable or appears in sitemap before native review.
- `CREATOR_LICENSE_ENABLED` is on, or a private grant/download path becomes active before legal approval.
- Any dirty legal/licensing file is included in the deployment.
- Flow/root build or smoke failure, founder auth regression, canonical mismatch, or analytics payload containing a GSC query/PII.

## Rollback

1. Roll back root VGP, then Flow, to their immediately previous successful deployment IDs.
2. Disable the SEO cron invocation if ingestion is the failure source.
3. Keep the additive analytics tables in place during application rollback; do not drop data under incident pressure.
4. Keep licensing off.
5. Revert `7875304` only after preserving connector/indexing evidence and confirming no later commit depends on it.

## Required final report

Return: deployed commit, Flow/root deployment IDs and production URLs, database target and migration proof, RLS/grant proof, environment-name checklist without values, licensing flag state, cron/connector result, sitemap submission status, URL Inspection/indexing evidence, desktop/mobile smoke matrix, alerts found, rollback deployment IDs, and every skipped or failed item.

## Copy-paste prompt for Gemini

```text
Deploy the non-legal Flow global SEO release from branch codex/flow-seo-creator-music, implementation commit 7875304. Follow GEMINI_DEPLOY_HANDOFF.md exactly. Do not deploy any dirty legal/licensing file, do not enable CREATOR_LICENSE_ENABLED, and do not mutate Worker/R2 for this release. Apply and verify the additive root SEO analytics migration with RLS and revoked anon/authenticated privileges, deploy Flow then root VGP, verify the existing https://www.virzyguns.com/founder dashboard, run the protected ingestion cron, submit the Flow sitemap with an authorized GSC operator account, inspect only eligible priority/indexable URLs, store provider evidence, and return the complete required final report. Stop immediately on scope drift, migration/RLS mismatch, invalid connector credentials, regional fallback indexation, build/smoke failure, or any legal feature activation.
```
