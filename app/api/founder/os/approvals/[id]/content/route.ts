import { NextRequest } from 'next/server';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import { replaceFounderApprovalContent } from '@/lib/founder-os/service';
import {
    approvalContentInputSchema,
    founderOsEntityIdSchema,
} from '@/lib/founder-os/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const unauthorized = await authorizeFounderOsRequest(request, true);
    if (unauthorized) return unauthorized;

    const requestId = getFounderOsRequestId(request);
    try {
        const idResult = founderOsEntityIdSchema.safeParse((await params).id);
        const bodyResult = approvalContentInputSchema.safeParse(
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
                        ?? 'Invalid approval content.',
                    requestId,
                },
                { status: 400 }
            );
        }

        const result = await replaceFounderApprovalContent(
            idResult.data,
            bodyResult.data.expectedContentHash,
            bodyResult.data.payloadSummary,
            bodyResult.data.payload,
            requestId
        );
        return founderOsJson({ success: true, ...result, requestId });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
