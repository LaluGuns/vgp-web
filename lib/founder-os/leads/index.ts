// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
export { LeadScoutValidationError } from './errors.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
export { runLeadScout, runLeadScoutBatch } from './engine.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
export { ingestLeadCandidate } from './ingest.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
export { offerForSegment, describeOffer } from './offer-policy.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
export { scoreLeadCandidate, prioritizeLeadCandidates } from './score.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
export { buildOutreachDraftPlan } from './sequence.ts';
export type {
    CandidateContactInput,
    CandidateEvidenceInput,
    CanonicalBasicMp3Offer,
    CustomSyncInquiryOffer,
    IngestedLeadCandidate,
    LeadCandidateInput,
    LeadOffer,
    LeadQualificationSignals,
    LeadScoutMode,
    LeadScoutOptions,
    LeadScoutResult,
    OutreachDraftPlan,
    OutreachDraftStep,
    QualificationSignalInput,
    QualificationTier,
    ScoredLeadCandidate,
    SignalStrength,
    VerifiedBeatMatchInput,
} from './types.ts';
