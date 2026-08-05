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
    revokeProviderConnection,
} from '@/lib/founder-os/provider-storage';
import { providerIdSchema } from '@/lib/founder-os/providers/contracts';
import {
    getMetaClient,
    getTikTokClient,
    normalizeConnectionSummary,
} from '@/lib/founder-os/providers/runtime';

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
    if (!providerResult.success) {
        return founderOsJson(
            { success: false, error: 'Unsupported provider.', requestId },
            { status: 404 }
        );
    }

    try {
        const provider = providerResult.data;
        const connections = await listProviderConnectionSummaries(provider);
        const connected = connections.filter(
            (candidate) => candidate.status === 'connected'
        );
        if (connected.length !== 1) {
            return founderOsJson(
                {
                    success: false,
                    error: connected.length === 0
                        ? 'Connected provider account not found.'
                        : 'Disconnect requires exactly one active provider account.',
                    requestId,
                },
                { status: connected.length === 0 ? 404 : 409 }
            );
        }
        const connection = connected[0];
        const credentials = await loadProviderCredentialsForServer(connection.id);

        // Explicit founder-initiated OAuth revocation. Social content and message
        // writes use the separate approval/outbox execution boundary.
        if (provider === 'meta') {
            await getMetaClient().revoke(credentials.accessToken);
        } else {
            await getTikTokClient().revoke(credentials.accessToken);
        }
        const revoked = await revokeProviderConnection({
            connectionId: connection.id,
            requestId,
        });
        return founderOsJson({
            success: true,
            provider: normalizeConnectionSummary(revoked),
            requestId,
        });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
