import { NextRequest } from 'next/server';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import { activateFounderOsLiveWorkspace } from '@/lib/founder-os/service';
import { activateLiveWorkspaceInputSchema } from '@/lib/founder-os/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const unauthorized = await authorizeFounderOsRequest(request, true);
    if (unauthorized) return unauthorized;
    const requestId = getFounderOsRequestId(request);

    if (process.env.FOUNDER_OS_ENABLE_DATABASE !== 'true') {
        return founderOsJson(
            {
                success: false,
                code: 'FOUNDER_OS_DATABASE_DISABLED',
                error: 'Founder OS database access is disabled.',
                requestId,
            },
            { status: 503 }
        );
    }

    try {
        const parsed = activateLiveWorkspaceInputSchema.safeParse(
            await request.json()
        );
        if (!parsed.success) {
            return founderOsJson(
                {
                    success: false,
                    code: 'LIVE_ACTIVATION_CONFIRMATION_REQUIRED',
                    error: 'Type ACTIVATE_LIVE_WORKSPACE to remove synthetic demo rows.',
                    requestId,
                },
                { status: 400 }
            );
        }
        const result = await activateFounderOsLiveWorkspace(requestId);
        return founderOsJson({ success: true, result, requestId });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
