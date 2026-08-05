import type {
    ActionChannel,
    ContactPermission,
    FounderMarket,
    OutreachSequenceStep,
    Prospect,
    ProspectScoreBreakdown,
    ProspectSegment,
    SourceEvidence,
} from '../contracts.ts';

export type LeadScoutMode = 'production' | 'demo';
export type SignalStrength = 'high' | 'medium' | 'low' | 'none';
export type QualificationTier = 'qualified' | 'near-match' | 'excluded';

export interface CandidateEvidenceInput {
    id: string;
    label: string;
    url: string | null;
    sourceType: SourceEvidence['sourceType'];
    observedAt: string | null;
    note?: string;
}

export interface QualificationSignalInput {
    strength: SignalStrength;
    evidenceIds: string[];
    note: string | null;
}

export interface LeadQualificationSignals {
    audienceFit: QualificationSignalInput;
    styleFit: QualificationSignalInput;
    purchaseIntent: QualificationSignalInput;
}

export interface CandidateContactInput {
    businessEmail: string | null;
    permission: ContactPermission;
    sourceEvidenceId: string | null;
    origin: 'source-provided' | 'founder-provided' | 'inferred';
}

export interface VerifiedBeatMatchInput {
    beatId: string;
    title: string;
    publicUrl: string;
    matchReason: string;
    evidenceIds: string[];
    verificationStatus: 'verified' | 'unverified';
}

export interface LeadCandidateInput {
    id: string;
    displayName: string;
    handle: string | null;
    segment: ProspectSegment;
    market: FounderMarket;
    platform: Prospect['platform'];
    profileUrl: string | null;
    contact: CandidateContactInput;
    evidence: CandidateEvidenceInput[];
    qualificationSignals: LeadQualificationSignals;
    beatMatches: VerifiedBeatMatchInput[];
}

export interface LeadScoutOptions {
    mode?: LeadScoutMode;
    now: string;
    scoreThreshold?: number;
}

export interface IngestedLeadCandidate {
    mode: LeadScoutMode;
    input: LeadCandidateInput;
    evidence: SourceEvidence[];
    evidenceById: ReadonlyMap<string, SourceEvidence>;
    matchedBeats: VerifiedBeatMatchInput[];
    lastObservedAt: string | null;
    freshness: SourceEvidence['freshness'];
    ingestionGaps: string[];
}

export interface ScoredLeadCandidate {
    prospect: Prospect;
    tier: QualificationTier;
    priorityRank: 0 | 1 | 2;
    scoreBreakdown: ProspectScoreBreakdown;
    matchedBeats: VerifiedBeatMatchInput[];
    evidenceFreshness: SourceEvidence['freshness'];
}

export interface CanonicalBasicMp3Offer {
    kind: 'canonical-basic-mp3';
    licenseId: 'basic-mp3';
    name: 'Basic MP3';
    priceUsd: 15;
    usage: 'Used for Music Recording';
    distributionCopies: 2_000;
    onlineAudioStreams: 5_000;
    musicVideos: 1;
    sourceVersion: string;
    rightsInferred: false;
}

export interface CustomSyncInquiryOffer {
    kind: 'custom-sync-inquiry';
    licenseId: null;
    name: 'Custom sync inquiry';
    priceUsd: null;
    usage: null;
    sourceVersion: null;
    rightsInferred: false;
    requiredScope:
        | 'game-or-interactive-use-must-be-confirmed-in-writing'
        | 'creator-or-commercial-video-use-must-be-confirmed-in-writing';
}

export type LeadOffer = CanonicalBasicMp3Offer | CustomSyncInquiryOffer;

export interface OutreachDraftStep extends OutreachSequenceStep {
    language: FounderMarket;
    backTranslation: string | null;
    approvalRequired: true;
    canExecute: false;
    deliveryMode: 'email-after-individual-approval' | 'manual-social-handoff';
    suggestedDelayBusinessDays: 0 | 5 | 7;
}

export interface OutreachDraftPlan {
    prospectId: string;
    channel: ActionChannel | null;
    recipient: string | null;
    deliveryMode: OutreachDraftStep['deliveryMode'] | null;
    individuallyApproved: false;
    offer: LeadOffer;
    steps: OutreachDraftStep[];
    stopConditions: readonly [
        'reply-received',
        'bounce',
        'opt-out',
        'suppressed',
        'founder-stopped',
    ];
    gaps: string[];
}

export interface LeadScoutResult {
    candidate: ScoredLeadCandidate;
    outreach: OutreachDraftPlan;
}
