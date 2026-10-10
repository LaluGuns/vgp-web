// Film 5 picture: scenes drawn on one 1080 x 1920 canvas, a pure function of
// time. window.seek(t) draws the frame at t seconds. Reads TIMELINE and DATA
// (the A/B's levels, limiter gain and the two hearing models, computed with
// the sound) and the drawing kit in art.js.
//
// Colour has one meaning for the whole film: amber is the kick and its
// click, cyan is data (levels, the limiter, the ruler), the riser and its fog
// are violet-grey, everything else is neutral.
/* global crowd, EARX, earSection, hairCell, magnifier, fogCloud, soundArcs, sparkle, speakerBox, consoleDesk, grMeter, knobSmall, brainChar, scissors, clip, TIMELINE, DATA, DP_URL, LESSON, W, H, P, clamp, lerp, seg, E, bump, font, label, rr, pill, shadow, ground, panel, PANEL, fader, faderCapY, robotDome, gloveDown, tube, speaker, DISPLAY, BODY */

const TL = TIMELINE;
const D = DATA;
const cv = document.getElementById('film');
cv.width = W;
cv.height = H;
const g = cv.getContext('2d');

// The riser and its fog.
const FOG = '#a7abc9';
const FOG_RGB = '200,203,226';
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
/** A slow push-in over a stretch of the film, about the middle of the picture. */
function cam(t, s0, s1, amount = 0.035) {
    const z = 1 + amount * E.inOut(seg(t, s0, s1));
    g.translate(540, 820);
    g.scale(z, z);
    g.translate(-540, -820);
}
/** Visible between a scene's start and end, with short dissolves either side. */
const sceneAlpha = (t, id) => E.out(seg(t, SC[id] + 0.02, SC[id] + 0.3)) * (1 - seg(t, sceneEnd(id) - 0.24, sceneEnd(id)));

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
    const a = frame1 ? 1 : replay ? sceneAlpha(t, 'replay') : 1 - seg(t, SC.fog - 0.24, SC.fog);
    if (a <= 0) return;
    g.save();
    g.globalAlpha *= a;
    if (!frame1 && !noHead) {
        if (replay) cam(t, SC.replay, SC.end);
        else if (t >= SC.notch) cam(t, SC.notch, SC.fog, 0.03);
    }
    const [dA, dB] = replay ? [demoBy.A2, demoBy.B2] : [demoBy.A, demoBy.B];
    // The replay uses the hook's window, so it is the same picture as the opening.
    const msA = -demoBy.A.pre * BEAT * 1000;
    const msB = demoBy.A.post * BEAT * 1000;
    const G = TL.guess;
    const tTwo = wt('hook', 'two');
    const guessing = !frame1 && !replay && t >= G.at && t < voBy.hook.at - 0.05;
    // Headline: the question; "1 or 2?" while the viewer picks; the answer on "two".
    if (noHead) {
        // Cover: the headline is drawn by drawCover.
    } else if (replay) headline(t, SC.replay + 0.05, [['Now'], ['listen'], ['again']], 330, { size: 96 });
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
            label(g, '1 or 2? Pick one.', 0, 0, { size: 72, weight: 800, color: P.ink, align: 'center', base: 'middle' });
            g.restore();
        } else label(g, 'Which one hits harder?', 540, 445, { size: 66, weight: 800, color: P.ink, align: 'center', base: 'middle' });
    }
    // Notch zoom on both lanes during the hook line, so the drop lines stay aligned.
    const zIn = id === 'notch' ? E.inOut(seg(t, wto('hook', 'hole', 0.35) - 0.1, wto('hook', 'hole', 0.35) + 0.5)) : 0;
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
        g.translate(540, lane.y);
        g.scale(1 + 0.025 * kick, 1 + 0.025 * kick);
        g.translate(-540, -lane.y);
        rr(g, box.x0 - 24, lane.y - lane.h / 2 - 20, box.x1 - box.x0 + 48, lane.h + 40, 22);
        g.fillStyle = playing ? 'rgba(125,211,252,0.07)' : 'rgba(255,255,255,0.035)';
        g.fill();
        g.strokeStyle = playing ? 'rgba(125,211,252,0.55)' : 'rgba(255,255,255,0.08)';
        g.lineWidth = 3;
        g.stroke();
        // Before a version has played, both lanes show the same neutral
        // silhouette, so the eye cannot answer before the ear; the real
        // waveform lights up under the playhead.
        const upto = frame1 ? -1e9 : t >= d.to ? 1e9 : abProgress(d, t);
        if (replay || v === 1) wave(g, v, box, a0, b0, 1e9, { alpha: 0.3 * dim });
        else if (upto < msB) {
            silhouette(g, box, upto, a0, b0);
            if (upto < msA) label(g, '?', 540, lane.y + 4, { size: 96, weight: 800, color: P.ink3, align: 'center', base: 'middle' });
        }
        if (!frame1 && (t >= d.at || replay)) wave(g, v, box, a0, b0, upto, { alpha: dim });
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
    if (!replay && !noHead) label(g, 'same samples · matched loudness', 540, 1288, { size: 36, weight: 600, color: P.ink2, align: 'center', family: BODY, alpha: frame1 ? 1 : 1 - seg(t, SC.fog - 0.3, SC.fog - 0.05) });
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
    }
    // Replay: what to listen for, on each first kick.
    if (replay && !frame1) {
        const k1 = popIn(t, dA.down, 0.2);
        const k2 = popIn(t, dB.down, 0.2);
        const L1 = AB.lanes[0];
        const L2 = AB.lanes[1];
        tag(g, 'buried click', X(0) - 150, L1.y + L1.h / 2 + 62, { x: X(0), y: L1.y + L1.h / 2 - 10 }, { a: k1, bg: P.dark, fg: P.amber, ring: P.amber, size: 34 });
        tag(g, 'clean click', X(0) - 150, L2.y + L2.h / 2 + 62, { x: X(0), y: L2.y + L2.h / 2 - 10 }, { a: k2, bg: P.amber, fg: P.dark, size: 34 });
    }
    g.restore();
}

