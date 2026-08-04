# VGP Founder Agent

Separate Cloudflare Agents SDK Worker for internal Founder OS proposal generation.

This package is intentionally **mock/dry-run only**:

- No email sending.
- No social posting or messaging.
- No provider OAuth credentials.
- No public Agent route.
- No deployment was performed as part of this implementation.

## Architecture

- `ChiefOfStaff` is an Agents SDK `Agent` with durable state.
- Specialist roles produce typed, deterministic proposal guidance.
- Agent state stores only bounded run summaries, IDs, counts, specialist roles,
  and policy hashes. It does not store objectives, draft bodies, evidence text,
  contacts, tokens, or secrets.
- `ReplayNonceGuard` is a sharded SQLite Durable Object. The shard is derived
  from key ID and a SHA-256 prefix of the nonce, so a repeated nonce routes to
  the same strongly consistent object without exposing client-controlled shard
  selection or creating one global bottleneck.
- Workflows are not included in V1 because both endpoints are bounded,
  synchronous, and side-effect free. Add Workflows only when a future,
  approved design introduces durable multi-step jobs.

## Signed internal API

Every endpoint requires HMAC authentication.

### `GET /internal/v1/health`

Returns non-sensitive service mode and environment information.

### `POST /internal/v1/proposals`

Accepts a strict, bounded proposal request. It returns analysis guidance or a
draft outline. The response always contains:

```json
{
  "mode": "mock-dry-run",
  "safety": {
    "dryRun": true,
    "externalActionsAllowed": false,
    "credentialsPersisted": false,
    "humanApprovalStillRequired": true
  }
}
```

Requests that resemble API keys, access tokens, passwords, bearer tokens, or
private keys are rejected before Agent state is updated.

## HMAC contract

Required headers:

- `x-vgp-key-id`
- `x-vgp-timestamp` — ten-digit Unix seconds
- `x-vgp-nonce` — 16–128 URL-safe characters
- `x-vgp-signature` — lowercase/uppercase SHA-256 HMAC hex

Canonical input:

```text
METHOD
/exact/path/without/query
SHA256_HEX(raw_body)
UNIX_TIMESTAMP
NONCE
KEY_ID
```

The acceptance window is plus/minus five minutes. A successfully authenticated
nonce is claimed in durable SQLite storage and cannot be reused.

The signer must hash the exact body bytes it sends. Query strings are not part
of V1 endpoints and must not carry authorization data.

## Configuration and secrets

`wrangler.jsonc` defines separate development, staging, and production Worker
names and Durable Object bindings. Non-secret settings live in `vars`.

`INTERNAL_HMAC_SECRET` must be configured as a Wrangler secret separately in
each environment. It must never be placed in `wrangler.jsonc`, `.dev.vars`
committed to Git, Agent state, request logs, or proposal evidence.

Future operator commands, only after deployment is separately approved:

```powershell
npx.cmd wrangler secret put INTERNAL_HMAC_SECRET --env staging
npx.cmd wrangler secret put INTERNAL_HMAC_SECRET --env production
```

Use different high-entropy secrets and key IDs per environment. Rotate by
adding a versioned key ID and a deliberately time-bounded previous-key
verification path; V1 intentionally accepts exactly one configured key.

## Basic MP3 license policy

The owner-confirmed canonical terms are versioned in
`src/license-policy.ts`:

- USD 15.00
- Music Recording
- Up to 2,000 copies
- Up to 5,000 online audio streams
- One music video

The canonical JSON is SHA-256 hashed into every relevant proposal. Any future
approval layer must invalidate approval when this hash changes. A change to
terms requires a new version and new source URI; never silently modify V1.

Pinned V1 SHA-256:

```text
71db881070de49a793e05b62a93e83b8f3fa1bd040063e720070082112b98e33
```

## Local verification

Install dependencies only inside this package:

```powershell
npm.cmd install
npm.cmd run types
npm.cmd run check
```

`npm run dry-run` invokes `wrangler deploy --dry-run` and creates only local
build artifacts. It does not deploy.

Runtime tests cover signed health, stale requests, body tampering, durable
replay rejection, no external action capability, credential rejection, safe
Agent state, and Basic MP3 source integrity.
