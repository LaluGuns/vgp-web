---
name: founder-daily-brief
description: Build the VGP founder's daily operating brief from live Founder OS pipeline, approval, provider-health, analytics, SEO, data-gap, and audit evidence. Use when the user asks for a morning brief, daily priorities, what needs attention, current blockers, or the safest next actions.
---

# Founder Daily Brief

1. Call `founder_get_brief`, `founder_get_provider_health`, and
   `founder_list_approvals`. Read permitted analytics only when they materially
   affect priorities.
2. Label every claim with its source and observation time. Separate current
   facts, stale facts, missing data, and inference.
3. Rank a short list of actions by impact, urgency, confidence, and dependency.
4. Put founder decisions and blocked provider work in separate sections.
5. Report DRAFT, READY_FOR_APPROVAL, APPROVED, and execution outcomes exactly;
   never collapse them into "done."

Do not invent metrics, connection state, or completed work. Do not create a
draft or review request unless the user asks. Never approve, execute, send,
publish, upload, reply, DM, start OAuth, or disconnect a provider.