// ══ Ear: what the riser does to hearing (fog), and what silence gives back (fresh) ══
// First the ear in cross-section, slowed down (model); then the two versions as measured rows.
const EAR = { x0: 330, x1: 900, msA: -450, msB: 450, rows: [{ y: 640, h: 230 }, { y: 1000, h: 230 }], axisY: 1145 };
const EX = (ms) => EAR.x0 + ((EAR.x1 - EAR.x0) * (ms - EAR.msA)) / (EAR.msB - EAR.msA);
// The cross-section's place on screen, and its cochlea there.
const XS = { x: 560, y: 740, s: 1 };
const XC = { x: XS.x + EARX.cochlea.x * XS.s, y: XS.y + EARX.cochlea.y * XS.s };
const MAG = { x: 700, y: 1118, r: 132 };
const fogWeight = (ms) => (ms >= 200 ? 0 : 1 - Math.log10(1 + Math.max(0, ms) / 10) / Math.log10(21));
function sensMeter(gc, x, y, h, sens, alpha) {
    if (alpha <= 0) return;
    gc.save();
    gc.globalAlpha *= alpha;
    rr(gc, x - 16, y - h / 2, 32, h, 12);
    gc.fillStyle = P.dark;
    gc.fill();
    const f = (h - 8) * clamp(sens);
    rr(gc, x - 12, y + h / 2 - 4 - f, 24, f, 9);
    gc.fillStyle = P.cyan;
    gc.fill();
    gc.restore();
}
/** One version's row: the build's level (riser colour), its fog (model), and the kick's click. */
function earRow(v, row, { reach, alpha, fogOn, live = false, head = null }) {
    const top = row.y - row.h / 2;
    const base = row.y + row.h / 2;
    g.save();
    g.globalAlpha *= alpha;
    rr(g, EAR.x0 - 24, top - 20, EAR.x1 - EAR.x0 + 48, row.h + 40, 22);
    g.fillStyle = live ? 'rgba(125,211,252,0.07)' : 'rgba(255,255,255,0.035)';
    g.fill();
    if (live) {
        g.strokeStyle = 'rgba(125,211,252,0.55)';
        g.lineWidth = 3;
        g.stroke();
    }
    const col = 4;
    for (let x = 0; x < EAR.x1 - EAR.x0; x += col) {
        const ms = EAR.msA + ((EAR.msB - EAR.msA) * x) / (EAR.x1 - EAR.x0);
        if (ms > reach) break;
        const m = Math.min(1, maxIn(V[v].masker, ms, ms + 6) / PEAK_MAX);
        const h = (row.h - 20) * m;
        g.fillStyle = RISER;
        g.fillRect(EAR.x0 + x, base - h, col - 1, h);
        const f = val(V[v].fog, ms) * fogOn;
        if (f > 0.005) {
            const gr = g.createLinearGradient(0, top, 0, base);
            gr.addColorStop(0, `rgba(${FOG_RGB},${0.2 * f})`);
            gr.addColorStop(1, `rgba(${FOG_RGB},${0.75 * f})`);
            g.fillStyle = gr;
            g.fillRect(EAR.x0 + x, top, col, row.h);
        }
    }
    if (reach >= 0) {
        const f = val(V[v].fog, 0) * fogOn;
        const k = Math.min(1, maxIn(V[v].kick, 0, 25) / PEAK_MAX);
        const hk = (row.h - 20) * k;
        g.save();
        g.globalAlpha *= 1 - 0.65 * f;
        g.fillStyle = P.amber;
        g.fillRect(EX(0) - 6, base - hk, 12, hk);
        g.restore();
    }
    dashed(g, EX(0), top - 6, EX(0), base + 6, P.ink3, 3, [8, 8]);
    const ph = head ?? (reach > EAR.msA && reach < EAR.msB ? reach : null);
    if (ph !== null && ph > EAR.msA && ph < EAR.msB) {
        g.fillStyle = P.ink;
        g.fillRect(EX(ph) - 2, top - 6, 4, row.h + 12);
    }
    g.restore();
}

