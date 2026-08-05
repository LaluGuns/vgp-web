import { NextRequest } from 'next/server';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import {
    claimProviderExecution,
    consumeEligibleInboundReply,
    createProviderJob,
    listProviderConnectionSummaries,
} from '@/lib/founder-os/provider-storage';
import {
    providerExecutionInputSchema,
    providerIdSchema,
} from '@/lib/founder-os/providers/contracts';
import { executeClaimedProviderAction } from '@/lib/founder-os/providers/executor';
import {
    getMetaClient,
    getTikTokClient,
} from '@/lib/founder-os/providers/runtime';
import { providerExecutionStore } from '@/lib/founder-os/providers/storage-adapter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const unauthorized = await authorizeFounderOsRequest(request, true);
    if (unauthorized) return unauthorized;
    const requestId = getFounderOsRequestId(request);
    const providerResult = providerIdSchema.safeParse((await params).provider);
    const bodyResult = providerExecutionInputSchema.safeParse(await request.json());
    if (!providerResult.success || !bodyResult.success) {
        return founderOsJson(
            {
                success: false,
                error: 'Invalid provider execution request.',
                requestId,
            },
            { status: 400 }
        );
    }

    try {
        const provider = providerResult.data;
        const input = bodyResult.data;
        if (input.jobType === 'social_reply' && provider !== 'meta') {
            return founderOsJson(
                {
                    success: false,
                    error: 'Cold or outbound TikTok messages are not supported.',
                    requestId,
                },
                { status: 409 }
            );
        }

        let inboundClaim:
            | Awaited<ReturnType<typeof consumeEligibleInboundReply>>
            | undefined;
        let connectionId: string;
        if (input.jobType === 'social_reply') {
            inboundClaim = await consumeEligibleInboundReply({
                provider,
                providerEventId: input.providerEventId,
                recipientScopedId: input.recipientScopedId,
                approvalId: input.approvalId,
                expectedContentHash: input.expectedContentHash,
                requestId,
            });
            connectionId = inboundClaim.connectionId;
        } else {
            const connections = await listProviderConnectionSummaries(provider);
            const connected = connections.filter(
                (candidate) => candidate.status === 'connected'
            );
            if (connected.length !== 1) {
                return founderOsJson(
                    {
                        success: false,
                        error: connected.length === 0
                            ? 'Provider is not connected.'
                            : 'Execution requires exactly one active provider account.',
                        requestId,
                    },
                    { status: 409 }
                );
            }
            connectionId = connected[0].id;
        }

        const idempotencyKey = [
            'provider-action',
            provider,
            input.approvalId,
            input.expectedContentHash,
        ].join(':');
        const job = await createProviderJob({
            provider,
            connectionId,
            jobType: input.jobType,
            approvalId: input.approvalId,
            approvalContentHash: input.expectedContentHash,
            inboundEventId: inboundClaim?.inboundEventId ?? null,
            idempotencyKey,
            requestPayload: {},
            maxAttempts: 1,
            requestId,
        });
        const claim = await claimProviderExecution({
            jobId: job.id,
            workerId: 'founder-os-explicit-provider-route',
            expectedContentHash: input.expectedContentHash,
            requestId,
        });
        const result = await executeClaimedProviderAction(
            claim,
            requestId,
            providerExecutionStore,
            {
                meta: getMetaClient(),
                tiktok: getTikTokClient(),
            },
            inboundClaim
        );

        return founderOsJson({
            success: result.status === 'SUCCEEDED',
            jobId: job.id,
            status: result.status,
            providerReference: result.providerReference,
            errorCode: result.errorCode,
            requestId,
        });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
