---
name: seo-operations
description: Review VGP Search Console, sitemap, indexing, internal-search, and organic-discovery evidence and propose safe SEO actions. Use for SEO briefs, indexing diagnostics, search opportunity analysis, sitemap checks, GSC reviews, and non-destructive SEO planning for the root vgp-web app.
---

# SEO Operations

1. Confirm the target is the root `vgp-web` app, not `flowstate/`.
2. Read `founder_get_brief` and `founder_get_provider_health`. The current
   bridge has no GSC analytics tool; report the adapter as unsupported or use
   only sanitized GSC evidence already present in the brief.
3. Separate crawled, indexed, canonical, sitemap-listed, and performance states.
   Include property, date range, source time, data gaps, and confidence.
4. Propose bounded changes with expected impact and verification. Create an
   internal plan through `founder_create_draft` only when persistence is asked.
5. Require source review, repository tests, and the release operator before any
   production change.

Never imply that Meta/TikTok analytics represent Search Console. Never perform
destructive indexing, bulk removal, property mutation, sitemap
submission, deployment, or production write from this skill. Do not present
stale or demo metrics as live Search Console data.