/** The cross-section part of the fog line: riser in, fog builds, click covered; riser stops, fog lingers up to 200 ms. */
function drawEarSection(t, k) {
    if (k <= 0) return;
    const tLoud = wto('fog', 'loud', 0.02);
    const tClick = wto('fog', 'click', 0.2);
    const tDulls = wto('fog', 'dulls', 0.36);
    const tStops = wto('fog', 'stops', 0.69);
    // The riser: rising from "loud" until "dulls", then stopped.
    const riser = (tt) => (tt < tLoud || tt > tDulls ? 0 : lerp(0.35, 1, seg(tt, tLoud, tDulls)));
    // Gauge: 0 to 200 ms after the riser stops, slowed down to last until "stops".
    const g0 = tDulls + 0.25;
    const g1 = tStops + 0.25;
    const ms = 200 * seg(t, g0, g1);
    const lvStop = riser(tDulls - 1e-3);
    const fog = t < tDulls ? 0.3 + 0.7 * riser(t) * seg(t, tLoud, tLoud + 0.8) : lvStop * fogWeight(t < g0 ? 0 : ms);
    // The click's spark: from the left at "click", into the cochlea 0.6 s later.
    const tArr = tClick + 0.6;
    const covered = clamp(0.3 + 0.7 * riser(tArr));
    g.save();
    g.globalAlpha *= k;
    // Sound arriving: the riser as arcs travelling into the canal.
    soundArcs(g, -60, XS.x - 340 * XS.s, XS.y, t, (age) => riser(t - age), { color: '126,131,168', speed: 520, h: 64 });
    const vib = riser(t) * Math.sin(t * 60) + (t > tArr && t < tArr + 0.3 ? 0.4 * Math.sin((t - tArr) * 90) * (1 - covered) : 0);
    earSection(g, XS.x, XS.y, XS.s, { vib, t });
    fogCloud(g, XC.x, XC.y, 230, 170, fog, t, 5);
    // The spark along the canal.
    if (t >= tClick && t < tArr + 0.25) {
        const u = seg(t, tClick, tArr);
        const x = lerp(20, XC.x, E.inOut(u));
        const y = u < 0.62 ? XS.y : lerp(XS.y, XC.y, seg(u, 0.62, 1));
        const a = u < 1 ? lerp(1, 1 - 0.75 * covered, seg(u, 0.55, 1)) : (1 - covered * 0.75) * (1 - seg(t, tArr, tArr + 0.25));
        sparkle(g, x, y, 26, a);
    }
    tag(g, 'riser', 150, XS.y - 150, { x: 120, y: XS.y - 40 }, { a: popIn(t, tLoud + 0.1) * (1 - seg(t, tDulls, tDulls + 0.3)), bg: RISER, fg: P.ink, size: 36 });
    tag(g, 'click', 130, XS.y + 150, { x: 110, y: XS.y + 30 }, { a: popIn(t, tClick, 0.2) * (1 - seg(t, tArr + 0.6, tArr + 0.9)), bg: P.amber, fg: P.dark, size: 36 });
    // Hair cells in the cochlea, magnified.
    const kM = popIn(t, tLoud + 0.5, 0.4);
    magnifier(g, MAG.x, MAG.y, MAG.r, XC, () => {
        const yb = MAG.y + 80;
        rr(g, MAG.x - MAG.r, yb, MAG.r * 2, 90, 0);
        g.fillStyle = '#e88a95';
        g.fill();
        const hit = t > tArr ? Math.exp(-(t - tArr) / 0.25) * (1 - covered) : 0;
        for (let i = 0; i < 4; i++) {
            const cx = MAG.x - 96 + i * 64;
            hairCell(g, cx, yb - 38, 0.78, { tired: clamp(fog * 1.1), burst: hit, wobble: Math.sin(t * 3 + i * 1.3) * (1 - fog) });
        }
        if (t >= tArr - 0.15 && t < tArr + 0.3) sparkle(g, MAG.x, lerp(MAG.y - MAG.r, MAG.y - 30, seg(t, tArr - 0.15, tArr)), 22, (1 - 0.75 * covered) * (1 - seg(t, tArr, tArr + 0.3)));
        fogCloud(g, MAG.x, MAG.y + 10, 260, 220, fog, t, 9);
    }, { alpha: kM });
    label(g, 'hair cells', MAG.x, MAG.y + MAG.r + 46, { size: 34, weight: 700, color: P.ink2, align: 'center', alpha: kM, family: BODY });
    // While it plays: covered.
    const kC = popIn(t, tArr + 0.05, 0.3) * (1 - seg(t, tDulls - 0.3, tDulls));
    tag(g, 'click covered', 290, 1060, { x: XC.x - 40, y: XC.y + 40 }, { a: kC, bg: P.dark, fg: P.amber, ring: P.amber, size: 36 });
    // After it stops: the fog lingers, timed on a stopwatch (slowed down).
    const kG = popIn(t, tDulls, 0.3);
    if (kG > 0) {
        g.save();
        g.globalAlpha *= kG;
        stopwatch(g, 300, 1120, 64, ms / 200, FOG);
        g.restore();
        label(g, `${Math.round(ms)} ms`, 300, 1240, { size: 44, weight: 800, color: P.cyan, align: 'center', alpha: kG });
        label(g, ms < 200 ? 'riser stopped · fog lingers' : 'fog gone at 200 ms', 300, 1010, { size: 34, weight: 700, color: FOG, align: 'center', alpha: kG, family: BODY });
    }
    g.restore();
}

