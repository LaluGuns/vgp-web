---
name: outreach-drafts
description: Draft personalized, evidence-grounded VGP outreach for a qualified prospect without sending it. Use when the user asks for an outreach email, follow-up sequence, pitch, personalized introduction, beat recommendation, or review-ready prospect message.
---

# Outreach Drafts

1. Load the prospect with `founder_search_prospects` and verify evidence,
   recency, contact permission, and matched catalog items.
2. Personalize only from cited evidence. Keep uncertain observations out of the
   message or qualify them explicitly.
3. Match tone and offer to configured founder settings. Do not quote licensing
   claims not present in the verified catalog or approved policy.
4. Prefer one relevant, respectful message and a bounded follow-up sequence.
   Never generate a cold-DM blast.
5. Persist with `founder_create_draft` only. Confirm `DRAFT`, exact target,
   evidence IDs, and content hash before reporting success.
6. Use `founder_request_review` only to request founder review of that exact
   revision.

Never send email, DM, reply, or call a provider execution endpoint. Missing or
manual-only contact permission is a hard stop for automated outreach, not a
prompt to guess another address.
