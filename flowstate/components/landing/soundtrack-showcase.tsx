"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, Play, Pause } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { resolveAudioUrl } from "@/lib/audio/signed-urls";

const FEATURED_TRACKS = [
  {
    id: "city-pop/city-pop-001",
    title: "Neon Drive",
    genre: "City Pop",
    url: "/tracks/city-pop/city-pop-001.mp3",
    duration: "2:15"
  },
  {
    id: "cyberpunk-jazz/cyberpunk-jazz-001",
    title: "Neon Alley",
    genre: "Cyberpunk Jazz",
    url: "/tracks/cyberpunk-jazz/cyberpunk-jazz-001.mp3",
    duration: "3:29"
  },
  {
    id: "city-pop/city-pop-018",
    title: "Velvet Cassette",
    genre: "City Pop",
    url: "/tracks/city-pop/city-pop-018.mp3",
    duration: "1:58"
  }
];

// Interactive soundtrack previewer (vinyl visual + featured playlist).
// Client island: holds the preview <audio> lifecycle; the section copy still
// server-renders because client components are SSR'd with their providers.
export function SoundtrackShowcase() {
  const { t } = useTranslation();
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewRequestId = useRef(0);

  useEffect(() => {
    return () => {
      previewRequestId.current += 1;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const clearPreviewState = (requestId: number) => {
    if (previewRequestId.current !== requestId) return;
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.src = "";
    audioRef.current = null;
    setActiveTrackId(null);
    setIsPlayingPreview(false);
  };

  const handlePlayPreview = async (trackId: string, path: string) => {
    if (activeTrackId === trackId && audioRef.current) {
      if (isPlayingPreview) {
        audioRef.current?.pause();
        setIsPlayingPreview(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlayingPreview(true);
        } catch {
          clearPreviewState(previewRequestId.current);
        }
      }
      return;
    }

    const requestId = ++previewRequestId.current;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setActiveTrackId(trackId);
    setIsPlayingPreview(false);

    try {
      const resolvedUrl = await resolveAudioUrl(path);
      if (previewRequestId.current !== requestId) return;

      const audio = new Audio(resolvedUrl);
      audio.volume = 0.4;
      audio.onended = () => {
        clearPreviewState(requestId);
      };
      audio.onerror = () => clearPreviewState(requestId);
      audioRef.current = audio;

      await audio.play();
      if (previewRequestId.current !== requestId) {
        audio.pause();
        audio.src = "";
        return;
      }
      setIsPlayingPreview(true);
    } catch {
      clearPreviewState(requestId);
    }
  };

  return (
    <div className="glass-card p-8 md:p-12 rounded-[32px] border border-white/5 max-w-5xl mx-auto relative overflow-hidden bg-white/[0.01]">
      <div className="!absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left Column: Visual Album / Vinyl Disk Cover */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-cyan-500/10 opacity-40" />

          {/* Vinyl Record Visual */}
          <div className="w-48 h-48 rounded-full bg-black border-4 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)] relative flex items-center justify-center overflow-hidden mb-6 z-10">
            {/* Vinyl grooves */}
            <div className="absolute inset-2 rounded-full border border-white/[0.03] pointer-events-none" />
            <div className="absolute inset-6 rounded-full border border-white/[0.03] pointer-events-none" />
            <div className="absolute inset-10 rounded-full border border-white/[0.03] pointer-events-none" />
            <div className="absolute inset-14 rounded-full border border-white/[0.03] pointer-events-none" />

            {/* Center Sticker */}
            <div className={`w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,229,255,0.4)] ${isPlayingPreview ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
              <img src="/icons/flowstate-logo.png" alt="Logo" className="w-8 h-8 object-contain opacity-80" />
              <div className="absolute w-3.5 h-3.5 rounded-full bg-[#0b1326] border border-white/10" />
            </div>
          </div>

          {/* Metadata & Wave visualizer */}
          <div className="text-center z-10 w-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
              <Compass className="h-3 w-3" /> {t("legal.landing.feat_music_title", "Original soundtracks")}
            </span>

            <h3 className="text-sm font-bold text-white tracking-wide">
              {activeTrackId ? FEATURED_TRACKS.find(t => t.id === activeTrackId)?.title : t("legal.landing.producer_title", "Soundtracks by Virzy Guns Production")}
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
              {activeTrackId ? FEATURED_TRACKS.find(t => t.id === activeTrackId)?.genre : "Virzy Guns Production"}
            </p>

            {/* Equalizer Visualizer (animated only when playing) */}
            <div className="flex items-end justify-center gap-1 h-8 mt-5">
              {[...Array(12)].map((_, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#00e5ff] rounded-full transition-all duration-300"
                  style={{
                    height: isPlayingPreview ? `${Math.floor(Math.random() * 80) + 20}%` : '15%',
                    animation: isPlayingPreview ? `bounce-bar ${0.4 + (i * 0.05)}s ease-in-out infinite alternate` : 'none',
                    transformOrigin: 'bottom'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Playlist & Info */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {t("legal.landing.producer_title", "Soundtracks by Virzy Guns Production")}
            </h2>
            <p className="text-xs text-white/60 leading-relaxed">
              {t("legal.landing.producer_desc", "Every track in Flow is produced by one person — Virzy Guns Production. Not licensed, not pulled from a stock library. Written for focus, and only here.")}
            </p>
          </div>

          <div className="space-y-2">
            {FEATURED_TRACKS.map((track) => {
              const isActive = activeTrackId === track.id;
              const isPlaying = isActive && isPlayingPreview;

              return (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? "bg-white/[0.06] border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
                      : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePlayPreview(track.id, track.url)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                          : "bg-white/5 hover:bg-white/10 text-white"
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <p className={`text-xs font-bold transition-colors ${isActive ? "text-[#00e5ff]" : "text-white"}`}>
                        {track.title}
                      </p>
                      <p className="text-[9px] font-mono text-white/40 mt-0.5">
                        {track.genre}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/40">{track.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
