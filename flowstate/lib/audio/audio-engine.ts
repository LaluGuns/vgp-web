let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

const loops = new Map<
  string,
  { source: AudioBufferSourceNode; gain: GainNode; buffer: AudioBuffer }
>();
const bufferCache = new Map<string, Promise<AudioBuffer>>();
const pending = new Map<string, number>(); // Map to track in-flight load request IDs
let requestCounter = 0;

function getContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("AudioEngine can only be used in browser environments.");
  }
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("Web Audio API is not supported in this browser.");
    }
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getMaster(): GainNode {
  getContext();
  return masterGain!;
}

export const ambientEngine = {
  // Synchronously unlock AudioContext inside user gestures for iOS/Safari support
  unlock() {
    try {
      const ctx = getContext();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      // Play a quick silent sound to fully initialize/unlock the hardware on iOS/Safari
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      source.stop();
      source.disconnect();
    } catch (e) {
      console.warn("[AudioEngine] Safari unlock failed:", e);
    }
  },

  async play(id: string, url: string, volume: number): Promise<boolean> {
    let ctx: AudioContext;
    let master: GainNode;
    try {
      ctx = getContext();
      master = getMaster();
    } catch (e) {
      console.error("[AudioEngine] Play failed: Web Audio context not available.", e);
      return false;
    }

    if (loops.has(id)) {
      this.setVolume(id, volume);
      return true;
    }

    // Guard against rapid re-trigger before the buffer finishes loading.
    if (pending.has(id)) return true;
    
    const currentRequest = ++requestCounter;
    pending.set(id, currentRequest);

    try {
      let bufferPromise = bufferCache.get(url);
      if (!bufferPromise) {
        bufferPromise = (async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio (${response.status})`);
          }
          const arrayBuffer = await response.arrayBuffer();
          return await ctx.decodeAudioData(arrayBuffer);
        })();
        bufferCache.set(url, bufferPromise);

        // Handle errors: remove failed promise from cache to allow retries
        bufferPromise.catch(() => {
          if (bufferCache.get(url) === bufferPromise) {
            bufferCache.delete(url);
          }
        });
      }

      const buffer = await bufferPromise;

      // If it was cancelled or a new request was made while loading, or already playing:
      if (pending.get(id) !== currentRequest) return false;
      if (loops.has(id)) return true;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = ctx.createGain();
      // Perceptual volume mapping (exponential squaring) cleanly scheduled
      gain.gain.setValueAtTime(Math.pow(volume, 2), ctx.currentTime);

      source.connect(gain);
      gain.connect(master);
      source.start(0);

      loops.set(id, { source, gain, buffer });
      return true;
    } catch (error) {
      console.error(`[AudioEngine] Error playing sound "${id}":`, error);
      return false;
    } finally {
      // Only clear if this request is still the active pending request
      if (pending.get(id) === currentRequest) {
        pending.delete(id);
      }
    }
  },

  stop(id: string) {
    pending.delete(id); // cancel an in-flight load if toggled off mid-load
    const loop = loops.get(id);
    if (!loop) return;
    try {
      loop.source.stop();
    } catch (e) {}
    loop.source.disconnect();
    loop.gain.disconnect();
    loops.delete(id);
  },

  setVolume(id: string, volume: number) {
    const loop = loops.get(id);
    if (!loop) return;
    try {
      const ctx = getContext();
      // Perceptual volume mapping (exponential squaring)
      const gainValue = Math.pow(volume, 2);
      const currentTime = ctx.currentTime;
      loop.gain.gain.setValueAtTime(loop.gain.gain.value, currentTime);
      loop.gain.gain.setTargetAtTime(gainValue, currentTime, 0.05);
    } catch (e) {
      console.error("[AudioEngine] SetVolume failed:", e);
    }
  },

  setMasterVolume(volume: number) {
    try {
      const ctx = getContext();
      const master = getMaster();
      // Perceptual volume mapping (exponential squaring)
      const gainValue = Math.pow(volume, 2);
      const currentTime = ctx.currentTime;
      master.gain.setValueAtTime(master.gain.value, currentTime);
      master.gain.setTargetAtTime(gainValue, currentTime, 0.05);
    } catch (e) {
      console.error("[AudioEngine] SetMasterVolume failed:", e);
    }
  },

  stopAll() {
    // Copy loops keys to avoid concurrent map mutations during iteration
    const ids = Array.from(loops.keys());
    for (const id of ids) {
      this.stop(id);
    }
  },

  isPlaying(id: string): boolean {
    return loops.has(id);
  },
};
