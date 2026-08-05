import { createHash } from 'node:crypto';
import type {
    ApprovalStatus,
    FounderDashboardSnapshot,
    FounderSettings,
} from './contracts';
import {
    assertApprovalTransition,
    isExecutionTerminalStatus,
    makeApprovalOutboxKey,
} from './approval-state';
import {
    DEMO_DATASET_VERSION,
    FOUNDER_OS_DEMO_SEED,
    getFounderOsDemoSeedHash,
} from './demo-seed';
import { beatsCatalog } from '@/lib/catalog';
import { FounderOsError } from './errors';
import { runLeadScout } from './leads/engine';
import type { CustomGptProspectInput } from './leads/action-validation';
import type { LeadCandidateInput } from './leads/types';
import {
    getFounderOsProvisioningStatus,
    readFounderOsSnapshot,
    withFounderOsRepository,
    type FounderOsRepository,
    type StoredApproval,
} from './repository';
import {
    executionOutcomeInputSchema,
    executionStartInputSchema,
    type CustomGptDraftInput,
    founderEmailAddressSchema,
    founderEmailPayloadSchema,
    type JsonValue,
} from './validation';

interface BootstrapResult {
    created: boolean;
    datasetVersion: string;
    seedHash: string;
    counts: Record<string, number>;
}

interface ApprovalReviewResult {
    approval: StoredApproval['action'];
    outboxHeld: boolean;
}

interface ApprovalContentResult {
    approval: StoredApproval['action'];
    invalidated: boolean;
    supersededOutboxCount: number;
}

export interface CustomGptBrief {
    contractVersion: FounderDashboardSnapshot['contractVersion'];
    generatedAt: string;
    mode: FounderDashboardSnapshot['mode'];
    agents: FounderDashboardSnapshot['agents'];
    prospects: Array<{
        id: string;
        displayName: string;
        handle: string | null;
        segment: string;
        market: string;
        platform: string;
        profileUrl: string | null;
        contactPermission: string;
        businessEmailAvailable: boolean;
        score: number;
        scoreBreakdown: FounderDashboardSnapshot['prospects'][number]['scoreBreakdown'];
        matchedBeatIds: string[];
        signals: string[];
        gaps: string[];
        evidence: Array<{
            id: string;
            label: string;
            sourceType: string;
            observedAt: string | null;
            freshness: string;
        }>;
        lastObservedAt: string | null;
    }>;
    approvals: FounderDashboardSnapshot['approvals'];
    settings: FounderDashboardSnapshot['settings'];
    evidence: Array<{
        id: string;
        label: string;
        sourceType: string;
        observedAt: string | null;
        freshness: string;
    }>;
    dataGaps: string[];
    safetyPolicy: {
        customGptCanApprove: false;
        customGptCanExecute: false;
        everyExternalActionRequiresFounderApproval: true;
        coldSocialDmAllowed: false;
    };
}

interface CustomGptDraftResult {
    created: boolean;
    approval: StoredApproval['action'];
    mode: 'demo' | 'live';
}

export interface FounderEmailExecutionClaim {
    approval: StoredApproval;
    recipientEmail: string;
    payload: ReturnType<typeof founderEmailPayloadSchema.parse>;
}

const LIVE_AGENT_CARDS: FounderDashboardSnapshot['agents'] = [
    {
        id: 'chief-of-staff',
        name: 'Chief of Staff',
        role: 'Prioritizes bounded work and prepares the founder brief.',
        status: 'idle',
        currentTask: 'Waiting for the next founder-directed brief',
        lastRunAt: null,
        evidenceCount: 0,
    },
    {
        id: 'lead-scout',
        name: 'A&R Lead Scout',
        role: 'Scores source-backed rapper, game, and creator prospects.',
        status: 'idle',
        currentTask: 'Ready for a Custom GPT research handoff',
        lastRunAt: null,
        evidenceCount: 0,
    },
    {
        id: 'growth-analyst',
        name: 'Growth Intelligence',
        role: 'Turns owned Meta and TikTok analytics into testable hypotheses.',
        status: 'blocked',
        currentTask: 'Waiting for an owned analytics connection',
        lastRunAt: null,
        evidenceCount: 0,
    },
    {
        id: 'content-strategist',
        name: 'Content Strategist',
        role: 'Builds source-backed hooks, briefs, and experiment plans.',
        status: 'idle',
        currentTask: 'Ready for a founder-approved content brief',
        lastRunAt: null,
        evidenceCount: 0,
    },
    {
        id: 'outreach-operator',
        name: 'Outreach Operator',
        role: 'Prepares drafts; every external action remains approval-gated.',
        status: 'idle',
        currentTask: 'Waiting for a qualified source-backed prospect',
        lastRunAt: null,
        evidenceCount: 0,
    },
];

