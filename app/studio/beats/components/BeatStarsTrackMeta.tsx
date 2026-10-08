'use client';

import { useEffect, useState } from 'react';
import { formatTrackTime, getBeatStarsTrack, type BeatStarsTrackData } from './beatstars-track-data';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

const copy = {
    'en-US': {
        label: 'Track details', bpm: 'BPM', key: 'Key', length: 'Length', genres: 'Genres',
        loading: 'Loading track details',
    },
    'ja-JP': {
        label: 'トラック詳細', bpm: 'BPM', key: 'キー', length: '再生時間', genres: 'ジャンル',
        loading: 'トラック詳細を読み込み中',
    },
    'de-DE': {
        label: 'Trackdetails', bpm: 'BPM', key: 'Tonart', length: 'Länge', genres: 'Genres',
        loading: 'Trackdetails werden geladen',
    },
} as const;

interface BeatStarsTrackMetaProps {
    trackId: string;
    locale: BeatLocale;
}

export default function BeatStarsTrackMeta({ trackId, locale }: BeatStarsTrackMetaProps) {
    const text = copy[locale];
    const [track, setTrack] = useState<BeatStarsTrackData>();

    useEffect(() => {
        let cancelled = false;
        getBeatStarsTrack(trackId).then((data) => {
            if (!cancelled) setTrack(data);
        }).catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [trackId]);

    if (!track) {
        return <p className="text-xs text-white/60" aria-live="polite">{text.loading}</p>;
    }

    const genres = track.metadata.genres.slice(0, 2).join(' · ');
    const facts: Array<{ label: string; value: string } | null> = [
        track.metadata.bpm ? { label: text.bpm, value: String(track.metadata.bpm) } : null,
        track.metadata.key ? { label: text.key, value: track.metadata.key } : null,
        track.duration ? { label: text.length, value: formatTrackTime(track.duration) } : null,
        genres ? { label: text.genres, value: genres } : null,
    ];

    return (
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-y border-white/10 py-5 sm:grid-cols-4" aria-label={text.label}>
            {facts.filter((fact): fact is { label: string; value: string } => fact !== null).map((fact) => (
                <div key={fact.label} className="min-w-0">
                    <dt className="text-xs text-white/50">{fact.label}</dt>
                    <dd className="mt-1 truncate font-display text-xl font-semibold tabular-nums text-white">{fact.value}</dd>
                </div>
            ))}
        </dl>
    );
}
