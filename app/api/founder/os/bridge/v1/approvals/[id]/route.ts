import { NextRequest } from 'next/server';
import { founderOsJson } from '@/lib/founder-os/http';
import { bridgeApprovalIdSchema } from '@/lib/founder-os/bridge/contracts';
import { handleFounderOsBridgeRequest } from '@/lib/founder-os/bridge/http';
import { getFounderOsBridgeApproval } from '@/lib/founder-os/bridge/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'approvals.read', scope: 'bridge:read', rateClass: 'read' },
        async ({ requestId }) => {
            const id = bridgeApprovalIdSchema.safeParse((await params).id);
            if (!id.success) {
                return founderOsJson(
                    { success: false, error: 'Invalid approval ID.', requestId },
                    { status: 400 }
                );
            }
            const approval = await getFounderOsBridgeApproval(id.data);
            if (!approval) {
                return founderOsJson(
                    { success: false, error: 'Approval was not found.', requestId },
                    { status: 404 }
                );
            }
            return founderOsJson({ success: true, approval, requestId });
        }
    );
}
