# VGP Founder OS Codex plugin

This local plugin turns Codex into an approval-gated operator for the private
VGP Founder OS. It can read sanitized operational data, save evidence-backed
prospect candidates, create internal drafts, and request founder review.

It deliberately has no tool for approving, executing, sending, publishing,
uploading, replying, direct messaging, OAuth, disconnecting providers, or
changing production settings.

## Runtime configuration

The stdio MCP process reads two inherited environment variables:

- `FOUNDER_OS_BASE_URL` (optional, defaults to `https://www.virzyguns.com`)
- `FOUNDER_OS_BRIDGE_SECRET` (required, at least 32 characters)

Never place either a production secret or an environment-file path in this
plugin. The server sends the secret only as the HTTPS bridge Bearer token and
never writes it to stdout, stderr, tool results, or request logs.

Plain HTTP is accepted only for `localhost`, `127.0.0.1`, and `::1` so the
bridge can be tested locally without weakening production transport.

## Bridge contract

The client calls only these versioned routes:

- `GET /api/founder/os/bridge/v1/brief`
- `GET /api/founder/os/bridge/v1/catalog`
- `GET|POST /api/founder/os/bridge/v1/prospects`
- `POST /api/founder/os/bridge/v1/drafts`
- `GET /api/founder/os/bridge/v1/approvals`
- `GET /api/founder/os/bridge/v1/approvals/{id}`
- `POST /api/founder/os/bridge/v1/approvals/{id}/request-review`
- `GET /api/founder/os/bridge/v1/providers`
- `GET /api/founder/os/bridge/v1/providers/{meta|tiktok}/analytics`
- `GET /api/founder/os/bridge/v1/audit`

Audit pagination uses `beforeId`. Provider analytics currently supports only
Meta and TikTok. The provider-health response may include other adapters, but
their explicit `not-implemented` or unknown states are not proof of readiness.

## Local checks

Run from the plugin directory:

```powershell
node --test scripts\bridge-client.test.mjs scripts\tool-registry.test.mjs
node scripts\smoke-mcp.mjs
```

Skill and plugin validation use the official Codex `quick_validate.py` and
`validate_plugin.py` helpers. Marketplace creation and installation are a
separate operator step.
