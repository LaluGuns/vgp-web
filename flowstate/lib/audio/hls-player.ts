import Hls from "hls.js";
import { usePlayerStore } from "@/lib/stores/player-store";
import { genrePlaylist } from "@/lib/catalog";

export interface PlayerChannel {
  name: "A" | "B";
  audioEl: HTMLAudioElement | null;
  hls: Hls | null;
  sourceNode: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  audioBuffer: AudioBuffer | null;
  isHlsMode: boolean;
  isWebAudioPlaying: boolean;
  startTime: number;
  startOffset: number;
  currentUrl: string;
  loadPromise: Promise<void> | null;
  abortController: AbortController | null;
  activeLoadId: number;
  volume: number; // Volume multiplier (0.0 to 1.0)
  isEnding: boolean;
  hasTriggeredNext: boolean;
}

function createChannel(name: "A" | "B"): PlayerChannel {
  return {
    name,
    audioEl: null,
    hls: null,
    sourceNode: null,
    gainNode: null,
    audioBuffer: null,
    isHlsMode: false,
    isWebAudioPlaying: false,
    startTime: 0,
    startOffset: 0,
    currentUrl: "",
    loadPromise: null,
    abortController: null,
    activeLoadId: 0,
    volume: 1.0,
    isEnding: false,
    hasTriggeredNext: false,
  };
}

let channelA = createChannel("A");
let channelB = createChannel("B");
let activeChannel: PlayerChannel = channelA;
let inactiveChannel: PlayerChannel = channelB;

// Web Audio API single AudioContext
let audioCtx: AudioContext | null = null;
let shouldPlay = false;
let pendingSeekTime: number | null = null;

type ProgressCallback = (current: number, duration: number) => void;
type EndCallback = () => void;

let onProgress: ProgressCallback | null = null;
let onEnded: EndCallback | null = null;
let animFrameId: number | null = null;

function canPlayNativeHls(): boolean {
  if (typeof window === "undefined") return false;
  const audio = document.createElement("audio");
  return !!(
    audio.canPlayType("application/vnd.apple.mpegurl") ||
    audio.canPlayType("application/x-mpegURL")
  );
}

const handleEnded = (channel: PlayerChannel) => {
  if (channel === activeChannel) {
    onEnded?.();
  } else {
    stopChannel(channel);
  }
};

const handleLoadedMetadata = (channel: PlayerChannel) => {
  if (pendingSeekTime !== null && channel === activeChannel && channel.audioEl) {
    channel.audioEl.currentTime = pendingSeekTime;
    pendingSeekTime = null;
  }
};

const handleAudioError = (channel: PlayerChannel, e: ErrorEvent) => {
  console.error(`Native audio element error on channel ${channel.name}:`, channel.audioEl?.error || e);
  if (channel === activeChannel) {
    musicPlayer.stop();
    usePlayerStore.getState().pause();
  } else {
    stopChannel(channel);
  }
};

