import { createHash } from 'node:crypto';
import {
    DEFAULT_FOUNDER_SETTINGS,
    type AgentCard,
    type ApprovalAction,
    type FounderSettings,
    type Prospect,
    type SourceEvidence,
} from './contracts';
import type { JsonValue } from './validation';

export const DEMO_DATASET_VERSION = 'founder-os-demo-2026-07-29.1' as const;

export interface DemoApprovalSeed extends Omit<
    ApprovalAction,
    'contentHash' | 'approvedAt' | 'executedAt' | 'providerReference' | 'failureReason'
> {
    prospectId: string | null;
    payload: Record<string, JsonValue>;
}

export interface FounderOsDemoSeed {
    agents: AgentCard[];
    prospects: Prospect[];
    approvals: DemoApprovalSeed[];
    settings: FounderSettings;
    globalEvidence: SourceEvidence[];
    dataGaps: Array<{ id: string; description: string; position: number }>;
}

export const FOUNDER_OS_DEMO_SEED: FounderOsDemoSeed = {
    agents: [
        {
            id: 'chief-of-staff',
            name: 'Chief of Staff',
            role: 'Prioritizes bounded work and prepares the founder brief.',
            status: 'working',
            currentTask: 'Reviewing the safest high-leverage actions for today',
            lastRunAt: '2026-07-29T08:42:00.000Z',
            evidenceCount: 4,
        },
        {
            id: 'lead-scout',
            name: 'A&R Lead Scout',
            role: 'Finds prospects and records source-backed qualification evidence.',
            status: 'waiting-for-approval',
            currentTask: 'Two demo prospects are staged for founder review',
            lastRunAt: '2026-07-29T08:31:00.000Z',
            evidenceCount: 3,
        },
        {
            id: 'growth-analyst',
            name: 'Growth Intelligence',
            role: 'Turns owned analytics into testable content hypotheses.',
            status: 'blocked',
            currentTask: 'Waiting for owned Meta and TikTok connections',
            lastRunAt: null,
            evidenceCount: 0,
        },
        {
            id: 'content-strategist',
            name: 'Content Strategist',
            role: 'Builds source-backed hooks, briefs, and experiment plans.',
            status: 'idle',
            currentTask: 'Ready for a founder-approved brief',
            lastRunAt: '2026-07-29T07:55:00.000Z',
            evidenceCount: 1,
        },
        {
            id: 'outreach-operator',
            name: 'Outreach Operator',
            role: 'Drafts outreach but cannot send or publish from this system.',
            status: 'waiting-for-approval',
            currentTask: 'One email draft is ready; cold social DMs remain locked',
            lastRunAt: '2026-07-29T08:18:00.000Z',
            evidenceCount: 2,
        },
    ],
    prospects: [
        {
            id: 'demo-prospect-kairo',
            displayName: 'Kairo Vale',
            handle: '@kairovale.demo',
            segment: 'rapper',
            market: 'en-US',
            platform: 'youtube',
            profileUrl: null,
            businessEmail: 'management@kairovale.example',
            contactPermission: 'public-business-email',
            score: 86,
            scoreBreakdown: {
                audienceFit: 18,
                styleFit: 27,
                purchaseIntent: 18,
                contactability: 14,
                freshness: 9,
            },
            matchedBeatIds: ['808-danger-line', 'hardcore-phonk'],
            signals: [
                'Demo record models a recent dark-trap performance signal.',
                'The example business address is explicitly non-deliverable.',
            ],
            gaps: [
                'No real source URL is attached.',
                'No owned interaction or budget evidence exists.',
            ],
            evidence: [
                {
                    id: 'demo-evidence-kairo-channel',
                    label: 'Demo official-channel observation',
                    url: null,
                    sourceType: 'manual-research',
                    observedAt: '2026-07-28T13:10:00.000Z',
                    freshness: 'fresh',
                    note: 'Synthetic evidence. Replace with an observed source before live use.',
                },
            ],
            lastObservedAt: '2026-07-28T13:10:00.000Z',
        },
        {
            id: 'demo-prospect-mika',
            displayName: 'Mika Rei',
            handle: '@mikarei.demo',
            segment: 'rapper',
            market: 'ja-JP',
            platform: 'instagram',
            profileUrl: null,
            businessEmail: null,
            contactPermission: 'manual-only',
            score: 78,
            scoreBreakdown: {
                audienceFit: 16,
                styleFit: 25,
                purchaseIntent: 17,
                contactability: 10,
                freshness: 10,
            },
            matchedBeatIds: ['hardcore-phonk'],
            signals: [
                'Demo record models a bilingual cyber-styled freestyle signal.',
            ],
            gaps: [
                'No public business email exists.',
                'Cold social delivery is prohibited.',
            ],
            evidence: [
                {
                    id: 'demo-evidence-mika-post',
                    label: 'Demo public-post observation',
                    url: null,
                    sourceType: 'manual-research',
                    observedAt: '2026-07-27T04:30:00.000Z',
                    freshness: 'fresh',
                    note: 'Synthetic evidence for a manual handoff only.',
                },
            ],
            lastObservedAt: '2026-07-27T04:30:00.000Z',
        },
        {
            id: 'demo-prospect-neon',
            displayName: 'Neon Ronin Studio',
            handle: null,
            segment: 'game-developer',
            market: 'ja-JP',
            platform: 'website',
            profileUrl: null,
            businessEmail: 'audio@neonronin.example',
            contactPermission: 'public-business-email',
            score: 74,
            scoreBreakdown: {
                audienceFit: 14,
                styleFit: 24,
                purchaseIntent: 15,
                contactability: 13,
                freshness: 8,
            },
            matchedBeatIds: ['cyber-runner'],
            signals: [
                'Demo record models a cyber-racing prototype seeking audio partners.',
            ],
            gaps: [
                'Interactive, trailer, soundtrack, and territory rights are not scoped.',
            ],
            evidence: [
                {
                    id: 'demo-evidence-neon-devlog',
                    label: 'Demo development-log observation',
                    url: null,
                    sourceType: 'manual-research',
                    observedAt: '2026-07-20T09:00:00.000Z',
                    freshness: 'fresh',
                    note: 'Synthetic evidence; no licensing claim is implied.',
                },
            ],
            lastObservedAt: '2026-07-20T09:00:00.000Z',
        },
    ],
    approvals: [
        {
            id: 'demo-approval-kairo-email',
            prospectId: 'demo-prospect-kairo',
            actionType: 'outreach-send',
            channel: 'email',
            status: 'READY_FOR_APPROVAL',
            targetLabel: 'Kairo Vale - demo sequence 1/3',
            payloadSummary: 'Demo introduction with two matched beat references.',
            payload: {
                deliveryPolicy: 'disabled-demo',
                recipient: 'management@kairovale.example',
                subject: 'Demo only - beat shortlist',
                body: 'Synthetic copy for approval-flow testing. No provider can send it.',
            },
            createdAt: '2026-07-29T08:20:00.000Z',
            updatedAt: '2026-07-29T08:34:00.000Z',
        },
        {
            id: 'demo-approval-mika-manual',
            prospectId: 'demo-prospect-mika',
            actionType: 'outreach-send',
            channel: 'instagram',
            status: 'DRAFT',
            targetLabel: 'Mika Rei - manual copy handoff',
            payloadSummary: 'Copy reference only; social API delivery is prohibited.',
            payload: {
                deliveryPolicy: 'manual-only',
                body: 'Synthetic social copy. Founder OS must not deliver this cold DM.',
            },
            createdAt: '2026-07-29T07:58:00.000Z',
            updatedAt: '2026-07-29T07:58:00.000Z',
        },
        {
            id: 'demo-approval-neon-sync',
            prospectId: 'demo-prospect-neon',
            actionType: 'outreach-send',
            channel: 'email',
            status: 'READY_FOR_APPROVAL',
            targetLabel: 'Neon Ronin Studio - custom sync inquiry',
            payloadSummary: 'Scope-first demo inquiry; no recording-license rights are promised.',
            payload: {
                deliveryPolicy: 'disabled-demo',
                recipient: 'audio@neonronin.example',
                subject: 'Demo only - custom sync scope',
                body: 'Synthetic scope-first inquiry. No provider can send it.',
            },
            createdAt: '2026-07-29T08:12:00.000Z',
            updatedAt: '2026-07-29T08:12:00.000Z',
        },
    ],
    settings: {
        ...DEFAULT_FOUNDER_SETTINGS,
        markets: [...DEFAULT_FOUNDER_SETTINGS.markets],
        segmentPriority: [...DEFAULT_FOUNDER_SETTINGS.segmentPriority],
        trendSources: { ...DEFAULT_FOUNDER_SETTINGS.trendSources },
        integrations: { ...DEFAULT_FOUNDER_SETTINGS.integrations },
    },
    globalEvidence: [
        {
            id: 'demo-evidence-catalog',
            label: 'VGP beat catalog repository',
            url: '/studio/beats',
            sourceType: 'repository',
            observedAt: '2026-07-29T08:00:00.000Z',
            freshness: 'fresh',
            note: 'Catalog presence does not establish eligibility for every license or usage.',
        },
        {
            id: 'demo-evidence-founder-policy',
            label: 'Founder external-action safety policy',
            url: null,
            sourceType: 'founder-input',
            observedAt: '2026-07-29T08:05:00.000Z',
            freshness: 'fresh',
            note: 'Every external action requires approval; cold social DMs remain disabled.',
        },
    ],
    dataGaps: [
        {
            id: 'demo-gap-meta',
            description: 'Meta owned-account analytics are not connected.',
            position: 10,
        },
        {
            id: 'demo-gap-tiktok',
            description: 'TikTok owned-account analytics are not connected.',
            position: 20,
        },
        {
            id: 'demo-gap-prospects',
            description: 'Prospect discovery is using synthetic demo records only.',
            position: 30,
        },
        {
            id: 'demo-gap-execution',
            description: 'No external send, reply, or publish capability is enabled.',
            position: 40,
        },
    ],
};

export function getFounderOsDemoSeedHash(): string {
    const digest = createHash('sha256')
        .update(JSON.stringify(FOUNDER_OS_DEMO_SEED))
        .digest('hex');

    return `sha256:${digest}`;
}
