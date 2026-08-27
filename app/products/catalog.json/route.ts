import { NextResponse } from 'next/server';
import { vgpProductCatalogJson } from '@/lib/ai-discovery/catalog';

export const dynamic = 'force-static';

export function GET() {
    return NextResponse.json(vgpProductCatalogJson, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
            Link: '<https://www.virzyguns.com/products>; rel="canonical"',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
