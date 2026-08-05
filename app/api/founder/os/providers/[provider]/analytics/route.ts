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
import { providerIdSchema } from '@/lib/founder-os/providers/contracts';
import {
    combineCredentials,
    getMetaClient,
    getTikTokClient,
} from '@/lib/founder-os/providers/runtime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const unauthorized = await authorizeFounderOsRequest(request, false);
    if (unauthorized) return unauthorized;
    const requestId = getFounderOsRequestId(request);
    const providerResult = providerIdSchema.safeParse((await params).provider);
    if (!providerResult.success) {
        return founderOsJson(
            { success: false, error: 'Unsupported provider.', requestId },
            { status: 404 }
        );
    }

    try {
        const provider = providerResult.data;
        const summaries = await listProviderConnectionSummaries(provider);
        const summary = summaries.find(
            (candidate) => candidate.status === 'connected'
        );
        if (!summary) {
            return founderOsJson(
                {
                    success: false,
                    error: 'Provider is not connected.',
                    requestId,
                },
                { status: 409 }
            );
        }
        const decrypted = await loadProviderCredentialsForServer(summary.id);
        const credentials = combineCredentials(summary, decrypted);
        const analytics = provider === 'meta'
            ? await getMetaClient().getOwnedAnalytics(credentials)
            : await getTikTokClient().getOwnedAnalytics(credentials);
        return founderOsJson({ success: true, analytics, requestId });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
