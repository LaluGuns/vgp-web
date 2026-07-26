'use client';

import { useEffect, useState } from 'react';
import { Clock3, Gauge, KeyRound, Tag } from 'lucide-react';
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

function Metric({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
    return (
        <div className="min-w-0 rounded-xl border border-white/[0.09] bg-black/15 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
                <Icon className="h-3 w-3 text-sky-200/70" aria-hidden="true" />
                {label}
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
        </div>
    );
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
        return <p className="text-xs text-white/45" aria-live="polite">{text.loading}</p>;
    }

    const genres = track.metadata.genres.slice(0, 2).join(' · ');
    return (
        <section className="rounded-2xl border border-white/[0.1] bg-[#041018]/75 p-4 sm:p-5" aria-label={text.label}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200/75">{text.label}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {track.metadata.bpm ? <Metric icon={Gauge} label={text.bpm} value={String(track.metadata.bpm)} /> : null}
                {track.metadata.key ? <Metric icon={KeyRound} label={text.key} value={track.metadata.key} /> : null}
                {track.duration ? <Metric icon={Clock3} label={text.length} value={formatTrackTime(track.duration)} /> : null}
                {genres ? <Metric icon={Tag} label={text.genres} value={genres} /> : null}
            </div>
            {track.metadata.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {track.metadata.tags.slice(0, 6).map((tag) => (
                        <span key={tag} className="rounded-full border border-white/[0.09] bg-white/[0.035] px-2.5 py-1 text-[11px] text-white/62">{tag}</span>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
