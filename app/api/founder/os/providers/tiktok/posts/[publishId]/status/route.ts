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
const SAFE_PROVIDER_ID = /^[A-Za-z0-9._~-]{1,256}$/;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ publishId: string }> }
) {
    const unauthorized = await authorizeFounderOsRequest(request, false);
    if (unauthorized) return unauthorized;
    const requestId = getFounderOsRequestId(request);
    const publishId = (await params).publishId;
    if (!SAFE_PROVIDER_ID.test(publishId)) {
        return founderOsJson(
            { success: false, error: 'Invalid publish ID.', requestId },
            { status: 400 }
        );
    }
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
        const status = await getTikTokClient().getPostStatus(
            combineCredentials(summary, decrypted),
            publishId
        );
        return founderOsJson({ success: true, status, requestId });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
