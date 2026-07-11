# Flowstate — Security Posture

Baseline security for the Flowstate focus SaaS. Keep this current as the app grows.

## Implemented

### HTTP security headers (`next.config.ts`)
- **Content-Security-Policy** — locks script/style/img/media/connect sources. `media-src` + `connect-src` allow the audio CDN and Supabase only. Dev relaxes `script-src` for HMR (`unsafe-eval`, `ws:`); production drops them.
- **Strict-Transport-Security** (prod only) — 2y, includeSubDomains, preload.
- **X-Frame-Options: DENY** + `frame-ancestors 'none'` — clickjacking protection.
- **X-Content-Type-Options: nosniff**, **Referrer-Policy: strict-origin-when-cross-origin**, **Permissions-Policy** (camera/mic/geo off), `poweredByHeader: false`.

### Authentication & data
- Supabase Auth (Google + email magic link); cookies handled via `@supabase/ssr`.
- **Row Level Security** on every user table (`supabase/migrations/001_initial_schema.sql`) — default deny; users only read/write their own rows. Service-role key never reaches the client.
- `licenses` table locked to service role only.

### Payments (`app/api/webhooks/lemonsqueezy/route.ts`)
- Raw-body **HMAC-SHA256 signature verification** before parsing (`lib/security/webhook.ts`), timing-safe compare, fail-closed if secret missing.
- **Rate limited** per IP; **idempotent** upsert keyed on `provider_subscription_id`; returns 5xx so the provider retries on DB error. Runs on Node runtime.

### Audio protection (`lib/security/audio-url.ts`)
- Short-lived **signed URLs** (HMAC of path+expiry) so premium tracks can't be hotlinked or URL-tampered. Verified at the CDN edge before bytes are served.

### Rate limiting (`lib/security/rate-limit.ts`)
- Fixed-window limiter with bounded-memory cleanup (no leak). Swappable `RateLimitStore` interface for a Redis/ioredis atomic backend in production.

### Secrets
- `.gitignore` excludes `.env*`, keys, `.next`, `node_modules`, and raw `.wav` masters. Only `.env.local.example` is committed.

## Upgrade path / TODO
- [ ] **Nonce-based CSP** — replace `script-src 'unsafe-inline'` with a per-request nonce generated in `middleware.ts` (Next reads the nonce header and applies it to its scripts). Mirrors the main VGP repo's dynamic CSP nonce.
- [ ] **Redis rate-limit backend** for multi-instance/serverless.
- [ ] **Zod validation** on every API route input.
- [ ] **GDPR**: account deletion + data export endpoints; cookie consent.
- [ ] **CSRF**: explicit token on any state-changing same-site form posts (Supabase cookie auth + SameSite mitigates most).
- [ ] **Audit logging** for subscription/entitlement changes.
- [ ] Dependency scanning (`npm audit` in CI) + Dependabot.

## Reporting
Security issues → founder@virzyguns.com. Do not open public issues for vulnerabilities.