function approvalAuditState(approval: StoredApproval): Record<string, unknown> {
    return {
        id: approval.action.id,
        prospectId: approval.prospectId,
        actionType: approval.action.actionType,
        channel: approval.action.channel,
        status: approval.action.status,
        targetLabel: approval.action.targetLabel,
        payloadSummary: approval.action.payloadSummary,
        contentHash: approval.action.contentHash,
        approvedAt: approval.action.approvedAt,
        executedAt: approval.action.executedAt,
        providerReference: approval.action.providerReference,
        failureReason: approval.action.failureReason,
        isDemo: approval.isDemo,
    };
}

function assertExpectedContentHash(
    approval: StoredApproval,
    expectedContentHash: string
): void {
    if (approval.action.contentHash === expectedContentHash) return;

    throw new FounderOsError(
        'FOUNDER_OS_CONTENT_CHANGED',
        'Approval content changed. Review the latest draft before continuing.',
        409,
        {
            approvalId: approval.action.id,
            currentContentHash: approval.action.contentHash,
        }
    );
}

function assertApprovalFound(
    approval: StoredApproval | null,
    approvalId: string
): asserts approval is StoredApproval {
    if (approval) return;
    throw new FounderOsError(
        'FOUNDER_OS_NOT_FOUND',
        'Approval action was not found.',
        404,
        { approvalId }
    );
}

export const founderOsService = {
    getSnapshot: readFounderOsSnapshot,
    getProvisioningStatus: getFounderOsProvisioningStatus,
};

function redactEvidenceForCustomGpt(
    evidence: FounderDashboardSnapshot['evidence']
): CustomGptBrief['evidence'] {
    return evidence.map((item) => ({
        id: item.id,
        label: item.label,
        sourceType: item.sourceType,
        observedAt: item.observedAt,
        freshness: item.freshness,
    }));
}

export async function getCustomGptBrief(): Promise<CustomGptBrief> {
    const snapshot = await readFounderOsSnapshot();
    return {
        contractVersion: snapshot.contractVersion,
        generatedAt: snapshot.generatedAt,
        mode: snapshot.mode,
        agents: snapshot.agents,
        prospects: snapshot.prospects.map((prospect) => ({
            id: prospect.id,
            displayName: prospect.displayName,
            handle: prospect.handle,
            segment: prospect.segment,
            market: prospect.market,
            platform: prospect.platform,
            profileUrl: prospect.profileUrl,
            contactPermission: prospect.contactPermission,
            businessEmailAvailable: Boolean(prospect.businessEmail),
            score: prospect.score,
            scoreBreakdown: prospect.scoreBreakdown,
            matchedBeatIds: prospect.matchedBeatIds,
            signals: prospect.signals,
            gaps: prospect.gaps,
            evidence: redactEvidenceForCustomGpt(prospect.evidence),
            lastObservedAt: prospect.lastObservedAt,
        })),
        approvals: snapshot.approvals,
        settings: snapshot.settings,
        evidence: redactEvidenceForCustomGpt(snapshot.evidence),
        dataGaps: snapshot.dataGaps,
        safetyPolicy: {
            customGptCanApprove: false,
            customGptCanExecute: false,
            everyExternalActionRequiresFounderApproval: true,
            coldSocialDmAllowed: false,
        },
    };
}

