import { NextRequest } from 'next/server';
import { founderOsJson } from '@/lib/founder-os/http';
import { bridgeAuditQuerySchema } from '@/lib/founder-os/bridge/contracts';
import { handleFounderOsBridgeRequest } from '@/lib/founder-os/bridge/http';
import { listBridgeAudit } from '@/lib/founder-os/bridge/repository';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'audit.list', scope: 'bridge:read', rateClass: 'read' },
        async ({ requestId }) => {
            const parsed = bridgeAuditQuerySchema.safeParse(
                Object.fromEntries(request.nextUrl.searchParams)
            );
            if (!parsed.success) {
                return founderOsJson(
                    { success: false, error: 'Invalid audit query.', requestId },
                    { status: 400 }
                );
            }
            const audit = await listBridgeAudit(parsed.data);
            return founderOsJson({ success: true, ...audit, requestId });
        }
    );
}
