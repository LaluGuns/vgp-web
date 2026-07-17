# ADR-001: Production Hardening, Retention System & Visual Identity

**Status:** Accepted
**Date:** 2026-07-08
**Deciders:** Virzy Guns

## Context

Pre-launch audit (2026-07-08) of Flowstate found, grounded in code — not assumption:

1. **Audio is unprotected.** 1.3 GB of raw MP3s ship in `public/tracks/` and are served
   statically from Vercel. `public/tracks/catalog.json` is a public sitemap of every
   file path. Any download manager (IDM etc.) can rip the entire catalog. The signed-URL
   helper (`lib/security/audio-url.ts`) exists but has **zero callers**. Env vars
   `NEXT_PUBLIC_AUDIO_CDN_BASE_URL` / `AUDIO_SIGNING_KEY` are **empty** — the R2 mirror
   (bucket `flowstate-audio`, fully synced 2026-07-02, keys mirror `tracks/...`) is not
   used by the app at all. Bonus damage: 1.3 GB bloats the Vercel deploy and audio
   bandwidth burns Vercel egress on a Hobby plan.
2. **Focus-session writes can silently vanish.** `persistSession` is a single
   fire-and-forget Supabase insert. Network blip / closed tab = data lost forever.
3. **Zero observability.** No error tracking, no product analytics, no way to see the
   bugs users actually hit or measure retention.
4. **Payment layer is solid** (server-authoritative pricing, HMAC webhook verification,
   replay protection, variant-ID plan mapping). Remaining task: verify RLS policies.
5. **Defection tracking was removed** (see memory: a hidden tab ≠ unfocused). The
   product needs honest replacement value worth a premium price.
6. **UI reads as generic "AI dark SaaS"**: Inter + glassmorphism + neon cyan/purple +
   emoji. No distinct identity.

A proven in-house pattern already exists: the `cadenz-audio-delivery` Worker
(JWT auth → Supabase entitlement check → HMAC short-TTL signed URLs → `/v1/stream`
R2 proxy with Range support and `cache-control: private, no-store`).

## Decision

Five phases, in priority order. Reuse the CADENZ worker pattern rather than inventing
new infrastructure.

### P0 — Audio protection & delivery (Worker `flowstate-audio-delivery`)

- New Cloudflare Worker in `flowstate/worker/` bound to R2 bucket `flowstate-audio`:
  - `POST /v1/urls` — batch-issue signed stream URLs. Free tracks: issuable without
    auth (the free tier works logged-out) but still signed + short TTL. Premium tracks:
    require Supabase JWT and `flowstate_profiles.plan != 'free'`
    (honoring `PREMIUM_PROMO` env during promo).
  - `GET /v1/stream?k=&e=&s=` — verify HMAC(key|exp), Range support,
    `content-type: audio/mpeg`, `cache-control: private, no-store`, strict CORS
    (only the app origin).
  - `GET /v1/health`.
- App side: player resolves track URLs through a signed-URL provider (batched,
  in-memory cache until near-expiry) instead of static paths. Dev fallback: when the
  worker env is not configured, keep serving `/tracks/...` locally so `npm run dev`
  works offline.
- Remove `public/tracks/*.mp3` from the deploy (they stay local as masters; the R2
  mirror is the source of truth). `catalog.json` metadata moves into the bundle —
  the public sitemap disappears.
- CSP `media-src`/`connect-src` gains the worker origin.

**Honesty note (no security theater):** signed short-TTL URLs + `no-store` kill
catalog scraping, hotlinking, and paste-URL-into-IDM. In-flight capture by a local
proxy and OS loopback recording are NOT stoppable by any web player — full mitigation
of casual in-flight capture would be encrypted HLS (AES-128), which is a follow-up
option (P0.5) using the already-installed hls.js + `ffmpeg-static` packaging script.

**Naming note (2026-07-17):** the `hlsUrl` field in `public/tracks/catalog.json`
(and on the `Track` type) actually holds plain `.mp3` paths today — no `.m3u8`
manifests exist, so the hls.js branch in `lib/audio/hls-player.ts` (gated on
`url.endsWith(".m3u8")`) never activates and playback always uses the native
`<audio>` element path. hls.js stays installed on purpose: it is the player half
of the P0.5 encrypted-HLS option above. The unused signed-URL helper
`lib/security/audio-url.ts` (zero callers, superseded by the Worker) was removed
on the same date.

