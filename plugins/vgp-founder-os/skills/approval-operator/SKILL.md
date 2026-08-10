---
name: approval-operator
description: Inspect Founder OS drafts and approval records, present exact evidence, diff, target, content hash, risk, and execution outcome, and request founder review without granting approval. Use when the user asks what is awaiting review, wants approval details, needs a draft staged for review, or needs an UNKNOWN result reconciled.
---

# Approval Operator

1. List records with `founder_list_approvals` and load the chosen exact revision
   with `founder_get_approval`.
2. Present only the returned sanitized fields: target, channel, payload summary,
   content hash, timestamps, current status, and recorded outcome. Do not claim
   the approval-detail endpoint supplies evidence, risk, payload, or a diff.
3. Never describe READY_FOR_APPROVAL as approved or APPROVED as executed.
4. Call `founder_request_review` only for a `DRAFT` with the exact current hash
   using its exact ID and hash. Confirm the response did not advance to APPROVED.
5. For `UNKNOWN`, use `founder_get_audit_log` and report manual reconciliation;
   never retry automatically.

The plugin intentionally exposes no approval or execution capability. Explicit
founder approval must occur in the authenticated dashboard. Do not bypass this
with raw HTTP, browser clicks, database writes, shell commands, or provider APIs.
