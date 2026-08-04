import { NextRequest } from 'next/server';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import { founderOsService } from '@/lib/founder-os/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const unauthorized = await authorizeFounderOsRequest(request, false);
    if (unauthorized) return unauthorized;

    const requestId = getFounderOsRequestId(request);
    try {
        const snapshot = await founderOsService.getSnapshot();
        return founderOsJson({ success: true, snapshot, requestId });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
