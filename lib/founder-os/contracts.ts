export const FOUNDER_OS_CONTRACT_VERSION = '2026-07-29.1' as const;

export const PROSPECT_SEGMENTS = ['rapper', 'game-developer', 'content-creator'] as const;
export type ProspectSegment = (typeof PROSPECT_SEGMENTS)[number];

export const FOUNDER_MARKETS = ['en-US', 'ja-JP', 'de-DE'] as const;
export type FounderMarket = (typeof FOUNDER_MARKETS)[number];

export const ACTION_CHANNELS = ['email', 'instagram', 'tiktok'] as const;
export type ActionChannel = (typeof ACTION_CHANNELS)[number];

export const APPROVAL_STATUSES = [
    'DRAFT',
    'READY_FOR_APPROVAL',
    'APPROVED',
    'EXECUTING',
    'SUCCEEDED',
    'FAILED',
    'UNKNOWN',
] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type EvidenceFreshness = 'fresh' | 'stale' | 'unknown';
export type ContactPermission = 'verified-opt-in' | 'public-business-email' | 'manual-only' | 'blocked';
export type IntegrationStatus = 'connected' | 'configured' | 'not-connected' | 'error';

export interface SourceEvidence {
    id: string;
    label: string;
    url: string | null;
    sourceType: 'owned-data' | 'official-api' | 'manual-research' | 'repository' | 'founder-input';
    observedAt: string | null;
    freshness: EvidenceFreshness;
    note?: string;
}

export interface ProspectScoreBreakdown {
    audienceFit: number;
    styleFit: number;
    purchaseIntent: number;
    contactability: number;
    freshness: number;
}

export interface Prospect {
    id: string;
    displayName: string;
    handle: string | null;
    segment: ProspectSegment;
    market: FounderMarket;
    platform: 'instagram' | 'tiktok' | 'youtube' | 'website' | 'other';
    profileUrl: string | null;
    businessEmail: string | null;
    contactPermission: ContactPermission;
    score: number;
    scoreBreakdown: ProspectScoreBreakdown;
    matchedBeatIds: string[];
    signals: string[];
    gaps: string[];
    evidence: SourceEvidence[];
    lastObservedAt: string | null;
}

export interface OutreachSequenceStep {
    id: string;
    prospectId: string;
    order: 1 | 2 | 3;
    channel: ActionChannel;
    subject: string | null;
    body: string;
    status: ApprovalStatus;
    scheduledFor: string | null;
    contentHash: string;
}

export interface ApprovalAction {
    id: string;
    actionType: 'outreach-send' | 'social-reply' | 'social-publish' | 'settings-change';
    channel: ActionChannel | 'internal';
    status: ApprovalStatus;
    targetLabel: string;
    payloadSummary: string;
    contentHash: string;
    createdAt: string;
    updatedAt: string;
    approvedAt: string | null;
    executedAt: string | null;
    providerReference: string | null;
    failureReason: string | null;
}

export interface AgentCard {
    id: 'chief-of-staff' | 'lead-scout' | 'growth-analyst' | 'content-strategist' | 'outreach-operator';
    name: string;
    role: string;
    status: 'idle' | 'working' | 'waiting-for-approval' | 'blocked';
    currentTask: string;
    lastRunAt: string | null;
    evidenceCount: number;
}

export interface FounderSettings {
    contractVersion: typeof FOUNDER_OS_CONTRACT_VERSION;
    markets: FounderMarket[];
    segmentPriority: ProspectSegment[];
    scoreThreshold: number;
    requireApprovalForEveryExternalAction: true;
    allowColdSocialDm: false;
    allowUnverifiedContacts: false;
    trendSources: {
        ownedAnalytics: boolean;
        officialPlatformApis: boolean;
        manualResearch: boolean;
        scraping: false;
    };
    integrations: Record<'meta' | 'tiktok' | 'hostinger-email' | 'cloudflare-agent', IntegrationStatus>;
}

export interface FounderDashboardSnapshot {
    contractVersion: typeof FOUNDER_OS_CONTRACT_VERSION;
    generatedAt: string;
    mode: 'demo' | 'live';
    agents: AgentCard[];
    prospects: Prospect[];
    approvals: ApprovalAction[];
    settings: FounderSettings;
    evidence: SourceEvidence[];
    dataGaps: string[];
}

export const DEFAULT_FOUNDER_SETTINGS: FounderSettings = {
    contractVersion: FOUNDER_OS_CONTRACT_VERSION,
    markets: ['en-US', 'ja-JP', 'de-DE'],
    segmentPriority: ['rapper', 'game-developer', 'content-creator'],
    scoreThreshold: 70,
    requireApprovalForEveryExternalAction: true,
    allowColdSocialDm: false,
    allowUnverifiedContacts: false,
    trendSources: {
        ownedAnalytics: true,
        officialPlatformApis: true,
        manualResearch: true,
        scraping: false,
    },
    integrations: {
        meta: 'not-connected',
        tiktok: 'not-connected',
        'hostinger-email': 'configured',
        'cloudflare-agent': 'not-connected',
    },
};
