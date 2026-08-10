import { NextRequest } from 'next/server';
import { founderOsJson } from '@/lib/founder-os/http';
import { bridgeCatalogQuerySchema } from '@/lib/founder-os/bridge/contracts';
import { handleFounderOsBridgeRequest } from '@/lib/founder-os/bridge/http';
import { searchFounderOsBridgeCatalog } from '@/lib/founder-os/bridge/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'catalog.search', scope: 'bridge:read', rateClass: 'read' },
        ({ requestId }) => {
            const parsed = bridgeCatalogQuerySchema.safeParse(
                Object.fromEntries(request.nextUrl.searchParams)
            );
            if (!parsed.success) {
                return founderOsJson(
                    { success: false, error: 'Invalid catalog query.', requestId },
                    { status: 400 }
                );
            }
            const matches = searchFounderOsBridgeCatalog(
                parsed.data.query,
                parsed.data.limit
            );
            return founderOsJson({
                success: true,
                query: parsed.data.query,
                matches,
                resultCount: matches.length,
                requestId,
            });
        }
    );
}