function drawEar(t) {
    const a = E.out(seg(t, SC.fog + 0.02, SC.fog + 0.3)) * (1 - seg(t, SC.hand - 0.24, SC.hand));
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    cam(t, SC.fog, SC.hand);
    const fresh = t >= SC.fresh;
    const tSo = wto('fog', 'number', 0.82) - 0.45;
    // Cross-section until "So in number one", then the measured rows.
    const toRows = E.inOut(seg(t, tSo, tSo + 0.5));
    if (!fresh) {
        headline(t, SC.fog + 0.1, [['A'], ['riser'], ['leaves'], ['a'], ['fog', FOG]], 300, { size: 84 });
        const tR = wto('fog', 'riser', 0.05);
        const tC = wto('fog', 'click', 0.2);
        const gloss = t >= tR && t < tR + 1.4 ? 'riser = the rising whoosh before a drop' : t >= tC && t < tC + 1.4 ? "click = the kick's sharp first instant" : null;
        label(g, gloss ?? (toRows < 0.5 ? 'slowed down · masking (model, Moore 2012)' : '1 of 3 · ears · both versions, as heard'), 540, 400, { size: 34, weight: 600, color: gloss ? P.ink : P.ink2, align: 'center', family: BODY });
    } else {
        headline(t, SC.fresh + 0.05, [['Silence'], ['resets'], ['your'], ['ears']], 300, { size: 84 });
        label(g, '1 of 3 · ears · hair-cell response (model, Moore 2012)', 540, 400, { size: 34, weight: 600, color: P.ink2, align: 'center', family: BODY });
    }
    if (toRows < 1) {
        g.save();
        g.translate(540, 820);
        const z = 1 + 0.12 * toRows;
        g.scale(z, z);
        g.translate(-540, -820);
        drawEarSection(t, 1 - toRows);
        g.restore();
    }
    if (toRows <= 0) {
        g.restore();
        return;
    }
    g.save();
    g.globalAlpha *= toRows;
    g.translate(540, 820);
    g.scale(lerp(0.94, 1, toRows), lerp(0.94, 1, toRows));
    g.translate(-540, -820);
    const S1 = demoBy.S1;
    const S2 = demoBy.S2;
    const reach = fresh ? EAR.msB : keys(t, [[tSo + 0.2, EAR.msA], [tSo + 1.1, EAR.msB]]);
    const inS = (d) => t >= d.at && t < d.to;
    const tTwo = wto('fresh', 'two', 0.1);
    const r1 = fresh ? (t >= tTwo ? 0.45 : 1) : inS(S1) || t >= S1.to ? 1 : 1;
    const r2 = fresh ? 1 : inS(S1) ? 0.45 : 1;
    const resp = fresh ? popIn(t, Math.min(S2.down, wto('fresh', 'fresh', 0.9) - 0.1), 0.25) : 0;
    EAR.rows.forEach((row, i) => {
        const v = i + 1;
        const S = v === 1 ? S1 : S2;
        const live = inS(S);
        const rA = v === 1 ? (resp > 0 ? 1 : r1) : r2;
        earRow(v, row, { reach, alpha: rA, fogOn: 1, live, head: live ? (t - S.down) * 1000 : null });
        badgeNum(g, v, 64, row.y - row.h / 2 + 4, 32, { alpha: rA });
        // A hair cell for each version, as tired as the model says at the playhead (or the drop).
        const at = live ? clamp((t - S.down) * 1000, EAR.msA, -1) : clamp(reach, EAR.msA, -1);
        const sens = val(V[v].sens, at);
        const fogNow = val(V[v].fog, live ? clamp((t - S.down) * 1000, EAR.msA, EAR.msB) : clamp(reach, EAR.msA, 0));
        const hitAge = t - S.down;
        const burst = hitAge > 0 && hitAge < 0.8 ? Math.exp(-hitAge / 0.3) * (v === 2 ? 1 : 0.25) : 0;
        g.save();
        g.globalAlpha *= rA;
        rr(g, 112, row.y - 70, 116, 150, 30);
        g.fillStyle = 'rgba(232,138,149,0.18)';
        g.fill();
        hairCell(g, 170, row.y + 10, 1.0, { tired: clamp((1 - sens) / 0.75), burst, wobble: Math.sin(t * 3 + v) * 0.5 });
        fogCloud(g, 170, row.y, 150, 150, fogNow, t, 11 + v);
        g.restore();
        sensMeter(g, 262, row.y + 10, 160, sens, rA);
    });
    label(g, 'hair cell', 170, EAR.rows[1].y + EAR.rows[1].h / 2 + 52, { size: 34, weight: 600, color: P.ink2, align: 'center', family: BODY });
    msAxis(g, EAR.x0, EAR.x1, EAR.msA, EAR.msB, EAR.axisY, [-400, 0, 400]);
    const R1 = EAR.rows[0];
    if (!fresh) {
        tag(g, 'click buried under riser + fog', EX(0) + 20, R1.y - R1.h / 2 - 50, null, { a: popIn(t, wto('fog', 'buried', 0.95) - 0.25, 0.3), bg: P.dark, fg: P.amber, ring: P.amber, size: 34 });
    } else {
        const tCl = wto('fresh', 'cleared', 0.5);
        const R2 = EAR.rows[1];
        const kS = popIn(t, tCl - 0.1, 0.3) * (1 - resp);
        if (kS > 0) {
            dashed(g, EX(-GAP_MS), R2.y - R2.h / 2, EX(-GAP_MS), R2.y + R2.h / 2, FOG, 4, [6, 8]);
            label(g, 'riser stops · fog gone by the drop', (EX(-GAP_MS) + EX(0)) / 2 + 40, R2.y - R2.h / 2 - 40, { size: 34, weight: 700, color: FOG, align: 'center', alpha: kS, family: BODY });
        }
        // The response to the kick (model): a tall burst after silence, a small one inside the riser.
        const RMAX = Math.max(...V[2].rate) / 0.95;
        EAR.rows.forEach((row, i) => {
            const v = i + 1;
            let pk = 0;
            for (let m = 0; m < 30; m++) pk = Math.max(pk, val(V[v].rate, m));
            const h = (row.h - 10) * clamp(pk / RMAX) * E.out(resp);
            const base = row.y + row.h / 2;
            if (h > 1) {
                rr(g, EX(0) + 16, base - h, 30, h, 8);
                g.fillStyle = P.cyan;
                g.fill();
            }
            label(g, v === 2 ? 'full response' : 'small response', EX(0) + 60, row.y - row.h / 2 + 30, { size: 36, weight: 800, color: P.cyan, alpha: resp });
        });
    }
    g.restore();
    // The measured result, from "buried" to the end of the ear scene.
    const kM = popIn(t, wto('fog', 'buried', 0.95) - 0.05, 0.3);
    if (kM > 0) pill(g, `measured: click ${fmt(D.claims[2].db)} dB clearer in 2`, 540, EAR.axisY + 112, { size: 38, bg: P.dark, fg: P.ink, ring: P.ink, alpha: kM * toRows, scale: E.outBack(kM), weight: 800 });
    g.restore();
}

