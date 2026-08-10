# Codex Founder OS Bridge

The Founder OS Bridge is a private machine-to-machine surface for the
`vgp-founder-os` Codex plugin. It reuses the same PostgreSQL system of record and
approval lifecycle as the founder dashboard. It performs no inference and does
not require an OpenAI API key, a Responses API runtime, or a Cloudflare AI
runtime.

## Safety boundary

The bridge principal has exactly three scopes:

- `bridge:read`
- `bridge:draft`
- `bridge:request-review`

`request-review` can only move an exact content hash from `DRAFT` to
`READY_FOR_APPROVAL`. It requires an `Idempotency-Key`; an exact retry is
recorded as a replay and cannot advance the item further. Final approval and every external action remain on the
authenticated, same-origin founder dashboard surface. The bridge has no route
for final approval, email delivery, provider execution, posting, media upload,
social reply, direct message, OAuth, or disconnect.

Existing `/api/founder/os/gpt/actions/*` routes remain available for backward
compatibility and use their existing separate bearer secret.

## Production configuration

1. Apply `20260810093000_founder_os_codex_bridge.sql`, then
   `20260810100000_founder_os_operating_profile.sql`, after the existing
   Founder OS migrations.
2. Confirm `founder_internal.bridge_rate_limits` has RLS enabled and is not in a
   PostgREST-exposed schema.
3. Generate a unique bridge bearer value of at least 32 random characters and
   set it only as the Vercel Production environment variable
   `FOUNDER_OS_BRIDGE_SECRET`.
4. Keep `FOUNDER_OS_ENABLE_DATABASE=false` until every Founder OS migration has
   been applied and verified. The bridge fails closed while this flag is false.
5. Store the same bearer value in the local Codex plugin environment or secret
   store. Never put it in plugin files, `.mcp.json`, repository files, browser
   JavaScript, logs, screenshots, or task prompts.

The bridge uses a PostgreSQL fixed-window limiter: 60 read requests, 12 DRAFT
mutations, and 12 request-review mutations per principal per minute. If the
safety ledger cannot be reached, the request returns `503` before the operation.

Provider health currently performs live database-backed status reads for Meta
and TikTok only. Google Search Console, PostHog, and Vercel are returned as
explicit `not-implemented`/unknown-readiness records; callers must not present
them as configured or connected. Owned-analytics reads are currently limited to
Meta and TikTok.

## Audit behavior

Every authenticated request first records principal, operation, method, scope,
request ID, and rate-limit count in the append-only Founder OS audit log. It
explicitly records that request bodies and authorization values were not logged.
DRAFT, prospect, and review-request mutations also write their entity audit row
inside the same transaction as the mutation.

The bridge audit API omits `before_state` and `after_state` and recursively
redacts sensitive metadata keys and credential-like values. It returns a numeric
`nextCursor`; pass that value as `beforeId` to fetch the next page.

## Local checks

```powershell
node --experimental-strip-types scripts/tests/founder-os-bridge.test.mts
node --experimental-strip-types scripts/tests/custom-gpt-actions.test.mts
npx.cmd tsc --noEmit --pretty false
```

The OpenAPI contract is `docs/founder-os/bridge.openapi.yaml`. Configure the
plugin against the production base URL only after authenticated read-only smoke
tests succeed. A DRAFT smoke test is safe only when it remains `DRAFT`; do not
use an external-action route during bridge verification.