### P1 — Data integrity (at-least-once session persistence)

- Client-side outbox: every finished session gets a client-generated UUID and is
  enqueued in `localStorage` first, then flushed (on finalize, on app open, on
  `online` event) with bounded retries.
- DB: unique index on the client UUID makes retries idempotent (no dupes).
- Verify RLS on `flowstate_focus_sessions`, `flowstate_profiles`,
  `flowstate_subscriptions` via Supabase MCP.

### P2 — Observability (Sentry + PostHog, free tiers)

- `@sentry/nextjs` for error tracking (client + server), release-tagged, user-id
  linked after consent.
- `posthog-js` for product analytics: funnels (landing → signup → first session →
  upgrade), retention curves, session replay on error.
- Core event taxonomy: `session_started/completed/skipped`, `upgrade_clicked`,
  `checkout_started/succeeded`, `theme_changed`, `track_played`.
- Env-gated: both no-op locally unless keys are set. CSP updated accordingly.

### P3 — Honest retention features (replacing the removed defection metric)

All computed from real measured data only:
- **Streaks** — consecutive days with ≥1 completed session (+ freeze rule to be kind).
- **Weekly focus goal** — user-set target minutes/week with progress ring.
- **Personal records** — longest session, best day, best week, longest streak.
- **Weekly recap** — in-app card first (email later via existing VGP CF worker
  email infra).

### P4 — Theme system (visual identity, kill the AI-slop look)

- Theme architecture: CSS custom properties per theme + `data-theme` attribute,
  themes selectable in-app; current "Dynamic Glass" becomes one theme and gets
  refined (no emoji in UI copy, tightened type scale).
- New themes shipped over time: **Analog Studio** (warm hi-fi instrument),
  **Editorial** (print-inspired, aligns with the VGP founder-dashboard direction),
  **Terminal** (phosphor instrument panel). Weak themes get cut or improved —
  quality bar over quantity.
- Premium themes double as retention/upgrade value.

### P5 — Full QA sweep before deploy

- Landing → login → app → insights → pricing → checkout flows.
- Mobile viewports (375px), tablet, desktop; dark scheme; empty/error states.
- Security: headers, CSP, RLS verified, rate limits.

## Options Considered (audio delivery)

### Option A: R2 + Worker signed URLs (CHOSEN)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium (pattern already proven in-house) |
| Cost | ~zero — R2 egress is free |
| Protection | High vs scraping/hotlink/IDM-paste; not vs loopback capture |
| Team familiarity | High (CADENZ worker identical) |

### Option B: Next.js proxy route on Vercel
Rejected: audio bandwidth through Vercel Hobby dies at scale; whole MP3 in one
authenticated request is easier for download managers; no infra reuse.

### Option C: R2 public bucket + signed URLs without Worker
Rejected: R2 public custom domains don't verify HMAC params; protection would be
cosmetic.

## Consequences

- Vercel deploy shrinks by ~1.3 GB; audio bandwidth moves to free R2 egress.
- A Worker deploy step enters the release process (`wrangler deploy`), requiring
  `wrangler login` once.
- Free-tier playback gains one signed-URL round-trip (mitigated by batch issuing).
- Analytics adds third-party scripts — CSP and privacy policy must be updated.
- The theme system adds a maintenance surface: every new component must be
  token-driven, never hard-coded colors.

## Action Items

1. [ ] P0: Worker source + wrangler.toml + secrets; deploy; wire app signed-URL provider; strip tracks from deploy; CSP.
2. [ ] P0.5 (optional): encrypted-HLS packaging script + player switch.
3. [ ] P1: session outbox + idempotency + RLS verification.
4. [ ] P2: Sentry + PostHog integration + event taxonomy.
5. [ ] P3: streaks, weekly goal, records, recap card.
6. [ ] P4: theme architecture + Dynamic Glass refine + first new theme.
7. [ ] P5: QA sweep; launch checklist update (`LAUNCH.md`).