function initAudio(channel: PlayerChannel): HTMLAudioElement {
  if (!channel.audioEl) {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.setAttribute("controlsList", "nodownload");
    audio.setAttribute("disablePictureInPicture", "true");
    audio.oncontextmenu = (e) => e.preventDefault();

    audio.addEventListener("ended", () => handleEnded(channel));
    audio.addEventListener("loadedmetadata", () => handleLoadedMetadata(channel));
    audio.addEventListener("error", (e: any) => handleAudioError(channel, e));
    channel.audioEl = audio;
  }
  return channel.audioEl;
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function initGainNode(channel: PlayerChannel): GainNode {
  const ctx = getAudioContext();
  if (!channel.gainNode) {
    channel.gainNode = ctx.createGain();
    const masterVolume = usePlayerStore.getState().volume;
    channel.gainNode.gain.value = Math.pow(channel.volume * masterVolume, 2);
    channel.gainNode.connect(ctx.destination);
  }
  return channel.gainNode;
}

function updateChannelVolume(channel: PlayerChannel) {
  const masterVolume = usePlayerStore.getState().volume;
  const targetVolume = channel.volume * masterVolume;
  const perceptualVolume = Math.pow(targetVolume, 2);

  if (channel.isHlsMode) {
    if (channel.audioEl) {
      channel.audioEl.volume = perceptualVolume;
    }
  } else {
    if (channel.gainNode) {
      const ctx = getAudioContext();
      channel.gainNode.gain.setTargetAtTime(perceptualVolume, ctx.currentTime, 0.01);
    }
  }
}

function pauseChannel(channel: PlayerChannel) {
  if (channel.isHlsMode) {
    if (channel.audioEl) {
      channel.audioEl.pause();
    }
  } else {
    const wasPlaying = channel.isWebAudioPlaying;
    channel.isWebAudioPlaying = false;
    if (channel.sourceNode) {
      try {
        channel.sourceNode.onended = null;
        channel.sourceNode.stop();
      } catch (e) {}
      channel.sourceNode.disconnect();
      channel.sourceNode = null;
    }
    if (wasPlaying) {
      const ctx = getAudioContext();
      channel.startOffset += ctx.currentTime - channel.startTime;
      if (channel.audioBuffer) {
        channel.startOffset = Math.min(channel.startOffset, channel.audioBuffer.duration);
      }
    }
  }
}

function cleanupWebAudioChannel(channel: PlayerChannel) {
  if (channel.sourceNode) {
    try {
      channel.sourceNode.onended = null;
      channel.sourceNode.stop();
    } catch (e) {}
    channel.sourceNode.disconnect();
    channel.sourceNode = null;
  }
  if (channel.gainNode) {
    try {
      channel.gainNode.disconnect();
    } catch (e) {}
    channel.gainNode = null;
  }
  channel.audioBuffer = null;
  channel.isWebAudioPlaying = false;
}

function stopChannel(channel: PlayerChannel) {
  pauseChannel(channel);
  channel.startOffset = 0;
  channel.startTime = 0;
  if (channel.abortController) {
    channel.abortController.abort();
    channel.abortController = null;
  }
  if (channel.hls) {
    channel.hls.destroy();
    channel.hls = null;
  }
  if (channel.audioEl) {
    channel.audioEl.removeAttribute("src");
    try {
      channel.audioEl.load();
    } catch (e) {}
  }
  cleanupWebAudioChannel(channel);
  channel.volume = 1.0;
  channel.isEnding = false;
  channel.hasTriggeredNext = false;
}

function decodeAudio(ctx: AudioContext, buffer: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const result = ctx.decodeAudioData(
      buffer,
      (decoded) => resolve(decoded),
      (err) => reject(err || new Error("Decoding error"))
    );
    if (result && typeof result.catch === "function") {
      result.catch(reject);
    }
  });
}

const tickProgress = () => {
  const channel = activeChannel;
  let current = 0;
  let duration = 0;

  if (channel.isHlsMode) {
    if (channel.audioEl) {
      current = channel.audioEl.currentTime;
      duration = channel.audioEl.duration || 0;
    }
  } else {
    if (channel.audioBuffer) {
      const ctx = getAudioContext();
      current = channel.isWebAudioPlaying
        ? channel.startOffset + (ctx.currentTime - channel.startTime)
        : channel.startOffset;
      current = Math.min(current, channel.audioBuffer.duration);
      duration = channel.audioBuffer.duration;
    }
  }

  if (onProgress) {
    onProgress(current, duration);
  }

  // Check for auto-transition near end of track
  const xfadeDur = usePlayerStore.getState().crossfadeDuration;
  if (
    duration > 0 &&
    xfadeDur > 0 &&
    duration - current <= xfadeDur &&
    !channel.hasTriggeredNext &&
    usePlayerStore.getState().isPlaying
  ) {
    const store = usePlayerStore.getState();
    if (store.repeat !== "one") {
      const playlist = store.currentPlaylist || genrePlaylist(store.activeGenre || "Lofi Chill");
      const tracks = playlist.tracks;
      const currentTrack = store.currentTrack;
      const idx = currentTrack ? tracks.findIndex((t) => t.id === currentTrack.id) : -1;
      const hasNext = store.shuffle || store.repeat === "all" || (idx !== -1 && idx + 1 < tracks.length);

      if (hasNext) {
        channel.hasTriggeredNext = true;
        store.next();
      }
    }
  }
};

