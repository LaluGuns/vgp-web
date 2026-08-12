'use client';

import Image from 'next/image';
import { Check, ExternalLink, ListMusic, Youtube } from 'lucide-react';

import { useNewsletter } from '@/components/context/NewsletterContext';
import { trackOrganicEvent } from '@/lib/analytics';
import {
  CADENZ_YOUTUBE_MUSIC_EMBED_URL,
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
  const { openPopup } = useNewsletter();
  const Heading = headingLevel;

  return (
    <section
      className="overflow-hidden rounded-[1.75rem] border border-cyan-200/15 bg-[linear-gradient(145deg,rgba(7,30,42,0.96),rgba(2,8,14,0.98))] shadow-[0_28px_100px_rgba(0,0,0,0.34)]"
      aria-labelledby={`cadenz-listen-${asset.bpm}`}
    >
      <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
        <div className="relative min-h-[20rem] overflow-hidden border-b border-white/10 lg:min-h-full lg:border-b-0 lg:border-r">
          <Image
            src={asset.coverImage}
            alt={`${asset.releaseTitle} cover artwork`}
            fill
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(1,7,12,0.88)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/70">Verified release</p>
              <p className="mt-1 text-sm font-semibold text-white">{asset.artist}</p>
            </div>
            <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
              {asset.bpm} BPM
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Exact ISRC
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
              1-hour track
            </span>
          </div>

          <Heading id={`cadenz-listen-${asset.bpm}`} className="mt-5 text-2xl font-semibold leading-tight text-white sm:text-3xl">
            {asset.title}
          </Heading>
          <p className="mt-3 text-sm leading-7 text-white/65">
            {asset.sessionSummary}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <dt className="uppercase tracking-[0.14em] text-white/40">Artist</dt>
              <dd className="mt-1.5 font-semibold text-white/85">{asset.artist}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <dt className="uppercase tracking-[0.14em] text-white/40">ISRC</dt>
              <dd className="mt-1.5 font-mono text-white/75">{asset.isrc}</dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={asset.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => outbound('spotify_track', asset.bpm, 'verified_track_card')}
              data-organic-cta
              data-destination-type="spotify_track"
              data-source-position="verified_track_card"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1ed760] px-5 py-3 text-sm font-bold text-[#07150c] transition hover:bg-[#5bea83] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <SpotifyMark />
              Listen on Spotify
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={asset.youtube?.playlistUrl ?? CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => outbound('youtube_playlist', asset.bpm, 'verified_track_card')}
              data-organic-cta
              data-destination-type="youtube_playlist"
              data-source-position="verified_track_card"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:border-red-300/40 hover:bg-red-300/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Youtube className="h-5 w-5 text-red-300" aria-hidden="true" />
              Open YouTube Music
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
            <div className="relative aspect-video overflow-hidden bg-[#050b10]">
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
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200/10 bg-red-200/[0.045] px-4 py-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-white/75"><ListMusic className="h-4 w-4 text-red-200" aria-hidden="true" /> Full 11-BPM album playlist embedded</p>
            <a
              href={asset.youtube?.playlistUrl ?? CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => outbound('youtube_playlist', asset.bpm, 'youtube_playlist_fallback')}
              data-organic-cta
              data-destination-type="youtube_playlist"
              data-source-position="youtube_playlist_fallback"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-100 underline decoration-red-200/40 underline-offset-4 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Open in YouTube Music
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-white/40">The full owner-supplied CADENZ album playlist stays embedded here. The Spotify link above remains the exact ISRC match for this BPM page.</p>

          <button
            type="button"
            onClick={openPopup}
            data-organic-cta
            data-destination-type="cadenz_waitlist"
            data-source-position="listen_panel"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-200/[0.07] px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/40 hover:bg-cyan-200/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
          >
            Get CADENZ launch updates
          </button>
        </div>
      </div>
    </section>
  );
}
