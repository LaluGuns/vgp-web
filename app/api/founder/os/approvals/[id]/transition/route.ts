import { NextRequest } from 'next/server';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import { transitionFounderApproval } from '@/lib/founder-os/service';
import {
    approvalTransitionInputSchema,
    founderOsEntityIdSchema,
} from '@/lib/founder-os/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const unauthorized = await authorizeFounderOsRequest(request, true);
    if (unauthorized) return unauthorized;

    const requestId = getFounderOsRequestId(request);
    try {
        const idResult = founderOsEntityIdSchema.safeParse((await params).id);
        const bodyResult = approvalTransitionInputSchema.safeParse(
            await request.json()
        );
        if (!idResult.success) {
            return founderOsJson(
                {
                    success: false,
                    error: idResult.error.issues[0]?.message ?? 'Invalid approval ID.',
                    requestId,
                },
                { status: 400 }
            );
        }
        if (!bodyResult.success) {
            return founderOsJson(
                {
                    success: false,
                    error:
                        bodyResult.error.issues[0]?.message
                        ?? 'Invalid approval transition.',
                    requestId,
                },
                { status: 400 }
            );
        }

        const result = await transitionFounderApproval(
            idResult.data,
            bodyResult.data.targetStatus,
            bodyResult.data.expectedContentHash,
            requestId
        );
        return founderOsJson({ success: true, ...result, requestId });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
