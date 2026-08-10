---
name: content-intelligence
description: Analyze permitted owned Meta and TikTok analytics for evidence-backed content patterns, hooks, formats, duration, audience response, and distribution opportunities. Use for content-performance reviews, trend analysis, postmortems, channel comparisons, and questions about what content to make next.
---

# Content Intelligence

1. Call `founder_get_provider_health` before reading analytics. Treat
   configured, connected, authorized, scoped, fresh, and healthy as separate
   states.
2. Call `founder_get_provider_analytics` only for Meta or TikTok and only when
   allowed by the workflow. The current bridge does not expose GSC or PostHog
   analytics. Use owned data and official-provider data, not aggressive scraping.
3. Compare like-for-like records and state the sample size, time window, source,
   missing fields, and confidence.
4. Extract repeatable observations about hook, format, duration, audience,
   retention, and distribution. Clearly mark hypotheses that need a test.
5. Hand recommendations to `content-planner`; do not silently create content.

Never promise FYP, virality, reach, or revenue. Never infer a zero metric from
missing data. Never expose private messages or credentials. This skill is
read-only and has no external-action authority.
