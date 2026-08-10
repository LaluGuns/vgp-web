# Founder OS deployment runbook

This runbook deliberately separates local validation, database provisioning,
Vercel deployment, Cloudflare deployment, and provider approval. None of those
states implies the others.

## 1. Founder-only secrets

Generate unique values; never reuse a passcode or SMTP password:

- `FOUNDER_OS_GPT_ACTION_SECRET`: at least 32 random bytes.
- `FOUNDER_OS_BRIDGE_SECRET`: at least 32 random characters and unique to the
  Codex plugin bridge.
- `FOUNDER_OS_TOKEN_ENCRYPTION_KEY`: `hex:` plus 64 random hex characters.
- `META_WEBHOOK_VERIFY_TOKEN`: at least 32 random bytes.
- `INTERNAL_HMAC_SECRET` is historical and needed only if explicitly operating
  the retired Cloudflare dry-run prototype. It is not a current production
  Founder OS requirement.

Set all values from `.env.example` in Vercel Production. Keep
`FOUNDER_OS_ENABLE_DATABASE=false` until all Founder OS migrations have been applied
and verified.

## 2. Supabase

Apply these migrations in filename order:

1. `20260729074605_founder_os_core.sql`
2. `20260729095858_founder_os_provider_storage.sql`
3. `20260810093000_founder_os_codex_bridge.sql`
4. `20260810100000_founder_os_operating_profile.sql`

Then verify:

- `founder_internal` is not exposed through the Data API.
- RLS is enabled on every Founder OS table.
- `anon` and `authenticated` have no schema/table/function privileges.
- Database advisors return no unresolved security findings.
- `founder_internal.settings`, `provider_connections`, `provider_jobs`, and
  `provider_inbound_events` exist.
- `founder_internal.bridge_rate_limits` exists, has RLS enabled, and stores no
  bearer value or request body.
- `founder_internal.settings.operating_profile` exists and validates the
  persisted Codex skill, targeting, cadence, notification, and safety defaults.

Only then set `FOUNDER_OS_ENABLE_DATABASE=true`.

## 3. Vercel

The correct project is `vgp-web`, root directory `.`. `main` is the only source
of truth. Push the intended current-main-based branch before deployment, run all
gates, then deploy a production rebuild from a clean detached worktree. Never
promote a Preview: Preview environment values are not production values.

Required runtime groups:

- Core: `DATABASE_URL`, `JWT_SECRET`, `FOUNDER_PASSCODE`, `APP_URL`.
- Founder OS: `FOUNDER_OS_ENABLE_DATABASE`,
  `FOUNDER_OS_BRIDGE_SECRET`, `FOUNDER_OS_TOKEN_ENCRYPTION_KEY`,
  `FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION`,
  `FOUNDER_OS_PROVIDER_STALE_EXECUTION_SECONDS`,
  `FOUNDER_OS_EMAIL_STALE_EXECUTION_SECONDS`.
- Legacy Custom GPT only: `FOUNDER_OS_GPT_ACTION_SECRET`.
- Mail: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CRON_SECRET`.
- Meta/TikTok: all provider variables listed in `.env.example`.

## 4. Codex plugin and Bridge

Install and validate the `vgp-founder-os` plugin, keep the bridge bearer in the
local Codex secret environment, and smoke-test the authenticated read-only brief
before creating one idempotent DRAFT. The plugin is interactive; no paid
background AI loop is required.

The historical `cloudflare/vgp-founder-agent` mock worker is not a current
runtime requirement and must not be deployed as an inference plane. The
separate `cloudflare/process-campaigns-cron` remains a non-AI legacy campaign
trigger and is outside the Codex bridge.

## 5. Meta

- Create/configure a Meta app with Instagram API access.
- Connect an Instagram Professional account.
- Register the exact Meta redirect URI from `.env.example`.
- Configure the webhook URL:
  `https://www.virzyguns.com/api/founder/os/providers/meta/webhook`.
- Enter the same `META_WEBHOOK_VERIFY_TOKEN` in Meta and Vercel.
- Request only the scopes shown by the Settings capability panel.
- Complete Meta app review before expecting non-tester accounts to work.

Cold Instagram DMs are not supported. Replies require a verified inbound event
inside its reply window and a separately approved exact payload.

## 6. TikTok

- Create/configure a TikTok developer app with Login Kit and Content Posting.
- Register the exact TikTok redirect URI from `.env.example`.
- Request the required user/video scopes and complete app review.
- Start with TikTok draft upload. The founder completes the final post in
  TikTok.
- Leave `TIKTOK_DIRECT_POST_ENABLED=false` until TikTok approves the Direct Post
  audit and the consent UX has been reviewed again.

TikTok direct messages are not supported.

## 7. Legacy ChatGPT Plus compatibility

Follow `custom-gpt-plus-setup.md`. Keep the GPT private. The Action secret is a
Bearer key. Test the sanitized brief first, then create one demo draft and
confirm that it appears as `DRAFT` in Founder OS.

The Plus subscription supplies the interactive Custom GPT conversation and Web
Search. It does not supply OpenAI API credits and is not used by a background
worker. Custom GPT Actions call these Founder OS HTTPS endpoints; they still
cannot approve or execute.

## 8. Release gates

Before a production rebuild, all of these must be independently true:

1. Run `node scripts/migrate-v5-recipient-delivery-unknown.js` once against the
   intended database, then confirm campaign and daily-report logs contain
   `smtp_attempted_at`.
2. Run the full test, typecheck, lint, and production build commands from
   `docs/founder-os/README.md`.
3. In a non-production validation environment, test authenticated access, live
   workspace activation, settings persistence, provider OAuth return paths,
   analytics error/empty states, exact approval transitions, and detail drawers.
4. Verify the Codex Bridge read-only surface and one idempotent DRAFT. Do not
   send email, post, upload, reply, or DM as a release smoke test. Provider
   acceptance tests require a separate explicit founder authorization.
5. Reconcile every `UNKNOWN` action before any resend or repeat publication.
6. Confirm the release branch is pushed and current with `origin/main`; deploy
   with `vercel deploy --prod` from a clean detached worktree, never with
   `vercel promote`. Then repeat read-only health and authentication checks on
   production.
