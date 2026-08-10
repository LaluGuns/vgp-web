import { NextRequest } from 'next/server';
import { founderOsJson } from '@/lib/founder-os/http';
import {
    bridgeApprovalListQuerySchema,
    bridgeDraftInputSchema,
} from '@/lib/founder-os/bridge/contracts';
import { handleFounderOsBridgeRequest } from '@/lib/founder-os/bridge/http';
import {
    createFounderOsBridgeDraft,
    listFounderOsBridgeDrafts,
} from '@/lib/founder-os/bridge/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'drafts.list', scope: 'bridge:read', rateClass: 'read' },
        async ({ requestId }) => {
            const parsed = bridgeApprovalListQuerySchema
                .pick({ limit: true })
                .safeParse(Object.fromEntries(request.nextUrl.searchParams));
            if (!parsed.success) {
                return founderOsJson(
                    { success: false, error: 'Invalid draft query.', requestId },
                    { status: 400 }
                );
            }
            const drafts = await listFounderOsBridgeDrafts(parsed.data.limit);
            return founderOsJson({
                success: true,
                drafts,
                resultCount: drafts.length,
                requestId,
            });
        }
    );
}
export async function POST(request: NextRequest) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'drafts.create', scope: 'bridge:draft', rateClass: 'draft' },
        async ({ requestId }) => {
            const parsed = bridgeDraftInputSchema.safeParse(
                await request.json().catch(() => null)
            );
            if (!parsed.success) {
                return founderOsJson(
                    { success: false, error: 'Draft request is invalid.', requestId },
                    { status: 400 }
                );
            }
            const draft = await createFounderOsBridgeDraft(parsed.data, requestId);
            return founderOsJson(
                { success: true, draft, requestId },
                { status: draft.created ? 201 : 200 }
            );
        }
    );
}