// ══ Hand: the limiter is a hand on a fader, on a console ══
const HD = { faders: [{ x: 330, v: 1 }, { x: 690, v: 2 }], desk: { x0: 150, y0: 560, w: 780, h: 650 }, top: 800, bottom: 1120, shelf: 548, msA: -700, msB: 260, scope: { y0: 616, h: 120, w: 280 } };
const FADER_MAX = 8;
function drawHand(t) {
    const a = sceneAlpha(t, 'hand');
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    cam(t, SC.hand, SC.brain);
    headline(t, SC.hand + 0.1, [['The'], ['limiter'], ['is'], ['a'], ['hand']], 300, { size: 84 });
    label(g, '2 of 3 · the limiter · its own gain, measured', 540, 400, { size: 36, weight: 600, color: P.ink2, align: 'center', family: BODY });
    const tHand = wto('hand', 'hand', 0.17);
    const tRiser = wto('hand', 'riser', 0.38);
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
        badgeNum(g, f.v, sx0 - 2, sc.y0 - 4, 30);
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
        knobSmall(g, f.x - 60, HD.top - 28, 18, 0.35);
        knobSmall(g, f.x + 86, HD.top - 28, 18, 0.6);
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
            const r = (60 + 110 * E.out(kAge / 0.9)) * 10 ** ((kick - D.r2.kickDb) / 20);
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
        label(g, `GR −${fmt(shown)} dB`, f.x, dk.y0 + dk.h - 34, { size: 36, weight: 800, color: kR > 0 ? P.ink : P.cyan, align: 'center' });
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
        const cx = 510;
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
    label(g, kR > 0 ? 'measured: gain reduction on the first kick' : live ? `limiter gain, slowed down ${Math.round(slow)}×` : 'the limiter on the master bus', 540, dk.y0 + dk.h + 62, { size: 36, weight: 700, color: P.ink2, align: 'center', family: BODY });
    g.restore();
}