export async function createCustomGptDraft(
    input: CustomGptDraftInput,
    requestId: string
): Promise<CustomGptDraftResult> {
    const approvalId = `gpt-draft-${createHash('sha256')
        .update(input.requestKey, 'utf8')
        .digest('hex')
        .slice(0, 40)}`;

    return withFounderOsRepository(async (repository) => {
        const workspace = await repository.getWorkspaceStateForUpdate();
        let prospectId: string | null = null;
        let actionType: StoredApproval['action']['actionType'];
        let channel: StoredApproval['action']['channel'];
        let payload: Record<string, JsonValue>;

        if (input.kind === 'email-outreach') {
            const permission = await repository.getProspectContactPermission(
                input.prospectId
            );
            if (
                permission !== 'verified-opt-in'
                && permission !== 'public-business-email'
            ) {
                throw new FounderOsError(
                    'FOUNDER_OS_POLICY_BLOCKED',
                    'Custom GPT may only draft email for a prospect with an approved contact basis.',
                    409,
                    { prospectId: input.prospectId, contactPermission: permission }
                );
            }
            prospectId = input.prospectId;
            actionType = 'outreach-send';
            channel = 'email';
            payload = {
                operation: 'email.outreach.draft',
                prospectId: input.prospectId,
                subject: input.subject,
                body: input.body,
                evidenceIds: input.evidenceIds,
            };
        } else if (input.kind === 'instagram-reel') {
            actionType = 'social-publish';
            channel = 'instagram';
            payload = {
                operation: 'meta.reel.create-container',
                videoUrl: input.videoUrl,
                caption: input.caption,
                shareToFeed: input.shareToFeed,
            };
        } else if (input.kind === 'instagram-reel-publish') {
            actionType = 'social-publish';
            channel = 'instagram';
            payload = {
                operation: 'meta.reel.publish',
                creationId: input.creationId,
            };
        } else {
            actionType = 'social-publish';
            channel = 'tiktok';
            payload = {
                operation: 'tiktok.draft.init',
                source: {
                    source: 'PULL_FROM_URL',
                    videoUrl: input.videoUrl,
                },
                explicitConsent: input.founderConfirmedUpload,
            };
        }

        const result = await repository.insertIdempotentGptDraft({
            id: approvalId,
            prospectId,
            actionType,
            channel,
            targetLabel: input.targetLabel,
            payloadSummary: input.payloadSummary,
            payload,
            isDemo: workspace.mode === 'demo',
        });

        await repository.appendAudit({
            actorType: 'system',
            actorId: 'custom-gpt-plus-action',
            action: result.created
                ? 'custom_gpt.draft_created'
                : 'custom_gpt.draft_replayed',
            entityType: 'approval_action',
            entityId: approvalId,
            requestId,
            afterState: approvalAuditState(result.approval),
            metadata: {
                requestKeyHash: createHash('sha256')
                    .update(input.requestKey, 'utf8')
                    .digest('hex'),
                mode: workspace.mode,
                canApprove: false,
                canExecute: false,
            },
        });

        return {
            created: result.created,
            approval: result.approval.action,
            mode: workspace.mode,
        };
    }, { isolation: 'serializable' });
}

function customGptLeadId(requestKey: string): string {
    return `lead-${createHash('sha256')
        .update(requestKey, 'utf8')
        .digest('hex')
        .slice(0, 40)}`;
}

function canonicalBeatMatch(
    beatId: string,
    matchReason: string,
    evidenceIds: string[]
): LeadCandidateInput['beatMatches'][number] {
    const beat = beatsCatalog.find((candidate) => candidate.id === beatId);
    if (
        !beat
        || beat.identityVerification === 'unverified'
        || beat.identityVerification === 'mismatch'
        || beat.availability === 'sold'
        || beat.availability === 'unavailable'
    ) {
        throw new FounderOsError(
            'FOUNDER_OS_INVALID_DATA',
            'Beat match must reference an available, repository-verified catalog beat.',
            400,
            { beatId }
        );
    }
    const origin = (process.env.APP_URL || 'https://www.virzyguns.com')
        .replace(/\/$/, '');
    return {
        beatId: beat.id,
        title: beat.title,
        publicUrl: `${origin}/studio/beats/${beat.slug}`,
        matchReason,
        evidenceIds,
        verificationStatus: 'verified',
    };
}

