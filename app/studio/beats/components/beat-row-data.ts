import type { BeatProduct } from '@/lib/catalog';
import { getEditorialBeatWorld } from '@/lib/catalog/beatstars-genre-index';
import { formatBeatTitle } from '@/lib/beat-title';
import { getGenreTheme } from '@/lib/genre-theme';
import beatStarsFilterIndexJson from '@/data/beatstars-filter-index.json';
import type { BeatRowData } from './BeatStoreRow';

type FilterMetadata = { bpm?: number | null; key?: string | null };
const filterIndex = beatStarsFilterIndexJson as Record<string, FilterMetadata>;

/** Row data for the beat list and the pinned player, shared by every store page. */
export function toBeatRow(beat: BeatProduct, href: string): BeatRowData {
    const metadata = filterIndex[beat.beatstarsTrackId];
    const genre = getEditorialBeatWorld(beat.beatstarsTrackId) || beat.primaryGenre;
    const { name, detail } = formatBeatTitle(beat.title);
    const musicalKey = metadata?.key && metadata.key !== 'None' ? metadata.key : undefined;
    const bpm = metadata?.bpm ?? undefined;

    return {
        beatId: beat.id,
        trackId: beat.beatstarsTrackId,
        name,
        detail,
        meta: [genre, bpm ? `${bpm} BPM` : undefined, musicalKey].filter(Boolean).join(' · '),
        price: beat.licenses[0]?.price || '$15',
        href,
        genre,
        accentHex: getGenreTheme(genre).accentHex,
        bpm,
        musicalKey,
    };
}
