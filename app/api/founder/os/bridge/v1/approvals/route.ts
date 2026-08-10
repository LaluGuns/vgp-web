import { NextRequest } from 'next/server';
import { founderOsJson } from '@/lib/founder-os/http';
import { bridgeApprovalListQuerySchema } from '@/lib/founder-os/bridge/contracts';
import { handleFounderOsBridgeRequest } from '@/lib/founder-os/bridge/http';
import { listFounderOsBridgeApprovals } from '@/lib/founder-os/bridge/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'approvals.list', scope: 'bridge:read', rateClass: 'read' },
        async ({ requestId }) => {
            const parsed = bridgeApprovalListQuerySchema.safeParse(
                Object.fromEntries(request.nextUrl.searchParams)
            );
            if (!parsed.success) {
                return founderOsJson(
                    { success: false, error: 'Invalid approval query.', requestId },
                    { status: 400 }
                );
            }
            const approvals = await listFounderOsBridgeApprovals(parsed.data);
            return founderOsJson({
                success: true,
                approvals,
                resultCount: approvals.length,
                requestId,
            });
        }
    );
}
