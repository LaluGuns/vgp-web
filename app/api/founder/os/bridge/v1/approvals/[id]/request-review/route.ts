import { NextRequest } from 'next/server';
import { founderOsJson } from '@/lib/founder-os/http';
import {
    bridgeApprovalIdSchema,
    bridgeIdempotencyKeySchema,
    bridgeRequestReviewInputSchema,
} from '@/lib/founder-os/bridge/contracts';
import { handleFounderOsBridgeRequest } from '@/lib/founder-os/bridge/http';
import { requestFounderOsBridgeReview } from '@/lib/founder-os/bridge/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleFounderOsBridgeRequest(
        request,
        {
            operation: 'approvals.request_review',
            scope: 'bridge:request-review',
            rateClass: 'request-review',
        },
        async ({ requestId }) => {
            const id = bridgeApprovalIdSchema.safeParse((await params).id);
            const idempotencyKey = bridgeIdempotencyKeySchema.safeParse(
                request.headers.get('idempotency-key')
            );
            const body = bridgeRequestReviewInputSchema.safeParse(
                await request.json().catch(() => null)
            );
            if (!id.success || !idempotencyKey.success || !body.success) {
                return founderOsJson(
                    { success: false, error: 'Invalid review request.', requestId },
                    { status: 400 }
                );
            }
            const result = await requestFounderOsBridgeReview(
                id.data,
                body.data.expectedContentHash,
                requestId,
                idempotencyKey.data
            );
            return founderOsJson({ success: true, ...result, requestId });
        }
    );
}
