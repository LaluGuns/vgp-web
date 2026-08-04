import { NextRequest } from 'next/server';
import { authorizeCustomGptAction } from '@/lib/founder-os/gpt-action-auth';
import { searchCustomGptCatalog } from '@/lib/founder-os/gpt-action-catalog';
import {
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const requestId = getFounderOsRequestId(request);
    const auth = authorizeCustomGptAction(request.headers);
    if (!auth.ok) {
        return founderOsJson(
            {
                success: false,
                code: auth.code,
                error: auth.code === 'NOT_CONFIGURED'
                    ? 'Custom GPT Actions are not configured.'
                    : 'Unauthorized.',
                requestId,
            },
            {
                status: auth.status,
                headers: auth.status === 401
                    ? { 'WWW-Authenticate': 'Bearer realm="Founder OS Custom GPT"' }
                    : undefined,
            }
        );
    }

    const query = request.nextUrl.searchParams.get('query')?.trim() ?? '';
    if (query.length > 200) {
        return founderOsJson(
            {
                success: false,
                code: 'INVALID_CATALOG_QUERY',
                error: 'Catalog query must be 200 characters or shorter.',
                requestId,
            },
            { status: 400 }
        );
    }
    const requestedLimit = Number(
        request.nextUrl.searchParams.get('limit') ?? '10'
    );
    const limit = Number.isInteger(requestedLimit)
        ? Math.min(Math.max(requestedLimit, 1), 20)
        : 10;
    const matches = searchCustomGptCatalog(query, limit);
    return founderOsJson({
        success: true,
        query,
        matches,
        resultCount: matches.length,
        requestId,
    });
}