// ══ Brain: one thing to predict ══
const BR = { x0: 150, x1: 900, dots: 1110, wave: 990, brain: { x: 330, y: 660, s: 1.0 } };
function drawBrain(t) {
    const a = sceneAlpha(t, 'brain');
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    cam(t, SC.brain, SC.how);
    headline(t, SC.brain + 0.1, [['Predict'], ['the'], ['next'], ['beat']], 300, { size: 88 });
    label(g, '3 of 3 · your brain · expectation (Huron 2006)', 540, 400, { size: 36, weight: 600, color: P.ink2, align: 'center', family: BODY });
    // Eight beats: the last bar and a half of the build, then the downbeat.
    const n = 8;
    const X = (i) => lerp(BR.x0, BR.x1, i / (n - 1));
    const tPred = wto('brain', 'predict', 0.25);
    const tNext = wto('brain', 'next', 0.38);
    const tLand = wto('brain', 'there', 0.68);
    const tArr = wto('brain', 'arrival', 0.85);
    // A ball hops along the build's beats 0 to 6; the build stops at 6.5 for the gap.
    const hop = keys(t, [[SC.brain + 0.3, 0], [tPred - 0.1, 6]]);
    const fillTo = Math.min(6.5, hop + 0.5);
    for (let i = 0; i < 6.5 * 24; i++) {
        const p = i / 24;
        if (p > fillTo) break;
        const h = 16 + 130 * (p / 6.5) ** 2;
        g.fillStyle = RISER;
        g.fillRect(X(p) - 3, BR.wave - h / 2, 5, h);
    }
    label(g, 'build', X(3), BR.wave - 100, { size: 34, weight: 700, color: FOG, align: 'center', alpha: popIn(t, SC.brain + 0.4), family: BODY });
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
    const ks = popIn(t, tPred - 0.3);
    if (ks > 0) {
        const xa = X(6.5);
        const xb = X(7);
        g.save();
        g.globalAlpha *= ks;
        g.strokeStyle = P.ink2;
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(xa, BR.dots + 44);
        g.lineTo(xa, BR.dots + 58);
        g.lineTo(xb, BR.dots + 58);
        g.lineTo(xb, BR.dots + 44);
        g.stroke();
        g.restore();
        label(g, 'silence', (xa + xb) / 2, BR.dots + 100, { size: 34, weight: 700, color: P.ink2, align: 'center', alpha: ks, family: BODY });
    }
    // The ball: hops on the beats, waits on beat 6, then the prediction: a dotted arc to the downbeat.
    const k = E.inOut(seg(t, tPred, tNext + 0.3));
    const arcPt = (u) => ({ x: lerp(X(6), X(7), u), y: BR.dots - 30 - 260 * 4 * u * (1 - u) });
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
        g.arc(X(7), BR.dots, 34, 0, Math.PI * 2);
        g.stroke();
        g.restore();
        tag(g, 'next beat', X(6.5) - 30, BR.dots - 330, { x: arcPt(0.5).x - 6, y: arcPt(0.5).y - 16 }, { a: popIn(t, tNext), bg: P.ink, fg: P.dark, size: 36 });
    }
    let ball;
    if (t < tPred) {
        const fr = hop - Math.floor(hop);
        ball = { x: X(hop), y: BR.dots - 30 - 120 * Math.sin(Math.PI * fr) };
    } else if (t < tLand - 0.35) ball = { x: X(6), y: BR.dots - 30 };
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
        g.arc(X(7), BR.dots, 28, 0, Math.PI * 2);
        g.fill();
        for (let i = 0; i < 3; i++) {
            const ag = land - i * 0.12;
            if (ag < 0 || ag > 0.8) continue;
            g.strokeStyle = `rgba(251,191,36,${0.85 * (1 - ag / 0.8)})`;
            g.lineWidth = 7;
            g.beginPath();
            g.arc(X(7), BR.dots, 36 + 76 * E.out(ag / 0.8), 0, Math.PI * 2);
            g.stroke();
        }
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2 + 0.3;
            const d = 60 + 90 * E.out(clamp(land / 0.6));
            sparkle(g, X(7) + Math.cos(ang) * d, BR.dots + Math.sin(ang) * d * 0.7, 14, 1 - clamp(land / 0.9));
        }
    }
    // The listener's brain: watches the ball, leans in during the silence, delighted when the kick lands.
    const B = BR.brain;
    const kB = popIn(t, SC.brain + 0.1, 0.4);
    const waiting = t >= tPred && t < tLand ? 1 : 0;
    const joy = land >= 0 ? clamp(land / 0.2) : 0;
    const blink = Math.max(0, 1 - Math.abs(((t - SC.brain) % 3.1) - 1.5) / 0.08);
    g.save();
    g.globalAlpha *= kB;
    const bob = Math.sin(t * 2.4) * 6 - (land >= 0 ? 24 * Math.exp(-land / 0.25) * Math.sin(Math.min(Math.PI, land * 12)) : 0);
    brainChar(g, B.x, B.y + bob, B.s * lerp(0.85, 1, E.outBack(kB)), { look: land >= 0 ? { x: X(7), y: BR.dots } : ball, joy, lean: waiting * 0.8 * E.inOut(seg(t, tPred, tPred + 0.4)), blink: waiting ? 0 : blink, t });
    g.restore();
    // A thought bubble: what it predicts.
    const kT = popIn(t, tNext - 0.1, 0.3) * (1 - seg(t, tLand + 0.2, tLand + 0.5));
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
    if (kp > 0) pill(g, 'the arrival is the payoff', 540, BR.dots + 170, { size: 42, bg: P.ink, fg: P.dark, alpha: kp, scale: E.outBack(kp), weight: 800 });
    g.restore();
}

