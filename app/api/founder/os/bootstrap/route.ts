import { NextRequest } from 'next/server';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import {
    bootstrapFounderOsDemo,
    founderOsService,
} from '@/lib/founder-os/service';
import { demoBootstrapInputSchema } from '@/lib/founder-os/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const unauthorized = await authorizeFounderOsRequest(request, false);
    if (unauthorized) return unauthorized;

    const requestId = getFounderOsRequestId(request);
    try {
        const status = await founderOsService.getProvisioningStatus();
        return founderOsJson({ success: true, status, requestId });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}

export async function POST(request: NextRequest) {
    const unauthorized = await authorizeFounderOsRequest(request, true);
    if (unauthorized) return unauthorized;

    const requestId = getFounderOsRequestId(request);
    try {
        const parsed = demoBootstrapInputSchema.safeParse(await request.json());
        if (!parsed.success) {
            return founderOsJson(
                {
                    success: false,
                    error: parsed.error.issues[0]?.message ?? 'Invalid bootstrap request.',
                    requestId,
                },
                { status: 400 }
            );
        }

        const result = await bootstrapFounderOsDemo(requestId);
        return founderOsJson(
            { success: true, bootstrap: result, requestId },
            { status: result.created ? 201 : 200 }
        );
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
