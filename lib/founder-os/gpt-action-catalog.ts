import { beatsCatalog } from '@/lib/catalog';

export interface CustomGptCatalogMatch {
    beatId: string;
    title: string;
    publicUrl: string;
    primaryGenre: string;
    subgenres: string[];
    moods: string[];
    tags: string[];
    availability: string;
    identityVerification: string;
}

function searchableText(beat: (typeof beatsCatalog)[number]): string {
    return [
        beat.title,
        beat.primaryGenre,
        ...beat.subgenres,
        ...beat.moods,
        ...beat.tags,
    ].join(' ').toLowerCase();
}

export function searchCustomGptCatalog(
    query: string,
    limit: number
): CustomGptCatalogMatch[] {
    const terms = query
        .toLowerCase()
        .split(/\s+/)
        .map((term) => term.trim())
        .filter(Boolean)
        .slice(0, 12);
    const origin = (process.env.APP_URL || 'https://www.virzyguns.com')
        .replace(/\/$/, '');

    return beatsCatalog
        .filter((beat) =>
            beat.seoStatus === 'indexable'
            && beat.availability !== 'sold'
            && beat.availability !== 'unavailable'
        )
        .map((beat) => {
            const haystack = searchableText(beat);
            const score = terms.length === 0
                ? 0
                : terms.reduce(
                    (total, term) => total + (haystack.includes(term) ? 1 : 0),
                    0
                );
            return { beat, score };
        })
        .filter(({ score }) => terms.length === 0 || score > 0)
        .sort((left, right) =>
            right.score - left.score
            || left.beat.title.localeCompare(right.beat.title)
        )
        .slice(0, limit)
        .map(({ beat }) => ({
            beatId: beat.id,
            title: beat.title,
            publicUrl: `${origin}/studio/beats/${beat.slug}`,
            primaryGenre: beat.primaryGenre,
            subgenres: beat.subgenres,
            moods: beat.moods,
            tags: beat.tags,
            availability: beat.availability,
            identityVerification: beat.identityVerification,
        }));
}
