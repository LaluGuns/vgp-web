// Film 5 picture: scenes drawn on one 1080 x 1920 canvas, a pure function of
// time. window.seek(t) draws the frame at t seconds. Reads TIMELINE and DATA
// (the A/B's levels, limiter gain and the two hearing models, computed with
// the sound) and the drawing kit in art.js.
//
// Colour has one meaning for the whole film: amber is the kick and its
// click, cyan is data (levels, the limiter, the ruler), the riser and its fog
// are violet-grey, everything else is neutral.
/* global earPinna, crowd, EARX, earSection, hairCell, magnifier, fogCloud, soundArcs, sparkle, speakerBox, consoleDesk, grMeter, knobSmall, brainChar, scissors, clip, TIMELINE, DATA, DP_URL, LESSON, W, H, P, clamp, lerp, seg, E, bump, font, label, rr, pill, shadow, ground, panel, PANEL, fader, faderCapY, robotDome, gloveDown, tube, speaker, DISPLAY, BODY */

const TL = TIMELINE;
const D = DATA;
const cv = document.getElementById('film');
cv.width = W;
cv.height = H;
const g = cv.getContext('2d');

// The riser and its fog.
const FOG = '#a7abc9';
const FOG_RGB = '200,203,226';
const CYAN_RGB = '125,211,252';
const RISER = '#7e83a8';

const VO = D.vo;
const voBy = Object.fromEntries(VO.map((v) => [v.id, v]));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
/** Film time at which `word` (k-th occurrence) is spoken in narration line `id`. */
function wt(id, word, k = 0) {
    const ws = voBy[id].words.filter((w) => norm(w.w) === norm(word));
    if (!ws[k]) throw new Error(`no word ${word} in ${id}`);
    return ws[k].s;
}
const vEnd = (id) => voBy[id].at + voBy[id].dur;
/** wt(), or a fraction of the way through the line when a take words it differently. */
function wto(id, word, frac, k = 0) {
    const ws = voBy[id].words.filter((w) => norm(w.w) === norm(word));
    return ws[k] ? ws[k].s : voBy[id].at + frac * voBy[id].dur;
}
const BEAT = TL.beat;
const demoBy = Object.fromEntries(TL.demos.map((d) => [d.id, { ...d, to: d.at + (d.pre + d.post) * BEAT, down: d.at + d.pre * BEAT }]));
const DEMOS = Object.values(demoBy);
const BUTTON = TL.button;
const SCENES = TL.scenes.map((s) => ({ ...s, start: s.line ? voBy[s.line].at + (s.dt ?? 0) : s.at }));
const SC = Object.fromEntries(SCENES.map((s) => [s.id, s.start]));
const sceneEnd = (id) => {
    const i = SCENES.findIndex((s) => s.id === id);
    return i + 1 < SCENES.length ? SCENES[i + 1].start : TL.duration;
};
const popIn = (t, t0, d = 0.3) => clamp((t - t0) / d);
/** The three reasons as one line, the current one lit: ears · limiter · brain. */
function tracker(cur, alpha = 1) {
    const items = ['ears', 'limiter', 'brain'];
    font(g, 40, 700, BODY);
    const sep = '  ·  ';
    const ws = items.map((w) => g.measureText(w).width);
    const sw = g.measureText(sep).width;
    let x = 540 - (ws.reduce((a, b) => a + b, 0) + 2 * sw) / 2;
    items.forEach((w, i) => {
        label(g, w, x, 412, { size: 40, weight: i === cur ? 800 : 600, color: i === cur ? P.ink : P.ink3, family: BODY, alpha });
        x += ws[i];
        if (i < 2) label(g, sep, x, 412, { size: 40, weight: 600, color: P.ink4, family: BODY, alpha });
        x += sw;
    });
}
/** A slow push-in over a stretch of the film, about the middle of the picture. */
function cam(t, s0, s1, amount = 0.035, slideIn = true) {
    const z = 1 + amount * E.inOut(seg(t, s0, s1));
    // Scenes push in from the right and out to the left, so a change reads as a move, not a dissolve.
    // A full-width push: the old scene leaves left as the new one arrives from the right, both opaque.
    g.translate((slideIn ? (1 - E.inOut(seg(t, s0 - 0.12, s0 + 0.18))) * W : 0) - E.inOut(seg(t, s1 - 0.12, s1 + 0.18)) * W, 0);
    g.translate(540, 820);
    g.scale(z, z);
    g.translate(-540, -820);
}
/** Visible between a scene's start and end, with short dissolves either side. */
// Scenes overlap by 0.3 s while one pushes out and the next pushes in, so no frame is empty;
// the replay leaves before the end card arrives, so their text never stacks.
const sceneAlpha = (t, id) => (t < SC[id] - 0.12 ? 0 : id === 'replay' ? 1 - seg(t, sceneEnd(id) - 0.24, sceneEnd(id)) : t < sceneEnd(id) + 0.18 ? 1 : 0);

// ── Data around each version's downbeat, one value per ms ──
const V = D.versions;
const MS0 = Math.round(-D.win.from * 1000);
const val = (arr, ms) => arr[clamp(Math.round(MS0 + ms), 0, arr.length - 1)] ?? 0;
const maxIn = (arr, a, b) => {
    let m = 0;
    for (let ms = Math.floor(a); ms <= b; ms++) m = Math.max(m, val(arr, ms));
    return m;
};
const PEAK_MAX = Math.max(...V[1].peak, ...V[2].peak);
const GAP_MS = D.gapMs;
const fmt = (x, d = 1) => x.toFixed(d).replace('-', '−');

/** Piecewise-linear map through [[t, v], ...]. */
function keys(t, ks) {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], (t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]));
    return ks[ks.length - 1][1];
}

function dashed(gc, x0, y0, x1, y1, color, width = 4, dash = [16, 12]) {
    gc.save();
    gc.setLineDash(dash);
    gc.strokeStyle = color;
    gc.lineWidth = width;
    gc.beginPath();
    gc.moveTo(x0, y0);
    gc.lineTo(x1, y1);
    gc.stroke();
    gc.restore();
}

/** A pill with a thin leader line to its target; the leader stops at the pill's edge. */
function tag(gc, text, x, y, target, { bg = P.ink, fg = P.dark, ring = null, a = 1, size = 36, weight = 700 } = {}) {
    if (a <= 0) return;
    if (target) {
        gc.save();
        gc.globalAlpha *= a;
        gc.strokeStyle = ring ?? bg;
        gc.lineWidth = 3;
        gc.beginPath();
        gc.moveTo(x, y + (target.y > y ? size * 0.85 : -size * 0.85));
        gc.lineTo(target.x, target.y);
        gc.stroke();
        gc.fillStyle = ring ?? bg;
        gc.beginPath();
        gc.arc(target.x, target.y, 7, 0, Math.PI * 2);
        gc.fill();
        gc.restore();
    }
    pill(gc, text, x, y, { size, bg, fg, ring, alpha: a, scale: E.outBack(clamp(a)), weight });
}

/** Big kinetic headline: words pop in one after another from t0. `parts` = [[text, color], ...]. */
function headline(t, t0, parts, y, { size = 84, alpha = 1, stagger = 0.04, center = 540, maxW = 920 } = {}) {
    if (alpha <= 0) return;
    font(g, size, 800);
    let space = g.measureText(' ').width;
    let widths = parts.map(([s]) => g.measureText(s).width);
    let total = widths.reduce((a, b) => a + b, 0) + space * (parts.length - 1);
    // Shrink to fit the 920 px between the margins.
    if (total > maxW) {
        size = Math.floor((size * maxW) / total);
        font(g, size, 800);
        space = g.measureText(' ').width;
        widths = parts.map(([s]) => g.measureText(s).width);
        total = widths.reduce((a, b) => a + b, 0) + space * (parts.length - 1);
    }
    let x = center - total / 2;
    parts.forEach(([s, c], i) => {
        const k = E.outBack(clamp((t - t0 - i * stagger) / 0.2));
        const a = clamp((t - t0 - i * stagger) / 0.08);
        if (a > 0) {
            g.save();
            g.globalAlpha *= alpha * a;
            g.translate(x + widths[i] / 2, y);
            g.scale(lerp(0.7, 1, k), lerp(0.7, 1, k));
            label(g, s, 0, 0, { size, weight: 800, color: c ?? P.ink, align: 'center', base: 'middle' });
            g.restore();
        }
        x += widths[i] + space;
    });
}

/** Version badge: a numbered disc. */
function badgeNum(gc, n, x, y, r, { ring = 0, alpha = 1, fill = P.ink } = {}) {
    gc.save();
    gc.globalAlpha *= alpha;
    gc.fillStyle = fill;
    gc.beginPath();
    gc.arc(x, y, r, 0, Math.PI * 2);
    gc.fill();
    label(gc, String(n), x, y + r * 0.04, { size: r * 1.25, weight: 800, color: P.dark, align: 'center', base: 'middle' });
    if (ring > 0) {
        // A hand-drawn circle around the badge, drawn on.
        gc.strokeStyle = P.ink;
        gc.lineWidth = 6;
        gc.lineCap = 'round';
        gc.beginPath();
        gc.arc(x, y, r * 1.45, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2.1 * ring);
        gc.stroke();
    }
    gc.restore();
}

/** Time axis in ms under a plot: ticks and labels. */
function msAxis(gc, x0, x1, msA, msB, y, ticks, { alpha = 1 } = {}) {
    const X = (ms) => x0 + ((x1 - x0) * (ms - msA)) / (msB - msA);
    gc.save();
    gc.globalAlpha *= alpha;
    gc.strokeStyle = P.ink3;
    gc.lineWidth = 3;
    gc.beginPath();
    gc.moveTo(x0, y);
    gc.lineTo(x1, y);
    gc.stroke();
    for (const ms of ticks) {
        gc.beginPath();
        gc.moveTo(X(ms), y);
        gc.lineTo(X(ms), y + 14);
        gc.stroke();
        label(gc, ms === 0 ? 'drop' : `${ms > 0 ? '+' : '−'}${Math.abs(ms)} ms`, X(ms), y + 52, { size: 34, weight: 600, color: ms === 0 ? P.amber : P.ink2, align: 'center', family: BODY });
    }
    gc.restore();
}

/**
 * The mix as a mirrored waveform between msA and msB (relative to the
 * downbeat) of version v, drawn up to `upto` ms. Before the downbeat it is
 * the build, in the riser's colour; after it, neutral; the kick's own part in
 * amber on top.
 */
function wave(gc, v, box, msA, msB, upto, { gain = 1, dimKick = 0, alpha = 1 } = {}) {
    const col = 5;
    const w = box.x1 - box.x0;
    const half = (box.h / 2) * 0.94;
    const cy = box.y;
    gc.save();
    gc.globalAlpha *= alpha;
    for (let x = 0; x < w; x += col) {
        const a = msA + ((msB - msA) * x) / w;
        const b = msA + ((msB - msA) * (x + col)) / w;
        if (a > upto) break;
        const m = Math.min(1, (maxIn(V[v].peak, a, b) / PEAK_MAX) * gain);
        const k = Math.min(1, (maxIn(V[v].kick, a, b) / PEAK_MAX) * gain);
        const h = Math.max(1.5, half * m);
        gc.fillStyle = a < 0 ? FOG : P.ink2;
        gc.fillRect(box.x0 + x, cy - h, col - 1.5, 2 * h);
        if (k > 0.02) {
            const hk = half * k;
            gc.fillStyle = P.amber;
            gc.globalAlpha = alpha * (1 - dimKick);
            gc.fillRect(box.x0 + x, cy - hk, col - 1.5, 2 * hk);
            gc.globalAlpha = alpha;
        }
    }
    gc.restore();
}

