/**
 * The reader's demo volume, shared by the volume row under every demo and the
 * audio engine. It lives apart from the engine so a lesson whose demo has not
 * played loads only this and the slider.
 *
 * The volume is the last stage of the output (engine.ts), after the safety
 * limiter, so it scales what a demo plays and never changes its dynamics.
 * 100 % is the level the demos are made for; the slider only turns down.
 */

/** A new key: under the old one (`vgp_demo_volume`) 100 % meant 12 dB more than it does now. */
const KEY = 'vgp_demo_volume_v2';

/** Where the slider starts: about 4 dB under 100 %. */
export const DEFAULT_VOLUME = 0.8;

const listeners = new Set<(volume: number) => void>();

export function storedVolume(): number {
    try {
        const raw = localStorage.getItem(KEY);
        const v = raw === null ? NaN : Number(raw);
        return Number.isFinite(v) && v > 0 && v <= 1 ? v : DEFAULT_VOLUME;
    } catch {
        return DEFAULT_VOLUME;
    }
}

export function setVolume(volume: number) {
    try {
        localStorage.setItem(KEY, String(volume));
    } catch {
        // The slider still works for this visit.
    }
    listeners.forEach((fn) => fn(volume));
}

/** Calls `fn` with every new volume. Returns a function that stops it. */
export function onVolume(fn: (volume: number) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

/** Slider position to gain. Squared, so equal steps sound about even; 100 % is unity gain. */
export const volumeGain = (volume: number) => volume * volume;
