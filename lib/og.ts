import beatStarsFilterIndex from '@/data/beatstars-filter-index.json';
import { formatBeatTitle } from '@/lib/beat-title';
import type { BeatProduct } from '@/lib/catalog';

/** Share-card image for a page's openGraph/twitter metadata. See app/og/route.tsx. */
export function ogImage({ title, kicker, sub }: { title: string; kicker?: string; sub?: string }) {
    const params = new URLSearchParams({ title });
    if (kicker) params.set('kicker', kicker);
    if (sub) params.set('sub', sub);
    return { url: `/og?${params.toString()}`, width: 1200, height: 630, alt: title };
}

/** Share card for a beat: clean name, genre, BPM and key. */
export function beatShareCard(beat: BeatProduct, genre: string) {
    const metadata = (beatStarsFilterIndex as Record<string, { bpm?: number | null; key?: string | null }>)[beat.beatstarsTrackId];
    const key = metadata?.key && metadata.key !== 'None' ? metadata.key : undefined;
    const sub = [genre, metadata?.bpm ? `${metadata.bpm} BPM` : undefined, key, `Licenses from ${beat.licenses[0]?.price || '$15'}`]
        .filter(Boolean)
        .join(' · ');
    return ogImage({ kicker: 'Beat by Virzy Guns', title: formatBeatTitle(beat.title).name, sub });
}
