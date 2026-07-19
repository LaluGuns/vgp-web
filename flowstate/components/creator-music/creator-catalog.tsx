"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, ExternalLink, Pause, Play, Search, Sparkles } from "lucide-react";
import { resolveAudioUrl } from "@/lib/audio/signed-urls";
import { track } from "@/lib/analytics";
import { CREATOR_ATTRIBUTION, SPOTIFY_ARTIST_URL } from "@/lib/creator-music/content";

export type CreatorCatalogTrack = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  durationS: number;
  hlsUrl: string;
};

type Props = {
  tracks: CreatorCatalogTrack[];
  locale: string;
  genre?: string;
  title?: string;
};

function trackDownloadHref(id: string) {
  return `/api/license/download/${id.split("/").map(encodeURIComponent).join("/")}`;
}

function duration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function CreatorCatalog({ tracks, locale, genre, title }: Props) {
  const [query, setQuery] = useState("");
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [grantState, setGrantState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [grantMessage, setGrantMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    track("creator_genre_viewed", { genre: genre ?? "all", locale, track_count: tracks.length });
  }, [genre, locale, tracks.length]);

  useEffect(() => () => {
    requestRef.current += 1;
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.src = "";
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tracks;
    return tracks.filter((item) => `${item.title} ${item.artist} ${item.genre}`.toLowerCase().includes(normalized));
  }, [query, tracks]);

  async function togglePreview(item: CreatorCatalogTrack) {
    if (activeTrackId === item.id && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setPlaying(true);
        } catch {
          setActiveTrackId(null);
        }
      }
      return;
    }

    const requestId = ++requestRef.current;
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.src = "";
    setActiveTrackId(item.id);
    setPlaying(false);
    try {
      const url = await resolveAudioUrl(item.hlsUrl);
      if (requestId !== requestRef.current) return;
      const audio = new Audio(url);
      audio.volume = 0.4;
      audio.onended = () => {
        if (requestId === requestRef.current) {
          setActiveTrackId(null);
          setPlaying(false);
        }
      };
      audio.onerror = () => audio.onended?.(new Event("error"));
      audioRef.current = audio;
      await audio.play();
      if (requestId !== requestRef.current) return;
      setPlaying(true);
      track("creator_track_previewed", { track_id: item.id, genre: item.genre, locale });
    } catch {
      if (requestId === requestRef.current) {
        setActiveTrackId(null);
        setPlaying(false);
      }
    }
  }

  async function createGrant() {
    setGrantState("loading");
    setGrantMessage("");
    track("creator_license_started", { genre: genre ?? "all", locale });
    try {
      const response = await fetch("/api/license/grants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
      });
      const payload = await response.json().catch(() => ({})) as { grant?: unknown; error?: string };
      if (!response.ok || !payload.grant) {
        const messages: Record<string, string> = {
          login_required: "Sign in first, then return here to create your grant.",
          active_pro_required: "An active Flow Pro plan is required for creator downloads.",
          creator_license_not_enabled: "Creator downloads are not enabled yet.",
        };
        throw new Error(messages[payload.error ?? ""] ?? "We could not create a creator license right now.");
      }
      setGrantState("ready");
      setGrantMessage("Creator license ready. Your eligible downloads are now unlocked.");
      track("creator_license_granted", { genre: genre ?? "all", locale });
    } catch (error) {
      setGrantState("error");
      setGrantMessage(error instanceof Error ? error.message : "We could not create a creator license right now.");
    }
  }

  async function copyAttribution() {
    try {
      await navigator.clipboard.writeText(CREATOR_ATTRIBUTION);
      setCopied(true);
      track("license_attribution_copied", { genre: genre ?? "all", locale });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="creator-catalog-title">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#00e5ff]">Creator catalog</p>
          <h2 id="creator-catalog-title" className="mt-2 text-2xl font-extrabold text-white">{title ?? "Find a track for your next edit"}</h2>
          <p className="mt-2 text-sm text-white/60">{tracks.length} eligible {genre ?? "creator"} tracks. Preview is open; downloads require active Flow Pro.</p>
        </div>
        <a
          href={SPOTIFY_ARTIST_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("spotify_catalog_clicked", { genre: genre ?? "all", locale })}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/75 transition-colors hover:border-[#1db954]/50 hover:text-white"
        >
          Listen on Spotify <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-black/20 p-4 md:flex-row md:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white/60 focus-within:border-[#00e5ff]/60">
          <Search className="h-4 w-4 shrink-0" />
          <span className="sr-only">Search creator tracks</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tracks, artist, or genre" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35" />
        </label>
        <button type="button" onClick={createGrant} disabled={grantState === "loading" || grantState === "ready"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00e5ff] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
          <Sparkles className="h-4 w-4" />
          {grantState === "ready" ? "Creator license ready" : grantState === "loading" ? "Checking Pro…" : "Unlock Pro downloads"}
        </button>
      </div>

      {grantMessage && <p role="status" className={`rounded-xl border px-3 py-2 text-sm ${grantState === "error" ? "border-rose-400/30 bg-rose-500/10 text-rose-100" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"}`}>{grantMessage}{grantState === "error" && <Link className="ml-2 underline underline-offset-4" href={`/${locale}/pricing`}>See Flow Pro</Link>}</p>}

      <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[10px] font-mono uppercase tracking-[0.16em] text-white/40">
          <span>{filtered.length} matching tracks</span><span>Preview / download</span>
        </div>
        <ul className="divide-y divide-white/[0.06]">
          {filtered.map((item) => {
            const isActive = activeTrackId === item.id;
            return <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${isActive ? "text-[#00e5ff]" : "text-white"}`}>{item.title}</p>
                <p className="mt-0.5 text-xs text-white/45">{item.genre} <span aria-hidden="true">·</span> {duration(item.durationS)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => togglePreview(item)} aria-label={`${playing && isActive ? "Pause" : "Play"} preview of ${item.title}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white transition-colors hover:border-[#00e5ff]/60 hover:text-[#00e5ff]">
                  {playing && isActive ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
                </button>
                {grantState === "ready" ? (
                  <a href={trackDownloadHref(item.id)} onClick={() => track("creator_track_downloaded", { track_id: item.id, genre: item.genre, locale })} aria-label={`Download ${item.title} with Flow Pro`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-[#00e5ff]/60 hover:text-[#00e5ff]">
                    <Download className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <button type="button" onClick={createGrant} aria-label={`Unlock a Flow Pro download for ${item.title}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-[#00e5ff]/60 hover:text-[#00e5ff]">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </li>;
          })}
        </ul>
        {filtered.length === 0 && <p className="px-4 py-8 text-center text-sm text-white/50">No eligible creator track matches that search.</p>}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/[0.04] p-4 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-xs leading-relaxed text-cyan-100/85">{CREATOR_ATTRIBUTION}</p>
        <button type="button" onClick={copyAttribution} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#00e5ff]/30 px-3 py-2 text-xs font-semibold text-[#00e5ff] hover:bg-[#00e5ff]/10">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy attribution"}
        </button>
      </div>
    </section>
  );
}