// ══ A/B stage: the hook, the notch, and the replay ══
const AB = { x0: 170, x1: 880, lanes: [{ y: 735, h: 240 }, { y: 1110, h: 240 }] };
/** Expanding rings on the first kick, sized from its measured level as heard. */
function impact(gc, x, y, t0, t, v) {
    const age = t - t0;
    if (age < 0 || age > 0.7) return;
    const kick = v === 1 ? D.r1.kickDb : D.r2.kickDb;
    const r = 130 * 10 ** ((kick - D.r2.kickDb) / 20);
    gc.save();
    for (let i = 0; i < 2; i++) {
        const a = age - i * 0.08;
        if (a < 0) continue;
        const k = E.out(clamp(a / 0.5));
        gc.strokeStyle = `rgba(251,191,36,${0.9 * (1 - clamp(a / 0.6))})`;
        gc.lineWidth = 10 - 6 * k;
        gc.beginPath();
        gc.arc(x, y, r * (0.35 + 0.65 * k), 0, Math.PI * 2);
        gc.stroke();
    }
    gc.restore();
}

const SIL = (() => {
    let seed = 41;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 400 }, () => 0.35 + 0.25 * r());
})();
/** A neutral placeholder waveform (not data), the same in both lanes, right of the playhead. */
function silhouette(gc, box, upto, a0, b0) {
    const col = 5;
    const w = box.x1 - box.x0;
    const half = (box.h / 2) * 0.94;
    gc.save();
    // A flat band, plainly a placeholder, not a waveform.
    const x0 = Math.max(box.x0, box.x0 + ((upto - a0) / (b0 - a0)) * w);
    if (x0 < box.x1) {
        rr(gc, x0, box.y - half * 0.42, box.x1 - x0, half * 0.84, 18);
        gc.fillStyle = 'rgba(248,250,252,0.08)';
        gc.fill();
    }
    void SIL;
    void col;
    gc.restore();
}

/** ms relative to the downbeat that demo d has reached at time t. */
const abProgress = (d, t) => (t - d.down) * 1000;

function drawAB(t, frame1 = false, noHead = false) {
    const replay = t >= SC.replay - 0.05;
    const id = replay ? 'replay' : t < SC.notch ? 'ab' : 'notch';
    const a = frame1 ? 1 : replay ? sceneAlpha(t, 'replay') : t < SC.fog + 0.18 ? 1 : 0;
    if (a <= 0) return;
    g.save();
    g.globalAlpha *= a;
    if (!frame1 && !noHead) {
        if (replay) cam(t, SC.replay, SC.end);
        else if (t >= SC.notch) cam(t, SC.notch, SC.fog, 0.03, false);
    }
    const [dA, dB] = replay ? [demoBy.A2, demoBy.B2] : [demoBy.A, demoBy.B];
    // The replay uses the hook's window, so it is the same picture as the opening.
    const msA = -demoBy.A.pre * BEAT * 1000;
    const msB = demoBy.A.post * BEAT * 1000;
    const G = TL.guess;
    const tTwo = wt('hook', 'two');
    const guessing = !frame1 && !noHead && !replay && t >= G.at && t < voBy.hook.at - 0.05;
    // Headline: the question; "1 or 2?" while the viewer picks; the answer on "two".
    if (noHead) {
        // Cover: the headline is drawn by drawCover.
    } else if (replay) headline(t, SC.replay + 0.05, [['Listen'], ['for'], ['the'], ['click', P.amber]], 330, { size: 92 });
    else {
        const s0 = frame1 ? 1 : lerp(1.18, 1, E.outBack(seg(t, 0, 0.25)));
        g.save();
        g.translate(540, 320);
        g.scale(s0, s0);
        label(g, 'Same drop.', 0, 0, { size: 104, weight: 800, color: P.ink, align: 'center', base: 'middle' });
        g.restore();
        const answer = !frame1 && t >= voBy.hook.at - 0.05;
        if (answer) headline(t, tTwo - 0.05, [['2'], ['hits'], ['harder.']], 445, { size: 72 });
        else if (guessing) {
            const pulse = 1 + 0.06 * Math.exp(-(((t - G.at) % BEAT) / 0.12));
            g.save();
            g.translate(540, 445);
            g.scale(pulse, pulse);
            label(g, 'Which one hits harder?', 0, 0, { size: 66, weight: 800, color: P.ink, align: 'center', base: 'middle' });
            g.restore();
        } else label(g, 'One change. Which hits harder?', 540, 445, { size: 62, weight: 800, color: P.ink, align: 'center', base: 'middle' });
    }
    // Notch zoom on both lanes during the hook line, so the drop lines stay aligned.
    // The zoom into the gap starts on "It has" and lands on "gap".
    const zIn = id === 'notch' ? E.inOut(seg(t, wto('hook', 'has', 0.2) - 0.3, wto('hook', 'gap', 0.35) + 0.3)) : 0;
    const a0 = lerp(msA, -GAP_MS - 260, zIn);
    const b0 = lerp(msB, 200, zIn);
    const X = (ms) => AB.x0 + ((AB.x1 - AB.x0) * (ms - a0)) / (b0 - a0);
    [[dA, 1, AB.lanes[0]], [dB, 2, AB.lanes[1]]].forEach(([d, v, lane]) => {
        const box = { x0: AB.x0, x1: AB.x1, y: lane.y, h: lane.h };
        const playing = !frame1 && t >= d.at && t < d.to + 0.05;
        const dim = id === 'notch' && v === 1 ? 0.45 : 1;
        // The lane breathes on its first kick.
        const kick = !frame1 && t >= d.down ? Math.exp(-(t - d.down) / 0.12) : 0;
        g.save();
        // In the replay the lanes slide back in from either side while "Now listen again" is spoken.
        if (replay && !frame1) {
            const kIn = E.outBack(seg(t, SC.replay + 0.05 + (v - 1) * 0.08, SC.replay + 0.5 + (v - 1) * 0.08));
            g.globalAlpha *= clamp(kIn);
            g.translate(540, lane.y);
            g.scale(lerp(0.85, 1, kIn), lerp(0.85, 1, kIn));
            g.translate(-540, -lane.y);
        }
        g.translate(540, lane.y);
        g.scale(1 + 0.025 * kick, 1 + 0.025 * kick);
        g.translate(-540, -lane.y);
        rr(g, box.x0 - 24, lane.y - lane.h / 2 - 20, box.x1 - box.x0 + 48, lane.h + 40, 22);
        g.fillStyle = playing ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.035)';
        g.fill();
        g.strokeStyle = playing ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)';
        g.lineWidth = 3;
        g.stroke();
        // Before a version has played, both lanes show the same neutral
        // silhouette, so the eye cannot answer before the ear; the real
        // waveform lights up under the playhead.
        let upto = frame1 ? -1e9 : t >= d.to ? 1e9 : abProgress(d, t);
        // Version 2 stays covered until the answer, so the eye cannot answer before the ear;
        // then it is wiped in, hole and all.
        // Each version draws live as it is heard; during the poll both turn back into
        // plain bands, so the eye cannot answer for the ear, and "Number two" wipes them back in.
        const tRev = wto('hook', 'two', 0.05);
        const hide = frame1 || replay || noHead ? 0 : E.inOut(seg(t, dB.to, dB.to + 0.25)) * (1 - E.inOut(seg(t, tRev - 0.05, tRev + 0.3)));
        const covered = false;
        if (replay || v === 1) wave(g, v, box, a0, b0, 1e9, { alpha: 0.45 * dim * (1 - hide) });
        else if (covered || upto < msB) {
            silhouette(g, box, covered ? -1e9 : upto, a0, b0);
            if (covered || upto < msA) label(g, '?', 540, lane.y + 4, { size: 96, weight: 800, color: P.ink3, align: 'center', base: 'middle' });
        }
        if (!frame1 && !covered && (t >= d.at || replay)) wave(g, v, box, a0, b0, upto, { alpha: dim * (1 - hide) });
        if (hide > 0) {
            g.save();
            g.globalAlpha *= hide;
            silhouette(g, box, -1e9, a0, b0);
            label(g, '?', 540, lane.y + 4, { size: 96, weight: 800, color: P.ink3, align: 'center', base: 'middle' });
            g.restore();
        }
        dashed(g, X(0), lane.y - lane.h / 2 - 6, X(0), lane.y + lane.h / 2 + 6, P.ink3, 3, [8, 8]);
        if (playing && upto < msB) {
            g.fillStyle = P.ink;
            g.fillRect(X(upto) - 2, lane.y - lane.h / 2 - 6, 4, lane.h + 12);
        }
        g.restore();
        if (playing) speaker(g, box.x1 - 30, lane.y - lane.h / 2 - 54, 0.75, 0.5 + 0.5 * Math.sin(t * 20));
        impact(g, X(0), lane.y, d.down, t, v);
        // Badge, with a countdown ring while the viewer picks and a circle on "two".
        let ring = 0;
        if (guessing) ring = clamp((t - G.at) / G.dur);
        if (v === 2 && id === 'notch') ring = E.out(seg(t, tTwo - 0.05, tTwo + 0.4));
        // Each version plays from its own speaker; the cone follows the mix.
        const pms = playing ? abProgress(d, t) : -1e9;
        const exc = playing ? Math.min(1, maxIn(V[v].peak, pms - 8, pms) / PEAK_MAX) : 0;
        speakerBox(g, 92, lane.y + 26, 0.72, { exc: exc * (0.6 + 0.4 * Math.sin(t * 90) ** 2), kick: kick * (v === 2 ? 1 : 0.6), alpha: dim });
        badgeNum(g, v, 92, lane.y - 98, 32, { ring, alpha: dim });
    });
    // The countdown while the viewer picks: 3, 2, 1 on the beat.
    if (guessing) {
        const k = Math.min(2, Math.floor((t - G.at) / BEAT));
        const p = ((t - G.at) % BEAT) / BEAT;
        // Three dots that fill on the beat (no digits, which would read as version labels).
        for (let i = 0; i < 3; i++) {
            const x = 540 + (i - 1) * 70;
            const on = i <= k;
            const sc = i === k ? 1 + 0.35 * Math.exp(-p / 0.15) : 1;
            g.beginPath();
            g.arc(x, 535, 18 * sc, 0, Math.PI * 2);
            if (on) {
                g.fillStyle = P.ink;
                g.fill();
            } else {
                g.strokeStyle = P.ink3;
                g.lineWidth = 4;
                g.stroke();
            }
        }
    }
    // Both versions are the same samples at matched loudness; say so while the hook plays.
    // Both versions are the same samples at matched loudness; after the answer, the measurement behind it.
    const tAns = frame1 ? 1e9 : wto('hook', 'two', 0.05) + 0.4;
    if (!replay && !noHead) {
        const out = frame1 ? 0 : seg(t, SC.fog - 0.3, SC.fog - 0.05);
        if (!guessing && id === 'notch' && t >= tAns) {
            const L1 = AB.lanes[0];
            const kD = popIn(t, tAns + 0.3, 0.2) * (1 - out);
            tag(g, 'in 1 the riser runs into the drop', 540, L1.y - L1.h / 2 - 62, null, { a: kD, bg: P.dark, fg: FOG, ring: FOG, size: 34 });
        }
        // The three reasons, each lit as it is named; the tracker carries them through the film.
        if (id === 'notch') {
            const items = ['ears', 'limiter', 'brain'];
            items.forEach((w, i) => {
                const kI = popIn(t, wto('hook', w, 0) - 0.05, 0.3) * (1 - out);
                if (kI <= 0) return;
                const x = 540 + (i - 1) * 290;
                const bob = Math.sin(t * 3 + i) * 4;
                g.save();
                g.globalAlpha *= kI;
                g.translate(x, 1500 + bob);
                g.scale(E.outBack(kI), E.outBack(kI));
                if (i === 0) earPinna(g, -8, -10, 0.95);
                else if (i === 1) robotDome(g, { x: 0, y: 62 }, { s: 0.85, look: { x: 0, y: 300 }, lid: 0 });
                else brainChar(g, 0, -30, 0.6, { t, joy: 0.3 });
                g.restore();
                label(g, w, x, 1640, { size: 44, weight: 800, color: P.ink, align: 'center', family: BODY, alpha: kI });
            });
        }
        label(g, 'same samples, drops matched in loudness', 540, 1308, { size: 38, weight: 600, color: P.ink2, align: 'center', family: BODY, alpha: (1 - out) * (1 - seg(t, tAns - 0.2, tAns)) });
        const kA = popIn(t, tAns, 0.3) * (1 - out) * (1 - popIn(t, wto('hook', 'quarter', 0.6) - 0.3, 0.2));
        if (false) pill(g, `measured: kick stands out ${fmt(D.claims[4].db)} dB more in 2`, 540, 560, { size: 36, bg: P.dark, fg: P.ink, ring: P.ink, alpha: kA, scale: E.outBack(kA), weight: 800 });
        // Version 1 is the lesson's own build: the riser peaks into the downbeat.
        const kR = id === 'notch' ? popIn(t, wto('hook', 'gap', 0.35), 0.3) * (1 - out) : 0;
        void kR;
    }
    // The notch, labelled once.
    if (zIn > 0) {
        const lane = AB.lanes[1];
        const k = popIn(t, wto('hook', 'quarter', 0.6) - 0.1, 0.3);
        const xa = X(-GAP_MS);
        const xb = X(0);
        const yb = lane.y - lane.h / 2 - 34;
        g.save();
        g.globalAlpha *= k;
        g.strokeStyle = P.cyan;
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(xa, yb + 16);
        g.lineTo(xa, yb);
        g.lineTo(xb, yb);
        g.lineTo(xb, yb + 16);
        g.stroke();
        g.restore();
        tag(g, `${Math.round(GAP_MS)} ms: under ¼ second`, (xa + xb) / 2, yb - 46, null, { a: k, bg: P.cyan, fg: P.dark, size: 36 });
        // A playhead crosses the silence again and again; the kick answers at the end of it.
        const tz = wto('hook', 'gap', 0.35) + 0.3;
        if (t > tz && !replay) {
            const ph = ((t - tz) % 1.2) / 1.2;
            const ms = lerp(-GAP_MS - 60, 30, clamp(ph / 0.8));
            const top = lane.y - lane.h / 2 - 6;
            g.save();
            g.globalAlpha *= clamp((t - tz) / 0.2) * (1 - seg(ph, 0.85, 1));
            g.fillStyle = P.ink;
            g.fillRect(X(ms) - 2, top, 4, lane.h + 12);
            g.restore();
            const hit = (ph - 0.8 * (60 + GAP_MS) / (90 + GAP_MS)) / 0.25;
            if (hit > 0 && hit < 1) {
                g.save();
                g.strokeStyle = `rgba(251,191,36,${0.8 * (1 - hit)})`;
                g.lineWidth = 6;
                g.beginPath();
                g.arc(X(0), lane.y, 30 + 70 * E.out(hit), 0, Math.PI * 2);
                g.stroke();
                g.restore();
            }
        }
    }
    // Replay: what to listen for, on each first kick.
    if (replay && !frame1) {
        const k1 = popIn(t, dA.down, 0.2);
        const k2 = popIn(t, dB.down, 0.2);
        const L1 = AB.lanes[0];
        const L2 = AB.lanes[1];
        tag(g, 'buried click', X(0) - 150, L1.y + L1.h / 2 + 62, { x: X(0), y: L1.y + L1.h / 2 + 22 }, { a: k1, bg: P.dark, fg: P.amber, ring: P.amber, size: 34 });
        const kC = popIn(t, dA.down + 0.1, 0.25);
        const sg = (x) => (x > 0 ? '+' : '') + fmt(x);
        if (kC > 0) pill(g, t < dB.down ? `click vs everything else: ${sg(D.r1.clickDb)} dB in 1` : `click vs everything else: ${sg(D.r1.clickDb)} → ${sg(D.r2.clickDb)} dB`, 540, 552, { size: 38, bg: P.dark, fg: P.ink, ring: P.ink, alpha: kC, scale: E.outBack(kC), weight: 800 });
        tag(g, 'clean click', X(0) - 150, L2.y + L2.h / 2 + 62, { x: X(0), y: L2.y + L2.h / 2 + 22 }, { a: k2, bg: P.amber, fg: P.dark, size: 34 });
    }
    g.restore();
}

