"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { track } from "@/lib/analytics";

type YouTubeDiscoveryPlayerProps = {
  videoId: string | null;
  title: string;
  intent: string;
  destinationUrl?: string | null;
};

function youtubeEmbedUrl(videoId: string): string {
  const origin = typeof window === "undefined" ? "https://flow.virzyguns.com" : window.location.origin;
  const params = new URLSearchParams({
    enablejsapi: "1",
    origin,
    autoplay: "0",
    controls: "1",
    rel: "0",
    playsinline: "1",
  });
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}

/**
 * Lazy, click-to-play YouTube discovery. It deliberately renders no iframe
 * until an owner-verified video id exists, so guessed IDs cannot create broken
 * embeds or false analytics. Native Flow audio remains the product player.
 */
export function YouTubeDiscoveryPlayer({
  videoId,
  title,
  intent,
  destinationUrl,
}: YouTubeDiscoveryPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const onNativeAudioPlaying = () => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
        "https://www.youtube.com",
      );
    };
    window.addEventListener("flow:native-audio-playing", onNativeAudioPlaying);
    return () => window.removeEventListener("flow:native-audio-playing", onNativeAudioPlaying);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com" || typeof event.data !== "string") return;
      try {
        const payload = JSON.parse(event.data) as { event?: string; info?: number };
        if (payload.event === "onStateChange" && payload.info === 1) {
          window.dispatchEvent(new Event("flow:youtube-playing"));
        }
      } catch {
        // Ignore unrelated postMessage traffic.
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!videoId) {
    return null;
  }

  const destination = destinationUrl ?? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00e5ff]">YouTube discovery</p>
          <h2 className="mt-1 text-lg font-bold text-white">{title}</h2>
        </div>
        <a
          href={destination}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
          onClick={() => track("outbound_clicked", {
            destination_type: "youtube",
            source_position: "youtube_discovery",
            intent,
          })}
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          Open on YouTube
        </a>
      </div>
      {loaded ? (
        <div className="aspect-video min-h-[200px] overflow-hidden rounded-xl bg-black">
          <iframe
            ref={iframeRef}
            title={title}
            src={youtubeEmbedUrl(videoId)}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <button
          type="button"
          className="flex aspect-video min-h-[200px] w-full items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/80 hover:border-[#00e5ff]/60 hover:text-white"
          onClick={() => {
            setLoaded(true);
            track("outbound_clicked", {
              destination_type: "youtube",
              source_position: "youtube_facade",
              intent,
            });
          }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#00e5ff] px-4 py-2 text-sm font-semibold text-black">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            Play discovery video
          </span>
        </button>
      )}
    </section>
  );
}

