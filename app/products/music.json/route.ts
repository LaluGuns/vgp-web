import { NextResponse } from 'next/server';

const SITE_URL = 'https://www.virzyguns.com';

export const dynamic = 'force-static';

const musicCatalogSummary = {
    schemaVersion: 1,
    publisher: {
        name: 'Virzy Guns Production',
        alternateName: 'VGP',
        url: SITE_URL,
    },
    canonicalUrl: `${SITE_URL}/products/music`,
    sourcePolicy:
        'This public summary exposes catalog identity only. Financial, store-performance, country, transaction-level, and internal source-file metadata are intentionally excluded.',
    trackIdentityCount: 617,
    identifierCoverage: ['ISRC', 'UPC'],
    artists: [
        { name: 'Virzy Guns', trackIdentityCount: 315 },
        { name: 'Chill Music Division', trackIdentityCount: 264 },
        { name: 'LUNA Q', trackIdentityCount: 20 },
        { name: 'LA LU', trackIdentityCount: 10 },
        { name: 'mia.exe', trackIdentityCount: 8 },
    ],
    availabilityNote:
        'This is an identity snapshot of distributed recordings. Availability for an individual recording should be verified on the target streaming or download service.',
};

export function GET() {
    return NextResponse.json(musicCatalogSummary, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
            Link: `<${SITE_URL}/products/music>; rel="canonical"`,
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