// ══ Ear: what the riser does to hearing (fog), and what silence gives back (fresh) ══
// First the ear in cross-section, slowed down (model); then the two versions as measured rows.
// The cross-section's place on screen, and its cochlea there.
const XS = { x: 560, y: 740, s: 1 };
// The ear's canal on screen: the zoom flies into it.
const XC = { x: 540 + 10 * 2.6, y: 800 + 14 * 2.6 };
const MAG = { x: 700, y: 1118, r: 132 };
const fogWeight = (ms) => (ms >= 200 ? 0 : 1 - Math.log10(1 + Math.max(0, ms) / 10) / Math.log10(21));
/** Cochlea stage: the camera flies from the ear into the cochlea, where hair cells meet the riser, the silence and the click. */
const STAGE = { x0: 90, x1: 930, y0: 470, y1: 1240, mem: 1110, cells: [250, 420, 590, 760], cy: 1010, s: 1.9 };
const BUBBLES = (() => {
    const r = rand(31);
    return Array.from({ length: 22 }, () => ({ x: r(), y: r(), r: 4 + r() * 10, ph: r() * 6.28 }));
})();
/**
 * What the stage shows at time t, as four episodes: number one told, number one
 * heard (sting S1), number two told, number two heard (sting S2). In each, the
 * riser plays from `on` to `off` (null: still playing at the kick), the click
 * arrives at `hit`, and after the riser stops its fog fades with the model's
 * weight over `slow` times real time.
 */
function stageEpisodes() {
    const S1 = demoBy.S1;
    const S2 = demoBy.S2;
    const tCov = wto('fog', 'covers', 0.5);
    const off2 = Math.min(wto('fresh', 'stops', 0.4), SC.fresh + 0.35);
    // One click per version, on the downbeat the viewer hears (the sting); version 1's
    // spark drifts in through the riser from "covers", version 2's silence is counted slowed.
    return [
        { v: 1, at: SC.fog - 0.3, on: wto('fog', 'number', 0.25), off: null, hit: S1.down, slow: 1, travel: Math.max(0.5, S1.down - tCov) },
        { v: 2, at: SC.fresh, on: SC.fresh - 0.4, off: off2, hit: S2.down, slow: (S2.down - off2) / (GAP_MS / 1000), travel: 0.3 },
    ];
}
function stageState(t) {
    const eps = stageEpisodes();
    let e = eps[0];
    for (const x of eps) if (t >= x.at) e = x;
    const riserOn = t >= e.on && (e.off === null || t < e.off) ? lerp(0.55, 1, seg(t, e.on, e.hit)) : 0;
    // Silence since the riser stopped, in real milliseconds of the version shown.
    const silMs = e.off !== null && t >= e.off ? ((t - e.off) * 1000) / e.slow : 0;
    const fog = riserOn > 0 ? 0.3 + 0.6 * riserOn : e.off !== null && t >= e.off ? 0.9 * fogWeight(silMs) : 0.3;
    const covered = e.off === null;
    return { e, riser: riserOn, fog, silMs: Math.min(silMs, GAP_MS), covered };
}
function drawEarSection(t, k) {
    if (k <= 0) return;
    const tEars = SC.fog - 0.05;
    const st = stageState(t);
    const e = st.e;
    g.save();
    g.globalAlpha *= k;
    // The fly-in: the ear held, then a zoom into its cochlea inside a navy vignette.
    const zf = E.inOut(seg(t, tEars + 0.2, tEars + 0.9));
    const iris = E.inOut(seg(t, tEars + 0.75, tEars + 1.15));
    const stageA = iris > 0 ? 1 : 0;
    if (iris < 1) {
        g.save();
        // Kept below the title band.
        g.beginPath();
        g.rect(0, 440, W, H - 440);
        g.clip();
        g.translate(XC.x, XC.y);
        const z = 1 + 2.5 * zf;
        g.scale(z, z);
        g.translate(-XC.x, -XC.y);
        earPinna(g, 540, 800, 2.6);
        g.restore();
        if (zf > 0) {
            const vg = g.createRadialGradient(XC.x, XC.y, 120, XC.x, XC.y, 760);
            vg.addColorStop(0, 'rgba(8,17,42,0)');
            vg.addColorStop(1, `rgba(8,17,42,${0.9 * zf})`);
            g.fillStyle = vg;
            g.fillRect(0, 440, W, H - 440);
        }
        label(g, 'into your ear', 540, 1150, { size: 36, weight: 700, color: P.ink2, align: 'center', alpha: (1 - zf) * popIn(t, SC.fog + 0.1, 0.3), family: BODY });
    }
    if (stageA > 0) {
        const S = STAGE;
        g.save();
        g.globalAlpha *= stageA;
        const sc = 1 + 0.04 * seg(t, e.at, e.at + 4);
        // The stage opens as a circle growing out of the ear's canal.
        if (iris < 1) {
            g.beginPath();
            g.arc(XC.x, XC.y, 30 + 1300 * iris, 0, Math.PI * 2);
            g.clip();
        }
        g.translate(540, 855);
        g.scale(sc, sc);
        g.translate(-540, -855);
        shadow(g, 510, S.y1 + 14, 420, 26, 0.7);
        rr(g, S.x0, S.y0, S.x1 - S.x0, S.y1 - S.y0, 60);
        const bg = g.createRadialGradient(500, 760, 60, 500, 860, 620);
        bg.addColorStop(0, '#5a2a46');
        bg.addColorStop(1, '#2a1226');
        g.fillStyle = bg;
        g.fill();
        g.save();
        rr(g, S.x0, S.y0, S.x1 - S.x0, S.y1 - S.y0, 60);
        g.clip();
        for (const b of BUBBLES) {
            const bx = S.x0 + b.x * (S.x1 - S.x0) + Math.sin(t * 0.8 + b.ph) * 12;
            const by = S.y0 + ((b.y * (S.y1 - S.y0) - t * 18 + 4000) % (S.y1 - S.y0));
            g.strokeStyle = 'rgba(255,200,220,0.16)';
            g.lineWidth = 3;
            g.beginPath();
            g.arc(bx, by, b.r, 0, Math.PI * 2);
            g.stroke();
        }
        g.fillStyle = '#e88a95';
        g.fillRect(S.x0, S.mem, S.x1 - S.x0, S.y1 - S.mem);
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.fillRect(S.x0, S.mem, S.x1 - S.x0, 8);
        // The riser arriving as waves from the left, while it plays.
        const lvAt = (tt) => {
            if (tt < e.on || (e.off !== null && tt >= e.off)) return 0;
            return lerp(0.55, 1, seg(tt, e.on, e.hit));
        };
        const live = lvAt(t) > 0 ? 1 : 1 - seg(t, e.off ?? 1e9, (e.off ?? 1e9) + 0.12);
        soundArcs(g, S.x0 - 40, S.x1, 880, t, (age) => lvAt(t - age) * live, { color: '167,171,201', speed: 560, h: 120, gap: 46 });
        // The click: a spark that reaches the cells at `hit`; inside the riser it dims to almost nothing.
        const travel = e.travel;
        if (t >= e.hit - travel && t < e.hit + 0.35) {
            const u = seg(t, e.hit - travel, e.hit);
            const dim = st.covered ? 0.8 : 0;
            const a = u < 1 ? lerp(1, 1 - dim, seg(u, 0.5, 1)) : (1 - dim) * (1 - seg(t, e.hit, e.hit + 0.35));
            sparkle(g, lerp(S.x0 + 20, 505, E.inOut(u)), lerp(880, 840, u), st.covered ? 52 : 70, a);
        }
        // The hit: a ring that spreads through the cells, faint when covered.
        if (t >= e.hit && t < e.hit + 0.7) {
            const k = (t - e.hit) / 0.7;
            g.strokeStyle = `rgba(251,191,36,${(st.covered ? 0.25 : 0.9) * (1 - k)})`;
            g.lineWidth = 10 - 6 * k;
            g.beginPath();
            g.arc(505, 900, 60 + 360 * E.out(k), 0, Math.PI * 2);
            g.stroke();
        }
        const age = t - e.hit;
        const burst = age > 0 ? Math.exp(-age / 0.3) * (st.covered ? 0.15 : 1) : 0;
        S.cells.forEach((cx, i) => {
            hairCell(g, cx, S.cy, S.s, { tired: 0, burst, wobble: Math.sin(t * 2.6 + i * 1.4) * (1 - st.fog) + st.riser * Math.sin(t * 30 + i) * 0.6 });
        });
        fogCloud(g, 505, 940, 820, 400, st.fog * 0.6, t, 5);
        fogCloud(g, 505, 1000, 700, 260, st.fog * 0.35, t + 3, 17);
        g.restore();
        // Which version, top left.
        badgeNum(g, e.v, S.x0 + 56, S.y0 + 56, 32);
        label(g, 'hair cells + nerve (model, slowed)', S.x0 + 104, S.y0 + 68, { size: 36, weight: 700, color: 'rgba(255,220,230,0.9)', family: BODY });
        // Number two: the silence before the kick, counted (slowed down while told).
        if (e.v === 2 && e.off !== null && t >= e.off - 0.1) {
            const kG = popIn(t, e.off - 0.1, 0.2);
            g.save();
            g.globalAlpha *= kG;
            rr(g, 650, S.y0 + 104, 260, 150, 28);
            g.fillStyle = 'rgba(6,16,29,0.75)';
            g.fill();
            label(g, `${Math.round(st.silMs)} ms`, 780, S.y0 + 178, { size: 56, weight: 800, color: P.cyan, align: 'center', base: 'middle' });
            label(g, 'of silence', 780, S.y0 + 232, { size: 32, weight: 700, color: P.ink2, align: 'center', family: BODY });
            g.restore();
        }
        g.restore();
        // What happened, in one line under the cells.
        let msg = null;
        let col = P.ink;
        if (e.v === 1 && t >= e.hit - e.travel) {
            msg = 'riser still playing: click covered';
            col = P.ink;
        } else if (e.v === 2 && e.off !== null && t >= e.off && t < e.hit) {
            msg = st.silMs < 200 ? 'riser stopped: the after-fog fades' : 'after-fog gone by 200 ms';
            col = FOG;
        } else if (e.v === 2 && t >= e.hit - 0.05) {
            msg = 'click lands in the clear';
            col = P.ink;
        }
        if (msg) {
            const km = popIn(t, e.v === 2 && t < e.hit ? e.off : e.hit - (e.v === 1 ? e.travel : 0.05), 0.2);
            pill(g, msg, 510, S.mem + 66, { size: 38, bg: P.dark, fg: col, ring: col, alpha: km * stageA, scale: E.outBack(km), weight: 800 });
        }
    }
    g.restore();
}

