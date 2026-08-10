import { NextRequest } from 'next/server';
import { founderOsJson } from '@/lib/founder-os/http';
import { handleFounderOsBridgeRequest } from '@/lib/founder-os/bridge/http';
import { getFounderOsBridgeProviderHealth } from '@/lib/founder-os/bridge/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'providers.health', scope: 'bridge:read', rateClass: 'read' },
        async ({ requestId }) => founderOsJson({
            success: true,
            providers: await getFounderOsBridgeProviderHealth(),
            requestId,
        })
    );
}
