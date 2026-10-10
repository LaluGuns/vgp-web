// The compressor's gain computer, shared by the shorts. Moved here from the
// first 32 s film (removed), whose model.mjs also held its drum loop.

const toDb = (v) => 20 * Math.log10(Math.max(1e-5, v));

/**
 * Feed-forward compressor in the log domain with smooth branching between
 * attack and release (Giannoulis, Massberg and Reiss, 2012). `settingsAt(i)`
 * returns {threshold, ratio, attack, release} or null for bypass at sample i.
 * Returns gain reduction in dB (positive numbers) per sample.
 */
export function compress(env, rate, settingsAt) {
    const gr = new Float32Array(env.length);
    let g = 0;
    let last = null;
    let aA = 0;
    let aR = 0;
    for (let i = 0; i < env.length; i++) {
        const c = settingsAt(i);
        if (!c) {
            g = 0;
            last = null;
            continue;
        }
        if (c !== last) {
            aA = Math.exp(-1 / (c.attack * rate));
            aR = Math.exp(-1 / (c.release * rate));
            last = c;
        }
        const over = toDb(env[i]) - toDb(c.threshold);
        const target = over > 0 ? over * (1 - 1 / c.ratio) : 0;
        const a = target > g ? aA : aR;
        g = a * g + (1 - a) * target;
        gr[i] = g;
    }
    return gr;
}
