import { NextRequest } from 'next/server';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import { listProviderConnectionSummaries } from '@/lib/founder-os/provider-storage';
import {
    normalizeConnectionSummary,
} from '@/lib/founder-os/providers/runtime';
import { buildProviderStatus } from '@/lib/founder-os/providers/status';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const unauthorized = await authorizeFounderOsRequest(request, false);
    if (unauthorized) return unauthorized;
    const requestId = getFounderOsRequestId(request);

    try {
        const summaries = await listProviderConnectionSummaries();
        const preferred = (provider: 'meta' | 'tiktok') => {
            const matches = summaries.filter((summary) => summary.provider === provider);
            return matches.find((summary) => summary.status === 'connected')
                ?? matches[0]
                ?? null;
        };
        const meta = preferred('meta');
        const tiktok = preferred('tiktok');

        return founderOsJson({
            success: true,
            providers: {
                meta: buildProviderStatus(
                    'meta',
                    meta ? normalizeConnectionSummary(meta) : null
                ),
                tiktok: buildProviderStatus(
                    'tiktok',
                    tiktok ? normalizeConnectionSummary(tiktok) : null
                ),
            },
            requestId,
        });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