// ══ How: the cut in a DAW, then the gap at 128 BPM ══
// The arrangement shows two beats before the drop and one after; the cut is an 8th before it.
const HW = { x0: 80, x1: 920, names: 250, y0: 470, ruler: 530, lanes: [580, 680, 780, 880], laneH: 86, beats: [-2, 1], zoom: { y: 1100, x0: 130, x1: 880, msMax: 300 } };
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
    headline(t, SC.how + 0.1, [['Cut'], ['an'], ['8th'], ['early']], 300, { size: 92 });
    label(g, `At ${TL.bpm} BPM`, 540, 400, { size: 40, weight: 700, color: P.cyan, align: 'center' });
    const tCut = wto('how', 'cut', 0.03);
    const tEighth = wto('how', 'eighth', 0.12);
    const tAt = wto('how', 'at', 0.32);
    const tQuarter = wto('how', 'quarter', 0.6);
    const tVerb = wto('how', 'reverb', 0.84);
    const tTails = wto('how', 'tails', 0.9);
    // Window: the DAW eases in, then shifts up a little when the zoom panel opens.
    const kW = E.outBack(seg(t, SC.how, SC.how + 0.45));
    g.save();
    g.translate(0, (1 - kW) * 60);
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
    for (let b = bA; b <= bB; b += 0.5) {
        const x = BX(b);
        g.strokeStyle = b === Math.round(b) ? P.ink3 : P.ink4;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x, HW.ruler + (b === Math.round(b) ? 0 : 16));
        g.lineTo(x, HW.lanes[3] + HW.laneH);
        g.stroke();
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
        const wave = key === 'riser' ? (u) => 0.25 + 0.75 * u ** 1.5 : key === 'drums' ? (u) => (Math.abs(Math.sin(u * Math.PI * 6)) > 0.85 ? 0.95 : 0.25) : key === 'synth' ? (u) => 0.5 + 0.2 * Math.sin(u * 40) : (u) => 0.35;
        const after = key === 'riser' ? null : key === 'drums' ? (u) => (Math.abs(Math.sin(u * Math.PI * 2)) > 0.8 ? 1 : 0.35) : key === 'synth' ? (u) => 0.85 : (u) => 0.4;
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
        g.strokeStyle = P.cyan;
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
        g.strokeStyle = P.cyan;
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
        tag(g, 'reverb muted too', BX(-1.3), y + HW.laneH + 52, { x: (xc + BX(0)) / 2, y: yDn }, { a: popIn(t, tTails - 0.1, 0.3), bg: P.cyan, fg: P.dark, size: 34 });
    }
    g.restore();
    // At 128 BPM: the 8th in milliseconds, against the fog (model) and the shorter gaps.
    const kZ = popIn(t, tAt - 0.1, 0.35);
    if (kZ > 0) {
        const Z = HW.zoom;
        const ZX = (ms) => lerp(Z.x0, Z.x1, ms / Z.msMax);
        const y = Z.y + (1 - E.out(kZ)) * 40;
        g.save();
        g.globalAlpha *= kZ;
        for (let ms = 0; ms < 200; ms += 2) {
            g.fillStyle = `rgba(${FOG_RGB},${0.55 * fogWeight(ms)})`;
            g.fillRect(ZX(ms), y, ZX(2) - ZX(0) + 0.5, 70);
        }
        label(g, 'fog (model)', ZX(70), y + 46, { size: 32, weight: 700, color: P.dark, align: 'center', family: BODY });
        const grow = E.out(seg(t, tAt, tQuarter));
        rr(g, ZX(0), y + 86, (ZX(GAP_MS) - ZX(0)) * grow, 40, 10);
        g.fillStyle = P.cyan;
        g.fill();
        g.strokeStyle = P.ink3;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(ZX(0), y + 140);
        g.lineTo(ZX(Z.msMax), y + 140);
        g.stroke();
        for (const [ms, nm] of [[58.6, '32nd'], [117.2, '16th'], [234.4, '8th']]) {
            g.beginPath();
            g.moveTo(ZX(ms), y + 132);
            g.lineTo(ZX(ms), y + 150);
            g.stroke();
            label(g, nm, ZX(ms), y + 188, { size: 32, weight: nm === '8th' ? 800 : 600, color: nm === '8th' ? P.cyan : P.ink2, align: 'center', family: BODY });
        }
        label(g, `${fmt(GAP_MS)} ms`, ZX(GAP_MS) + 18, y + 118, { size: 40, weight: 800, color: P.cyan, alpha: grow });
        label(g, 'fog gone by 200 ms', ZX(200), y - 18, { size: 32, weight: 600, color: P.ink2, align: 'center', family: BODY });
        g.restore();
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
    if (t < SC.end - 0.15) return;
    const a = E.out(seg(t, SC.end - 0.1, SC.end + 0.2));
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
    if (SHOT) {
        // The lesson's Listen demo, already in view; Play is tapped on "play".
        const tTap = wto('cta', 'play', 0.45) + 0.05;
        const playing = t > tTap + 0.12;
        const frames = Object.keys(SHOT).filter((k) => k.startsWith('play')).sort();
        const img = playing && frames.length ? SHOT[frames[Math.floor((t - tTap) / 0.35) % frames.length]] : SHOT.idle;
        const s = sw / img.width;
        // First the page scrolls from its top down to the demo, then the demo itself.
        const tS0 = SC.end + 0.35;
        const tS1 = wto('cta', 'demo', 0.35);
        if (SHOT.page && t < tS1) {
            const ps = sw / SHOT.page.width;
            const y = E.inOut(seg(t, tS0, tS1)) * LESSON.scrollTo * 2 * ps;
            g.drawImage(SHOT.page, x0 + 14, PH.top + 14 - y, sw, SHOT.page.height * ps);
        } else {
            // After the tap, the screen eases in on the demo player.
            const z = 1 + 0.3 * E.inOut(seg(t, tTap + 0.2, tTap + 1.2));
            const [bx, by, bw, bh] = LESSON.play;
            const fx = x0 + 14 + (bx + bw / 2) * 2 * s;
            const fy = PH.top + 14 + (by + bh) * 2 * s;
            g.save();
            g.translate(fx, fy);
            g.scale(z, z);
            g.translate(-fx, -fy);
            g.drawImage(img, x0 + 14, PH.top + 14, sw, img.height * s);
            g.restore();
        }
        const tap = seg(t, tTap, tTap + 0.55);
        if (tap > 0 && tap < 1) {
            const [bx, by, bw, bh] = LESSON.play;
            const cx = x0 + 14 + (bx + bw / 2) * 2 * s;
            const cy = PH.top + 14 + (by + bh / 2) * 2 * s;
            g.fillStyle = `rgba(255,255,255,${0.55 * (1 - tap)})`;
            g.beginPath();
            g.arc(cx, cy, 20 + 54 * E.out(tap), 0, Math.PI * 2);
            g.fill();
        }
    }
    g.restore();
    g.restore();
    // The address, up for the whole call to action.
    const k = popIn(t, voBy.cta.at + 0.1, 0.35);
    if (k > 0) {
        const pulse = t < BUTTON ? 0.035 * Math.exp(-((t % BEAT) / 0.12)) : 0;
        pill(g, TL.lesson.url, 540, 1092, { size: 56, bg: P.cyan, fg: P.dark, scale: lerp(0.85, 1, E.outBack(k)) * (1 + 0.04 * btn + pulse), alpha: clamp(k * 3), weight: 800 });
        // The lesson's title on two lines, clear of the right-hand rail.
        const words = `Lesson: ${TL.lesson.title}`.split(' ');
        const cut = Math.ceil(words.length / 2);
        label(g, words.slice(0, cut).join(' '), 540, 1166, { size: 34, weight: 600, color: P.ink2, align: 'center', alpha: clamp(k * 3) });
        label(g, words.slice(cut).join(' '), 540, 1208, { size: 34, weight: 600, color: P.ink2, align: 'center', alpha: clamp(k * 3) });
        label(g, 'Which gap do you use? Comment below.', 540, 1270, { size: 38, weight: 700, color: P.ink, align: 'center', alpha: popIn(t, wto('cta', 'free', 0.6), 0.3) });
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
        const m = Math.max(width(l1), width(l2));
        if (width(l1) <= maxW && width(l2) <= maxW && (!best || m < best.m)) best = { m, lines: [l1, l2] };
    }
    return best ? best.lines : null;
}

