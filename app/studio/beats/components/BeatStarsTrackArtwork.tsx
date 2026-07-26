'use client';
/* eslint-disable @next/next/no-img-element -- BeatStars artwork URLs are signed and intentionally fetched from its CDN. */

import { type ReactNode, useEffect, useState } from 'react';
import { getBeatStarsTrack } from './beatstars-track-data';

interface BeatStarsTrackArtworkProps {
    trackId: string;
    title: string;
    fallback: ReactNode;
}

export default function BeatStarsTrackArtwork({ trackId, title, fallback }: BeatStarsTrackArtworkProps) {
    const [artworkUrl, setArtworkUrl] = useState<string>();
    const [hasFailed, setHasFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        getBeatStarsTrack(trackId)
            .then((track) => {
                if (!cancelled && track.artworkUrl) setArtworkUrl(track.artworkUrl);
            })
            .catch(() => {
                if (!cancelled) setHasFailed(true);
            });

        return () => {
            cancelled = true;
        };
    }, [trackId]);

    if (!artworkUrl || hasFailed) return <>{fallback}</>;

    return (
        <img
            src={artworkUrl}
            alt={`${title} cover artwork`}
            className="h-full w-full object-cover"
            onError={() => setHasFailed(true)}
        />
    );
}