export async function createCustomGptProspect(
    input: CustomGptProspectInput,
    requestId: string
) {
    const prospectId = customGptLeadId(input.requestKey);
    const evidenceId = (key: string) => `${prospectId}:${key}`;
    const candidate: LeadCandidateInput = {
        id: prospectId,
        displayName: input.displayName,
        handle: input.handle,
        segment: input.segment,
        market: input.market,
        platform: input.platform,
        profileUrl: input.profileUrl,
        contact: {
            businessEmail: input.contact.businessEmail,
            permission: input.contact.permission,
            sourceEvidenceId: input.contact.sourceEvidenceKey
                ? evidenceId(input.contact.sourceEvidenceKey)
                : null,
            origin: input.contact.origin,
        },
        evidence: input.evidence.map((item) => ({
            id: evidenceId(item.key),
            label: item.label,
            url: item.url,
            sourceType: 'manual-research',
            observedAt: item.observedAt,
            ...(item.note ? { note: item.note } : {}),
        })),
        qualificationSignals: {
            audienceFit: {
                strength: input.qualificationSignals.audienceFit.strength,
                evidenceIds: input.qualificationSignals.audienceFit.evidenceKeys
                    .map(evidenceId),
                note: input.qualificationSignals.audienceFit.note,
            },
            styleFit: {
                strength: input.qualificationSignals.styleFit.strength,
                evidenceIds: input.qualificationSignals.styleFit.evidenceKeys
                    .map(evidenceId),
                note: input.qualificationSignals.styleFit.note,
            },
            purchaseIntent: {
                strength: input.qualificationSignals.purchaseIntent.strength,
                evidenceIds: input.qualificationSignals.purchaseIntent.evidenceKeys
                    .map(evidenceId),
                note: input.qualificationSignals.purchaseIntent.note,
            },
        },
        beatMatches: input.beatMatches.map((beat) =>
            canonicalBeatMatch(
                beat.beatId,
                beat.matchReason,
                beat.evidenceKeys.map(evidenceId)
            )
        ),
    };

    return withFounderOsRepository(async (repository) => {
        const workspace = await repository.getWorkspaceStateForUpdate();
        const settings = await repository.getSettingsForUpdate();
        const result = runLeadScout(candidate, {
            mode: workspace.mode === 'live' ? 'production' : 'demo',
            now: new Date().toISOString(),
            scoreThreshold: settings?.scoreThreshold ?? 70,
        });
        const stored = await repository.insertIdempotentScoutedLead({
            prospect: result.candidate.prospect,
            evidence: result.candidate.prospect.evidence,
            isDemo: workspace.mode === 'demo',
        });

        await repository.appendAudit({
            actorType: 'system',
            actorId: 'custom-gpt-plus-lead-scout',
            action: stored.created
                ? 'custom_gpt.prospect_scored'
                : 'custom_gpt.prospect_replayed',
            entityType: 'prospect',
            entityId: prospectId,
            requestId,
            afterState: {
                id: result.candidate.prospect.id,
                segment: result.candidate.prospect.segment,
                market: result.candidate.prospect.market,
                score: result.candidate.prospect.score,
                tier: result.candidate.tier,
                evidenceIds: result.candidate.prospect.evidence.map(
                    (item) => item.id
                ),
                matchedBeatIds: result.candidate.prospect.matchedBeatIds,
            },
            metadata: {
                requestKeyHash: createHash('sha256')
                    .update(input.requestKey, 'utf8')
                    .digest('hex'),
                mode: workspace.mode,
                scoringAuthority: 'deterministic-backend',
                contactReturnedToGpt: false,
            },
        });

        return {
            created: stored.created,
            mode: workspace.mode,
            prospect: {
                id: result.candidate.prospect.id,
                displayName: result.candidate.prospect.displayName,
                segment: result.candidate.prospect.segment,
                market: result.candidate.prospect.market,
                score: result.candidate.prospect.score,
                scoreBreakdown: result.candidate.scoreBreakdown,
                tier: result.candidate.tier,
                priorityRank: result.candidate.priorityRank,
                matchedBeatIds: result.candidate.prospect.matchedBeatIds,
                gaps: result.candidate.prospect.gaps,
            },
            offer: result.outreach.offer,
            outreachDraftEligible: result.outreach.steps.length > 0,
        };
    }, { isolation: 'serializable' });
}

