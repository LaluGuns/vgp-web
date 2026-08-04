import { z } from 'zod';
import {
    providerActionPayloadSchema,
    type ClaimedProviderExecution,
    type ProviderActionResult,
    type ProviderCredentials,
    type ProviderId,
} from './contracts';
import { ProviderRequestError, safeProviderCode } from './http';
import type { MetaProviderClient } from './meta';
import type { TikTokProviderClient } from './tiktok';

export interface ProviderExecutionStore {
    loadCredentials(connectionId: string): Promise<ProviderCredentials>;
    recordOutcome(input: {
        jobId: string;
        status: 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
        providerReference?: string;
        failureReason?: string;
        outcome?: Record<string, string | number | boolean | null>;
        requestId: string;
    }): Promise<void>;
}

export interface ProviderClients {
    meta: MetaProviderClient;
    tiktok: TikTokProviderClient;
}

function assertClaimMatchesPayload(
    claim: ClaimedProviderExecution,
    operation: string
): void {
    const expectedProvider: ProviderId = operation.startsWith('meta.')
        ? 'meta'
        : 'tiktok';
    const expectedChannel = expectedProvider === 'meta' ? 'instagram' : 'tiktok';
    const expectedActionType = operation === 'meta.inbound.reply'
        ? 'social-reply'
        : 'social-publish';

    if (
        claim.provider !== expectedProvider
        || claim.approval.channel !== expectedChannel
        || claim.approval.actionType !== expectedActionType
        || !/^sha256:[0-9a-f]{64}$/.test(claim.approval.contentHash)
    ) {
        throw new ProviderRequestError('Approved action does not match provider operation.', {
            providerCode: 'APPROVAL_OPERATION_MISMATCH',
        });
    }
}

export async function executeClaimedProviderAction(
    claim: ClaimedProviderExecution,
    requestId: string,
    store: ProviderExecutionStore,
    clients: ProviderClients,
    inboundClaim?: {
        connectionId: string;
        providerEventId: string;
        recipientScopedId: string;
        approvalId: string;
    }
): Promise<{
    status: 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
    providerReference: string | null;
    errorCode: string | null;
}> {
    let result: ProviderActionResult | null = null;

    try {
        const payload = providerActionPayloadSchema.parse(claim.approval.payload);
        assertClaimMatchesPayload(claim, payload.operation);
        const credentials = await store.loadCredentials(claim.connectionId);
        if (credentials.provider !== claim.provider) {
            throw new ProviderRequestError('Connection provider does not match action.', {
                providerCode: 'CONNECTION_PROVIDER_MISMATCH',
            });
        }

        switch (payload.operation) {
            case 'meta.reel.create-container':
                result = await clients.meta.createReelContainer(credentials, {
                    videoUrl: payload.videoUrl,
                    caption: payload.caption,
                    shareToFeed: payload.shareToFeed,
                });
                break;
            case 'meta.reel.publish':
                result = await clients.meta.publishReel(
                    credentials,
                    payload.creationId
                );
                break;
            case 'meta.inbound.reply': {
                if (
                    !inboundClaim
                    || inboundClaim.connectionId !== claim.connectionId
                    || inboundClaim.approvalId !== claim.approval.id
                    || inboundClaim.providerEventId !== payload.providerEventId
                    || inboundClaim.recipientScopedId !== payload.recipientScopedId
                ) {
                    throw new ProviderRequestError('Approved reply does not match inbound claim.', {
                        providerCode: 'INBOUND_CLAIM_MISMATCH',
                    });
                }
                result = await clients.meta.replyToInbound(
                    credentials,
                    payload.recipientScopedId,
                    payload.text
                );
                break;
            }
            case 'tiktok.draft.init':
                result = await clients.tiktok.initDraft(
                    credentials,
                    payload.source.videoUrl
                );
                break;
            case 'tiktok.direct-post.init':
                result = await clients.tiktok.initDirectPost(credentials, {
                    videoUrl: payload.source.videoUrl,
                    title: payload.title,
                    privacyLevel: payload.privacyLevel,
                    allowComment: payload.allowComment,
                    allowDuet: payload.allowDuet,
                    allowStitch: payload.allowStitch,
                    brandContent: payload.brandContent,
                    brandOrganic: payload.brandOrganic,
                    isAiGenerated: payload.isAiGenerated,
                });
                break;
        }

        await store.recordOutcome({
            jobId: claim.jobId,
            status: 'SUCCEEDED',
            providerReference: result.providerReference,
            outcome: result.detail,
            requestId,
        });
        return {
            status: 'SUCCEEDED',
            providerReference: result.providerReference,
            errorCode: null,
        };
    } catch (error) {
        const ambiguous =
            result !== null
            || (error instanceof ProviderRequestError && error.ambiguous);
        const status = ambiguous ? 'UNKNOWN' : 'FAILED';
        const errorCode = result !== null
            ? 'OUTCOME_PERSISTENCE_FAILED'
            : error instanceof ProviderRequestError
            ? error.providerCode
            : error instanceof z.ZodError
                ? 'INVALID_APPROVED_PAYLOAD'
                : safeProviderCode(
                    typeof error === 'object' && error !== null && 'code' in error
                        ? (error as { code?: unknown }).code
                        : 'UNCLASSIFIED'
                );
        const failureReason = status === 'UNKNOWN'
            ? `Provider outcome unknown (${errorCode}); manual reconciliation required`
            : `Provider action failed before a conclusive write (${errorCode})`;

        await store.recordOutcome({
            jobId: claim.jobId,
            status,
            failureReason,
            requestId,
        });
        return {
            status,
            providerReference: null,
            errorCode,
        };
    }
}