const handleVisibilityChange = () => {
  if (typeof document !== "undefined" && document.visibilityState === "visible") {
    tickProgress();
  }
};

function startProgressLoop() {
  if (animFrameId !== null) return;
  tickProgress();
  animFrameId = window.setInterval(tickProgress, 250) as any;
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }
}

function stopProgressLoop() {
  if (animFrameId !== null) {
    clearInterval(animFrameId);
    animFrameId = null;
  }
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }
}

async function playChannel(channel: PlayerChannel) {
  if (channel.isHlsMode) {
    const audio = initAudio(channel);
    try {
      await audio.play();
    } catch (err) {
      console.error(`Playback failed on channel ${channel.name}:`, err);
    }
  } else {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => {});
    }

    if (channel.isWebAudioPlaying || !channel.audioBuffer) return;

    channel.sourceNode = ctx.createBufferSource();
    channel.sourceNode.buffer = channel.audioBuffer;
    initGainNode(channel);
    channel.sourceNode.connect(channel.gainNode!);

    channel.sourceNode.onended = () => {
      if (channel.isWebAudioPlaying) {
        const current = channel.startOffset + (ctx.currentTime - channel.startTime);
        if (current >= channel.audioBuffer!.duration - 0.5) {
          channel.isWebAudioPlaying = false;
          if (channel.sourceNode) {
            channel.sourceNode.disconnect();
            channel.sourceNode = null;
          }
          handleEnded(channel);
        }
      }
    };

    channel.sourceNode.start(0, channel.startOffset);
    channel.startTime = ctx.currentTime;
    channel.isWebAudioPlaying = true;
  }
}

let fadeIntervalId: any = null;
let fadeStartTime = 0;
let fadeOutgoing: PlayerChannel | null = null;
let fadeIncoming: PlayerChannel | null = null;

function startCrossfade(outgoing: PlayerChannel, incoming: PlayerChannel, resumeFromCurrent = false) {
  const dur = usePlayerStore.getState().crossfadeDuration;
  if (dur <= 0) {
    stopChannel(outgoing);
    incoming.volume = 1.0;
    updateChannelVolume(incoming);
    return;
  }

  fadeOutgoing = outgoing;
  fadeIncoming = incoming;
  outgoing.isEnding = true;
  incoming.isEnding = false;

  const startOutVol = resumeFromCurrent ? outgoing.volume : 1.0;
  const startInVol = resumeFromCurrent ? incoming.volume : 0.0;

  const remainingRatio = startOutVol; // Scale duration by remaining volume to fade out
  const actualDur = dur * remainingRatio;

  if (actualDur <= 0.05) {
    stopChannel(outgoing);
    incoming.volume = 1.0;
    updateChannelVolume(incoming);
    return;
  }

  const ctx = getAudioContext();
  fadeStartTime = ctx.currentTime;

  if (fadeIntervalId !== null) {
    clearInterval(fadeIntervalId);
  }

  fadeIntervalId = setInterval(() => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const elapsed = now - fadeStartTime;
    const ratio = Math.min(1, elapsed / actualDur);

    if (fadeOutgoing) {
      fadeOutgoing.volume = startOutVol * (1.0 - ratio);
      updateChannelVolume(fadeOutgoing);
    }
    if (fadeIncoming) {
      fadeIncoming.volume = startInVol + (1.0 - startInVol) * ratio;
      updateChannelVolume(fadeIncoming);
    }

    if (ratio >= 1) {
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;
      if (fadeOutgoing) {
        stopChannel(fadeOutgoing);
        fadeOutgoing = null;
      }
      fadeIncoming = null;
    }
  }, 30) as any;
}