export async function activateFounderOsLiveWorkspace(requestId: string) {
    return withFounderOsRepository(async (repository) => {
        const before = await repository.getWorkspaceStateForUpdate();
        if (before.mode === 'live') {
            return { activated: false, mode: 'live' as const, removed: {} };
        }

        const result = await repository.activateLiveWorkspace(LIVE_AGENT_CARDS);
        await repository.appendAudit({
            actorType: 'founder',
            actorId: 'founder-session',
            action: 'workspace.activated_live',
            entityType: 'workspace',
            entityId: 'default',
            requestId,
            beforeState: before,
            afterState: { mode: 'live' },
            metadata: {
                removedSyntheticRows: result.removed,
                realProviderActionPerformed: false,
            },
        });
        return {
            activated: true,
            mode: 'live' as const,
            removed: result.removed,
        };
    }, { isolation: 'serializable' });
}

export async function bootstrapFounderOsDemo(
    requestId: string
): Promise<BootstrapResult> {
    const seedHash = getFounderOsDemoSeedHash();

    return withFounderOsRepository(async (repository) => {
        await repository.acquireBootstrapLock();
        const workspace = await repository.getWorkspaceStateForUpdate();

        if (workspace.mode === 'live') {
            throw new FounderOsError(
                'FOUNDER_OS_CONFLICT',
                'Demo data cannot be bootstrapped into a live Founder OS workspace.',
                409
            );
        }

        if (await repository.hasNonDemoData()) {
            throw new FounderOsError(
                'FOUNDER_OS_CONFLICT',
                'Demo bootstrap refused because non-demo Founder OS records already exist.',
                409
            );
        }

        if (await repository.hasDemoBootstrapRun(DEMO_DATASET_VERSION)) {
            return {
                created: false,
                datasetVersion: DEMO_DATASET_VERSION,
                seedHash,
                counts: {},
            };
        }

        const counts = await repository.insertDemoSeed(
            FOUNDER_OS_DEMO_SEED,
            DEMO_DATASET_VERSION,
            seedHash
        );

        await repository.appendAudit({
            actorType: 'bootstrap',
            actorId: 'founder-session',
            action: 'demo.bootstrap',
            entityType: 'workspace',
            entityId: 'default',
            requestId,
            afterState: {
                mode: 'demo',
                datasetVersion: DEMO_DATASET_VERSION,
                seedHash,
            },
            metadata: { counts },
        });

        return {
            created: true,
            datasetVersion: DEMO_DATASET_VERSION,
            seedHash,
            counts,
        };
    }, { isolation: 'serializable' });
}

export async function saveFounderOsSettings(
    settings: FounderSettings,
    requestId: string
): Promise<FounderSettings> {
    return withFounderOsRepository(async (repository) => {
        const before = await repository.getSettingsForUpdate();

        if (
            before
            && JSON.stringify(before.integrations) !== JSON.stringify(settings.integrations)
        ) {
            throw new FounderOsError(
                'FOUNDER_OS_POLICY_BLOCKED',
                'Integration status is server-managed and cannot be changed from settings.',
                409
            );
        }

        const saved = await repository.upsertSettings(settings);
        await repository.appendAudit({
            actorType: 'founder',
            actorId: 'founder-session',
            action: 'settings.saved',
            entityType: 'settings',
            entityId: 'default',
            requestId,
            beforeState: before,
            afterState: saved,
        });
        return saved;
    }, { isolation: 'serializable' });
}

