import { NextRequest } from 'next/server';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import {
    listProviderConnectionSummaries,
    loadProviderCredentialsForServer,
} from '@/lib/founder-os/provider-storage';
import {
    combineCredentials,
    getTikTokClient,
} from '@/lib/founder-os/providers/runtime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const unauthorized = await authorizeFounderOsRequest(request, false);
    if (unauthorized) return unauthorized;
    const requestId = getFounderOsRequestId(request);
    try {
        const summaries = await listProviderConnectionSummaries('tiktok');
        const summary = summaries.find((item) => item.status === 'connected');
        if (!summary) {
            return founderOsJson(
                { success: false, error: 'TikTok is not connected.', requestId },
                { status: 409 }
            );
        }
        const decrypted = await loadProviderCredentialsForServer(summary.id);
        const creator = await getTikTokClient().getCreatorInfo(
            combineCredentials(summary, decrypted)
        );
        return founderOsJson({ success: true, creator, requestId });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
