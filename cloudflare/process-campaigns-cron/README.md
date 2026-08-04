# VGP — Process Campaigns Cron

This Cloudflare Worker drives the email queue every 10 minutes. It replaces a
Vercel cron schedule that is not available on the Hobby plan.

## Required deployment order

Before deploying this Worker or the matching Next.js route, apply
`scripts/migrate-v5-recipient-delivery-unknown.js` through the normal,
reviewed database migration process. The migration adds the `unknown`
recipient-delivery state used to quarantine ambiguous SMTP outcomes.
The same additive migration also protects the daily founder report from
automatic retry after an ambiguous SMTP attempt.

This system does not claim SMTP exactly-once delivery. An `unknown` row means
SMTP was invoked but the application could not prove whether delivery was
accepted. Those rows are never retried automatically. Reconcile them with the
SMTP provider and retry manually only after confirming that no delivery was
accepted.

## One-time Cloudflare setup

```bash
cd cloudflare/process-campaigns-cron

# Log in (opens a browser).
npx wrangler login

# Deploy the Worker and its 10-minute cron trigger.
npx wrangler deploy

# Paste the same CRON_SECRET value used by the Next.js deployment.
npx wrangler secret put CRON_SECRET
```

Cloudflare sends an authenticated `POST` to
`/api/cron/process-campaigns` every 10 minutes.

## Verify

```bash
# Watch structured live logs for campaign_processor_ok.
npx wrangler tail

# Public health check. This never processes a campaign.
curl https://vgp-process-campaigns-cron.<your-subdomain>.workers.dev/health
```

## Notes

- `PROCESS_URL` in `wrangler.toml` must be the live custom domain, not a
  protected preview URL.
- Public HTTP requests cannot start the processor. Only the Cloudflare
  `scheduled` handler calls the actionful endpoint.
- Logs contain request IDs, status codes, and timing only. Response bodies,
  recipient data, credentials, and secrets are not logged.
- The daily report cron remains on Vercel because its once-daily schedule is
  supported there.
