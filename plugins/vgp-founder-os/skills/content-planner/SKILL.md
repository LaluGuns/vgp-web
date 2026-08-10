---
name: content-planner
description: Plan evidence-backed VGP content ideas, hooks, captions, scripts, calls to action, calendars, and internal drafts. Use when the user asks for a content plan, posting calendar, campaign concept, caption, short-form script, creative brief, or draft based on Founder OS intelligence.
---

# Content Planner

1. Read `founder_get_brief` and relevant evidence. Search the verified catalog
   with `founder_search_catalog` when music selection matters.
2. State audience, objective, platform, evidence, confidence, cadence, and
   measurable hypothesis before writing.
3. Produce clear hooks, script beats, caption, CTA, asset requirements, and a
   proposed schedule. Avoid unsupported performance claims.
4. When persistence is requested, call `founder_create_draft` only for a
   server-supported email-outreach, Instagram Reel, or TikTok draft-upload
   record, with a stable idempotency key. Confirm the returned status is
   `DRAFT`. Keep unsupported generic plans in the response instead of forcing
   them into the wrong schema.
5. Call `founder_request_review` only when the workflow explicitly asks to put
   the exact content hash before the founder.

Creating a DRAFT is not posting. Requesting review is not approval. Never use
hidden fields or another endpoint to send, publish, upload, reply, DM, or
execute. TikTok Direct Post remains disabled until provider review and explicit
founder enablement are independently verified.
