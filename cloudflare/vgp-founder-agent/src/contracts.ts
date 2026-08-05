import { z } from "zod";

export const SpecialistRoleSchema = z.enum([
  "growth-intelligence",
  "content-strategist",
  "community-manager",
  "email-campaign-manager",
  "product-analyst",
  "creative-producer",
  "lead-scout",
  "sales-concierge",
]);

export type SpecialistRole = z.infer<typeof SpecialistRoleSchema>;

export const EvidenceSchema = z
  .object({
    sourceType: z.enum([
      "founder-input",
      "owned-account",
      "official-provider",
      "public-business-page",
      "internal-analytics",
    ]),
    sourceUrl: z.string().url().max(2_048).optional(),
    observedAt: z.string().datetime({ offset: true }),
    title: z.string().trim().min(1).max(160),
    summary: z.string().trim().min(1).max(1_000),
  })
  .strict();

export const ProposalRequestSchema = z
  .object({
    schemaVersion: z.literal("1"),
    runId: z.string().uuid(),
    scopeId: z
      .string()
      .trim()
      .min(3)
      .max(80)
      .regex(/^[a-zA-Z0-9:_-]+$/),
    taskType: z.enum(["analysis", "draft"]),
    objective: z.string().trim().min(3).max(2_000),
    audience: z.string().trim().min(1).max(300).optional(),
    requestedRoles: z.array(SpecialistRoleSchema).max(3).default([]),
    evidence: z.array(EvidenceSchema).max(20).default([]),
    constraints: z.array(z.string().trim().min(1).max(300)).max(10).default([]),
    includeBasicMp3Terms: z.boolean().default(false),
  })
  .strict();

export type ProposalRequest = z.infer<typeof ProposalRequestSchema>;

export interface SpecialistRecommendation {
  role: SpecialistRole;
  title: string;
  rationale: string;
  evidenceRequired: string[];
  nextSafeStep: string;
}

export interface DraftArtifact {
  format: "outline";
  title: string;
  blocks: Array<{
    label: string;
    text: string;
  }>;
  prohibitedExternalActions: true;
}

export interface LicenseTermSnapshot {
  offerId: "basic-mp3";
  version: "owner-confirmed-main-c407209-2026-07-29";
  sourceUri: "owner://vgp/beat-license/basic-mp3/2026-07-29";
  currency: "USD";
  price: 15;
  allowedUse: "Music Recording";
  copiesLimit: 2_000;
  onlineAudioStreamsLimit: 5_000;
  musicVideosLimit: 1;
  contentSha256: string;
}

export interface ProposalEnvelope {
  schemaVersion: "1";
  proposalId: string;
  runId: string;
  scopeId: string;
  taskType: "analysis" | "draft";
  mode: "mock-dry-run";
  createdAt: string;
  selectedSpecialists: SpecialistRole[];
  recommendations: SpecialistRecommendation[];
  draft?: DraftArtifact;
  evidenceSummary: {
    supplied: number;
    sourceTypes: string[];
    missingEvidence: boolean;
  };
  policyInputs: {
    basicMp3Terms?: LicenseTermSnapshot;
  };
  approvalInvalidationConditions: Array<
    | "PAYLOAD_CHANGED"
    | "TARGET_CHANGED"
    | "LICENSE_TERMS_HASH_CHANGED"
    | "INTEGRATION_CAPABILITY_CHANGED"
  >;
  safety: {
    dryRun: true;
    externalActionsAllowed: false;
    credentialsPersisted: false;
    humanApprovalStillRequired: true;
  };
}

export type AgentProposalResult =
  | {
      ok: true;
      proposal: ProposalEnvelope;
    }
  | {
      ok: false;
      error: "CREDENTIAL_LIKE_MATERIAL_REJECTED";
    };

const CREDENTIAL_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/i,
  /\b(?:access_token|client_secret|api_key|password)\s*[:=]\s*\S+/i,
  /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}/i,
];

export function containsCredentialLikeMaterial(input: ProposalRequest): boolean {
  const strings = [
    input.objective,
    input.audience ?? "",
    ...input.constraints,
    ...input.evidence.flatMap((item) => [item.title, item.summary, item.sourceUrl ?? ""]),
  ];

  return strings.some((value) => CREDENTIAL_PATTERNS.some((pattern) => pattern.test(value)));
}
