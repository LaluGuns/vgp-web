import type {
  ProposalRequest,
  SpecialistRecommendation,
  SpecialistRole,
} from "./contracts";

const ROLE_GUIDANCE: Record<
  SpecialistRole,
  Omit<SpecialistRecommendation, "role">
> = {
  "growth-intelligence": {
    title: "Evidence-backed growth hypothesis",
    rationale:
      "Compare owned performance against the account baseline and identify one measurable experiment.",
    evidenceRequired: ["owned performance metrics", "date range", "content or campaign baseline"],
    nextSafeStep: "Prepare an experiment card; do not claim FYP or conversion certainty.",
  },
  "content-strategist": {
    title: "Bounded content direction",
    rationale:
      "Translate the objective and supplied evidence into a small set of testable content directions.",
    evidenceRequired: ["audience", "channel constraints", "approved brand voice"],
    nextSafeStep: "Create a reviewable outline without publishing it.",
  },
  "community-manager": {
    title: "Inbound triage proposal",
    rationale:
      "Classify eligible inbound conversations and separate sensitive categories for founder handling.",
    evidenceRequired: ["inbound message", "provider capability", "reply eligibility"],
    nextSafeStep: "Draft a reply only; never initiate a cold DM or send automatically.",
  },
  "email-campaign-manager": {
    title: "Email campaign draft plan",
    rationale:
      "Propose a segment, message structure, and delivery checks without claiming or executing a send.",
    evidenceRequired: ["recipient eligibility", "suppression status", "approved offer"],
    nextSafeStep: "Render a test-recipient preview and request a separate approval.",
  },
  "product-analyst": {
    title: "Product evidence summary",
    rationale:
      "Turn supplied product telemetry into a scoped observation with explicit missing data.",
    evidenceRequired: ["metric definition", "freshness", "source coverage"],
    nextSafeStep: "Publish an internal analysis card only.",
  },
  "creative-producer": {
    title: "Creative brief proposal",
    rationale:
      "Convert the objective into a production brief while retaining source and rights constraints.",
    evidenceRequired: ["asset ownership", "format", "channel specification"],
    nextSafeStep: "Create an asset checklist; do not export or upload media.",
  },
  "lead-scout": {
    title: "Prospect qualification proposal",
    rationale:
      "Score only source-grounded public business prospects and keep identity confidence separate from fit.",
    evidenceRequired: ["public business source", "recent activity", "beat or use-case fit"],
    nextSafeStep: "Create a qualified shortlist without guessing contact details.",
  },
  "sales-concierge": {
    title: "Beat offer and outreach outline",
    rationale:
      "Match the prospect use case to an approved offer snapshot and draft a low-pressure sequence.",
    evidenceRequired: ["prospect evidence", "approved license terms", "public business contact path"],
    nextSafeStep: "Prepare the first outreach draft; never send or auto-follow-up.",
  },
};

export function selectSpecialists(input: ProposalRequest): SpecialistRole[] {
  if (input.requestedRoles.length > 0) {
    return [...new Set(input.requestedRoles)].slice(0, 3);
  }

  const haystack = `${input.objective} ${input.audience ?? ""}`.toLowerCase();
  const selected: SpecialistRole[] = [];
  if (/(rapper|artist|developer|creator|prospect|lead|buyer)/.test(haystack)) {
    selected.push("lead-scout");
  }
  if (/(beat|license|outreach|sale|offer)/.test(haystack)) {
    selected.push("sales-concierge");
  }
  if (/(email|campaign|subscriber)/.test(haystack)) {
    selected.push("email-campaign-manager");
  }
  if (/(post|content|caption|video|tiktok|instagram)/.test(haystack)) {
    selected.push("content-strategist");
  }
  if (/(metric|growth|fyp|reach|conversion|seo)/.test(haystack)) {
    selected.push("growth-intelligence");
  }

  return [...new Set(selected)].slice(0, 3).length > 0
    ? [...new Set(selected)].slice(0, 3)
    : ["product-analyst"];
}

export function buildRecommendations(
  roles: SpecialistRole[],
): SpecialistRecommendation[] {
  return roles.map((role) => ({
    role,
    ...ROLE_GUIDANCE[role],
  }));
}