function drawEar(t) {
    const a = t >= SC.fog - 0.12 && t < SC.hand + 0.18 ? 1 : 0;
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    cam(t, SC.fog, SC.hand);
    const fresh = t >= SC.fresh;
    if (!fresh) headline(t, SC.fog + 0.1, [['Riser'], ['covers'], ['the'], ['click', P.amber]], 300, { size: 88, stagger: 0 });
    else headline(t, SC.fresh + 0.05, [['Silence'], ['clears'], ['the'], ['way']], 300, { size: 88, stagger: 0 });
    const tR = wto('fog', 'riser', 0.38);
    const tCk = wto('fog', 'click', 0.95);
    const gloss = t < SC.fog + 1.8 ? "click = the kick's sharp first few ms" : t >= tR && t < tR + 1.4 ? 'riser = the rising whoosh before a drop' : t >= SC.fresh + 0.3 && t < SC.fresh + 2.1 ? 'after-fog = forward masking (Moore 2012)' : null;
    if (gloss) label(g, gloss, 540, 412, { size: 40, weight: 700, color: P.ink, align: 'center', family: BODY });
    else tracker(0);
    drawEarSection(t, 1);
    g.restore();
}

// ══ Hand: the limiter is a hand on a fader, on a console ══
// Each strip, top to bottom: fader with its gain-reduction meter, the input scope, the display.
const HD = { faders: [{ x: 350, v: 1 }, { x: 710, v: 2 }], desk: { x0: 160, y0: 600, w: 740, h: 610 }, top: 670, bottom: 950, shelf: 588, msA: -700, msB: 260, scope: { y0: 986, h: 104, w: 280 } };
const FADER_MAX = 8;
function drawHand(t) {
    const a = sceneAlpha(t, 'hand');
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    cam(t, SC.hand, SC.brain);
    headline(t, SC.hand + 0.1, [['Riser'], ['triggers'], ['the'], ['limiter']], 300, { size: 80, stagger: 0 });
    if (t < SC.hand + 2.2) label(g, 'limiter = automatic volume control', 540, 412, { size: 40, weight: 700, color: P.ink, align: 'center', family: BODY });
    else tracker(1);
    const tHand = SC.hand + 0.15;
    // The slow motion runs from the scene's start to the kick on "down", so the faders move at once.
    const tRiser = SC.hand + 0.35;
    // Slowed down from -700 ms to the kick on "down", then on to the end of
    // the click window (+20 ms, where claim 1 is measured) and held there.
    const tKick = wto('hand', 'down', 0.7);
    const ms = keys(t, [[tRiser, HD.msA], [tKick, 0], [tKick + 0.35, 20]]);
    const slow = (tKick - tRiser) / (-HD.msA / 1000);
    const live = t > tRiser;
    const appear = E.outBack(seg(t, tHand - 0.35, tHand + 0.05));
    const reach = E.inOut(seg(t, tHand, tHand + 0.55));
    const dk = HD.desk;
    // The console rises into place.
    const rise = E.outBack(seg(t, SC.hand, SC.hand + 0.5));
    g.save();
    g.translate(0, (1 - rise) * 80);
    consoleDesk(g, dk.x0, dk.y0, dk.w, dk.h);
    const caps = [];
    for (const f of HD.faders) {
        const gr = live ? val(V[f.v].gr, ms) : 0;
        // Input scope: the last 700 ms going into the limiter, riser in its colour, the kick in amber.
        const sc = HD.scope;
        const sx0 = f.x - 140;
        rr(g, sx0, sc.y0, sc.w, sc.h, 14);
        g.fillStyle = '#070d1a';
        g.fill();
        g.save();
        rr(g, sx0, sc.y0, sc.w, sc.h, 14);
        g.clip();
        const now = live ? ms : HD.msA;
        for (let px = 0; px < sc.w; px += 4) {
            const m0 = now - 700 + (700 * px) / sc.w;
            const m = Math.min(1, maxIn(V[f.v].masker, m0, m0 + 10) / PEAK_MAX);
            const k = Math.min(1, maxIn(V[f.v].kick, m0, m0 + 10) / PEAK_MAX);
            const h = (sc.h - 16) * m;
            g.fillStyle = RISER;
            g.fillRect(sx0 + px, sc.y0 + sc.h / 2 - h / 2, 3, h);
            if (k > 0.02) {
                g.fillStyle = P.amber;
                g.fillRect(sx0 + px, sc.y0 + sc.h / 2 - ((sc.h - 16) * k) / 2, 3, (sc.h - 16) * k);
            }
        }
        g.restore();
        g.strokeStyle = 'rgba(170,205,255,0.2)';
        g.lineWidth = 3;
        rr(g, sx0, sc.y0, sc.w, sc.h, 14);
        g.stroke();
        badgeNum(g, f.v, f.x - 150, HD.top - 8, 30);
        // Fader track and scale.
        rr(g, f.x - 11, HD.top, 22, HD.bottom - HD.top, 11);
        g.fillStyle = '#060b16';
        g.fill();
        for (const d of [0, 2, 4, 6, 8]) {
            const ty = lerp(HD.top + 40, HD.bottom - 40, d / FADER_MAX);
            label(g, d === 0 ? '0 dB' : `−${d}`, f.x - 100, ty + 11, { size: 32, weight: 500, color: P.ink3, align: 'right', family: BODY });
        }
        // Gain reduction, lit on the meter.
        grMeter(g, f.x + 86, HD.top + 28, HD.bottom - 28, gr, FADER_MAX);
        label(g, 'down', f.x + 86, HD.bottom + 4, { size: 32, weight: 700, color: P.ink3, align: 'center', family: BODY });
        const cy = lerp(HD.top + 40, HD.bottom - 40, clamp(gr / FADER_MAX));
        shadow(g, f.x + 8, cy + 30, 110, 26, 0.7);
        rr(g, f.x - 64, cy - 32, 128, 64, 14);
        const cg = g.createLinearGradient(0, cy - 32, 0, cy + 32);
        cg.addColorStop(0, '#eef2f8');
        cg.addColorStop(1, P.steelLo);
        g.fillStyle = cg;
        g.fill();
        g.fillStyle = 'rgba(6,16,29,0.45)';
        for (const dy of [-12, 0, 12]) g.fillRect(f.x - 44, cy + dy - 2, 88, 4);
        caps.push({ x: f.x, y: cy, gr });
        // The kick arriving at the drop: a flash on the scope and a ring on the cap.
        if (live && ms >= 0 && t - tKick < 0.9) {
            const kAge = t - tKick;
            const kick = f.v === 1 ? D.r1.kickDb : D.r2.kickDb;
            const r = (44 + 56 * E.out(kAge / 0.9)) * 10 ** ((kick - D.r2.kickDb) / 20);
            g.save();
            g.strokeStyle = `rgba(251,191,36,${0.9 * (1 - kAge / 0.9)})`;
            g.lineWidth = 7;
            g.beginPath();
            g.arc(f.x, cy, r, 0, Math.PI * 2);
            g.stroke();
            g.restore();
        }
        // The measured reading on the strip's display, after the kick.
        const kR = popIn(t, tKick + 0.15, 0.3);
        rr(g, f.x - 110, dk.y0 + dk.h - 76, 220, 58, 12);
        g.fillStyle = '#070d1a';
        g.fill();
        const shown = kR > 0 ? (f.v === 1 ? D.r1.gr : D.r2.gr) : gr;
        label(g, `down ${fmt(Math.max(0, shown))} dB`, f.x, dk.y0 + dk.h - 34, { size: 36, weight: 800, color: kR > 0 ? P.ink : P.ink2, align: 'center' });
        if (kR > 0) {
            g.save();
            g.globalAlpha *= kR;
            g.strokeStyle = P.ink;
            g.lineWidth = 4;
            rr(g, f.x - 110, dk.y0 + dk.h - 76, 220, 58, 12);
            g.stroke();
            g.restore();
        }
    }
    // The robot sits on the console, one glove on each fader.
    if (appear > 0) {
        g.save();
        g.globalAlpha *= clamp(appear * 1.5);
        const cx = 530;
        for (const c of caps) {
            const capTop = c.y - 32;
            const wrist = { x: c.x, y: lerp(HD.shelf + 20, capTop - 62, reach) };
            const sh = { x: cx + (c.x < cx ? -60 : 60), y: HD.shelf - 40 };
            const mid = { x: lerp(sh.x, wrist.x, 0.5), y: Math.min(sh.y, wrist.y) - 30 };
            tube(g, sh, mid, 0.9);
            tube(g, mid, wrist, 0.7);
            gloveDown(g, wrist.x, wrist.y, 1.0, reach > 0.9 ? Math.max(0.6, clamp(c.gr / 2)) : 0, capTop, 0);
        }
        // It squints while it pulls hard.
        robotDome(g, { x: cx, y: HD.shelf }, { s: 0.8, look: { x: caps[0].x, y: caps[0].y }, lid: clamp((caps[0].gr - 2) / 6) * 0.55 });
        g.restore();
    }
    g.restore();
    const kR = popIn(t, tKick + 0.15, 0.3);
    if (kR > 0) pill(g, `measured: 1 down ${fmt(D.r1.gr)} dB · 2 down ${fmt(D.r2.gr)} dB`, 540, dk.y0 + dk.h + 42, { size: 38, bg: P.ink, fg: P.dark, alpha: kR, scale: E.outBack(kR), weight: 800 });
    else label(g, live ? `limiter gain, slowed down ${Math.round(slow)}×` : 'the limiter on the master bus', 540, dk.y0 + dk.h + 62, { size: 36, weight: 700, color: P.ink2, align: 'center', family: BODY });
    g.restore();
}

