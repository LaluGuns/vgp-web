# Founder OS deployment runbook

This runbook deliberately separates local validation, database provisioning,
Vercel deployment, Cloudflare deployment, and provider approval. None of those
states implies the others.

## 1. Founder-only secrets

Generate unique values; never reuse a passcode or SMTP password:

- `FOUNDER_OS_GPT_ACTION_SECRET`: at least 32 random bytes.
- `FOUNDER_OS_TOKEN_ENCRYPTION_KEY`: `hex:` plus 64 random hex characters.
- `META_WEBHOOK_VERIFY_TOKEN`: at least 32 random bytes.
- `INTERNAL_HMAC_SECRET`: at least 32 random bytes and identical on the Vercel
  internal caller and the Cloudflare agent Worker.

Set all values from `.env.example` in Vercel Production. Keep
`FOUNDER_OS_ENABLE_DATABASE=false` until both SQL migrations have been applied
and verified.

## 2. Supabase

Apply these migrations in filename order:

1. `20260729074605_founder_os_core.sql`
2. `20260729095858_founder_os_provider_storage.sql`

Then verify:

- `founder_internal` is not exposed through the Data API.
- RLS is enabled on every Founder OS table.
- `anon` and `authenticated` have no schema/table/function privileges.
- Database advisors return no unresolved security findings.
- `founder_internal.settings`, `provider_connections`, `provider_jobs`, and
  `provider_inbound_events` exist.

Only then set `FOUNDER_OS_ENABLE_DATABASE=true`.

## 3. Vercel

The correct project is `vgp-web`, root directory `.`. Build a Preview first,
authenticate at `/founder`, test `/founder/os`, and inspect function logs before
promoting the exact validated artifact.

Required runtime groups:

- Core: `DATABASE_URL`, `JWT_SECRET`, `FOUNDER_PASSCODE`, `APP_URL`.
- Founder OS: `FOUNDER_OS_ENABLE_DATABASE`,
  `FOUNDER_OS_GPT_ACTION_SECRET`, `FOUNDER_OS_TOKEN_ENCRYPTION_KEY`,
  `FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION`,
  `FOUNDER_OS_PROVIDER_STALE_EXECUTION_SECONDS`,
  `FOUNDER_OS_EMAIL_STALE_EXECUTION_SECONDS`.
- Mail: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CRON_SECRET`.
- Meta/TikTok: all provider variables listed in `.env.example`.

## 4. Cloudflare

Authenticate the local CLI:

```powershell
npx.cmd wrangler login
```

From `cloudflare/vgp-founder-agent`, configure `INTERNAL_HMAC_SECRET` with
`wrangler secret put`, deploy staging, verify signed health/proposal requests,
then deploy production. The agent is dry-run only: it proposes work but cannot
send or publish.

From `cloudflare/process-campaigns-cron`, set `CRON_SECRET`, deploy staging, and
verify the scheduled authenticated POST before production.

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

## 7. ChatGPT Plus

Follow `custom-gpt-plus-setup.md`. Keep the GPT private. The Action secret is a
Bearer key. Test the sanitized brief first, then create one demo draft and
confirm that it appears as `DRAFT` in Founder OS.

The Plus subscription supplies the interactive Custom GPT conversation and Web
Search. It does not supply OpenAI API credits and is not used by a background
worker. Custom GPT Actions call these Founder OS HTTPS endpoints; they still
cannot approve or execute.

## 8. Release gates

Before promotion, all of these must be independently true:

1. Run `node scripts/migrate-v5-recipient-delivery-unknown.js` once against the
   intended database, then confirm campaign and daily-report logs contain
   `smtp_attempted_at`.
2. Run the full test, typecheck, lint, and production build commands from
   `docs/founder-os/README.md`.
3. Deploy a Vercel Preview and test authenticated access, live workspace
   activation, settings persistence, provider OAuth return paths, analytics
   error/empty states, exact approval transitions, and detail drawers.
4. Use test recipients/accounts for one approved SMTP send, one Meta container,
   a separate Meta publish approval, and one TikTok Upload-to-Draft. Do not test
   cold social messages.
5. Reconcile every `UNKNOWN` action before any resend or repeat publication.
6. Promote the exact verified Preview artifact, then repeat read-only health and
   authentication checks on production.
