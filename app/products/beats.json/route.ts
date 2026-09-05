import { NextResponse } from 'next/server';
import { beatsCatalog } from '@/lib/catalog';
import { getOfficialBeatStarsGenres } from '@/lib/catalog/beatstars-genre-index';

const SITE_URL = 'https://www.virzyguns.com';

export const dynamic = 'force-static';

export function GET() {
    const beats = beatsCatalog
        .filter((beat) => beat.seoStatus === 'indexable')
        .map((beat) => {
            const commercialOfferVerified =
                beat.offerVerification === 'product-page-active' &&
                beat.availability !== 'unknown';

            return {
                id: beat.id,
                title: beat.title,
                producer: beat.producer,
                canonicalUrl: `${SITE_URL}/studio/beats/${beat.slug}`,
                beatStarsUrl: beat.beatstarsProductUrl,
                description: beat.description['en-US'] || beat.title,
                genres:
                    getOfficialBeatStarsGenres(beat.beatstarsTrackId).length > 0
                        ? getOfficialBeatStarsGenres(beat.beatstarsTrackId)
                        : [beat.primaryGenre, ...beat.subgenres],
                moods: beat.moods,
                tags: beat.tags,
                durationSeconds: beat.durationSeconds,
                coverImageUrl: beat.coverImageUrl,
                previewAudioUrl: beat.previewAudioUrl,
                availability: beat.availability,
                commercialOfferVerified,
                licenses: commercialOfferVerified
                    ? beat.licenses.map((license) => ({
                          name: license.name,
                          price: license.priceValue,
                          currency: license.currency || 'USD',
                          fileFormats: license.fileFormats,
                          includesStems: license.includesStems,
                          type: license.type || 'non-exclusive',
                      }))
                    : [],
                updatedAt: beat.updatedAt,
            };
        });

    return NextResponse.json(
        {
            schemaVersion: 1,
            publisher: 'Virzy Guns Production',
            producer: 'Virzy Guns',
            canonicalCatalog: `${SITE_URL}/studio/beats`,
            note: 'Only indexable catalog entries are included. Commercial license data is emitted only when the product-page offer is verified active.',
            count: beats.length,
            beats,
        },
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
                Link: `<${SITE_URL}/studio/beats>; rel="canonical"`,
                'X-Content-Type-Options': 'nosniff',
            },
        },
    );
}
