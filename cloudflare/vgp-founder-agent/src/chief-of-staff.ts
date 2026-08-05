import { Agent } from "agents";
import {
  containsCredentialLikeMaterial,
  ProposalRequestSchema,
  type AgentProposalResult,
  type ProposalEnvelope,
  type SpecialistRole,
} from "./contracts";
import { getBasicMp3TermsSnapshot } from "./license-policy";
import { buildRecommendations, selectSpecialists } from "./specialists";

interface SafeRunSummary {
  runId: string;
  proposalId: string;
  taskType: "analysis" | "draft";
  selectedSpecialists: SpecialistRole[];
  evidenceCount: number;
  basicMp3TermsHash?: string;
  createdAt: string;
}

interface ChiefOfStaffState {
  proposalCount: number;
  recentRuns: SafeRunSummary[];
}

export class ChiefOfStaff extends Agent<Env, ChiefOfStaffState> {
  initialState: ChiefOfStaffState = {
    proposalCount: 0,
    recentRuns: [],
  };

  async createProposal(rawInput: unknown): Promise<AgentProposalResult> {
    const input = ProposalRequestSchema.parse(rawInput);
    if (containsCredentialLikeMaterial(input)) {
      return {
        ok: false,
        error: "CREDENTIAL_LIKE_MATERIAL_REJECTED",
      };
    }

    const selectedSpecialists = selectSpecialists(input);
    const recommendations = buildRecommendations(selectedSpecialists);
    const needsLicenseTerms =
      input.includeBasicMp3Terms ||
      selectedSpecialists.some((role) => role === "lead-scout" || role === "sales-concierge");
    const basicMp3Terms = needsLicenseTerms
      ? await getBasicMp3TermsSnapshot()
      : undefined;
    const createdAt = new Date().toISOString();
    const proposalId = crypto.randomUUID();

    const proposal: ProposalEnvelope = {
      schemaVersion: "1",
      proposalId,
      runId: input.runId,
      scopeId: input.scopeId,
      taskType: input.taskType,
      mode: "mock-dry-run",
      createdAt,
      selectedSpecialists,
      recommendations,
      draft:
        input.taskType === "draft"
          ? {
              format: "outline",
              title: "Founder review draft",
              blocks: [
                {
                  label: "Objective",
                  text: input.objective,
                },
                {
                  label: "Evidence boundary",
                  text:
                    input.evidence.length > 0
                      ? `Use only the ${input.evidence.length} supplied evidence item(s).`
                      : "No evidence supplied; keep every claim explicitly provisional.",
                },
                {
                  label: "Founder decision",
                  text: "Review, revise, and approve in the authoritative Founder OS before any external action.",
                },
              ],
              prohibitedExternalActions: true,
            }
          : undefined,
      evidenceSummary: {
        supplied: input.evidence.length,
        sourceTypes: [...new Set(input.evidence.map((item) => item.sourceType))],
        missingEvidence: input.evidence.length === 0,
      },
      policyInputs: {
        basicMp3Terms,
      },
      approvalInvalidationConditions: [
        "PAYLOAD_CHANGED",
        "TARGET_CHANGED",
        "LICENSE_TERMS_HASH_CHANGED",
        "INTEGRATION_CAPABILITY_CHANGED",
      ],
      safety: {
        dryRun: true,
        externalActionsAllowed: false,
        credentialsPersisted: false,
        humanApprovalStillRequired: true,
      },
    };

    const summary: SafeRunSummary = {
      runId: input.runId,
      proposalId,
      taskType: input.taskType,
      selectedSpecialists,
      evidenceCount: input.evidence.length,
      basicMp3TermsHash: basicMp3Terms?.contentSha256,
      createdAt,
    };
    this.setState({
      proposalCount: this.state.proposalCount + 1,
      recentRuns: [...this.state.recentRuns, summary].slice(-10),
    });

    return {
      ok: true,
      proposal,
    };
  }

  getSafeState(): ChiefOfStaffState {
    return this.state;
  }
}
