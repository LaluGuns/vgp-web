# Flowstate release/security audit — 2026-07-11

Scope: source and local build only. No production domain, dashboard, checkout, webhook delivery, R2 bucket, or Supabase project was contacted or changed.

## Release command evidence

| Check | Result | Evidence |
|---|---|---|
| `npx.cmd tsc --noEmit` | PASS | Exit 0 |
| `npm.cmd run lint` | PASS, deprecated gate | Exit 0; `next lint` warns it will be removed in Next 16 |
| `npm.cmd run build` | PASS | Exit 0 in 242.4s; 18 static pages generated |
| Tests / CI | BLOCKED | `package.json` has no test script; Flowstate and workspace have no `.github/workflows` |
| Dependency audit | P2 | `npm audit --omit=dev` reports two moderate PostCSS advisories through Next's bundled `postcss@8.4.31`; no High/Critical found |

## P0 — do not deploy

### RS-01: Premium entitlement bypass is enabled in source/local configuration

- Evidence: `worker/wrangler.toml:17` sets `PREMIUM_PROMO = "1"`. In `worker/src/index.js:218-245`, this skips the premium-user check before URLs are issued. `hooks/use-entitlement.ts:18-21` also force-sets the UI entitlement when `NEXT_PUBLIC_PREMIUM_PROMO=1`; the local non-secret configuration state has that flag enabled.
- Impact: anonymous/non-paying users receive premium audio URLs and the UI unlocks premium features if these values reach deployment.
- Reproduce: inspect the cited source; call `/v1/urls` for a catalog entry marked premium with no bearer token under this Worker configuration.
- Required retest: remove the public app flag and deploy the Worker with `PREMIUM_PROMO=0`; prove one free anonymous request receives `premium required`, while an entitled Test Mode account receives a short-lived URL.

### RS-02: Payment contract has conflicting yearly prices

- Evidence: checkout is server-authoritative at `app/api/checkout/route.ts:37-40` ($59.99 yearly, $29.99 with `FLOWBRO`). `app/pricing/page.tsx:55-57,153-193` and every translated Terms/Refund price currently match $59.99/$29.99. But `LAUNCH.md:16-18` and `marketing/LEMONSQUEEZY-SETUP.md:7,82-90` instruct creation of a $99 yearly Lemon Squeezy product anchor.
- Impact: the checkout API's `custom_price` will determine a recurring charge that does not match the runbook's declared sales configuration. This is a revenue, buyer-trust, and refund-risk release blocker.
- Reproduce: compare the cited source values; no payment was created.
- Required retest: choose one approved monthly/yearly and promo schedule, update every contract surface, then complete a Lemon Squeezy Test Mode checkout and retain the receipt plus webhook/entitlement evidence.

### RS-03: Local webhook secret does not meet the project’s own launch requirement

- Evidence: the non-secret state check confirms the local `LEMONSQUEEZY_WEBHOOK_SECRET` is materially shorter than the 32+ character requirement in `LAUNCH.md:27-32`; the runbook also says the existing secret is guessable and must be rotated.
- Impact: a weak signing secret risks forged subscription events and free Pro access. This does **not** prove what is in a future deploy/dashboard.
- Required retest: generate and set a new high-entropy secret in the Lemon Squeezy Test Mode webhook and deploy environment; send one valid Test Mode event and one invalid-signature event, retaining only redacted status/results.

## P1 — fix or explicitly accept before release

### RS-04: Unknown signed Lemon Squeezy statuses fail open to `active`

- Evidence: `app/api/webhooks/lemonsqueezy/route.ts:18-33` maps every unrecognized status to `active`; the setup doc subscribes to paused/unpaused lifecycle events at `marketing/LEMONSQUEEZY-SETUP.md:128-129`, but `SubscriptionStatus` does not model `paused`.
- Impact: a valid provider event with an unexpected/paused status can be stored as active and mirror a Pro plan.
- Reproduce: source trace `mapStatus("paused")` → `"active"`, then lines 122-130 mirror the plan.
- Required retest: explicitly model every subscribed provider status and make unknown statuses fail closed; replay signed Test Mode paused, cancelled, expired, and active events.