async function enforceApprovalPolicy(
    repository: FounderOsRepository,
    approval: StoredApproval
): Promise<void> {
    if (approval.action.actionType !== 'outreach-send') return;

    if (
        approval.action.channel === 'instagram'
        || approval.action.channel === 'tiktok'
    ) {
        throw new FounderOsError(
            'FOUNDER_OS_POLICY_BLOCKED',
            'Cold social outreach cannot be approved for delivery.',
            409,
            { channel: approval.action.channel }
        );
    }

    if (approval.action.channel !== 'email' || !approval.prospectId) {
        throw new FounderOsError(
            'FOUNDER_OS_POLICY_BLOCKED',
            'Outreach approval requires a linked, contactable prospect.',
            409
        );
    }

    const permission = await repository.getProspectContactPermission(
        approval.prospectId
    );
    if (
        permission !== 'verified-opt-in'
        && permission !== 'public-business-email'
    ) {
        throw new FounderOsError(
            'FOUNDER_OS_POLICY_BLOCKED',
            'This prospect does not have an approved email contact basis.',
            409,
            { contactPermission: permission }
        );
    }
}

export async function transitionFounderApproval(
    approvalId: string,
    targetStatus: Extract<ApprovalStatus, 'READY_FOR_APPROVAL' | 'APPROVED'>,
    expectedContentHash: string,
    requestId: string
): Promise<ApprovalReviewResult> {
    return withFounderOsRepository(async (repository) => {
        const before = await repository.getApprovalForUpdate(approvalId);
        assertApprovalFound(before, approvalId);
        assertExpectedContentHash(before, expectedContentHash);
        assertApprovalTransition(before.action.status, targetStatus);

        if (targetStatus === 'APPROVED') {
            await enforceApprovalPolicy(repository, before);
        }

        const after = await repository.updateApprovalReviewStatus(
            approvalId,
            targetStatus
        );
        let outboxHeld = false;

        if (targetStatus === 'APPROVED') {
            const outbox = await repository.insertHeldOutbox(
                after,
                makeApprovalOutboxKey(approvalId, after.action.contentHash)
            );
            outboxHeld = outbox.row.status === 'held';
        }

        await repository.appendAudit({
            actorType: 'founder',
            actorId: 'founder-session',
            action: `approval.${targetStatus.toLowerCase()}`,
            entityType: 'approval_action',
            entityId: approvalId,
            requestId,
            beforeState: approvalAuditState(before),
            afterState: approvalAuditState(after),
            metadata: {
                outboxHeld,
                noProviderCallPerformed: true,
            },
        });

        return { approval: after.action, outboxHeld };
    }, { isolation: 'serializable' });
}

export async function replaceFounderApprovalContent(
    approvalId: string,
    expectedContentHash: string,
    payloadSummary: string,
    payload: Record<string, JsonValue>,
    requestId: string
): Promise<ApprovalContentResult> {
    return withFounderOsRepository(async (repository) => {
        const before = await repository.getApprovalForUpdate(approvalId);
        assertApprovalFound(before, approvalId);
        assertExpectedContentHash(before, expectedContentHash);

        if (
            before.action.status === 'EXECUTING'
            || isExecutionTerminalStatus(before.action.status)
        ) {
            throw new FounderOsError(
                'FOUNDER_OS_POLICY_BLOCKED',
                'Approval content is immutable after execution starts.',
                409
            );
        }

        const after = await repository.replaceApprovalContent(
            approvalId,
            payloadSummary,
            payload
        );
        const invalidated =
            before.action.contentHash !== after.action.contentHash
            && before.action.status !== 'DRAFT';

        if (invalidated) {
            assertApprovalTransition(
                before.action.status,
                after.action.status,
                { contentChanged: true }
            );
        }

        const supersededOutboxCount =
            before.action.contentHash === after.action.contentHash
                ? 0
                : await repository.supersedeHeldOutbox(
                    approvalId,
                    before.action.contentHash
                );

        await repository.appendAudit({
            actorType: 'founder',
            actorId: 'founder-session',
            action: invalidated
                ? 'approval.content_changed_and_invalidated'
                : 'approval.content_saved',
            entityType: 'approval_action',
            entityId: approvalId,
            requestId,
            beforeState: approvalAuditState(before),
            afterState: approvalAuditState(after),
            metadata: {
                invalidated,
                supersededOutboxCount,
            },
        });

        return {
            approval: after.action,
            invalidated,
            supersededOutboxCount,
        };
    }, { isolation: 'serializable' });
}

