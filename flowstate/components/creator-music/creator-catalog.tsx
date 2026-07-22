"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, ExternalLink, FileText, Pause, Play, Search, Sparkles } from "lucide-react";
import { resolveAudioUrl } from "@/lib/audio/signed-urls";
import { track } from "@/lib/analytics";
import { CREATOR_ATTRIBUTION, SPOTIFY_ARTIST_URL, creatorGrantErrorCopy, creatorUiCopy } from "@/lib/creator-music/content";
import {
  CREATOR_CATALOG_VERSION,
  CREATOR_TERMS_VERSION,
} from "@/lib/creator-license/policy";

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

function trackDownloadHref(id: string, licenseeName?: string) {
  const base = `/api/license/download/${id.split("/").map(encodeURIComponent).join("/")}`;
  if (licenseeName && licenseeName.trim()) {
    return `${base}?licenseeName=${encodeURIComponent(licenseeName.trim())}`;
  }
  return base;
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [licenseeName, setLicenseeName] = useState("");
  const [copied, setCopied] = useState(false);
  const [certMap, setCertMap] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef(0);

  const isId = locale === "id";
  const regional = creatorUiCopy(locale);

  const clickwrapText = isId
    ? "Saya telah membaca dan menyetujui Lisensi Musik untuk Kreator creator-license-2026-07-21. Saya memahami bahwa atribusi wajib, musik tidak boleh didistribusikan tersendiri, dan saya tidak boleh mendaftarkan rekaman atau fingerprint musiknya ke Content ID atau sistem sejenis."
    : "I have read and agree to the Creator Music License creator-license-2026-07-21. I understand that attribution is required, the music may not be distributed standalone, and I may not register the track or its music fingerprint in Content ID or a similar system.";

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
    if (!termsAccepted) {
      setGrantState("error");
      setGrantMessage(regional?.acceptFirst ?? (isId ? "Setujui Lisensi Musik untuk Kreator terlebih dahulu." : "Accept the Creator Music License first."));
      return;
    }
    setGrantState("loading");
    setGrantMessage("");
    track("creator_license_started", { genre: genre ?? "all", locale });
    try {
      const response = await fetch("/api/license/grants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          acceptTerms: true,
          termsVersion: CREATOR_TERMS_VERSION,
          catalogVersion: CREATOR_CATALOG_VERSION,
          licenseeName: licenseeName.trim() || undefined,
        }),
      });
      const payload = await response.json().catch(() => ({})) as { grant?: { id: string }; error?: string };
      if (!response.ok || !payload.grant) {
        const messages: Record<string, string> = {
          login_required: "Sign in first, then return here to create your grant.",
          active_pro_required: "An active Flow Pro plan is required for creator downloads.",
          creator_license_not_enabled: "Creator downloads are not enabled yet.",
          terms_acceptance_required: "Accept the Creator Music License before creating a grant.",
          terms_version_mismatch: "The license terms changed. Review and accept the current version.",
          catalog_version_mismatch: "The creator catalog changed. Refresh this page and try again.",
          invalid_licensee_name: "Please enter a valid display name for your license certificate (2-100 chars, no email).",
        };
        throw new Error(creatorGrantErrorCopy(locale, payload.error ?? "") ?? messages[payload.error ?? ""] ?? "We could not create a creator license right now.");
      }
      setGrantState("ready");
      setGrantMessage(regional?.grantReady ?? (isId ? "Lisensi kreator siap. Download track dan sertifikat PDF sekarang terbuka." : "Creator license ready. Track downloads and license PDFs are now unlocked."));
      track("creator_license_granted", { genre: genre ?? "all", locale });
    } catch (error) {
      setGrantState("error");
      setGrantMessage(error instanceof Error ? error.message : (creatorGrantErrorCopy(locale, "fallback") ?? "We could not create a creator license right now."));
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
          <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#00e5ff]">{regional?.creatorCatalog ?? "Creator catalog"}</p>
          <h2 id="creator-catalog-title" className="mt-2 text-2xl font-extrabold text-white">{title ?? regional?.findTrack ?? (isId ? "Cari musik untuk karya kamu" : "Find a track for your next edit")}</h2>
          <p className="mt-2 text-sm text-white/60">{tracks.length} {regional?.eligibleTracks ?? (isId ? "track eligible" : "eligible creator tracks")}. {regional?.previewPro ?? (isId ? "Preview terbuka; download memerlukan Flow Pro aktif." : "Preview is open; downloads require active Flow Pro.")}</p>
        </div>
        <a
          href={SPOTIFY_ARTIST_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("spotify_catalog_clicked", { genre: genre ?? "all", locale })}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/75 transition-colors hover:border-[#1db954]/50 hover:text-white"
        >
          {regional?.listenSpotify ?? "Listen on Spotify"} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white/60 focus-within:border-[#00e5ff]/60">
            <Search className="h-4 w-4 shrink-0" />
            <span className="sr-only">{regional?.searchLabel ?? "Search creator tracks"}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={regional?.search ?? (isId ? "Cari judul, artis, atau genre" : "Search tracks, artist, or genre")} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35" />
          </label>
          <button type="button" onClick={createGrant} disabled={!termsAccepted || grantState === "loading" || grantState === "ready"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00e5ff] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
            <Sparkles className="h-4 w-4" />
            {grantState === "ready" ? (regional?.ready ?? (isId ? "Lisensi siap" : "Creator license ready")) : grantState === "loading" ? (regional?.checking ?? (isId ? "Memeriksa Pro…" : "Checking Pro…")) : (regional?.unlock ?? (isId ? "Buka Download Pro" : "Unlock Pro downloads"))}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-3 text-xs leading-relaxed text-white/75">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#00e5ff]"
            />
            <span>
              {clickwrapText}{" "}
              <Link href={`/${locale}/license`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#00e5ff] underline underline-offset-4">
                ({regional?.readTerms ?? (isId ? "Baca syarat lengkap" : "Read full terms")})
              </Link>
            </span>
          </label>
          <input
            type="text"
            value={licenseeName}
            onChange={(e) => setLicenseeName(e.target.value)}
            placeholder={regional?.licensedTo ?? (isId ? "Nama Lisensi (misal: Nama / Channel)" : "Licensed to (Name / Channel)")}
            className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/35 focus:border-[#00e5ff]/60"
          />
        </div>
      </div>

      {grantMessage && <p role="status" className={`rounded-xl border px-3 py-2 text-sm ${grantState === "error" ? "border-rose-400/30 bg-rose-500/10 text-rose-100" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"}`}>{grantMessage}{grantState === "error" && <Link className="ml-2 underline underline-offset-4" href={`/${locale}/pricing`}>{regional?.seePro ?? "See Flow Pro"}</Link>}</p>}

      <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[10px] font-mono uppercase tracking-[0.16em] text-white/40">
          <span>{filtered.length} {regional?.matching ?? "matching tracks"}</span><span>{regional?.previewDownload ?? "Preview / Download track & PDF"}</span>
        </div>
        <ul className="divide-y divide-white/[0.06]">
          {filtered.map((item) => {
            const isActive = activeTrackId === item.id;
            const certId = certMap[item.id];
            return <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${isActive ? "text-[#00e5ff]" : "text-white"}`}>{item.title}</p>
                <p className="mt-0.5 text-xs text-white/45">{item.genre} <span aria-hidden="true">·</span> {duration(item.durationS)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => togglePreview(item)} aria-label={`${playing && isActive ? (locale.startsWith("ja") ? "一時停止" : locale.startsWith("ko") ? "일시정지" : "Pause") : (locale.startsWith("ja") ? "試聴" : locale.startsWith("ko") ? "미리듣기" : "Play preview")}: ${item.title}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white transition-colors hover:border-[#00e5ff]/60 hover:text-[#00e5ff]">
                  {playing && isActive ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
                </button>
                {grantState === "ready" ? (
                  <>
                    <a href={trackDownloadHref(item.id, licenseeName)} onClick={() => track("creator_track_downloaded", { track_id: item.id, genre: item.genre, locale })} title={regional?.downloadMp3 ?? (isId ? "Download file MP3" : "Download MP3 track")} aria-label={`${regional?.downloadMp3 ?? "Download MP3"}: ${item.title}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-[#00e5ff]/60 hover:text-[#00e5ff]">
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    {certId ? (
                      <a href={`/api/license/certificate/${certId}`} download title={regional?.downloadPdf ?? (isId ? "Download Sertifikat PDF" : "Download License PDF")} aria-label={`${regional?.downloadPdf ?? "Download License PDF"}: ${item.title}`} className="grid h-9 w-9 place-items-center rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 text-[#00e5ff] transition-colors hover:bg-[#00e5ff]/20">
                        <FileText className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <a href={trackDownloadHref(item.id, licenseeName)} title={regional ? `${regional.downloadPdf} / ${regional.downloadMp3}` : (isId ? "Download Sertifikat PDF & MP3" : "Download License PDF & MP3")} aria-label={`${regional ? `${regional.downloadPdf} / ${regional.downloadMp3}` : "Download License PDF & MP3"}: ${item.title}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-[#00e5ff]/60 hover:text-[#00e5ff]">
                        <FileText className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </>
                ) : (
                  <button type="button" onClick={createGrant} aria-label={`${regional?.unlockTrack ?? "Unlock a Flow Pro download"}: ${item.title}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-[#00e5ff]/60 hover:text-[#00e5ff]">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </li>;
          })}
        </ul>
        {filtered.length === 0 && <p className="px-4 py-8 text-center text-sm text-white/50">{regional?.noMatch ?? "No eligible creator track matches that search."}</p>}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#00e5ff]/20 bg-[#00e5ff]/[0.04] p-4 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-xs leading-relaxed text-cyan-100/85">{CREATOR_ATTRIBUTION}</p>
        <button type="button" onClick={copyAttribution} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#00e5ff]/30 px-3 py-2 text-xs font-semibold text-[#00e5ff] hover:bg-[#00e5ff]/10">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? (regional?.copied ?? "Copied") : (regional?.copyAttribution ?? "Copy attribution")}
        </button>
      </div>
    </section>
  );
}