### RS-05: No automated regression gate or CI

- Evidence: `package.json` has dev/build/start/lint only; no test files or CI workflow were found. The current `next lint` gate is deprecated.
- Impact: payment, entitlement, RLS, worker, and redirect changes can ship without a repeatable check. The passing manual commands are not a sufficient release safety net by themselves.
- Required retest: add a non-mutating CI gate for type check, supported linter, production build, and targeted tests for checkout/webhook/worker authorization.

### RS-06: Private-audio conclusion is configuration-dependent, not proven

- Evidence: 308 audio assets (about 1.22 GB) still exist locally under `public/tracks`/`public/sounds`. `flowstate/.vercelignore` excludes those files and `worker`; `flowstate/.gitignore` also keeps the raw files untracked. This only protects a Vercel project whose deployment root is exactly `flowstate` and which honors that ignore file.
- Impact: a mis-rooted or differently configured deployment could expose the catalog and raw audio publicly.
- Required retest: before deployment, inspect the Vercel build file manifest/log for `public/tracks/**/*.mp3` and `public/sounds/**/*.mp3`; verify the R2 bucket has no public access/custom public domain and only the Worker is reachable.

## P2 — hardening / release debt

- `lib/security/rate-limit.ts:1-60` uses a per-instance in-memory store. It is bypassable across serverless instances and does not protect Worker URL issuance at all. Move checkout and audio issuance controls to a durable edge/Redis limiter.
- `SECURITY.md:18-20` claims the Lemon webhook is rate-limited, but `app/api/webhooks/lemonsqueezy/route.ts` has no `rateLimit` call. Correct the documentation or add the intended control.
- `next.config.ts:34-37` retains `script-src 'unsafe-inline'` due the inline theme bootstrap in `app/layout.tsx:55-61`. Use a nonce/hash when practical; current CSP is useful but not strong XSS containment.
- The local audio-worker URL is empty, so local playback uses `/api/dev-audio`; signed Worker/R2 behavior, secret presence, expiry, Range response, and CORS cannot be verified locally.
- Sentry/PostHog are intentionally disabled in the local configuration; deployment observability and the associated privacy claims require an explicit product decision and dashboard proof.
- `npm audit --omit=dev --audit-level=high` found two moderate PostCSS advisories through Next. Do not run `npm audit fix --force`: its proposed change is an unsafe major/downgrade path. Track a supported Next patch once available.

## Source-confirmed protections

- Checkout ignores caller-supplied amount and requires a Supabase user before creating a Lemon Squeezy checkout (`app/api/checkout/route.ts`).
- Webhook verifies raw-body HMAC before JSON parsing and returns 401 for invalid signatures (`lib/security/webhook.ts`, webhook route).
- Source migrations enable RLS on Flowstate tables, restrict profile grants to non-plan columns in migrations 003/004, and use service role only on the webhook path. Applied database state is unverified.
- Worker validates catalog paths, binds HMAC to path/expiry, returns no-store opaque stream responses, and has an explicit origin allow-list. Deployed secret/bucket state is unverified.
- `next.config.ts` sets CSP, HSTS in production, anti-framing, nosniff, referrer, and Permissions-Policy headers. Deployed headers are unverified.

## Manual proof still required (not inferable from source)

1. Lemon Squeezy Test Mode variants, product prices, rotated API/webhook credentials, and a full checkout → webhook → profile/worker entitlement sequence.
2. Supabase migration application, RLS policy/grant state, production redirect allow-list, and service-role deployment variable.
3. Cloudflare Worker deployment, four required secrets, private R2 bucket/no public domain, exact CORS, signed URL expiry/403, and free-vs-Pro behavior.
4. Vercel project root, environment values, deployment manifest, production security headers, and observability privacy configuration.