// ══ Brain: one thing to predict ══
const BR = { x0: 150, x1: 880, dots: 1120, wave: 880, brain: { x: 370, y: 640, s: 1.15 } };
function drawBrain(t) {
    const a = sceneAlpha(t, 'brain');
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    cam(t, SC.brain, SC.how);
    headline(t, SC.brain + 0.1, [['Predict'], ['the'], ['next'], ['beat']], 300, { size: 88, stagger: 0 });
    if (t < SC.brain + 2.2) label(g, 'expectation (Huron 2006), illustrated', 540, 412, { size: 40, weight: 700, color: P.ink, align: 'center', family: BODY });
    else tracker(2);
    // Eight beats: the last bar and a half of the build, then the downbeat.
    // Five beats, so the 8th of silence before the downbeat is wide enough to see.
    const n = 5;
    const L = n - 1;
    const X = (i) => lerp(BR.x0, BR.x1, i / L);
    const tPred = wto('brain', 'predict', 0.45);
    const tNext = wto('brain', 'next', 0.38);
    const tLand = wto('brain', 'lands', 0.82);
    const tArr = wto('brain', 'payoff', 0.95);
    // A ball hops along the build's beats; the build stops an 8th before the downbeat.
    const hop = keys(t, [[SC.brain + 0.3, 0], [tPred - 0.1, L - 1]]);
    // The whole build is there from the start; the bars under the ball light on each hop.
    const pulse = t < tPred ? Math.exp(-((hop % 1) / 0.25)) : 0;
    for (let i = 0; i < (L - 0.5) * 40; i++) {
        const p = i / 40;
        const h = 24 + 190 * (p / (L - 0.5)) ** 2;
        const near = clamp(1 - Math.abs(p - hop) / 0.6);
        g.fillStyle = RISER;
        g.save();
        g.globalAlpha *= lerp(0.55, 1, Math.max(near, p <= hop ? 0.6 : 0));
        g.fillRect(X(p) - 3, BR.wave - (h * (1 + 0.12 * near * pulse)) / 2, 5, h * (1 + 0.12 * near * pulse));
        g.restore();
    }
    label(g, 'build', X(0.7), BR.wave + 74, { size: 34, weight: 700, color: FOG, align: 'center', alpha: popIn(t, SC.brain + 0.4), family: BODY });
    for (let i = 0; i < n; i++) {
        g.beginPath();
        g.arc(X(i), BR.dots, i === n - 1 ? 22 : 11, 0, Math.PI * 2);
        if (i === n - 1) {
            g.strokeStyle = P.amber;
            g.lineWidth = 5;
            g.stroke();
        } else {
            g.fillStyle = i <= hop ? P.ink : P.ink3;
            g.fill();
        }
    }
    // The gap, bracketed.
    const ks = popIn(t, tPred - 0.3) * (1 - seg(t, tLand - 0.25, tLand));
    if (ks > 0) {
        const xa = X(L - 0.5);
        const xb = X(L) - 12;
        // The silence itself, in the gap's blue, on the build's row.
        g.save();
        g.globalAlpha *= ks;
        rr(g, xa + 6, BR.wave - 110, xb - xa - 6, 220, 14);
        g.fillStyle = `rgba(${CYAN_RGB},0.22)`;
        g.fill();
        g.restore();
        label(g, 'silence', (xa + xb) / 2 + 3, BR.wave - 136, { size: 40, weight: 800, color: P.cyan, align: 'center', alpha: ks, family: BODY });
        g.save();
        g.globalAlpha *= ks;
        g.strokeStyle = P.ink2;
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(xa, BR.dots + 104);
        g.lineTo(xa, BR.dots + 118);
        g.lineTo(xb, BR.dots + 118);
        g.lineTo(xb, BR.dots + 104);
        g.stroke();
        g.restore();
    }
    // The ball: hops on the beats, waits on the last beat of the build, then the prediction: a dotted arc to the downbeat.
    const k = E.inOut(seg(t, tPred, tNext + 0.3));
    const arcPt = (u) => ({ x: lerp(X(L - 1), X(L), u), y: BR.dots - 100 * 4 * u * (1 - u) });
    if (k > 0) {
        g.save();
        g.setLineDash([2, 18]);
        g.lineCap = 'round';
        g.strokeStyle = P.ink;
        g.lineWidth = 10;
        g.beginPath();
        for (let i = 0; i <= 40 * k; i++) {
            const p = arcPt(i / 40);
            if (i === 0) g.moveTo(p.x, p.y);
            else g.lineTo(p.x, p.y);
        }
        g.stroke();
        g.restore();
        // A ghost of the beat where the brain expects it.
        g.save();
        g.globalAlpha *= popIn(t, tNext, 0.3) * (t < tLand ? 0.5 + 0.2 * Math.sin(t * 9) : 0);
        g.strokeStyle = P.ink;
        g.setLineDash([6, 8]);
        g.lineWidth = 4;
        g.beginPath();
        g.arc(X(L), BR.dots, 34, 0, Math.PI * 2);
        g.stroke();
        g.restore();
        if (false) tag(g, 'next beat', X(2.4), BR.dots + 70, null, { a: popIn(t, tNext), bg: P.ink, fg: P.dark, size: 36 });
    }
    let ball;
    if (t < tPred) {
        const fr = hop - Math.floor(hop);
        ball = { x: X(hop), y: BR.dots - 130 * Math.sin(Math.PI * fr) };
    } else if (t < tLand - 0.35) ball = { x: X(L - 1), y: BR.dots };
    else ball = arcPt(E.inOut(seg(t, tLand - 0.35, tLand)));
    const land = t - tLand;
    if (land < 0) {
        g.fillStyle = P.ink;
        g.beginPath();
        g.arc(ball.x, ball.y, 16, 0, Math.PI * 2);
        g.fill();
    } else {
        // The kick lands exactly on the expected beat.
        g.fillStyle = P.amber;
        g.beginPath();
        g.arc(X(L), BR.dots, 28, 0, Math.PI * 2);
        g.fill();
        for (let i = 0; i < 3; i++) {
            const ag = land - i * 0.12;
            if (ag < 0 || ag > 0.8) continue;
            g.strokeStyle = `rgba(251,191,36,${0.85 * (1 - ag / 0.8)})`;
            g.lineWidth = 7;
            g.beginPath();
            g.arc(X(L), BR.dots, 36 + 56 * E.out(ag / 0.8), 0, Math.PI * 2);
            g.stroke();
        }
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2 + 0.3;
            const d = 60 + 90 * E.out(clamp(land / 0.6));
            sparkle(g, X(L) + Math.cos(ang) * d, BR.dots + Math.sin(ang) * d * 0.7, 14, 1 - clamp(land / 0.9));
        }
    }
    // The listener's brain: watches the ball, leans in during the silence, delighted when the kick lands.
    const B = BR.brain;
    const kB = 1;
    const waiting = t >= tPred && t < tLand ? 1 : 0;
    const joy = land >= 0 ? clamp(land / 0.2) : 0;
    const blink = Math.max(0, 1 - Math.abs(((t - SC.brain) % 3.1) - 1.5) / 0.08);
    g.save();
    g.globalAlpha *= kB;
    const bob = Math.sin(t * 2.4) * 6 - (land >= 0 ? 24 * Math.exp(-land / 0.25) * Math.sin(Math.min(Math.PI, land * 12)) : 0);
    brainChar(g, B.x, B.y + bob, B.s * lerp(0.85, 1, E.outBack(kB)), { look: land >= 0 ? { x: X(L), y: BR.dots } : ball, joy, lean: waiting * 0.8 * E.inOut(seg(t, tPred, tPred + 0.4)), blink: waiting ? 0 : blink, t });
    g.restore();
    // A thought bubble: what it predicts.
    const kT = popIn(t, tPred - 0.1, 0.3) * (1 - seg(t, tLand + 0.2, tLand + 0.5));
    if (kT > 0) {
        g.save();
        g.globalAlpha *= kT;
        for (const [bx, by, br] of [[B.x + 140, B.y - 70, 12], [B.x + 172, B.y - 108, 18]]) {
            g.fillStyle = P.ink;
            g.beginPath();
            g.arc(bx, by, br, 0, Math.PI * 2);
            g.fill();
        }
        rr(g, B.x + 190, B.y - 200, 330, 110, 55);
        g.fillStyle = P.ink;
        g.fill();
        label(g, 'kick… now?', B.x + 355, B.y - 130, { size: 44, weight: 800, color: P.dark, align: 'center' });
        g.restore();
    }
    const kp = popIn(t, tArr - 0.05, 0.3);
    void kp;
    g.restore();
}

