import type {
    BeatMatchSummary,
    IntelligenceSignal,
} from './demo-data';

export interface LiveCatalogBeat {
    id: string;
    slug: string;
    title: string;
    primaryGenre: string;
    beatstarsTrackId?: string;
    availability: string;
    offerVerification: string;
}

function safeCount(value: number): number {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function humanize(value: string): string {
    return value.replaceAll('-', ' ');
}

export function buildLiveIntelligenceSignals(
    catalogCount: number,
    prospectCount: number,
): IntelligenceSignal[] {
    const canonicalCatalogCount = safeCount(catalogCount);
    const canonicalProspectCount = safeCount(prospectCount);

    return [
        {
            id: 'catalog',
            label: 'Beat catalog',
            value: `${canonicalCatalogCount.toLocaleString('en-US')} tracks`,
            context:
                'Count comes from the canonical repository catalog; offer eligibility remains separately verified.',
            status: canonicalCatalogCount > 0 ? 'available' : 'blocked',
        },
        {
            id: 'meta',
            label: 'Meta performance',
            value: 'Check Settings / live status',
            context:
                'This baseline does not infer connection, scopes, audience, or performance. Settings performs the live provider check.',
            status: 'partial',
        },
        {
            id: 'tiktok',
            label: 'TikTok performance',
            value: 'Check Settings / live status',
            context:
                'This baseline does not infer authorization or FYP performance. Settings performs the live provider check.',
            status: 'partial',
        },
        {
            id: 'research',
            label: 'Lead research',
            value:
                canonicalProspectCount === 0
                    ? 'No live records yet'
                    : `${canonicalProspectCount.toLocaleString('en-US')} canonical ${
                          canonicalProspectCount === 1 ? 'record' : 'records'
                      }`,
            context:
                'Count comes from the current live database snapshot; synthetic demo prospects are not included.',
            status: canonicalProspectCount > 0 ? 'available' : 'partial',
        },
    ];
}

export function buildLiveBeatDirectory(
    matchedBeatIds: readonly string[],
    catalog: readonly LiveCatalogBeat[],
): Record<string, BeatMatchSummary> {
    const catalogByKey = new Map<string, LiveCatalogBeat>();
    for (const beat of catalog) {
        for (const key of [beat.id, beat.slug, beat.beatstarsTrackId]) {
            const normalized = key?.trim();
            if (normalized && !catalogByKey.has(normalized)) {
                catalogByKey.set(normalized, beat);
            }
        }
    }

    const directory: Record<string, BeatMatchSummary> = {};
    for (const rawId of matchedBeatIds) {
        const matchedId = rawId.trim();
        if (!matchedId || directory[matchedId]) continue;

        const beat = catalogByKey.get(matchedId);
        if (!beat) {
            directory[matchedId] = {
                id: matchedId,
                title: `Unresolved beat reference: ${matchedId}`,
                genre: 'Canonical catalog match missing',
                reason:
                    'The live prospect references this beat ID, but no matching canonical catalog record was found. Review the lead source before outreach.',
                href: null,
                offerLabel:
                    'No license or availability claim is shown until the catalog identity is resolved.',
                resolution: 'missing',
            };
            continue;
        }

        directory[matchedId] = {
            id: matchedId,
            title: beat.title,
            genre: beat.primaryGenre,
            reason:
                'Canonical catalog identity resolved. The current live snapshot does not store a per-match rationale; review the prospect evidence before outreach.',
            href: `/studio/beats/${beat.slug}`,
            offerLabel: `Catalog availability: ${humanize(
                beat.availability,
            )}; offer verification: ${humanize(beat.offerVerification)}.`,
            resolution: 'catalog',
        };
    }

    return directory;
}
