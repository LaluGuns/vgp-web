import { NextRequest } from 'next/server';
import { founderOsJson } from '@/lib/founder-os/http';
import { FOUNDER_OS_BRIDGE_VERSION } from '@/lib/founder-os/bridge/contracts';
import { handleFounderOsBridgeRequest } from '@/lib/founder-os/bridge/http';
import { getFounderOsBridgeBrief } from '@/lib/founder-os/bridge/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'brief.read', scope: 'bridge:read', rateClass: 'read' },
        async ({ requestId }) => founderOsJson({
            success: true,
            bridgeVersion: FOUNDER_OS_BRIDGE_VERSION,
            brief: await getFounderOsBridgeBrief(),
            requestId,
        })
    );
}