// ══ How: the cut in a DAW, then the gap at 128 BPM ══
// The arrangement shows two beats before the drop and one after; the cut is an 8th before it.
const HW = { x0: 80, x1: 920, names: 250, y0: 470, ruler: 530, lanes: [580, 680, 780, 880], laneH: 86, beats: [-2, 1], zoom: { y: 640, x0: 120, x1: 900, msMax: 300 } };
const CLIPC = {
    riser: { body: 'rgba(126,131,168,0.55)', head: RISER, wave: 'rgba(200,203,226,0.75)', text: P.ink },
    drums: { body: 'rgba(248,250,252,0.16)', head: 'rgba(248,250,252,0.55)', wave: 'rgba(248,250,252,0.7)', text: P.dark },
    synth: { body: 'rgba(248,250,252,0.12)', head: 'rgba(248,250,252,0.4)', wave: 'rgba(248,250,252,0.55)', text: P.dark },
    verb: { body: 'rgba(248,250,252,0.08)', head: 'rgba(248,250,252,0.3)', wave: 'rgba(248,250,252,0.4)', text: P.dark },
};
function drawHow(t) {
    const a = sceneAlpha(t, 'how');
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    cam(t, SC.how, SC.replay);
    headline(t, SC.how + 0.1, [['Cut'], ['an'], ['8th'], ['early']], 300, { size: 92, stagger: 0 });
    label(g, `a 16th helps · an 8th is just under ¼ s at ${TL.bpm} BPM`, 540, 400, { size: 38, weight: 700, color: P.ink2, align: 'center' });
    const tCut = wto('how', 'cut', 0.03);
    const tEighth = wto('how', 'eighth', 0.12);
    const tAt = wto('how', 'at', 0.32);
    const tQuarter = wto('how', 'outlasts', 0.85);
    const tFogs = wto('how', 'afterfog', 0.5);
    const tFifth = wto('how', 'fifth', 0.62);
    const tVerb = wto('how', 'reverb', 0.84);
    const tTails = wto('how', 'tails', 0.9);
    // Window: the DAW eases in, then shifts up a little when the zoom panel opens.
    const kW = E.outBack(seg(t, SC.how, SC.how + 0.45));
    g.save();
    g.translate(0, (1 - kW) * 60);
    // Two shots: the cut in the DAW, then the milliseconds on their own, full width.
    const shot2 = E.inOut(seg(t, tFogs - 0.35, tFogs + 0.15));
    g.globalAlpha *= 1 - shot2;
    g.translate(0, -260 * shot2);
    // Push in on the gap while it is cut, then back out for the millisecond panel.
    const zG = E.inOut(seg(t, tCut, tCut + 0.6)) * (1 - E.inOut(seg(t, tFogs - 0.5, tFogs)));
    if (zG > 0) {
        g.translate(500, 760);
        g.scale(1 + 0.05 * zG, 1 + 0.05 * zG);
        g.translate(-500, -760);
    }
    const [bA, bB] = HW.beats;
    const tx0 = HW.names;
    const tx1 = HW.x1 - 20;
    const BX = (beat) => lerp(tx0, tx1, (beat - bA) / (bB - bA));
    shadow(g, 500, HW.y0 + 520, 420, 30, 0.7);
    rr(g, HW.x0, HW.y0, HW.x1 - HW.x0, 500, 26);
    g.fillStyle = '#0d1629';
    g.fill();
    g.strokeStyle = 'rgba(170,205,255,0.2)';
    g.lineWidth = 3;
    g.stroke();
    rr(g, HW.x0, HW.y0, HW.x1 - HW.x0, 44, 26);
    g.fillStyle = '#1a2643';
    g.fill();
    g.fillRect(HW.x0, HW.y0 + 22, HW.x1 - HW.x0, 22);
    ['#f87171', '#fbbf24', '#4ade80'].forEach((c, i) => {
        g.fillStyle = i === 1 ? 'rgba(248,250,252,0.45)' : 'rgba(248,250,252,0.3)';
        g.beginPath();
        g.arc(HW.x0 + 30 + i * 30, HW.y0 + 22, 9, 0, Math.PI * 2);
        g.fill();
        void c;
    });
    // Ruler: beats, the drop in amber.
    // Beats as solid lines with their numbers (3, 4, then the drop on 1); 8ths as faint dashes.
    for (let b = bA; b <= bB; b += 0.5) {
        const x = BX(b);
        const whole = b === Math.round(b);
        g.save();
        g.strokeStyle = whole ? P.ink3 : P.ink4;
        g.lineWidth = whole ? 3 : 2;
        if (!whole) g.setLineDash([6, 8]);
        g.beginPath();
        g.moveTo(x, HW.ruler + (whole ? 0 : 16));
        g.lineTo(x, HW.lanes[3] + HW.laneH);
        g.stroke();
        g.restore();
    }
    label(g, 'drop', BX(0) + 12, HW.ruler + 4, { size: 32, weight: 800, color: P.amber });
    dashed(g, BX(0), HW.ruler + 14, BX(0), HW.lanes[3] + HW.laneH, P.amber, 4, [10, 8]);
    // Lanes and clips. The cut removes everything from an 8th before the drop to the drop.
    const names = [['Riser', 'riser'], ['Drums', 'drums'], ['Synths', 'synth'], ['Reverb', 'verb']];
    const kCut = E.inOut(seg(t, tCut + 0.1, tCut + 0.6));
    const fall = seg(t, tCut + 0.5, tCut + 1.1);
    const xc = BX(-0.5);
    names.forEach(([nm, key], i) => {
        const y = HW.lanes[i];
        label(g, nm, HW.x0 + 22, y + HW.laneH / 2 + 12, { size: 32, weight: 700, color: key === 'riser' ? FOG : P.ink2, family: BODY });
        const wave = key === 'riser' ? (u) => 0.25 + 0.75 * u ** 1.5 : key === 'drums' ? (u) => { const b = u * 1.5; const f = b - Math.floor(b); return f < 0.06 ? 0.95 : Math.abs(f - 0.5) < 0.05 ? 0.5 : 0.18; } : key === 'synth' ? (u) => 0.5 + 0.2 * Math.sin(u * 40) : (u) => 0.35;
        const after = key === 'riser' ? null : key === 'drums' ? (u) => (u < 0.06 ? 1 : Math.abs(u - 0.5) < 0.05 ? 0.5 : 0.18) : key === 'synth' ? (u) => 0.85 : (u) => 0.4;
        // Before the cut.
        const pre = BX(bA) + 2;
        clip(g, pre, y, xc - pre - 3, HW.laneH, CLIPC[key], { wave });
        // The piece the cut removes falls away.
        if (fall < 1) {
            g.save();
            g.translate(0, 220 * E.in(fall));
            g.globalAlpha *= 1 - fall;
            clip(g, xc + 3, y, BX(0) - xc - 6, HW.laneH, CLIPC[key], { wave: (u) => wave(0.9 + 0.1 * u) });
            g.restore();
        }
        // The drop.
        if (after) clip(g, BX(0) + 3, y, BX(bB) - BX(0) - 5, HW.laneH, CLIPC[key], { wave: after });
    });
    // The empty 8th, hatched.
    if (fall > 0) {
        g.save();
        g.globalAlpha *= fall;
        g.beginPath();
        g.rect(xc, HW.lanes[0], BX(0) - xc, HW.lanes[3] + HW.laneH - HW.lanes[0]);
        g.clip();
        g.strokeStyle = 'rgba(125,211,252,0.35)';
        g.lineWidth = 3;
        for (let d = -400; d < 400; d += 22) {
            g.beginPath();
            g.moveTo(xc + d, HW.lanes[0]);
            g.lineTo(xc + d + 420, HW.lanes[3] + HW.laneH + 20);
            g.stroke();
        }
        g.restore();
    }
    // The cut line, with scissors running down it.
    if (kCut > 0 && fall < 1) {
        const yTop = HW.ruler + 10;
        const yBot = HW.lanes[3] + HW.laneH;
        const yS = lerp(yTop, yBot, kCut);
        g.strokeStyle = P.ink;
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(xc, yTop);
        g.lineTo(xc, yS);
        g.stroke();
        g.save();
        g.globalAlpha *= 1 - fall;
        scissors(g, xc, yS, 1.0, 0.3 + 0.4 * Math.abs(Math.sin(t * 22)), Math.PI / 2 - 0.35);
        g.restore();
    }
    // The bracket: one 8th note.
    const k8 = popIn(t, tEighth - 0.1, 0.3);
    if (k8 > 0) {
        g.save();
        g.globalAlpha *= k8;
        g.strokeStyle = P.cyan;
        g.lineWidth = 4;
        const yb = HW.ruler + 20;
        g.beginPath();
        g.moveTo(xc, yb + 14);
        g.lineTo(xc, yb);
        g.lineTo(BX(0), yb);
        g.lineTo(BX(0), yb + 14);
        g.stroke();
        g.restore();
        label(g, '⅛ note', xc - 14, HW.ruler + 8, { size: 34, weight: 800, color: P.cyan, align: 'right', alpha: k8 });
    }
    // Reverb tails too: the return's level drops to zero at the cut.
    const kV = E.inOut(seg(t, tVerb - 0.1, tTails + 0.3));
    if (kV > 0) {
        const y = HW.lanes[3];
        const yUp = y + 52;
        const yDn = y + HW.laneH - 10;
        g.strokeStyle = P.ink;
        g.lineWidth = 6;
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(BX(bA), yUp);
        g.lineTo(xc - 4, yUp);
        g.lineTo(xc + 4, lerp(yUp, yDn, kV));
        g.lineTo(BX(0) - 4, lerp(yUp, yDn, kV));
        g.lineTo(BX(0) + 4, yUp);
        g.lineTo(BX(bB), yUp);
        g.stroke();
        tag(g, 'reverb muted too', BX(-1.3), y + HW.laneH + 52, { x: (xc + BX(0)) / 2, y: yDn }, { a: popIn(t, tTails - 0.1, 0.3) * (1 - popIn(t, tAt - 0.1, 0.3)), bg: P.ink, fg: P.dark, size: 34 });
    }
    g.restore();
    // At 128 BPM: the gap grows to an 8th, past the after-fog (model), full width and large.
    const kZ = popIn(t, tFogs - 0.1, 0.35);
    if (kZ > 0) {
        const Z = HW.zoom;
        const ZX = (ms) => lerp(Z.x0, Z.x1, ms / Z.msMax);
        const y = Z.y + (1 - E.out(kZ)) * 60;
        g.save();
        g.globalAlpha *= kZ;
        label(g, 'after-fog', Z.x0, y - 24, { size: 40, weight: 800, color: FOG, family: BODY });
        label(g, 'model', Z.x0 + 200, y - 24, { size: 32, weight: 600, color: P.ink3, family: BODY });
        // A playhead sweeps the after-fog from 0 to 200 ms while "a fifth of a second" is spoken.
        const sweep = 200 * E.inOut(seg(t, tFogs + 0.1, tFifth + 0.4));
        for (let m = 0; m < 200; m += 2) {
            g.fillStyle = `rgba(${FOG_RGB},${(m < sweep ? 0.8 : 0.14) * fogWeight(m)})`;
            g.fillRect(ZX(m), y, ZX(2) - ZX(0) + 0.5, 150);
        }
        if (sweep > 0 && sweep < 200) {
            g.fillStyle = P.ink;
            g.fillRect(ZX(sweep) - 2, y - 8, 4, 166);
        }
        // The fog's end line lights when the sweep reaches it.
        const kEnd = sweep >= 199 ? 1 : 0.25;
        g.save();
        g.globalAlpha *= kEnd;
        g.strokeStyle = FOG;
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(ZX(200), y - 10);
        g.lineTo(ZX(200), y + 160);
        g.stroke();
        g.restore();
        label(g, 'gone by 200 ms', ZX(200) + 16, y + 92, { size: 40, weight: 700, color: P.ink2, family: BODY, alpha: kEnd });
        const t128 = wto('how', '128', 0.78);
        // The gap starts on "128" and crosses the fog's 200 ms line on "outlasts".
        const ms = keys(t, [[tFogs + 0.3, 0], [tQuarter, 200], [tQuarter + 0.3, GAP_MS]]);
        label(g, 'gap', Z.x0, y + 250, { size: 40, weight: 800, color: P.cyan, family: BODY });
        rr(g, ZX(0), y + 274, Math.max(1, ZX(ms) - ZX(0)), 110, 18);
        g.fillStyle = P.cyan;
        g.fill();
        // The fog's end line flashes as the gap passes it.
        const fl = t >= tQuarter ? Math.exp(-(t - tQuarter) / 0.25) : 0;
        if (fl > 0.01) {
            g.fillStyle = `rgba(${CYAN_RGB},${0.9 * fl})`;
            g.fillRect(ZX(200) - 5, y - 10, 10, 170);
        }
        label(g, `${Math.round(ms)} ms`, ZX(ms) + 20, y + 347, { size: 56, weight: 800, color: ms > 240 ? P.dark : P.cyan });
        // Axis: 0, 100, 200 ms and the 8th.
        g.strokeStyle = P.ink3;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(ZX(0), y + 430);
        g.lineTo(ZX(Z.msMax), y + 430);
        g.stroke();
        for (const m of [0, 100, 200, 300]) {
            g.fillStyle = P.ink3;
            g.fillRect(ZX(m) - 1.5, y + 422, 3, 16);
            label(g, `${m}`, ZX(m), y + 474, { size: 34, weight: 600, color: P.ink3, align: 'center', family: BODY });
        }
        label(g, 'ms', ZX(300) + 34, y + 440, { size: 30, weight: 600, color: P.ink3, family: BODY });
        // The note lengths at 128 BPM on their own row, ticked on the axis.
        for (const [nm, m, on] of [['16th', GAP_MS / 2, ms >= GAP_MS / 2 - 1], ['8th', GAP_MS, ms >= GAP_MS - 1]]) {
            g.fillStyle = on ? P.cyan : P.ink3;
            g.fillRect(ZX(m) - 2, y + 416, 4, 28);
            label(g, nm, ZX(m), y + 530, { size: 42, weight: 800, color: on ? P.cyan : P.ink3, align: 'center', family: BODY });
        }
        g.restore();
        label(g, 'a 16th helps · an 8th outlasts the fog', 540, Z.y + 620, { size: 44, weight: 800, color: P.ink, align: 'center', alpha: popIn(t, tQuarter + 0.2, 0.3), family: BODY });
    }
    g.restore();
}

