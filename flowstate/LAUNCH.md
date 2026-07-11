# Flowstate — Launch Runbook

Status as of 2026-06-30. Code is launch-ready; the items below are the remaining
**human/dashboard actions** that can't be done from the codebase.

## 🔴 Blockers (must do before go-live)

### 1. Lemon Squeezy (payments) — account VERIFIED ✅ (2026-07-02)
- [ ] Use product type **Subscription** (NOT "Pay what you want" — that type is
      single-payment only, no interval). The pay-what-you-want behavior comes from the
      app sending `custom_price` per checkout (LS applies it to every renewal); the $5
      floor is enforced server-side in the checkout route.
- [ ] LS puts one billing interval per product, so create **TWO separate products**
      (adding a second interval as a "variant" in the UI is awkward — two products give
      the two variant IDs the code needs, cleaner):
      - **Flowstate Pro Monthly** — Subscription, Standard pricing, **$9.99** (anchor;
        the $5 floor lives in the app code), repeat every 1 Month.
      - **Flowstate Pro Yearly** — Subscription, Standard pricing, **$99**, repeat every 1 Year.
      - Full click-by-click guide + final selling copy: `marketing/LEMONSQUEEZY-SETUP.md`.
      - Turn **free trial OFF** (core app is already free; a 14-day Pro trial then charge
        invites chargebacks). Tax category: reconsider "SaaS personal use" (buyers are
        individuals) vs the default "business use" — confirm with a tax source.
- [x] DONE (2026-07-02): key + store `418457` + variants set in `.env.local`.
      NOTE: product page URLs show **product** IDs; the code needs **variant** IDs
      (monthly `1861083`, yearly `1862091` — fetched via `GET /v1/variants?filter[product_id]=`).
      Checkout creation smoke-tested via API with custom_price 500 → OK.
- [ ] SECURITY before launch: (a) regenerate the API key (it transited a chat session),
      (b) replace webhook secret with a 32+ char random string in BOTH the LS dashboard
      and the env (current one is guessable → forged webhooks = free Pro).
- [ ] Settings → Webhooks → add `https://flow.virzyguns.com/api/webhooks/lemonsqueezy`,
      subscribe to all `subscription_*` events, set a signing secret →
      `LEMONSQUEEZY_WEBHOOK_SECRET` (route fails closed without it).
- [ ] Set `NEXT_PUBLIC_APP_URL=https://flow.virzyguns.com` (checkout redirect).
- [ ] Toggle **Test mode** first: run a $5 test checkout (card 4242 4242 4242 4242),
      confirm the webhook writes a row in `flowstate_subscriptions` and the account
      badge flips to "Pro". Then switch live.
- [ ] After this works, flip entitlement gating from "ungated pre-launch" to enforced:
      **remove `NEXT_PUBLIC_PREMIUM_PROMO=1` from the env** (it currently force-unlocks
      everything for everyone via `hooks/use-entitlement.ts`).

### 2. Audio delivery worker (Cloudflare R2 — SIGNED, not public)
> Replaces the old "make the bucket public" plan (ADR-001): a public bucket lets any
> download manager rip the catalog. The worker issues short-TTL signed URLs instead.
> The bucket must stay **private** (no public access, no custom public domain).
- [ ] `cd worker` → `wrangler login` (once).
- [ ] Set the four secrets:
      `wrangler secret put URL_SIGNING_SECRET` (long random string),
      `wrangler secret put SUPABASE_URL`,
      `wrangler secret put SUPABASE_ANON_KEY`,
      `wrangler secret put SUPABASE_SERVICE_ROLE_KEY`.
- [ ] `wrangler deploy` → note the worker URL.
- [ ] Set `NEXT_PUBLIC_AUDIO_WORKER_URL=<worker URL>` in the Vercel env (leave the
      legacy `NEXT_PUBLIC_AUDIO_CDN_BASE_URL` empty) and redeploy the app.
- [ ] Verify in production: a track plays; its stream URL is `…/v1/stream?k=…&e=…&s=…`;
      pasting that URL into a new tab **after ~15 min** returns 403.
- [ ] When `NEXT_PUBLIC_PREMIUM_PROMO` is removed from the app env, also set the
      worker's `PREMIUM_PROMO` var to `0` in `worker/wrangler.toml` + redeploy
      (they must flip together or premium gating will disagree between app and worker).
- [ ] Delete `scripts/.r2.env` once confirmed.

### 2b. Observability (Sentry + PostHog — free tiers)
- [ ] Create a Sentry project (Next.js) → set `NEXT_PUBLIC_SENTRY_DSN` in the deploy env.
      Optional source maps: `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.
- [ ] Create a PostHog project → set `NEXT_PUBLIC_POSTHOG_KEY`
      (+ `NEXT_PUBLIC_POSTHOG_HOST` if EU). Both are silent no-ops while unset.
- [ ] Marketing copy check: the landing page claims "No tracking or ads" — either keep
      PostHog cookieless-ish (current config: localStorage-only, no autocapture, DNT
      respected, no session recording) AND soften the claim (e.g. "No ads. Anonymous,
      cookie-free product analytics."), or don't enable the key. Update `/legal/privacy`
      + `/legal/cookies` accordingly when enabling.

### 3. Auth (Supabase)
- [ ] Add prod + dev redirect URLs to the Supabase Auth allowlist:
      `https://flow.virzyguns.com/**` and `http://localhost:3001/**`.
- [ ] Create the Google OAuth client and paste credentials into Supabase Auth.
- [ ] Paste `SUPABASE_SERVICE_ROLE_KEY` into the deploy env (used by the webhook).

## 🟡 Recommended (low effort, do before or just after launch)
- [ ] Supabase → Auth → enable **leaked-password protection** (HaveIBeenPwned).
- [ ] Hosting: confirm we're on **Vercel Pro** (Hobby is non-commercial) or another host.
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in prod env.
- [ ] Review the legal pages (`/legal/terms`, `/legal/privacy`, `/legal/refund`) and
      adjust the operator/business name if you register a legal entity.

## ✅ Done in code (2026-06-30)
- Perf: lazy-loaded three.js (route `/` First Load 526 kB → 393 kB); tamed
  backdrop-filter blur; de-nested glass layers.
- Security: enabled RLS on the 7 exposed `vgp_*` founder tables (closed an email-list
  leak via the public anon key); pinned function search_path.
- Legal: Terms / Privacy / Refund pages + links from pricing, login, and the app.
- PWA: generated real `icon-192/512` + apple-touch (manifest previously pointed at
  missing files); brand `app/icon.svg` favicon.
- SEO/social: dynamic OG image, `robots.txt`, `sitemap.xml`.
- Robustness: branded `error.tsx` + `not-found.tsx` boundaries.

## Known accepted tradeoffs
- CSP keeps `script-src 'unsafe-inline'` for now (Lemon Squeezy overlay + Next inline
  scripts). Documented in SECURITY.md; revisit with a nonce later.
- `flowstate_is_premium` is anon-callable (leaks only a boolean premium status).
- `catalog.json` (~146 KB) is still statically imported — optional future lazy-load.
