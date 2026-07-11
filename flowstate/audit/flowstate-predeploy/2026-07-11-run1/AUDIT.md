# Flowstate pre-deploy audit

## Verdict: No-Go

This audit used the current local source and localhost captures only. It did not call a production domain, log in to a user account, create a checkout, change a dashboard, or use credentials. Code, assets, and deployment configuration were not modified. The P0 blockers below must be resolved before a deployment candidate is created. Payment, R2, Supabase, and Lemon Squeezy Test Mode still need a public preview or temporary HTTPS test endpoint after the source fixes land.

## Evidence-backed release blockers

| ID | Severity | Finding | Release condition |
| --- | --- | --- | --- |
| FS-01 | P0 | Landing preview buttons create raw `/tracks/*.mp3` audio URLs, while `.vercelignore` removes those files from a Vercel artifact. Keeping the files makes raw delivery bypass signed audio; omitting them makes the three previews fail. | Replace the preview path with an intentional, protected preview mechanism. Inspect the Vercel manifest, verify raw audio returns 404, and play all three previews through the intended path. |
| FS-02 | P0 | Premium is force-unlocked by the app promo flag and `worker/wrangler.toml` sets `PREMIUM_PROMO = "1"`. | Disable both flags together. A fresh anonymous user must receive `premium required`; an entitled Test Mode user must receive a short-lived stream URL. |
| FS-03 | P0 | Yearly price has two contracts: checkout/UI/legal use $59.99 ($29.99 with `FLOWBRO`), while the Lemon Squeezy launch/setup documents say $99. | Choose one price and promo policy, update every surface, then retain one Test Mode checkout, receipt, webhook, and entitlement result. |
| FS-04 | P0 | The local webhook secret does not meet the project's own 32+ character launch requirement. The runbook also calls for rotation. | Rotate the Lemon Squeezy Test Mode and deployment secrets, then preserve only redacted valid/invalid webhook status evidence. |
| FS-05 | P1 | Eight non-English locales each miss 24 current translation keys and retain eight stale keys. Missing calls fall back to English. | Match all eleven dictionary shapes and add a key/placeholder parity check. |
| FS-06 | P1 | Legal link rendering splits translated text on English literals such as `See`, `contact`, and `Refund and Cancellation`. Non-English content can duplicate English text or lose the refund link. | Represent legal links as translated structured fields, then validate all locales. |
| FS-07 | P1 | Offline session outbox entries have no owner ID and can be persisted under the next account on a shared browser. | Bind entries to user ID and reject or isolate mismatches; test offline account A, sign-out, account B, reconnect. |
| FS-08 | P1 | Worker treats every ambient sound as free while the UI labels five as Pro; the current catalog marks every track free. | Establish one canonical premium map used by catalog, Worker, and UI, then test Free and Pro accounts. |
| FS-09 | P1 | Unknown Lemon Squeezy subscription statuses fall through to `active`. | Explicitly map subscribed statuses and fail closed on unknown values; replay paused, cancelled, expired, and active Test Mode events. |
| FS-10 | P1 | There is no automated test suite or CI. The present lint command is deprecated. | Add a supported lint/type/build/test release gate before launch. |
| FS-11 | P1 | Raw audio is excluded only when the Vercel project root is exactly `flowstate` and honors its `.vercelignore`. | Verify the final Vercel manifest and R2 private-bucket setting before publish. |

## Local flow capture

| Step | Evidence | Health |
| --- | --- | --- |
| 1. Landing, desktop | `experience/01-landing-desktop.png` | Loads with a coherent visual system. Hero copy and subtitle are readable; small navigation and support copy need contrast measurement. |
| 2. Pricing, desktop | `experience/02-pricing-desktop.png` | Renders. Price disclosure is blocked by FS-03. The `FLOWBRO` field is a valid pricing/disclosure review item, not evidence of the premium force-unlock flag. |
| 3. Login and keyboard focus | `experience/03-login-desktop.png`, `04-login-keyboard-focus-desktop.png` | Renders; focus is visible on the back link. Authentication itself was not attempted. |
| 4. Terms | `experience/05-terms-desktop.png` | Renders. Legal localization has the FS-06 structural defect. Small muted body copy needs a formal contrast check. |
| 5. App entry | `experience/06-app-entry-desktop.png` | Renders the guided-tour entry state. Private persistence, audio, and entitlement behavior remain unverified without a disposable account. |
| 6. Not-found state | `experience/07-not-found-desktop.png` | Healthy, focused recovery CTA. |
| 7. Landing, 390px mobile | `experience/09-landing-mobile-390x844.png` | Core CTA and language selector remain visible. The header CTA wraps to three lines but remains usable. |

`experience/08-landing-mobile-390x844.png` was rejected because the capture is cropped to an invalid narrow viewport. It is not audit evidence.

## Secondary findings

- P2: `P` can present the player as playing when no track is selected. Audio-signing/loading errors have no user retry surface, and restored ambient playback needs Safari/iOS autoplay testing.
- P2: rate limiting is per instance; `SECURITY.md` says webhooks are rate-limited but the route does not enforce it; CSP retains `unsafe-inline`.
- P2: `npm audit --omit=dev` reports two moderate PostCSS advisories. Do not use the proposed force-fix path.
- P2: Landing copy broadly follows `docs/VOICE.md`, but significant visible text bypasses the translation system. A Humanizer review is in `localization-copy.md`; it found the primary problem is inconsistent language delivery, not generic AI prose.

## Local checks

- `npx.cmd tsc --noEmit`: pass.
- `npm.cmd run lint`: pass, but the `next lint` command is deprecated.
- `npm.cmd run build`: pass in 242.4 seconds; 18 static pages generated.
- Dependency audit: no high or critical vulnerability reported; two moderate PostCSS advisories remain.
- No tests or CI workflow exist.

## Evidence limits and next proof

The following cannot be proven from localhost alone: Supabase migration state and OAuth redirects, the real Vercel artifact and headers, R2 privacy/Worker secrets/CORS/expiry, and Lemon Squeezy checkout/webhook/entitlement behavior. After the source P0 fixes, use a preview or temporary HTTPS endpoint plus a disposable account and Lemon Squeezy Test Mode to complete that matrix.

## Detailed reports

- `product-audio/product-audio-audit.md`
- `release-security/REPORT.md`
- `localization-copy.md`