const SUB = { size: 54, maxW: 780, maxWords: 11, x: 510, y: 1388, lh: 70 };
// A page never ends on these, and prefers to start on the second set.
const WEAK = new Set(['a', 'an', 'the', 'of', 'for', 'to', 'up', 'in', 'on', 'with', 'and', 'but', 'that', 'your', 'at', 'is', 'it', 'has', 'than', 'less']);
const LEAD = new Set(['right', 'after', 'before', 'for', 'with', 'and', 'but', 'is', 'in', 'of']);
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
    }
    if (cur.length) pages.push(cur);
    for (let i = pages.length - 1; i > 0; i--) {
        if (count(pages[i]) <= 2) {
            const merged = [...pages[i - 1], ...pages[i]];
            if (twoLines(merged, SUB.maxW, space) && count(merged) <= SUB.maxWords + 2) pages.splice(i - 1, 2, merged);
        }
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
        const d = DEMOS.find((q) => t >= q.at && t < q.to);
        if (d) {
            const a = clamp((t - d.at) / 0.15) * (1 - clamp((t - d.to + 0.15) / 0.15));
            g.save();
            g.globalAlpha = a;
            speaker(g, 420, 1394, 1.1, 0.5 + 0.5 * Math.sin(t * 18));
            label(g, 'Listen', 470, 1412, { size: 54, weight: 700, color: P.cyan });
            g.restore();
        }
        return;
    }
    const fadeIn = clamp((t - v.at + 0.12) / 0.12);
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
            g.globalAlpha = fadeIn * fadeOut * lerp(0.62, 1, on);
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
    // The last half second hands off to frame one: the end card goes, then frame one comes.
    const out = seg(t, TL.duration - 0.6, TL.duration - 0.32);
    const loop = seg(t, TL.duration - 0.3, TL.duration - 0.02);
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
    const tc = demoBy.B.to - 0.02;
    drawAB(tc, false, true);
    label(g, 'Same drop.', 540, 370, { size: 132, weight: 800, color: P.ink, align: 'center', base: 'middle' });
    label(g, 'Which one hits harder?', 540, 500, { size: 78, weight: 800, color: P.ink, align: 'center', base: 'middle' });
    label(g, '1 or 2?', 540, 1420, { size: 120, weight: 800, color: P.ink, align: 'center', base: 'middle' });
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
    { id: 'notch', t: vEnd('hook') - 0.1, box: { x: 30, y: 560, width: 960, height: 760 } },
    { id: 'fog', t: inScene('fog', vEnd('fog') + 0.05), box: { x: 20, y: 440, width: 960, height: 880 } },
    { id: 'fresh', t: inScene('fresh', vEnd('fresh') - 0.05), box: { x: 20, y: 440, width: 960, height: 880 } },
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