export const musicPlayer = {
  unlockAudio() {
    // Timer and player controls both call this. Never play/pause the active
    // HTMLAudioElement here because that races the real transport.
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
  },

  async load(url: string) {
    let outgoing: PlayerChannel | null = null;
    const activeIsPlaying = !activeChannel.isHlsMode
      ? activeChannel.isWebAudioPlaying
      : (activeChannel.audioEl && !activeChannel.audioEl.paused);

    if (activeIsPlaying) {
      outgoing = activeChannel;
      const temp = activeChannel;
      activeChannel = inactiveChannel;
      inactiveChannel = temp;
    } else {
      stopChannel(activeChannel);
      stopChannel(inactiveChannel);
    }

    const channel = activeChannel;
    stopChannel(channel);

    channel.isHlsMode = url.endsWith(".m3u8") && (Hls.isSupported() || canPlayNativeHls());
    channel.currentUrl = url;
    pendingSeekTime = null;
    channel.volume = 1.0;

    const loadId = ++channel.activeLoadId;

    if (channel.isHlsMode) {
      const audio = initAudio(channel);
      if (Hls.isSupported()) {
        const hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 10,
          maxMaxBufferLength: 15,
          backBufferLength: 5,
          maxBufferSize: 3 * 1024 * 1024,
        });
        channel.hls = hlsInstance;
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(audio);

        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn("Fatal HLS network error, attempting recovery...");
                hlsInstance.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("Fatal HLS media error, attempting recovery...");
                hlsInstance.recoverMediaError();
                break;
              default:
                console.error("Unrecoverable HLS error:", data);
                if (channel === activeChannel) {
                  musicPlayer.stop();
                  usePlayerStore.getState().pause();
                } else {
                  stopChannel(channel);
                }
                break;
            }
          }
        });
      } else {
        audio.src = url;
        audio.load();
      }
      channel.loadPromise = null;
    } else {
      channel.audioBuffer = null;
      channel.startOffset = 0;
      channel.startTime = 0;

      if (channel.abortController) {
        channel.abortController.abort();
      }
      channel.abortController = new AbortController();
      const signal = channel.abortController.signal;

      channel.loadPromise = (async () => {
        const ctx = getAudioContext();
        try {
          const response = await fetch(url, { signal });
          if (!response.ok) {
            throw new Error(`Audio stream request failed (${response.status})`);
          }
          if (channel.activeLoadId !== loadId) return;
          const arrayBuffer = await response.arrayBuffer();

          if (channel.activeLoadId !== loadId) return;

          const decoded = await decodeAudio(ctx, arrayBuffer);

          if (channel.activeLoadId !== loadId) return;

          channel.audioBuffer = decoded;

          if (pendingSeekTime !== null && channel === activeChannel) {
            channel.startOffset = Math.max(0, Math.min(pendingSeekTime, channel.audioBuffer.duration));
            pendingSeekTime = null;
          }

          if (onProgress && channel === activeChannel) {
            onProgress(channel.startOffset, channel.audioBuffer.duration);
          }
        } catch (err: any) {
          if (err.name === "AbortError" || channel.activeLoadId !== loadId) {
            return;
          }
          console.error("Failed to load/decode audio via Web Audio API:", err);
          if (channel === activeChannel) {
            musicPlayer.stop();
            usePlayerStore.getState().pause();
          } else {
            stopChannel(channel);
          }
          throw err;
        } finally {
          if (channel.activeLoadId === loadId) {
            channel.loadPromise = null;
            channel.abortController = null;
          }
        }
      })();
      await channel.loadPromise;
    }
  },

  async play() {
    shouldPlay = true;
    const channel = activeChannel;
    const playLoadId = channel.activeLoadId;

    if (channel.loadPromise) {
      try {
        await channel.loadPromise;
      } catch (err) {}
    }

    if (!shouldPlay || channel.activeLoadId !== playLoadId) return;

    // Check if the inactiveChannel was playing (or fading out) and should be crossfaded
    const wasCrossfading = inactiveChannel.isEnding;
    const hasOutgoing = !inactiveChannel.isHlsMode
      ? inactiveChannel.isWebAudioPlaying
      : (inactiveChannel.audioEl && !inactiveChannel.audioEl.paused);

    if (hasOutgoing || wasCrossfading) {
      channel.volume = wasCrossfading ? channel.volume : 0.0;
      updateChannelVolume(channel);
    } else {
      channel.volume = 1.0;
      updateChannelVolume(channel);
    }

    if (wasCrossfading) {
      // Resume playback of the outgoing channel
      playChannel(inactiveChannel).catch(() => {});
    }

    await playChannel(channel);
    startProgressLoop();

    if (hasOutgoing || wasCrossfading) {
      startCrossfade(inactiveChannel, channel, wasCrossfading);
    }
  },

  pause() {
    shouldPlay = false;
    pauseChannel(activeChannel);
    pauseChannel(inactiveChannel);
    stopProgressLoop();

    if (fadeIntervalId !== null) {
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;
    }
  },

  seek(seconds: number) {
    const channel = activeChannel;
    channel.hasTriggeredNext = false;

    // Stop any active crossfade and restore full volume on seek
    if (fadeIntervalId !== null) {
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;
    }
    stopChannel(inactiveChannel);
    channel.volume = 1.0;
    updateChannelVolume(channel);

    if (channel.isHlsMode) {
      if (channel.audioEl && isFinite(seconds) && seconds >= 0) {
        if (channel.audioEl.readyState >= 1) {
          channel.audioEl.currentTime = seconds;
          pendingSeekTime = null;
        } else {
          pendingSeekTime = seconds;
        }
      }
    } else {
      if (!channel.audioBuffer) {
        pendingSeekTime = seconds;
        return;
      }
      const wasPlaying = channel.isWebAudioPlaying;

      if (wasPlaying) {
        pauseChannel(channel);
      }

      channel.startOffset = Math.max(0, Math.min(seconds, channel.audioBuffer.duration));

      if (wasPlaying) {
        playChannel(channel).catch(() => {});
      } else {
        if (onProgress) {
          onProgress(channel.startOffset, channel.audioBuffer.duration);
        }
      }
    }
  },

  setVolume(volume: number) {
    updateChannelVolume(activeChannel);
    updateChannelVolume(inactiveChannel);
  },

  onProgress(cb: ProgressCallback) {
    onProgress = cb;
  },

  onEnded(cb: EndCallback) {
    onEnded = cb;
  },

  get currentTime() {
    const channel = activeChannel;
    if (channel.isHlsMode) {
      return channel.audioEl?.currentTime ?? 0;
    } else {
      if (!channel.audioBuffer) return channel.startOffset;
      if (channel.isWebAudioPlaying) {
        const ctx = getAudioContext();
        return Math.min(channel.startOffset + (ctx.currentTime - channel.startTime), channel.audioBuffer.duration);
      }
      return channel.startOffset;
    }
  },

  get duration() {
    const channel = activeChannel;
    if (channel.isHlsMode) {
      return channel.audioEl?.duration ?? 0;
    } else {
      return channel.audioBuffer?.duration ?? 0;
    }
  },

  get paused() {
    const channel = activeChannel;
    if (channel.isHlsMode) {
      return channel.audioEl?.paused ?? true;
    } else {
      return !channel.isWebAudioPlaying;
    }
  },

  stop() {
    this.pause();
    pendingSeekTime = null;
    stopChannel(activeChannel);
    stopChannel(inactiveChannel);
  },

  destroy() {
    this.stop();
    stopProgressLoop();
    onProgress = null;
    onEnded = null;

    stopChannel(channelA);
    if (channelA.audioEl) channelA.audioEl = null;

    stopChannel(channelB);
    if (channelB.audioEl) channelB.audioEl = null;

    if (audioCtx && audioCtx.state !== "closed") {
      try {
        audioCtx.close().catch(() => {});
      } catch (e) {}
      audioCtx = null;
    }
  },
};
