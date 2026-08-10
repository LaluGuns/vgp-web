---
name: provider-health
description: Diagnose Founder OS connector readiness by checking configured, connected, authorized, scopes, token freshness, webhook validation, capabilities, feature flags, last verification, and last error separately. Use for Meta, TikTok, GSC, PostHog, Vercel, or general provider readiness questions.
---

# Provider Health

1. Call `founder_get_provider_health`, which returns all current bridge
   adapters. Filter the response locally for the requested provider.
2. Report these fields separately: configured credentials, OAuth connection,
   authorized account, granted scopes, token presence/freshness, webhook state,
   enabled capability, last verified time, last error, and required manual work.
3. Classify the result as `not-configured`, `configured`, `connected-limited`,
   `connected`, `review-required`, `expired`, `error`, or `unknown` based only on
   returned evidence.
4. Use Meta or TikTok analytics as an empirical read check only when useful.
   GSC, PostHog, and Vercel currently have no analytics tool. A successful
   analytics call does not prove write capability.
5. Give one precise recovery step for each failed layer.

A developer app is not readiness. Preserve existing provider apps and sessions.
Never request a fresh login before session recovery is attempted. Never start
OAuth, change legal URLs, save provider settings, submit review, or disconnect
through this skill.
