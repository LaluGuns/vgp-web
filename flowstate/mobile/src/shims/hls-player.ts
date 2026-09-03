import { usePlayerStore } from "@/lib/stores/player-store";
import { flowAudio, isFlowMobile, nativePlatform } from "../native-bridge";
import { musicPlayer as webMusicPlayer } from "../../../lib/audio/hls-player";

type ProgressCallback = (current: number, duration: number) => void;
type EndCallback = () => void;

let progressCallback: ProgressCallback | null = null;
let endedCallback: EndCallback | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let currentSeconds = 0;
let durationSeconds = 0;
let nativePaused = true;
let endedDelivered = false;

function nativeEngineAvailable(): boolean {
  if (!isFlowMobile() || nativePlatform() === "web") return false;
  const plugin = flowAudio();
  return !!plugin?.load && !!plugin?.play && !!plugin?.pause && !!plugin?.seek && !!plugin?.setVolume && !!plugin?.getState && !!plugin?.stop;
}

async function pollNativeState() {
  const plugin = flowAudio();
  if (!plugin?.getState) return;
  try {
    const state = await plugin.getState();
    currentSeconds = Number.isFinite(state.currentSeconds) ? Math.max(0, state.currentSeconds) : currentSeconds;
    durationSeconds = Number.isFinite(state.durationSeconds) ? Math.max(0, state.durationSeconds) : durationSeconds;
    nativePaused = !state.playing;
    progressCallback?.(currentSeconds, durationSeconds);
    if (state.ended) {
      if (!endedDelivered) {
        endedDelivered = true;
        endedCallback?.();
      }
    } else {
      endedDelivered = false;
    }
  } catch (error) {
    console.warn("Flow native audio state polling failed", error);
  }
}

function startPolling() {
  if (pollTimer) return;
  void pollNativeState();
  pollTimer = setInterval(() => void pollNativeState(), 250);
}

function stopPolling() {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
}

async function assertNativeEngine() {
  if (!nativeEngineAvailable()) {
    throw new Error("FlowAudio native plugin is unavailable on a native Flow build");
  }
  return flowAudio()!;
}

export const musicPlayer = {
  unlockAudio() {
    if (!nativeEngineAvailable()) webMusicPlayer.unlockAudio();
  },

  async load(url: string) {
    if (!isFlowMobile() || nativePlatform() === "web") return webMusicPlayer.load(url);
    const plugin = await assertNativeEngine();
    const track = usePlayerStore.getState().currentTrack;
    if (!track) throw new Error("Flow native audio load requested without a current track");
    currentSeconds = 0;
    durationSeconds = Math.max(0, track.durationS || 0);
    nativePaused = true;
    endedDelivered = false;
    await plugin.load!({
      url,
      cacheKey: track.id,
      title: track.title,
      artist: track.displayCredit ?? track.recordingArtist ?? track.artist,
      premium: track.isPremium,
    });
    await pollNativeState();
  },

  async play() {
    if (!isFlowMobile() || nativePlatform() === "web") return webMusicPlayer.play();
    const plugin = await assertNativeEngine();
    await plugin.play!();
    nativePaused = false;
    startPolling();
  },

  pause() {
    if (!isFlowMobile() || nativePlatform() === "web") return webMusicPlayer.pause();
    const plugin = flowAudio();
    nativePaused = true;
    stopPolling();
    void plugin?.pause?.().catch((error) => console.warn("Flow native audio pause failed", error));
  },

  seek(seconds: number) {
    if (!isFlowMobile() || nativePlatform() === "web") return webMusicPlayer.seek(seconds);
    if (!Number.isFinite(seconds) || seconds < 0) return;
    currentSeconds = seconds;
    endedDelivered = false;
    progressCallback?.(currentSeconds, durationSeconds);
    void flowAudio()?.seek?.({ seconds }).catch((error) => console.warn("Flow native audio seek failed", error));
  },

  setVolume(volume: number) {
    if (!isFlowMobile() || nativePlatform() === "web") return webMusicPlayer.setVolume(volume);
    const value = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0));
    void flowAudio()?.setVolume?.({ value }).catch((error) => console.warn("Flow native audio volume failed", error));
  },

  onProgress(callback: ProgressCallback) {
    progressCallback = callback;
    if (!isFlowMobile() || nativePlatform() === "web") webMusicPlayer.onProgress(callback);
  },

  onEnded(callback: EndCallback) {
    endedCallback = callback;
    if (!isFlowMobile() || nativePlatform() === "web") webMusicPlayer.onEnded(callback);
  },

  get currentTime() {
    return nativeEngineAvailable() ? currentSeconds : webMusicPlayer.currentTime;
  },

  get duration() {
    return nativeEngineAvailable() ? durationSeconds : webMusicPlayer.duration;
  },

  get paused() {
    return nativeEngineAvailable() ? nativePaused : webMusicPlayer.paused;
  },

  stop() {
    if (!isFlowMobile() || nativePlatform() === "web") return webMusicPlayer.stop();
    nativePaused = true;
    currentSeconds = 0;
    durationSeconds = 0;
    endedDelivered = false;
    stopPolling();
    void flowAudio()?.stop?.().catch((error) => console.warn("Flow native audio stop failed", error));
  },

  destroy() {
    if (!isFlowMobile() || nativePlatform() === "web") return webMusicPlayer.destroy();
    this.stop();
    progressCallback = null;
    endedCallback = null;
  },
};