// ══ End: who made it, the lesson's demo on a phone, the address ══
const DP = new Image();
DP.src = DP_URL;
const SHOT = window.LESSON ? Object.fromEntries(Object.entries(LESSON.images).map(([k, v]) => [k, Object.assign(new Image(), { src: v })])) : null;
function avatar(gc, x, y, r) {
    gc.save();
    gc.beginPath();
    gc.arc(x, y, r, 0, Math.PI * 2);
    gc.clip();
    const s = Math.max((2 * r) / DP.width, (2 * r) / DP.height);
    gc.drawImage(DP, x - (DP.width * s) / 2, y - (DP.height * s) / 2, DP.width * s, DP.height * s);
    gc.restore();
    gc.strokeStyle = 'rgba(255,255,255,0.25)';
    gc.lineWidth = 3;
    gc.beginPath();
    gc.arc(x, y, r, 0, Math.PI * 2);
    gc.stroke();
}
// ══ End: who made it, the lesson's demo on a phone, the address ══
const PH = { x: 540, top: 290, w: 460, h: 730 };
function drawEnd(t) {
    if (t < SC.end) return;
    const a = E.out(seg(t, SC.end, SC.end + 0.25));
    g.save();
    g.globalAlpha = a;
    const btn = bump(t, BUTTON, 0.08, 0.6);
    avatar(g, 132, 212, 62 * (1 + 0.08 * btn));
    label(g, 'Virzy Guns', 222, 204, { size: 54, weight: 800, color: P.ink });
    label(g, TL.lesson.tagline, 222, 256, { size: 36, weight: 600, color: P.ink2 });
    const sw = PH.w - 28;
    const sh = PH.h - 28;
    const x0 = PH.x - PH.w / 2;
    const lift = E.outBack(seg(t, SC.end - 0.05, SC.end + 0.5));
    g.save();
    g.translate(0, (1 - lift) * 100 + 8 * Math.sin((t - SC.end) * 1.7));
    const glow = g.createRadialGradient(PH.x, PH.top + PH.h / 2, 0, PH.x, PH.top + PH.h / 2, 640);
    glow.addColorStop(0, 'rgba(125,211,252,0.15)');
    glow.addColorStop(1, 'rgba(125,211,252,0)');
    g.fillStyle = glow;
    g.fillRect(0, PH.top - 200, W, PH.h + 400);
    shadow(g, PH.x, PH.top + PH.h + 18, 300, 34);
    rr(g, x0, PH.top, PH.w, PH.h, 66);
    g.fillStyle = '#26314a';
    g.fill();
    rr(g, x0 + 5, PH.top + 5, PH.w - 10, PH.h - 10, 62);
    g.fillStyle = '#04060a';
    g.fill();
    g.save();
    rr(g, x0 + 14, PH.top + 14, sw, sh, 54);
    g.clip();
    g.fillStyle = '#050607';
    g.fillRect(x0 + 14, PH.top + 14, sw, sh);
    if (SHOT && SHOT.figure) {
        // The lesson page: its top, a fast scroll, then its gap-length figure, easing in on the
        // sentence that backs the film ("An 8th-note gap or longer lets it fade completely."),
        // which is underlined as the voice names the lesson.
        const tS0 = SC.end + 0.1;
        const tS1 = SC.end + 0.75;
        const F = SHOT.figure;
        const fs = sw / F.width;
        // The sentence sits at 765-880 px of the figure capture (2x), the chart below it.
        const focusY = 820 * fs;
        if (SHOT.page && t < tS1) {
            const ps = sw / SHOT.page.width;
            const y = E.in(seg(t, tS0, tS1)) * Math.min(LESSON.scrollTo * 2 * ps, SHOT.page.height * ps - sh);
            g.drawImage(SHOT.page, x0 + 14, PH.top + 14 - y, sw, SHOT.page.height * ps);
        } else {
            const z = 1 + 0.08 * E.inOut(seg(t, tS1, tS1 + 1.4));
            const yOff = clamp(focusY - sh * 0.42, 0, F.height * fs - sh);
            const fx = x0 + 14 + sw / 2;
            const fy = PH.top + 14 + focusY - yOff;
            g.save();
            g.translate(fx, fy);
            g.scale(z, z);
            g.translate(-fx, -fy);
            const arrive = 1 - E.out(seg(t, tS1, tS1 + 0.25));
            g.drawImage(F, x0 + 14, PH.top + 14 - yOff + arrive * 120, sw, F.height * fs);
            // The underline under the sentence's two lines.
            const u = E.inOut(seg(t, wto('cta', 'lesson', 0.3) - 0.1, wto('cta', 'lesson', 0.3) + 0.6));
            if (u > 0) {
                g.fillStyle = P.ink;
                const lx = x0 + 14 + 32 * fs;
                for (const [ly, lw] of [[810, 715], [876, 620]]) {
                    const k = clamp(u * 2 - (ly === 876 ? 1 : 0));
                    if (k > 0) g.fillRect(lx, PH.top + 14 - yOff + ly * fs + 4, lw * fs * k, 4);
                }
            }
            g.restore();
        }
    }
    g.restore();
    g.restore();
    // The address, up for the whole call to action.
    const k = popIn(t, voBy.cta.at + 0.1, 0.35);
    if (k > 0) {
        const pulse = t < BUTTON ? 0.035 * Math.exp(-((t % BEAT) / 0.12)) : 0;
        pill(g, TL.lesson.url, 540, 1092, { size: 56, bg: P.ink, fg: P.dark, scale: lerp(0.85, 1, E.outBack(k)) * (1 + 0.04 * btn + pulse), alpha: clamp(k * 3), weight: 800 });
        // The lesson's title on two lines, clear of the right-hand rail.
        const words = `Lesson: ${TL.lesson.title}`.split(' ');
        const cut = Math.ceil(words.length / 2);
        label(g, words.slice(0, cut).join(' '), 540, 1166, { size: 34, weight: 600, color: P.ink2, align: 'center', alpha: clamp(k * 3) });
        label(g, words.slice(cut).join(' '), 540, 1208, { size: 34, weight: 600, color: P.ink2, align: 'center', alpha: clamp(k * 3) });
        // The comment poll: the gap lengths the film names, as chips.
        ['16th', '8th', 'beat'].forEach((c, i) => {
            const kc = popIn(t, SC.end + 0.3 + i * 0.12, 0.25);
            if (kc > 0) pill(g, c, 540 + (i - 1) * 220, 1272, { size: 44, bg: c === '8th' ? P.cyan : P.ink, fg: P.dark, alpha: kc, scale: E.outBack(kc), weight: 800 });
        });
    }
    g.restore();
}

// ══ Words on screen: the narration, word by word, two lines at most ══
const KEYWORD = { click: P.amber, kick: P.amber, kicks: P.amber, riser: FOG, fog: FOG };
/** Split words (with widths) into at most two lines of near-equal width, or null if they need more. */
function twoLines(words, maxW, space) {
    const width = (ws) => ws.reduce((p, w) => p + w.width, 0) + space * Math.max(0, ws.length - 1);
    if (width(words) <= maxW) return [words];
    let best = null;
    for (let i = 1; i < words.length; i++) {
        const l1 = words.slice(0, i);
        const l2 = words.slice(i);
        // Balance the two lines, but never end the first on a weak word (a, the, so ...).
        const m = Math.max(width(l1), width(l2)) + (WEAK.has(norm(l1[l1.length - 1].w)) || norm(l1[l1.length - 1].w) === 'so' ? 400 : 0);
        if (width(l1) <= maxW && width(l2) <= maxW && (!best || m < best.m)) best = { m, lines: [l1, l2] };
    }
    return best ? best.lines : null;
}

const SUB = { size: 54, maxW: 780, maxWords: 11, x: 510, y: 1388, lh: 70 };
// A page never ends on these, and prefers to start on the second set.
const WEAK = new Set(['a', 'an', 'the', 'of', 'for', 'to', 'up', 'in', 'on', 'with', 'and', 'but', 'that', 'your', 'at', 'is', 'it', 'has', 'than', 'less']);
const LEAD = new Set(['right', 'after', 'before', 'for', 'with', 'and', 'but', 'is', 'in']);
/**
 * Caption pages for one narration line: phrases (split after , . : ; ? !)
 * packed into pages of at most two lines and nine words; "Virzy Guns" is one
 * unit; a page of one or two words joins the page before it when it fits.
 */
