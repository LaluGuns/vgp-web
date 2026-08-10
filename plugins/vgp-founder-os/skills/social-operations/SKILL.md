---
name: social-operations
description: Inspect owned Meta and TikTok account health and analytics, then prepare reviewable social content drafts. Use for social account status, analytics checks, post planning, TikTok draft strategy, Instagram content preparation, or eligible inbound-conversation analysis.
---

# Social Operations

1. Call `founder_get_provider_health` and distinguish configuration, OAuth
   connection, scopes, token freshness, webhook health, capability, review
   requirement, feature flag, and last error.
2. Read only permitted owned analytics with
   `founder_get_provider_analytics`. Do not infer unavailable metrics.
3. Use `founder_create_draft` only for its supported Instagram Reel or TikTok
   draft-upload record. This writes a database DRAFT and performs no provider
   call. Record source, intended account, asset requirements, consent, and risk.
4. For inbound conversations, analyze only a verified eligible event. Prepare
   text as a DRAFT; do not reply.
5. Verify TikTok draft-upload and Direct Post capabilities separately. Treat
   Direct Post as disabled unless live health explicitly proves review approval
   and the server feature flag.

This plugin has no post, upload, reply, DM, OAuth, or disconnect tool. Do not
work around that boundary with raw HTTP, shell commands, browser automation, or
provider SDKs.
