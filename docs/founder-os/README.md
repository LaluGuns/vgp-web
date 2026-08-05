# VGP Founder OS

Founder OS is the private control plane for a solo founder and a bounded AI
workforce. It organizes evidence, scores source-backed prospects, prepares
drafts, exposes owned Meta/TikTok analytics, and moves exact revisions through
an audited approval lifecycle. Approved email and provider publish actions have
a separate explicit execution click. Social replies remain restricted to
verified inbound events, and no action can spend money.

## Runtime boundaries

- Next.js and PostgreSQL are the system of record.
- `founder_internal` is the private database schema for prospects, settings,
  evidence, approvals, audit events, and the external-action outbox.
- `cloudflare/vgp-founder-agent` is a separate analysis and drafting execution
  plane. It never stores provider credentials or calls provider write APIs.
- `flowstate/`, CADENZ data, `cadenz-audio-delivery`, and
  `flowstate-audio-delivery` are outside this feature boundary.
- Campaign and daily-report email routes now quarantine ambiguous SMTP outcomes
  as `unknown`; they require the additive V5 migration before deployment.

## Founder routes

- `/founder/os` — operational dashboard.
- `GET /api/founder/os` — canonical snapshot for the authenticated founder.
- `GET|POST /api/founder/os/bootstrap` — bootstrap status and explicit,
  idempotent demo initialization.
- `PUT /api/founder/os/settings` — founder settings with same-origin and
  session checks.
- `POST /api/founder/os/approvals/:id/transition` — controlled draft,
  ready-for-approval, and approval transitions. This endpoint does not execute
  the external action.
- `POST /api/founder/os/email/actions/execute` sends only the exact approved
  email payload after SMTP, suppression, permission, hash, and outbox checks.
- `POST /api/founder/os/providers/:provider/actions/execute` executes the exact
  approved Meta/TikTok provider payload. A generic queue item cannot manufacture
  an inbound reply claim.
- `/api/founder/os/gpt/actions/*` is the private ChatGPT Plus Action surface for
  a sanitized brief, verified catalog search, source-backed prospect handoff,
  and `DRAFT` creation only.

The page defaults to an explicit local demo snapshot. After applying the
migration, set `FOUNDER_OS_ENABLE_DATABASE=true` to load the private database
snapshot, persist editable settings, and enable exact-revision approval
transitions. Integration status remains server-managed.

## Safety invariants

- Every external action requires founder approval of the exact content hash.
- Editing the payload after approval invalidates that approval.
- The lifecycle is
  `DRAFT -> READY_FOR_APPROVAL -> APPROVED -> EXECUTING -> SUCCEEDED|FAILED|UNKNOWN`.
- `UNKNOWN` is never retried automatically when a provider may have accepted
  the request.
- Approval and execution are separate founder clicks. Neither the Custom GPT
  nor a Cloudflare scheduled agent can perform those clicks.
- Cold Instagram and TikTok DMs are disabled.
- Contact details may not be guessed. Every usable contact needs a permission
  state, source, and observation time.
- Meta and TikTok capabilities are `not-connected` until authorized scopes and
  test-account behavior are verified.
- Trend analysis may use owned analytics, official APIs, and founder-reviewed
  public evidence. Scraping is disabled, and no FYP outcome is promised.

## Licensing policy

`lib/licensing-registry.ts` is the canonical registry. Version
`owner-confirmed-main-c407209-2026-07-29` synchronizes the public
non-exclusive product summary from founder commit `c407209`:

- Basic MP3: $15, 2,000 copies, 5,000 streams, 1 music video
- Basic Pro Lease: $25, 5,000 copies, 200,000 streams, 1 music video
- Premium Lease: $50, 10,000 copies, 500,000 streams, 1 music video
- UNLIMITED Lease: $100, unlimited copies and streams, 2 music videos

Public display eligibility does not authorize automated promises. AI outreach
may quote only Basic MP3. Basic Pro, Premium, Unlimited, Exclusive, creator
sync, and game sync remain inquiry-only for agents until their complete written
terms and outreach policy are approved in a separate licensing session.

## Local verification

No command in this slice deploys or mutates the live database.

```powershell
node --test scripts\tests\custom-gpt-actions.test.mts scripts\tests\founder-email-execution.test.mts scripts\tests\founder-os-contracts.test.mts scripts\tests\lead-scout-engine.test.mts app\founder\os\live-view-model.test.mjs components\founder\os\LiveWorkspaceActivationModel.test.mjs components\founder\os\ProviderSetupModel.test.mjs lib\founder-os\core-security.test.mjs lib\founder-os\provider-storage\provider-storage.test.mjs lib\founder-os\providers\provider-connectors.test.mjs cloudflare\process-campaigns-cron\test\safety-contract.test.mjs
node node_modules\typescript\bin\tsc --noEmit --incremental false
npm.cmd run lint
npm.cmd run build
```

The Cloudflare package has its own install, typecheck, test, type-generation,
and dry-run commands documented in
`cloudflare/vgp-founder-agent/README.md`.

The difference between configured, authorized, and empirically verified Meta
and TikTok capabilities is documented in
`docs/founder-os/provider-capabilities.md`.

The ChatGPT Plus setup and importable Action schema are documented in
`docs/founder-os/custom-gpt-plus-setup.md` and
`docs/founder-os/custom-gpt-action.openapi.yaml`.