function pagesOf(v) {
    font(g, SUB.size, 600);
    const space = g.measureText(' ').width;
    const units = [];
    for (const w of v.words) {
        const prev = units[units.length - 1];
        if (prev && norm(prev.w) === 'virzy' && norm(w.w).startsWith('guns')) {
            prev.w = `${prev.w} ${w.w}`;
            prev.e = w.e;
            prev.n = 2;
        } else units.push({ ...w, n: 1 });
    }
    for (const u of units) u.width = g.measureText(u.w).width;
    const phrases = [[]];
    for (const u of units) {
        phrases[phrases.length - 1].push(u);
        if (/[,.:;?!]$/.test(u.w)) phrases.push([]);
    }
    if (!phrases[phrases.length - 1].length) phrases.pop();
    const count = (ws) => ws.reduce((p, u) => p + u.n, 0);
    const fits = (ws) => count(ws) <= SUB.maxWords && twoLines(ws, SUB.maxW, space);
    const pages = [];
    let cur = [];
    for (const ph of phrases) {
        if (fits([...cur, ...ph])) {
            cur = [...cur, ...ph];
            // A sentence ends the page, so a page never carries the next sentence's opening.
            if (/[.?!]$/.test(ph[ph.length - 1].w)) {
                pages.push(cur);
                cur = [];
            }
            continue;
        }
        if (cur.length) pages.push(cur);
        cur = [];
        // A phrase too long for one page splits into the fewest balanced pages.
        let rest = ph;
        while (!fits(rest)) {
            // Best split: fits, does not end on a weak word, starts on a lead word, balanced.
            let best = null;
            for (let k = 1; k < rest.length; k++) {
                if (!fits(rest.slice(0, k))) break;
                const last = norm(rest[k - 1].w);
                const next = norm(rest[k].w);
                const score = (WEAK.has(last) ? 10 : 0) + (LEAD.has(next) ? -4 : 0) + Math.abs(count(rest.slice(0, k)) - count(rest.slice(k))) * 0.5 + (fits(rest.slice(k)) ? 0 : 3);
                if (!best || score < best.score) best = { k, score };
            }
            const k = best ? best.k : 1;
            pages.push(rest.slice(0, k));
            rest = rest.slice(k);
        }
        cur = rest;
        if (/[.?!]$/.test(rest[rest.length - 1].w)) {
            pages.push(cur);
            cur = [];
        }
    }
    if (cur.length) pages.push(cur);
    for (let i = pages.length - 1; i > 0; i--) {
        if (count(pages[i]) <= 2) {
            const merged = [...pages[i - 1], ...pages[i]];
            if (twoLines(merged, SUB.maxW, space) && count(merged) <= SUB.maxWords + 2) pages.splice(i - 1, 2, merged);
        }
    }
    // A short first page ("Number two.") joins the next one, so it stays up long enough to read.
    if (pages.length > 1 && count(pages[0]) <= 2) {
        const merged = [...pages[0], ...pages[1]];
        if (twoLines(merged, SUB.maxW, space) && count(merged) <= SUB.maxWords + 2) pages.splice(0, 2, merged);
    }
    return pages.map((ws) => ({ words: ws, lines: twoLines(ws, SUB.maxW, space), space }));
}
const PAGES = Object.fromEntries(VO.map((v) => [v.id, null]));
function pagesFor(v) {
    PAGES[v.id] ??= pagesOf(v);
    return PAGES[v.id];
}

function subtitles(t) {
    const v = VO.filter((x) => t >= x.at - 0.12 && t <= x.at + x.dur + 0.3).pop();
    if (!v) {
        // During a demo with no narration: a speaker and "Listen", the cue to turn the sound on.
        const d = DEMOS.find((q) => t >= q.at && t < q.to && !q.id.startsWith('S'));
        if (d) {
            const a = clamp((t - d.at) / 0.15) * (1 - clamp((t - d.to + 0.15) / 0.15));
            g.save();
            g.globalAlpha = a;
            // The version now playing, as a big numbered disc that pulses on its downbeat.
            const pulse = t >= d.down ? Math.exp(-(t - d.down) / 0.15) : 0;
            badgeNum(g, d.v, 400, 1394, 46 * (1 + 0.2 * pulse));
            speaker(g, 486, 1394, 1.1, 0.5 + 0.5 * Math.sin(t * 18));
            label(g, 'Listen', 530, 1412, { size: 54, weight: 700, color: P.ink });
            g.restore();
        }
        return;
    }
    const fadeIn = clamp((t - v.at + 0.12) / 0.12);
    // A soft dark band behind the words, so they read over any picture.
    {
        const bandA = fadeIn * (1 - clamp((t - (v.at + v.dur + 0.1)) / 0.2));
        const bg = g.createLinearGradient(0, SUB.y - 110, 0, SUB.y + 110);
        bg.addColorStop(0, 'rgba(5,9,19,0)');
        bg.addColorStop(0.5, `rgba(5,9,19,${0.45 * bandA})`);
        bg.addColorStop(1, 'rgba(5,9,19,0)');
        g.fillStyle = bg;
        g.fillRect(0, SUB.y - 110, W, 220);
    }
    const fadeOut = 1 - clamp((t - (v.at + v.dur + 0.1)) / 0.2);
    const pages = pagesFor(v);
    let pi = 0;
    pages.forEach((p, k) => {
        if (p.words[0].s - 0.05 <= t) pi = k;
    });
    const page = pages[pi];
    font(g, SUB.size, 600);
    const y0 = SUB.y - ((page.lines.length - 1) * SUB.lh) / 2;
    g.save();
    g.textBaseline = 'middle';
    page.lines.forEach((line, li) => {
        const total = line.reduce((p, w) => p + w.width, 0) + page.space * (line.length - 1);
        let x = SUB.x - total / 2;
        for (const w of line) {
            const on = clamp((t - w.s + 0.03) / 0.09);
            const key = KEYWORD[norm(w.w)];
            g.fillStyle = on > 0 && key ? key : P.ink;
            // Words not yet spoken stay readable (over 4.5:1 on the ground).
            g.globalAlpha = fadeIn * fadeOut * lerp(0.8, 1, on);
            g.textAlign = 'left';
            g.fillText(w.w, x, y0 + li * SUB.lh);
            x += w.width + page.space;
        }
    });
    g.restore();
}

/** Caption cues for the .srt: one per page, as shown on screen. */
window.captionPages = () => {
    const cues = VO.flatMap((v) => {
        const pages = pagesFor(v);
        return pages.map((p, k) => ({
            start: k === 0 ? v.at : p.words[0].s - 0.05,
            end: k + 1 < pages.length ? pages[k + 1].words[0].s - 0.05 : v.at + v.dur + 0.25,
            text: p.lines.map((l) => l.map((w) => w.w).join(' ')).join('\n'),
        }));
    });
    // No cue starts before the previous one ends.
    for (let i = 1; i < cues.length; i++) cues[i].start = Math.max(cues[i].start, cues[i - 1].end);
    return cues;
};

function badge(t) {
    const a = 1 - seg(t, SC.end - 0.4, SC.end - 0.15);
    if (a <= 0) return;
    g.save();
    g.globalAlpha *= a;
    avatar(g, 96, 206, 32);
    label(g, 'Virzy Guns', 142, 218, { size: 34, weight: 700, color: P.ink });
    g.restore();
}


/** The first frame's composition, for the loop hand-off. */
function frameOne(alpha) {
    if (alpha <= 0) return;
    g.save();
    g.globalAlpha = alpha;
    drawAB(0);
    g.restore();
    g.save();
    g.globalAlpha = alpha;
    badge(0);
    g.restore();
}

function draw(t, { words = true } = {}) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    let kick = 0;
    for (const d of DEMOS) for (let b = 0; b < d.post; b++) {
        const tk = d.down + b * BEAT;
        if (t >= tk && t - tk < 0.3) kick = Math.max(kick, 1 - (t - tk) / 0.3);
    }
    ground(g, t, 0.3 * kick);
    // The crowd jumps on every demo kick, as high as that version's first kick is loud as heard.
    // The crowd only where the music is heard as a song: the hook, the replay and the end.
    g.save();
    g.globalAlpha = clamp(1 - seg(t, SC.fog - 0.3, SC.fog) + seg(t, SC.replay - 0.3, SC.replay));
    crowd(g, t, (delay) => {
        let lift = 0;
        for (const d of DEMOS) {
            const lv = 10 ** (((d.v === 1 ? D.r1.kickDb : D.r2.kickDb) - D.r2.kickDb) / 20);
            for (let b = 0; b < d.post; b++) {
                const age = t - delay - (d.down + b * BEAT);
                if (age >= 0 && age < 0.36) lift = Math.max(lift, 46 * lv * Math.sin((Math.PI * age) / 0.36));
            }
        }
        return lift;
    });
    g.restore();
    // The last half second hands off to frame one: the end card goes, then frame one comes.
    const out = seg(t, TL.duration - 0.62, TL.duration - 0.34);
    const loop = seg(t, TL.duration - 0.36, TL.duration - 0.04);
    g.save();
    g.globalAlpha = 1;
    // A small camera shake on each demo kick.
    g.translate(5 * kick * Math.sin(t * 91), 4 * kick * Math.cos(t * 77));
    drawAB(t);
    drawEar(t);
    drawHand(t);
    drawBrain(t);
    drawHow(t);
    if (out < 1) {
        g.save();
        g.globalAlpha = 1 - out;
        drawEnd(t);
        g.restore();
    }
    g.restore();
    frameOne(loop);
    if (words && out < 1) subtitles(t);
    badge(t);
}

/** Cover for the profile grid: the hook frame, the question over it. */
function drawCover() {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    ground(g, 0, 0.2);
    // Both versions drawn in full, the hook's last frame, under a large question
    // that sits inside the profile grid's 3:4 crop (y 240 to 1680).
    const tc = demoBy.B.to + 0.02;
    drawAB(tc, false, true);
    label(g, 'Same drop.', 540, 370, { size: 132, weight: 800, color: P.ink, align: 'center', base: 'middle' });
    label(g, 'One change. Which hits harder?', 540, 500, { size: 64, weight: 800, color: P.ink, align: 'center', base: 'middle' });
    pill(g, 'what changed?', 540, 1300, { size: 40, bg: P.ink, fg: P.dark, weight: 800 });
    label(g, '1 or 2?', 540, 1440, { size: 120, weight: 800, color: P.ink, align: 'center', base: 'middle' });
    // The brand inside the 3:4 crop.
    avatar(g, 420, 1590, 36);
    label(g, 'Virzy Guns', 468, 1604, { size: 40, weight: 700, color: P.ink });
}

window.seek = (t) => draw(t);
window.sceneTimes = () => SCENES.map((s) => ({ id: s.id, start: s.start }));
// Full-size crops of every plot, at the moment each is most complete.
const inScene = (id, t) => Math.min(t, sceneEnd(id) - 0.35);
window.plotCrops = () => [
    { id: 'ab', t: demoBy.B.to + 0.4, box: { x: 30, y: 260, width: 960, height: 1020 } },
    { id: 'notch', t: inScene('notch', vEnd('hook') - 0.1), box: { x: 30, y: 560, width: 960, height: 760 } },
    { id: 'fog', t: inScene('fog', vEnd('fog') + 0.05), box: { x: 20, y: 440, width: 960, height: 880 } },
    { id: 'fresh', t: inScene('fresh', vEnd('fresh') + 0.2), box: { x: 20, y: 440, width: 960, height: 880 } },
    { id: 'hand', t: inScene('hand', vEnd('hand') + 0.3), box: { x: 100, y: 420, width: 880, height: 880 } },
    { id: 'brain', t: inScene('brain', vEnd('brain') - 0.05), box: { x: 80, y: 560, width: 900, height: 760 } },
    { id: 'how', t: inScene('how', vEnd('how') - 0.05), box: { x: 80, y: 520, width: 920, height: 800 } },
    { id: 'replay', t: demoBy.B2.to - 0.05, box: { x: 30, y: 560, width: 960, height: 780 } },
];
window.cover = () => drawCover();
window.filmReady = (async () => {
    await Promise.all(['600 54px', '800 74px', '700 34px', '500 30px'].map((f) => document.fonts.load(`${f} ${DISPLAY}`)));
    await Promise.all(['500 30px', '600 28px', '700 32px'].map((f) => document.fonts.load(`${f} ${BODY}`)));
    await DP.decode();
    if (SHOT) await Promise.all(Object.values(SHOT).map((i) => i.decode()));
    draw(0);
    return { duration: TL.duration, fps: TL.fps };
})();