/**
 * Internal execution boundary. The caller must verify its provider connection
 * before claiming. This function mutates lifecycle/outbox state but performs no
 * provider request.
 */
export async function beginFounderApprovalExecution(
    input: unknown,
    options: {
        expectedChannel?: 'email';
        integrationVerified?: boolean;
    } = {}
): Promise<StoredApproval | FounderEmailExecutionClaim> {
    const parsed = executionStartInputSchema.parse(input);

    return withFounderOsRepository(async (repository) => {
        const staleAfterSecondsRaw = Number(
            process.env.FOUNDER_OS_EMAIL_STALE_EXECUTION_SECONDS ?? '900'
        );
        const staleAfterSeconds =
            Number.isInteger(staleAfterSecondsRaw)
            && staleAfterSecondsRaw >= 60
            && staleAfterSecondsRaw <= 86_400
                ? staleAfterSecondsRaw
                : 900;
        const quarantinedApprovalIds =
            await repository.quarantineStaleEmailExecutions(staleAfterSeconds);
        if (quarantinedApprovalIds.length > 0) {
            await repository.appendAudit({
                actorType: 'system',
                actorId: 'founder-os-email-executor',
                action: 'email.stale_executions_quarantined',
                entityType: 'workspace',
                entityId: 'default',
                requestId: parsed.requestId,
                metadata: {
                    approvalIds: quarantinedApprovalIds,
                    retryAutomatically: false,
                    reconcileOnly: true,
                },
            });
        }

        const before = await repository.getApprovalForUpdate(parsed.approvalId);
        assertApprovalFound(before, parsed.approvalId);
        assertExpectedContentHash(before, parsed.expectedContentHash);
        assertApprovalTransition(before.action.status, 'EXECUTING');
        if (
            options.expectedChannel
            && before.action.channel !== options.expectedChannel
        ) {
            throw new FounderOsError(
                'FOUNDER_OS_POLICY_BLOCKED',
                'Execution route does not match the approved action channel.',
                409
            );
        }

        if (before.isDemo) {
            throw new FounderOsError(
                'FOUNDER_OS_POLICY_BLOCKED',
                'Demo approvals can never execute.',
                409
            );
        }

        const settings = await repository.getSettingsForUpdate();
        if (!settings) {
            throw new FounderOsError(
                'FOUNDER_OS_NOT_PROVISIONED',
                'Founder OS settings are unavailable.',
                503
            );
        }

        const integrationKey =
            before.action.channel === 'email'
                ? 'hostinger-email'
                : before.action.channel === 'instagram'
                    ? 'meta'
                    : before.action.channel === 'tiktok'
                        ? 'tiktok'
                        : 'cloudflare-agent';
        const configuredEmailWasVerified =
            integrationKey === 'hostinger-email'
            && settings.integrations[integrationKey] === 'configured'
            && options.integrationVerified === true;
        if (
            settings.integrations[integrationKey] !== 'connected'
            && !configuredEmailWasVerified
        ) {
            throw new FounderOsError(
                'FOUNDER_OS_POLICY_BLOCKED',
                'Execution requires an empirically connected integration.',
                409,
                { integration: integrationKey }
            );
        }

        let emailClaim:
            | Pick<FounderEmailExecutionClaim, 'recipientEmail' | 'payload'>
            | null = null;
        if (before.action.channel === 'email') {
            if (
                before.action.actionType !== 'outreach-send'
                || !before.prospectId
            ) {
                throw new FounderOsError(
                    'FOUNDER_OS_POLICY_BLOCKED',
                    'Email execution requires an approved outreach action linked to a prospect.',
                    409
                );
            }
            const payload = founderEmailPayloadSchema.parse(before.payload);
            if (payload.prospectId !== before.prospectId) {
                throw new FounderOsError(
                    'FOUNDER_OS_POLICY_BLOCKED',
                    'Approved email payload does not match its prospect.',
                    409
                );
            }
            const contact = await repository.getProspectDeliveryContact(
                before.prospectId
            );
            if (
                !contact
                || (
                    contact.permission !== 'verified-opt-in'
                    && contact.permission !== 'public-business-email'
                )
                || contact.suppressed
                || !founderEmailAddressSchema.safeParse(contact.email).success
            ) {
                throw new FounderOsError(
                    'FOUNDER_OS_POLICY_BLOCKED',
                    'Recipient is missing, suppressed, malformed, or no longer has an approved contact basis.',
                    409,
                    {
                        prospectId: before.prospectId,
                        suppressed: contact?.suppressed ?? null,
                        contactPermission: contact?.permission ?? null,
                    }
                );
            }
            emailClaim = {
                recipientEmail: contact.email,
                payload,
            };
        }

        const outbox = await repository.getOutboxForUpdate(
            parsed.approvalId,
            parsed.expectedContentHash
        );
        if (!outbox || outbox.status !== 'held') {
            throw new FounderOsError(
                'FOUNDER_OS_CONFLICT',
                'A held idempotent outbox record is required before execution.',
                409
            );
        }

        const after = await repository.markExecutionStarted(
            parsed.approvalId,
            outbox.id
        );
        await repository.appendAudit({
            actorType: 'system',
            actorId: 'founder-os-worker',
            action: 'approval.execution_started',
            entityType: 'approval_action',
            entityId: parsed.approvalId,
            requestId: parsed.requestId,
            beforeState: approvalAuditState(before),
            afterState: approvalAuditState(after),
            metadata: {
                outboxId: outbox.id,
                providerCallPerformed: false,
            },
        });
        return emailClaim
            ? {
                approval: after,
                recipientEmail: emailClaim.recipientEmail,
                payload: emailClaim.payload,
            }
            : after;
    }, { isolation: 'serializable' });
}

