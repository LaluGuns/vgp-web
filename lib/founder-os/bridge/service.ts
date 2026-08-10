import { createHash } from 'node:crypto';
import { searchCustomGptCatalog } from '../gpt-action-catalog';
import {
    createCustomGptDraft,
    createCustomGptProspect,
    getCustomGptBrief,
    transitionFounderApproval,
    type FounderOsAutomationActor,
} from '../service';
import {
    listProviderConnectionSummaries,
    loadProviderCredentialsForServer,
} from '../provider-storage';
import { buildProviderStatus } from '../providers/status';
import {
    combineCredentials,
    getMetaClient,
    getTikTokClient,
    normalizeConnectionSummary,
} from '../providers/runtime';
import type { ProviderId } from '../providers/contracts';
import type { CustomGptDraftInput } from '../validation';
import type { CustomGptProspectInput } from '../leads/action-validation';
import {
    getBridgeApproval,
    listBridgeApprovals,
} from './repository';

const BRIDGE_ACTOR: FounderOsAutomationActor = {
    actorId: 'bridge:codex-plugin',
    auditNamespace: 'bridge',
    draftIdPrefix: 'bridge-draft',
    prospectIdPrefix: 'bridge-lead',
};

export async function getFounderOsBridgeBrief() {
    const brief = await getCustomGptBrief();
    return {
        ...brief,
        safetyPolicy: {
            bridgeCanApprove: false,
            bridgeCanExecute: false,
            bridgeCanPerformExternalWrites: false,
            everyExternalActionRequiresFounderApproval: true,
            coldSocialDmAllowed: false,
        },
    };
}

export function searchFounderOsBridgeCatalog(query: string, limit: number) {
    return searchCustomGptCatalog(query, limit);
}

export async function searchFounderOsBridgeProspects(input: {
    query: string;
    segment?: string;
    market?: string;
    platform?: string;
    limit: number;
}) {
    const brief = await getCustomGptBrief();
    const query = input.query.toLowerCase();
    return brief.prospects
        .filter((prospect) =>
            (!input.segment || prospect.segment === input.segment)
            && (!input.market || prospect.market === input.market)
            && (!input.platform || prospect.platform === input.platform)
            && (
                !query
                || [
                    prospect.displayName,
                    prospect.handle ?? '',
                    prospect.segment,
                    prospect.market,
                    prospect.platform,
                    ...prospect.signals,
                    ...prospect.gaps,
                ].join(' ').toLowerCase().includes(query)
            )
        )
        .slice(0, input.limit);
}

export async function createFounderOsBridgeProspect(
    input: CustomGptProspectInput,
    requestId: string
) {
    return createCustomGptProspect(input, requestId, BRIDGE_ACTOR);
}

export async function createFounderOsBridgeDraft(
    input: CustomGptDraftInput,
    requestId: string
) {
    return createCustomGptDraft(input, requestId, BRIDGE_ACTOR);
}

export async function listFounderOsBridgeDrafts(limit: number) {
    return listBridgeApprovals({ status: 'DRAFT', limit });
}

export async function listFounderOsBridgeApprovals(input: {
    status?: Parameters<typeof listBridgeApprovals>[0]['status'];
    limit: number;
}) {
    return listBridgeApprovals(input);
}

export async function getFounderOsBridgeApproval(approvalId: string) {
    return getBridgeApproval(approvalId);
}

export async function requestFounderOsBridgeReview(
    approvalId: string,
    expectedContentHash: string,
    requestId: string,
    idempotencyKey: string
) {
    return transitionFounderApproval(
        approvalId,
        'READY_FOR_APPROVAL',
        expectedContentHash,
        requestId,
        {
            actorType: 'system',
            actorId: 'bridge:codex-plugin',
            auditAction: 'bridge.approval.ready_for_review',
            auditMetadata: {
                idempotencyKeyHash: createHash('sha256')
                    .update(idempotencyKey, 'utf8')
                    .digest('hex'),
            },
            allowExactReplay: true,
        }
    );
}

export async function getFounderOsBridgeProviderHealth() {
    const summaries = await listProviderConnectionSummaries();
    const preferred = (provider: ProviderId) => {
        const matches = summaries.filter((summary) => summary.provider === provider);
        return matches.find((summary) => summary.status === 'connected')
            ?? matches[0]
            ?? null;
    };
    const statusFor = (provider: ProviderId) => {
        const summary = preferred(provider);
        const normalized = summary ? normalizeConnectionSummary(summary) : null;
        const status = buildProviderStatus(
            provider,
            normalized
        );
        const tokenFreshness = !normalized?.tokenPresent
            ? 'missing'
            : !normalized.expiresAt
                ? 'unknown'
                : new Date(normalized.expiresAt).getTime() > Date.now()
                    ? 'fresh'
                    : 'expired';
        return {
            status: status.status,
            configured: status.configured,
            connected: normalized?.status === 'connected',
            authorized: normalized?.status === 'connected'
                ? normalized.grantedScopes.length > 0
                : false,
            accountLabel: status.accountLabel,
            scopes: normalized?.grantedScopes ?? [],
            tokenFreshness,
            webhook: provider === 'meta'
                ? process.env.META_WEBHOOK_VERIFY_TOKEN
                    ? 'configured-not-live-verified'
                    : 'not-configured'
                : 'not-implemented',
            lastCheckedAt: status.lastCheckedAt,
            error: status.error,
            capabilities: status.capabilities,
        };
    };
    const unsupported = (label: string) => ({
        label,
        adapterState: 'not-implemented' as const,
        configured: null,
        connected: null,
        authorized: null,
        scopes: [],
        tokenFreshness: 'unknown' as const,
        webhook: 'unknown' as const,
        lastCheckedAt: null,
        error: null,
        note: 'No Founder OS Bridge adapter is implemented; readiness is unknown.',
    });
    return {
        meta: statusFor('meta'),
        tiktok: statusFor('tiktok'),
        googleSearchConsole: unsupported('Google Search Console'),
        posthog: unsupported('PostHog'),
        vercel: unsupported('Vercel'),
    };
}

export async function getFounderOsBridgeProviderAnalytics(provider: ProviderId) {
    const summaries = await listProviderConnectionSummaries(provider);
    const summary = summaries.find((candidate) => candidate.status === 'connected');
    if (!summary) return null;

    const decrypted = await loadProviderCredentialsForServer(summary.id);
    const credentials = combineCredentials(summary, decrypted);
    const analytics = provider === 'meta'
        ? await getMetaClient().getOwnedAnalytics(credentials)
        : await getTikTokClient().getOwnedAnalytics(credentials);
    return {
        provider: analytics.provider,
        observedAt: analytics.observedAt,
        account: analytics.account,
        content: analytics.content,
        nextCursor: analytics.nextCursor,
    };
}
