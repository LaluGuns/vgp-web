/**
 * Level matching for the demos that measure each setting offline (the
 * compressor, the limiter; the saturation demo shares the posting rules).
 * One scheme for every way a setting can change, so no path keeps a gain
 * meant for another one:
 *
 * - What gain: `along` gives the matching gain for the setting now heard.
 *   A setting already measured plays its own. Otherwise the measurements on
 *   the same slider (the other settings equal) give it: between two of
 *   them by interpolation, past the last one by the demo's safe rule from
 *   the nearest (never louder than that measurement implies). While a demo
 *   plays and is idle it measures ahead (`aheadAlong`): one step either
 *   side of each slider, both ends, the middle; so the next move usually
 *   lands on a measured setting or between two.
 * - When: the demo posts that gain whenever anything it depends on
 *   changes (a setting, any measurement landing, Play, the source), on its
 *   processor's own time (`postGain`): a lower gain at once, a higher one
 *   only as fast as the processor builds the gain reduction it matches.
 */

/** A slider: its range, its step, and the scale along which a matching gain changes about evenly. */
export interface Axis {
    min: number;
    max: number;
    step: number;
    scale?: (v: number) => number;
}

const db = (gain: number) => 20 * Math.log10(Math.max(gain, 1e-6));

/**
 * The matching gain at `v` from measured points on the same slider: exact on
 * one, interpolated in dB between the two either side, else `edge` from the
 * nearest (the demo's safe estimate from one measurement). `reach` is how far
 * the nearest point is, as a share of the slider (0 when exact or between two).
 */
export function along<T>(points: { v: number; gain: number; from: T }[], v: number, axis: Axis, edge: (nearest: T) => number): { gain: number; reach: number } | null {
    if (!points.length) return null;
    const x = axis.scale ?? ((u: number) => u);
    const at = x(v);
    let lo: (typeof points)[number] | null = null;
    let hi: (typeof points)[number] | null = null;
    for (const p of points) {
        const px = x(p.v);
        if (px === at) return { gain: p.gain, reach: 0 };
        if (px < at && (!lo || px > x(lo.v))) lo = p;
        if (px > at && (!hi || px < x(hi.v))) hi = p;
    }
    if (lo && hi) {
        const t = (at - x(lo.v)) / (x(hi.v) - x(lo.v));
        return { gain: 10 ** ((db(lo.gain) + (db(hi.gain) - db(lo.gain)) * t) / 20), reach: 0 };
    }
    const nearest = (lo ?? hi)!;
    const span = Math.abs(x(axis.max) - x(axis.min)) || 1;
    return { gain: edge(nearest.from), reach: Math.abs(at - x(nearest.v)) / span };
}

/**
 * Values to measure ahead along a slider from `v`, in three tiers: a step either side, both ends, then `inside`
 * points evenly spaced between them (on the slider's own steps).
 */
export function aheadAlong(axis: Axis, v: number, inside = 1): number[][] {
    const inRange = (u: number) => u >= axis.min - 1e-9 && u <= axis.max + 1e-9;
    const fix = (u: number) => Number((Math.round((u - axis.min) / axis.step) * axis.step + axis.min).toFixed(6));
    const near = [v - axis.step, v + axis.step].filter(inRange).map(fix);
    const ends = [axis.min, axis.max].filter((u) => u !== v);
    const middle = Array.from({ length: inside }, (_, i) => fix(axis.min + ((axis.max - axis.min) * (i + 1)) / (inside + 1))).filter((u) => u !== v);
    return [near, ends, middle];
}

/** What a gain parameter needs to post a matching gain once, and to skip posting the same one twice. */
export interface Posted {
    ctx: BaseAudioContext;
    param: AudioParam;
    /** The gain last posted. */
    target: number;
}

/**
 * Posts `gain` (replacing anything still scheduled): lower at once (5 ms); higher from `start` (now when omitted)
 * with time constant `rise`. A gain equal to the one last posted is left alone, so a rise already on its way keeps
 * its timing.
 */
export function postGain(n: Posted, gain: number, rise: number, start?: number) {
    if (Math.abs(gain - n.target) < 1e-6 * Math.max(1, gain)) return;
    n.target = gain;
    const t = n.ctx.currentTime;
    const now = n.param.value;
    n.param.cancelScheduledValues(t);
    if (gain <= now) n.param.setTargetAtTime(gain, t, 0.005);
    else n.param.setTargetAtTime(gain, Math.max(t, start ?? t), Math.max(0.005, rise));
}

/**
 * Posts `gain` (replacing anything still scheduled): lower at once (5 ms); higher as a ramp straight in dB (an
 * exponential ramp), from `start` (now when earlier) over `duration` seconds: the pace of a processor that builds
 * its gain reduction a few dB at a time. A gain equal to the one last posted is left alone.
 */
export function rampGain(n: Posted, gain: number, start: number, duration: number) {
    if (Math.abs(gain - n.target) < 1e-6 * Math.max(1, gain)) return;
    n.target = gain;
    const t = n.ctx.currentTime;
    const now = Math.max(n.param.value, 1e-4);
    n.param.cancelScheduledValues(t);
    if (gain <= now) {
        n.param.setTargetAtTime(gain, t, 0.005);
        return;
    }
    const at = Math.max(t, start);
    n.param.setValueAtTime(now, at);
    n.param.exponentialRampToValueAtTime(gain, at + Math.max(0.005, duration));
}