export async function beginFounderEmailExecution(
    input: unknown
): Promise<FounderEmailExecutionClaim> {
    const claim = await beginFounderApprovalExecution(input, {
        expectedChannel: 'email',
        integrationVerified: true,
    });
    if (!('recipientEmail' in claim)) {
        throw new FounderOsError(
            'FOUNDER_OS_POLICY_BLOCKED',
            'Approved action did not produce an email execution claim.',
            409
        );
    }
    return claim;
}

/**
 * Internal reconciliation boundary only. UNKNOWN is terminal and is never
 * returned to a retry queue automatically.
 */
export async function recordFounderApprovalExecutionOutcome(
    input: unknown
): Promise<StoredApproval['action']> {
    const parsed = executionOutcomeInputSchema.parse(input);

    return withFounderOsRepository(async (repository) => {
        const before = await repository.getApprovalForUpdate(parsed.approvalId);
        assertApprovalFound(before, parsed.approvalId);
        assertApprovalTransition(before.action.status, parsed.status);

        const outbox = await repository.getOutboxForUpdate(
            parsed.approvalId,
            before.action.contentHash
        );
        if (!outbox || outbox.status !== 'processing') {
            throw new FounderOsError(
                'FOUNDER_OS_CONFLICT',
                'A processing outbox record is required to record an outcome.',
                409
            );
        }

        const providerReference =
            parsed.status === 'SUCCEEDED' ? parsed.providerReference : null;
        const failureReason =
            parsed.status === 'SUCCEEDED' ? null : parsed.failureReason;
        const after = await repository.markExecutionOutcome(
            parsed.approvalId,
            parsed.status,
            providerReference,
            failureReason,
            outbox.id
        );

        await repository.appendAudit({
            actorType: 'system',
            actorId: 'founder-os-worker',
            action: `approval.execution_${parsed.status.toLowerCase()}`,
            entityType: 'approval_action',
            entityId: parsed.approvalId,
            requestId: parsed.requestId,
            beforeState: approvalAuditState(before),
            afterState: approvalAuditState(after),
            metadata: {
                outboxId: outbox.id,
                retryEligible: parsed.status === 'FAILED',
                retryAutomatically: false,
                reconcileOnly: parsed.status === 'UNKNOWN',
            },
        });
        return after.action;
    }, { isolation: 'serializable' });
}
