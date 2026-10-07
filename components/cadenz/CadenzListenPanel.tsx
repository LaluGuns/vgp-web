'use client';

import Image from 'next/image';

import { trackOrganicEvent } from '@/lib/analytics';
import { CADENZ_PLAY_URL } from '@/lib/vgp-ecosystem';
import {
  CADENZ_YOUTUBE_MUSIC_EMBED_URL,
  CADENZ_YOUTUBE_THUMBNAIL,
  CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL,
  type CadenzMusicAsset,
} from '@/lib/organic-discovery/cadenz';

function SpotifyMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 1.75A10.25 10.25 0 1 0 12 22.25 10.25 10.25 0 0 0 12 1.75Zm4.7 14.78a.8.8 0 0 1-1.1.27c-3.01-1.84-6.8-2.25-11.26-1.23a.8.8 0 1 1-.36-1.56c4.88-1.12 9.08-.64 12.45 1.42a.8.8 0 0 1 .27 1.1Zm1.47-3.27a1 1 0 0 1-1.38.33c-3.45-2.12-8.7-2.73-12.77-1.49a1 1 0 1 1-.58-1.91c4.66-1.42 10.45-.74 14.4 1.69a1 1 0 0 1 .33 1.38Zm.13-3.41C14.17 7.4 7.36 7.17 3.42 8.37a1.2 1.2 0 1 1-.7-2.3c4.53-1.37 12.05-1.1 16.8 1.72a1.2 1.2 0 0 1-1.22 2.06Z" />
    </svg>
  );
}

function outbound(destinationType: string, bpm: number, sourcePosition: string) {
  trackOrganicEvent('outbound_clicked', {
    bpm,
    destination_type: destinationType,
    source_position: sourcePosition,
  });
}

export function CadenzListenPanel({
  asset,
  headingLevel = 'h2',
}: {
  asset: CadenzMusicAsset;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;

  return (
    <section className="grid gap-10 border-y border-white/10 py-12 lg:grid-cols-12" aria-labelledby={`cadenz-listen-${asset.bpm}`}>
      <div className="lg:col-span-5">
        <div className="relative aspect-video overflow-hidden rounded-[6px] border border-white/10 bg-black">
          <Image
            src={CADENZ_YOUTUBE_THUMBNAIL}
            alt="CADENZ running cadence cover art"
            fill
            sizes="(min-width: 1024px) 34vw, 100vw"
            quality={90}
            className="object-cover"
          />
        </div>
        <p className="mt-3 text-xs text-white/55">
          {asset.artist} · {asset.bpm} BPM · 1-hour track
        </p>
      </div>

      <div className="lg:col-span-7">
        <p className="text-xs font-medium text-sky-300">Exact ISRC match</p>
        <Heading id={`cadenz-listen-${asset.bpm}`} className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl">
          {asset.title}
        </Heading>
        <p className="mt-3 max-w-xl text-base leading-7 text-white/70">{asset.sessionSummary}</p>

        <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-white/50">Artist</dt>
            <dd className="mt-1 text-white/85">{asset.artist}</dd>
          </div>
          <div>
            <dt className="text-xs text-white/50">ISRC</dt>
            <dd className="mt-1 font-mono text-white/85">{asset.isrc}</dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
          <a
            href={asset.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => outbound('spotify_track', asset.bpm, 'verified_track_card')}
            data-organic-cta
            data-destination-type="spotify_track"
            data-source-position="verified_track_card"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1ed760] px-6 text-sm font-semibold text-[#07150c] transition-colors hover:bg-[#5bea83] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]"
          >
            <SpotifyMark />
            Listen on Spotify
          </a>
          <a
            href={asset.youtube?.playlistUrl ?? CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => outbound('youtube_playlist', asset.bpm, 'verified_track_card')}
            data-organic-cta
            data-destination-type="youtube_playlist"
            data-source-position="verified_track_card"
            className="text-sm font-medium text-white underline decoration-white/30 underline-offset-[6px] hover:decoration-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Open the playlist on YouTube Music
          </a>
        </div>

        <div className="mt-8 overflow-hidden rounded-[6px] border border-white/10 bg-black">
          <div className="relative aspect-video">
            <iframe
              src={CADENZ_YOUTUBE_MUSIC_EMBED_URL}
              title="CADENZ 11 BPM running cadence album on YouTube Music"
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              onLoad={() =>
                trackOrganicEvent('music_preview_started', {
                  bpm: asset.bpm,
                  destination_type: 'youtube_playlist',
                  source_position: 'youtube_playlist_embed',
                })
              }
            />
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Full 11-BPM album playlist embedded. The Spotify button opens the exact track for {asset.bpm} BPM.
        </p>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-base leading-7 text-white/75">
            CADENZ plays this music at your running or cycling cadence.
          </p>
          <a
            href={CADENZ_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => outbound('google_play', asset.bpm, 'listen_panel')}
            data-organic-cta
            data-destination-type="google_play"
            data-source-position="listen_panel"
            className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-white underline decoration-white/30 underline-offset-[6px] hover:decoration-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Get CADENZ on Google Play
          </a>
        </div>
      </div>
    </section>
  );
}
