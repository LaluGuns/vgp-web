# VGP — Process Campaigns Cron (Cloudflare Worker)

Drives the email queue every 10 minutes. Replaces the Vercel cron that the
**Hobby plan rejects** (Hobby allows cron jobs only once per day, so the
`*/10 * * * *` schedule fails the deploy).

## One-time setup

```bash
cd cloudflare/process-campaigns-cron

# 1. Log in (opens browser)
npx wrangler login

# 2. Deploy the Worker + its 10-minute cron trigger
npx wrangler deploy

# 3. Set the shared secret — paste the SAME value as CRON_SECRET on Vercel
npx wrangler secret put CRON_SECRET
```

That's it. Cloudflare now calls `/api/cron/process-campaigns` every 10 minutes.

## Verify

```bash
# Watch live logs (you should see "process-campaigns ok: ..." every 10 min)
npx wrangler tail

# Or trigger once manually:
curl https://vgp-process-campaigns-cron.<your-subdomain>.workers.dev
```

## Notes

- `PROCESS_URL` in `wrangler.toml` must be the **live custom domain**
  (`https://www.virzyguns.com/...`), not the `*.vercel.app` preview URL —
  otherwise Vercel deployment protection can block the request.
- The Worker authenticates with `Authorization: Bearer <CRON_SECRET>`, exactly
  what the route checks. No other access is granted.
- The daily report cron (`/api/cron/daily-report`) stays on Vercel — a
  once-a-day schedule is allowed on Hobby, so it does not need a Worker.
