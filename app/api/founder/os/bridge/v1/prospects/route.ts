import { NextRequest } from 'next/server';
import { founderOsJson } from '@/lib/founder-os/http';
import {
    bridgeProspectInputSchema,
    bridgeProspectSearchQuerySchema,
} from '@/lib/founder-os/bridge/contracts';
import { handleFounderOsBridgeRequest } from '@/lib/founder-os/bridge/http';
import {
    createFounderOsBridgeProspect,
    searchFounderOsBridgeProspects,
} from '@/lib/founder-os/bridge/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'prospects.search', scope: 'bridge:read', rateClass: 'read' },
        async ({ requestId }) => {
            const parsed = bridgeProspectSearchQuerySchema.safeParse(
                Object.fromEntries(request.nextUrl.searchParams)
            );
            if (!parsed.success) {
                return founderOsJson(
                    { success: false, error: 'Invalid prospect query.', requestId },
                    { status: 400 }
                );
            }
            const prospects = await searchFounderOsBridgeProspects(parsed.data);
            return founderOsJson({
                success: true,
                prospects,
                resultCount: prospects.length,
                requestId,
            });
        }
    );
}
export async function POST(request: NextRequest) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'prospects.create', scope: 'bridge:draft', rateClass: 'draft' },
        async ({ requestId }) => {
            const parsed = bridgeProspectInputSchema.safeParse(
                await request.json().catch(() => null)
            );
            if (!parsed.success) {
                return founderOsJson(
                    { success: false, error: 'Prospect handoff is invalid.', requestId },
                    { status: 400 }
                );
            }
            const result = await createFounderOsBridgeProspect(parsed.data, requestId);
            return founderOsJson(
                { success: true, result, requestId },
                { status: result.created ? 201 : 200 }
            );
        }
    );
}
