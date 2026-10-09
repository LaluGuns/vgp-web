// Film 5 picture: scenes drawn on one 1080 x 1920 canvas, a pure function of
// time. window.seek(t) draws the frame at t seconds. Reads TIMELINE and DATA
// (the A/B's levels, limiter gain and the two hearing models, computed with
// the sound) and the drawing kit in art.js.
//
// Colour has one meaning for the whole film: amber is the kick and its
// click, cyan is data (levels, the limiter, the ruler), the riser and its fog
// are violet-grey, everything else is neutral.
/* global TIMELINE, DATA, DP_URL, LESSON, W, H, P, clamp, lerp, seg, E, bump, font, label, rr, pill, shadow, ground, panel, PANEL, fader, faderCapY, robotDome, gloveDown, tube, speaker, DISPLAY, BODY */

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
const BEAT = TL.beat;
const demoBy = Object.fromEntries(TL.demos.map((d) => [d.id, { ...d, to: d.at + (d.pre + d.post) * BEAT, down: d.at + d.pre * BEAT }]));
const DEMOS = Object.values(demoBy);
const BUTTON = TL.button;
const SCENES = TL.scenes.map((s) => ({ ...s, start: s.from ? wt(s.from[0], s.from[1]) + (s.dt ?? 0) : s.at }));
const SC = Object.fromEntries(SCENES.map((s) => [s.id, s.start]));
const sceneEnd = (id) => {
    const i = SCENES.findIndex((s) => s.id === id);
    return i + 1 < SCENES.length ? SCENES[i + 1].start : TL.duration;
};
const popIn = (t, t0, d = 0.3) => clamp((t - t0) / d);
/** Visible between a scene's start and end, with short dissolves either side. */
const sceneAlpha = (t, id, inD = 0.25, outD = 0.25) => E.out(seg(t, SC[id], SC[id] + inD)) * (1 - seg(t, sceneEnd(id) - 0.02, sceneEnd(id) + outD));

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
function headline(t, t0, parts, y, { size = 84, alpha = 1, stagger = 0.12, center = 540 } = {}) {
    if (alpha <= 0) return;
    font(g, size, 800);
    const space = g.measureText(' ').width;
    const widths = parts.map(([s]) => g.measureText(s).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (parts.length - 1);
    let x = center - total / 2;
    parts.forEach(([s, c], i) => {
        const k = E.outBack(clamp((t - t0 - i * stagger) / 0.28));
        const a = clamp((t - t0 - i * stagger) / 0.12);
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
        label(gc, ms === 0 ? 'drop' : `${ms > 0 ? '+' : '−'}${Math.abs(ms)} ms`, X(ms), y + 52, { size: 32, weight: 600, color: ms === 0 ? P.amber : P.ink2, align: 'center', family: BODY });
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
const AB = { x0: 170, x1: 930, lanes: [{ y: 760, h: 250 }, { y: 1110, h: 250 }] };
/** Expanding rings on the first kick, sized from its measured level as heard. */
function impact(gc, x, y, t0, t, v) {
    const age = t - t0;
    if (age < 0 || age > 0.7) return;
    const kick = v === 1 ? D.r1.kickDb : D.r2.kickDb;
    const r = 140 * 10 ** ((kick - D.r2.kickDb) / 20);
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

function abProgress(d, t) {
    // ms relative to the downbeat that the demo has reached.
    return (t - d.down) * 1000;
}

function drawAB(t, frame1 = false, noHead = false) {
    const replay = t >= SC.replay - 0.05;
    const id = replay ? 'replay' : t < SC.notch ? 'ab' : 'notch';
    const a = frame1 ? 1 : replay ? sceneAlpha(t, 'replay') : 1 - seg(t, SC.fog - 0.02, SC.fog + 0.25);
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    const [dA, dB] = replay ? [demoBy.A2, demoBy.B2] : [demoBy.A, demoBy.B];
    const msA = -dA.pre * BEAT * 1000;
    const msB = dA.post * BEAT * 1000;
    // Headline.
    if (noHead) {
        // Cover: the headline is drawn by drawCover.
    } else if (replay) headline(t, SC.replay + 0.05, [['Now'], ['listen'], ['again']], 330, { size: 96 });
    else {
        const s0 = frame1 ? 1 : lerp(1.18, 1, E.outBack(seg(t, 0, 0.25)));
        g.save();
        g.translate(540, 330);
        g.scale(s0, s0);
        label(g, 'Same drop.', 0, 0, { size: 104, weight: 800, color: P.ink, align: 'center', base: 'middle' });
        g.restore();
        label(g, 'Which one hits harder?', 540, 450, { size: 66, weight: 800, color: P.ink, align: 'center', base: 'middle' });
    }
    // Notch zoom on lane 2 during the hook line.
    const zIn = id === 'notch' ? E.inOut(seg(t, wt('hook', 'hole') - 0.1, wt('hook', 'hole') + 0.5)) : 0;
    const lanes = [
        { d: dA, v: 1, lane: AB.lanes[0] },
        { d: dB, v: 2, lane: AB.lanes[1] },
    ];
    for (const L of lanes) {
        const { d, v, lane } = L;
        const box = { x0: AB.x0, x1: AB.x1, y: lane.y, h: lane.h };
        const playing = !frame1 && t >= d.at && t < d.to + 0.05;
        // Lane frame.
        rr(g, box.x0 - 24, lane.y - lane.h / 2 - 20, box.x1 - box.x0 + 48, lane.h + 40, 22);
        g.fillStyle = playing ? 'rgba(125,211,252,0.07)' : 'rgba(255,255,255,0.035)';
        g.fill();
        g.strokeStyle = playing ? 'rgba(125,211,252,0.55)' : 'rgba(255,255,255,0.08)';
        g.lineWidth = 3;
        g.stroke();
        // Badge to the left.
        const ring = v === 2 && id === 'notch' ? E.out(seg(t, wt('hook', 'two') - 0.05, wt('hook', 'two') + 0.4)) : 0;
        const dim = id === 'notch' && v === 1 ? 0.45 : 1;
        badgeNum(g, v, 92, lane.y, 46, { ring, alpha: dim, fill: v === 2 && id === 'notch' ? P.ink : P.ink });
        // Zoomed window for lane 2 in the notch scene.
        let a0 = msA;
        let b0 = msB;
        if (v === 2 && zIn > 0) {
            a0 = lerp(msA, -GAP_MS - 220, zIn);
            b0 = lerp(msB, 160, zIn);
        }
        const upto = frame1 ? -1e9 : t >= d.to ? 1e9 : abProgress(d, t);
        if (upto > a0) wave(g, v, box, a0, b0, upto, { alpha: dim });
        // Downbeat line.
        const X = (ms) => box.x0 + ((box.x1 - box.x0) * (ms - a0)) / (b0 - a0);
        dashed(g, X(0), lane.y - lane.h / 2 - 6, X(0), lane.y + lane.h / 2 + 6, P.ink3, 3, [8, 8]);
        // Playhead.
        if (playing && upto < msB) {
            g.fillStyle = P.ink;
            g.fillRect(X(upto) - 2, lane.y - lane.h / 2 - 6, 4, lane.h + 12);
        }
        if (playing) speaker(g, box.x1 - 30, lane.y - lane.h / 2 - 54, 0.75, 0.5 + 0.5 * Math.sin(t * 20));
        impact(g, X(0), lane.y, d.down, t, v);
        // The notch, labelled.
        if (v === 2 && zIn > 0) {
            const k = popIn(t, wt('hook', 'quarter') - 0.1, 0.3);
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
            tag(g, 'less than ¼ second', (xa + xb) / 2, yb - 70, null, { a: k, bg: P.cyan, fg: P.dark, size: 38 });
            label(g, `${fmt(GAP_MS)} ms of silence`, (xa + xb) / 2, lane.y + lane.h / 2 + 64, { size: 34, weight: 600, color: P.cyan, align: 'center', alpha: k, family: BODY });
        }
    }
    // "Which one?" verdict ring labels after the hook, before the voice.
    g.restore();
}

// ══ Fog: forward masking (model) after the riser ══
const FG = { x0: 140, x1: 940, msA: -450, msB: 520, rows: [{ y: 640, h: 230 }, { y: 990, h: 230 }], axisY: 1160 };
function fogRow(t, v, row, { reach, alpha, clickOn, fogOn }) {
    const X = (ms) => FG.x0 + ((FG.x1 - FG.x0) * (ms - FG.msA)) / (FG.msB - FG.msA);
    const top = row.y - row.h / 2;
    const base = row.y + row.h / 2;
    g.save();
    g.globalAlpha *= alpha;
    rr(g, FG.x0 - 24, top - 20, FG.x1 - FG.x0 + 48, row.h + 40, 22);
    g.fillStyle = 'rgba(255,255,255,0.035)';
    g.fill();
    badgeNum(g, v, 70, row.y, 34);
    // Riser level (the build, then its tail), as a filled level line from the baseline.
    const col = 4;
    for (let x = 0; x < FG.x1 - FG.x0; x += col) {
        const ms = FG.msA + ((FG.msB - FG.msA) * x) / (FG.x1 - FG.x0);
        if (ms > reach) break;
        const m = Math.min(1, maxIn(V[v].masker, ms, ms + 6) / PEAK_MAX);
        const h = (row.h - 20) * m;
        g.fillStyle = RISER;
        g.fillRect(FG.x0 + x, base - h, col - 1, h);
    }
    // Fog: a translucent layer whose density is the model's value at each ms.
    if (fogOn > 0) {
        for (let x = 0; x < FG.x1 - FG.x0; x += col) {
            const ms = FG.msA + ((FG.msB - FG.msA) * x) / (FG.x1 - FG.x0);
            if (ms > reach) break;
            const f = val(V[v].fog, ms);
            if (f <= 0.005) continue;
            // The haze thins towards the top so the level under it stays readable.
            const gr = g.createLinearGradient(0, top, 0, base);
            gr.addColorStop(0, `rgba(${FOG_RGB},${0.25 * f * fogOn})`);
            gr.addColorStop(1, `rgba(${FOG_RGB},${0.8 * f * fogOn})`);
            g.fillStyle = gr;
            g.fillRect(FG.x0 + x, top, col, row.h);
        }
    }
    // The kick's click: an amber spike at the drop, dimmed by the fog over it.
    if (clickOn > 0 && reach >= 0) {
        const f = val(V[v].fog, 0) * fogOn;
        const k = Math.min(1, maxIn(V[v].kick, 0, 25) / PEAK_MAX);
        const hk = (row.h - 20) * k;
        g.save();
        g.globalAlpha *= clickOn * (1 - 0.65 * f);
        g.fillStyle = P.amber;
        g.fillRect(X(0) - 6, base - hk, 12, hk);
        g.restore();
    }
    dashed(g, X(0), top - 6, X(0), base + 6, P.ink3, 3, [8, 8]);
    g.restore();
    return X;
}
function drawFog(t) {
    const a = sceneAlpha(t, 'fog');
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    headline(t, SC.fog + 0.1, [['A'], ['riser'], ['leaves'], ['a'], ['fog', FOG]], 300, { size: 80 });
    label(g, 'Forward masking (model, Moore 2012)', 540, 400, { size: 34, weight: 600, color: P.ink2, align: 'center', family: BODY });
    // Row 2 (the gap) shows the fog lifting after the riser stops, with the
    // first sentence; row 1 shows the click inside it, from "In number one".
    const s2 = keys(t, [[wt('fog', 'loud'), FG.msA], [wt('fog', 'stops') + 0.2, FG.msB]]);
    const X = fogRow(t, 2, FG.rows[1], { reach: s2, alpha: 1, clickOn: 1, fogOn: popIn(t, wt('fog', 'dulls'), 0.4) });
    const t1 = wt('fog', 'in') - 0.1;
    const r1 = popIn(t, t1, 0.3);
    if (r1 > 0) {
        const s1 = keys(t, [[t1, FG.msA], [wt('fog', 'click'), FG.msB]]);
        fogRow(t, 1, FG.rows[0], { reach: s1, alpha: r1, clickOn: 1, fogOn: 1 });
    }
    msAxis(g, FG.x0, FG.x1, FG.msA, FG.msB, FG.axisY, [-400, -200, 0, 200, 400]);
    // "Up to a fifth of a second": row 2's fog after its riser stops, bracketed.
    const kB = popIn(t, wt('fog', 'fifth') - 0.05, 0.3);
    if (kB > 0) {
        const r = FG.rows[1];
        const yb = r.y - r.h / 2 - 34;
        const xa = X(-GAP_MS);
        const xb = X(-GAP_MS + 200);
        g.save();
        g.globalAlpha *= kB;
        g.strokeStyle = FOG;
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(xa, yb + 14);
        g.lineTo(xa, yb);
        g.lineTo(xb, yb);
        g.lineTo(xb, yb + 14);
        g.stroke();
        g.restore();
        label(g, 'fog lifts within 200 ms', (xa + xb) / 2, yb - 20, { size: 32, weight: 700, color: FOG, align: 'center', alpha: kB, family: BODY });
    }
    // Tags on the clicks, in the lane above each row.
    const k1 = popIn(t, wt('fog', 'inside') - 0.05, 0.3);
    tag(g, 'click inside the fog', X(0) + 200, FG.rows[0].y - FG.rows[0].h / 2 - 50, { x: X(0) + 6, y: FG.rows[0].y - 20 }, { a: k1, bg: P.dark, fg: P.amber, ring: P.amber, size: 34 });
    tag(g, 'click in the clear', X(0) + 250, FG.rows[1].y - FG.rows[1].h / 2 - 36, { x: X(0) + 6, y: FG.rows[1].y - 10 }, { a: popIn(t, wt('fog', 'fog') + 0.3, 0.3), bg: P.dark, fg: P.amber, ring: P.amber, size: 34 });
    g.restore();
}

// ══ Fresh: the ear's response after silence (adaptation, model) ══
const FR = { x0: 300, x1: 950, msA: -450, msB: 300, rows: [{ y: 770, h: 220 }, { y: 1080, h: 220 }] };
function earIcon(gc, x, y, s, sens) {
    gc.save();
    gc.translate(x, y);
    gc.scale(s, s);
    // Outer ear.
    gc.fillStyle = '#e8c8a8';
    gc.beginPath();
    gc.moveTo(10, -90);
    gc.bezierCurveTo(80, -100, 95, -10, 50, 30);
    gc.bezierCurveTo(30, 50, 40, 90, 0, 95);
    gc.bezierCurveTo(-40, 98, -45, 60, -30, 40);
    gc.bezierCurveTo(-60, 10, -60, -80, 10, -90);
    gc.fill();
    gc.strokeStyle = '#b98f6c';
    gc.lineWidth = 9;
    gc.lineCap = 'round';
    gc.beginPath();
    gc.moveTo(-10, -50);
    gc.bezierCurveTo(30, -70, 55, -20, 25, 10);
    gc.bezierCurveTo(10, 25, 15, 45, 0, 55);
    gc.stroke();
    gc.restore();
    // Sensitivity meter beside it.
    const mx = x + 110 * s;
    const top = y - 95 * s;
    const bot = y + 95 * s;
    rr(gc, mx - 16, top, 32, bot - top, 12);
    gc.fillStyle = P.dark;
    gc.fill();
    const h = (bot - top - 8) * clamp(sens);
    rr(gc, mx - 12, bot - 4 - h, 24, h, 9);
    gc.fillStyle = P.cyan;
    gc.fill();
}
function drawFresh(t) {
    const a = sceneAlpha(t, 'fresh');
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    headline(t, SC.fresh + 0.1, [['Silence'], ['resets'], ['your'], ['ears']], 300, { size: 84 });
    label(g, 'Nerve response (model, Moore 2012)', 540, 400, { size: 34, weight: 600, color: P.ink2, align: 'center', family: BODY });
    const sweep = keys(t, [[SC.fresh + 0.3, FR.msA], [wt('fresh', 'full') + 0.15, FR.msB]]);
    const X = (ms) => FR.x0 + ((FR.x1 - FR.x0) * (ms - FR.msA)) / (FR.msB - FR.msA);
    const RMAX = Math.max(...V[2].rate) / 0.92;
    FR.rows.forEach((row, i) => {
        const v = i + 1;
        const top = row.y - row.h / 2;
        const base = row.y + row.h / 2;
        rr(g, FR.x0 - 24, top - 20, FR.x1 - FR.x0 + 48, row.h + 40, 22);
        g.fillStyle = 'rgba(255,255,255,0.035)';
        g.fill();
        badgeNum(g, v, 248, top + 10, 30);
        // Ear and its sensitivity at the sweep.
        earIcon(g, 110, row.y, 0.95, val(V[v].sens, Math.min(sweep, 0)));
        label(g, 'sensitivity', 110 + 104, base + 54, { size: 30, weight: 600, color: P.cyan, align: 'center', family: BODY });
        // Firing rate trace.
        g.save();
        g.beginPath();
        let first = true;
        for (let ms = FR.msA; ms <= Math.min(sweep, FR.msB); ms += 2) {
            const y = base - (row.h - 16) * clamp(val(V[v].rate, ms) / RMAX);
            if (first) g.moveTo(X(ms), y);
            else g.lineTo(X(ms), y);
            first = false;
        }
        g.strokeStyle = P.cyan;
        g.lineWidth = 5;
        g.lineJoin = 'round';
        g.stroke();
        g.restore();
        // The kick's onset burst, in amber.
        if (sweep > 0) {
            let pk = 0;
            for (let ms = 0; ms < 30; ms++) pk = Math.max(pk, val(V[v].rate, ms));
            const y = base - (row.h - 16) * clamp(pk / RMAX);
            g.fillStyle = P.amber;
            g.beginPath();
            g.arc(X(8), y, 12, 0, Math.PI * 2);
            g.fill();
            const k = popIn(t, wt('fresh', 'full') - 0.05, 0.3);
            label(g, v === 2 ? 'full response' : 'small response', X(8) + 30, y + 12, { size: 34, weight: 700, color: P.amber, alpha: k });
        }
        dashed(g, X(0), top - 6, X(0), base + 6, P.ink3, 3, [8, 8]);
    });
    msAxis(g, FR.x0, FR.x1, FR.msA, FR.msB, 1250, [-400, -200, 0, 200]);
    g.restore();
}

// ══ Hand: the limiter is a hand on a fader ══
const HD = { faders: [{ x: 330, v: 1 }, { x: 750, v: 2 }], top: 640, bottom: 1130, shelf: 530, msA: -700, msB: 260 };
const FADER_MAX = 8;
function drawHand(t) {
    const a = sceneAlpha(t, 'hand');
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    headline(t, SC.hand + 0.1, [['The'], ['limiter'], ['is'], ['a'], ['hand']], 300, { size: 84 });
    const tHand = wt('hand', 'hand');
    const tRiser = wt('hand', 'riser');
    const tEnd = wt('hand', 'arrives') + 0.35;
    // Slowed down: -700 ms to +260 ms of each version, over the second half of the line.
    const ms = keys(t, [[tRiser, HD.msA], [tEnd, HD.msB]]);
    const slow = (tEnd - tRiser) / ((HD.msB - HD.msA) / 1000);
    const live = t > tRiser;
    label(g, live ? `Limiter gain, slowed down ${Math.round(slow)}×` : 'Limiter on the master bus', 540, 400, { size: 34, weight: 600, color: P.ink2, align: 'center', family: BODY });
    const appear = E.outBack(seg(t, tHand - 0.35, tHand + 0.05));
    const reach = E.inOut(seg(t, tHand, tHand + 0.55));
    const caps = [];
    for (const f of HD.faders) {
        const gr = live ? val(V[f.v].gr, ms) : 0;
        // Fader scale: 0 to 8 dB of gain reduction.
        rr(g, f.x - 11, HD.top, 22, HD.bottom - HD.top, 11);
        g.fillStyle = P.dark;
        g.fill();
        for (const d of [0, 2, 4, 6, 8]) {
            const ty = lerp(HD.top + 40, HD.bottom - 40, d / FADER_MAX);
            g.strokeStyle = P.ink4;
            g.lineWidth = 4;
            g.beginPath();
            g.moveTo(f.x + 92, ty);
            g.lineTo(f.x + 112, ty);
            g.stroke();
            label(g, d === 0 ? '0 dB' : `−${d}`, f.x + 122, ty + 11, { size: 30, weight: 500, color: P.ink3, family: BODY });
        }
        const cy = lerp(HD.top + 40, HD.bottom - 40, clamp(gr / FADER_MAX));
        shadow(g, f.x + 8, cy + 30, 110, 26, 0.7);
        rr(g, f.x - 80, cy - 38, 160, 76, 16);
        const cg = g.createLinearGradient(0, cy - 38, 0, cy + 38);
        cg.addColorStop(0, '#eef2f8');
        cg.addColorStop(1, P.steelLo);
        g.fillStyle = cg;
        g.fill();
        g.fillStyle = 'rgba(6,16,29,0.45)';
        for (const dy of [-14, 0, 14]) g.fillRect(f.x - 54, cy + dy - 2, 108, 4);
        caps.push({ x: f.x, y: cy, gr });
        badgeNum(g, f.v, f.x - 140, HD.top + 10, 34);
        // The kick arriving on the cap at the drop.
        if (live) {
            const kAge = (ms - 0) / 1000 * slow;
            if (ms > -140 && ms < 0) {
                const k = (ms + 140) / 140;
                g.fillStyle = P.amber;
                g.beginPath();
                g.arc(f.x, lerp(HD.top - 60, cy - 50, E.in(k)), 22, 0, Math.PI * 2);
                g.fill();
            }
            if (ms >= 0 && kAge < 0.9) {
                g.save();
                g.strokeStyle = `rgba(251,191,36,${0.9 * (1 - kAge / 0.9)})`;
                g.lineWidth = 7;
                g.beginPath();
                g.arc(f.x, cy, 60 + 110 * E.out(kAge / 0.9), 0, Math.PI * 2);
                g.stroke();
                g.restore();
            }
        }
    }
    // The robot on its shelf, one glove on each fader.
    if (appear > 0) {
        g.save();
        g.globalAlpha *= clamp(appear * 1.5);
        const cx = 540;
        for (const c of caps) {
            const capTop = c.y - 38;
            const wrist = { x: c.x, y: lerp(HD.shelf + 20, capTop - 62, reach) };
            const sh = { x: cx + (c.x < cx ? -60 : 60), y: HD.shelf - 40 };
            const mid = { x: lerp(sh.x, wrist.x, 0.5), y: Math.min(sh.y, wrist.y) - 30 };
            tube(g, sh, mid, 0.9);
            tube(g, mid, wrist, 0.7);
            gloveDown(g, wrist.x, wrist.y, 1.05, reach > 0.9 ? Math.max(0.6, clamp(c.gr / 2)) : 0, capTop, 0);
        }
        robotDome(g, { x: cx, y: HD.shelf }, { s: 0.8, look: { x: caps[0].x, y: caps[0].y } });
        g.restore();
    }
    label(g, 'limiter', 540, HD.bottom + 70, { size: 40, weight: 700, color: P.ink2, align: 'center' });
    // Readouts: measured gain reduction on the first kick.
    const kR = popIn(t, wt('hand', 'arrives'), 0.3);
    if (kR > 0) {
        for (const f of HD.faders) {
            const gr = f.v === 1 ? D.r1.gr : D.r2.gr;
            pill(g, `−${fmt(gr)} dB on the kick`, f.x, HD.bottom + 150, { size: 36, bg: P.cyan, fg: P.dark, alpha: kR, scale: E.outBack(kR), weight: 800 });
        }
    }
    g.restore();
}

// ══ Brain: one thing to predict ══
const BR = { x0: 130, x1: 900, dots: 1000, wave: 860 };
function drawBrain(t) {
    const a = sceneAlpha(t, 'brain');
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    headline(t, SC.brain + 0.1, [['Predict'], ['the'], ['next'], ['beat']], 300, { size: 88 });
    label(g, 'Expectation (Huron 2006)', 540, 400, { size: 34, weight: 600, color: P.ink2, align: 'center', family: BODY });
    // Eight beats: the last bar and a half of the build, then the downbeat.
    const n = 8;
    const X = (i) => lerp(BR.x0, BR.x1, i / (n - 1));
    const tPred = wt('brain', 'predict');
    const tNext = wt('brain', 'next');
    const tLand = wt('brain', 'there');
    const tPay = wt('brain', 'payoff');
    // The build rises over beats 0 to 6.5, then stops for the gap.
    const fillTo = keys(t, [[SC.brain + 0.2, 0], [tPred - 0.2, 6.5]]);
    for (let i = 0; i < 6.5 * 24; i++) {
        const p = i / 24;
        if (p > fillTo) break;
        const h = 16 + 150 * (p / 6.5) ** 2;
        g.fillStyle = RISER;
        g.fillRect(X(p) - 3, BR.wave - h / 2, 5, h);
    }
    label(g, 'build', X(3), BR.wave - 120, { size: 32, weight: 700, color: FOG, align: 'center', alpha: popIn(t, SC.brain + 0.4), family: BODY });
    // Beat dots under it; the downbeat is a ring.
    for (let i = 0; i < n; i++) {
        g.beginPath();
        g.arc(X(i), BR.dots, i === n - 1 ? 20 : 11, 0, Math.PI * 2);
        if (i === n - 1) {
            g.strokeStyle = P.amber;
            g.lineWidth = 5;
            g.stroke();
        } else {
            g.fillStyle = P.ink3;
            g.fill();
        }
    }
    const ks = popIn(t, tPred - 0.3);
    if (ks > 0) {
        // The gap: an empty bracket between the build's end and the downbeat.
        const xa = X(6.5);
        const xb = X(7);
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
        label(g, 'silence', (xa + xb) / 2, BR.dots + 150, { size: 32, weight: 700, color: P.ink2, align: 'center', alpha: ks, family: BODY });
    }
    // Prediction arc: dotted, from the last beat of the build to the downbeat.
    const k = E.inOut(seg(t, tPred, tNext + 0.3));
    if (k > 0) {
        const x0 = X(6);
        const x1 = X(7);
        const y0 = BR.dots - 30;
        g.save();
        g.setLineDash([2, 18]);
        g.lineCap = 'round';
        g.strokeStyle = P.ink;
        g.lineWidth = 10;
        g.beginPath();
        const steps = 40;
        for (let i = 0; i <= steps * k; i++) {
            const u = i / steps;
            const x = lerp(x0, x1, u);
            const y = y0 - 300 * 4 * u * (1 - u);
            if (i === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
        }
        g.stroke();
        g.restore();
        tag(g, 'next beat', X(4.6), BR.dots - 360, { x: X(6.5), y: BR.dots - 330 }, { a: popIn(t, tNext), bg: P.ink, fg: P.dark, size: 36 });
    }
    // The kick lands exactly on it.
    const land = t - tLand;
    if (land > -0.25) {
        const x = X(7);
        const y = land < 0 ? lerp(BR.dots - 330, BR.dots, E.in(clamp((land + 0.25) / 0.25))) : BR.dots;
        g.fillStyle = P.amber;
        g.beginPath();
        g.arc(x, y, 28, 0, Math.PI * 2);
        g.fill();
        if (land >= 0) {
            for (let i = 0; i < 3; i++) {
                const ag = land - i * 0.12;
                if (ag < 0 || ag > 0.8) continue;
                g.strokeStyle = `rgba(251,191,36,${0.85 * (1 - ag / 0.8)})`;
                g.lineWidth = 7;
                g.beginPath();
                g.arc(x, BR.dots, 36 + 76 * E.out(ag / 0.8), 0, Math.PI * 2);
                g.stroke();
            }
        }
    }
    const kp = popIn(t, tPay - 0.05, 0.3);
    if (kp > 0) pill(g, 'the arrival is the payoff', 540, BR.dots + 250, { size: 42, bg: P.amber, fg: P.dark, alpha: kp, scale: E.outBack(kp), weight: 800 });
    g.restore();
}

// ══ How: the gap at 128 BPM ══
const HW = { x0: 150, x1: 930, msMax: 500, rulerY: 640 };
function drawHow(t) {
    const a = sceneAlpha(t, 'how');
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    headline(t, SC.how + 0.1, [['Cut'], ['an'], ['8th'], ['early']], 300, { size: 92 });
    label(g, `At ${TL.bpm} BPM`, 540, 400, { size: 40, weight: 700, color: P.cyan, align: 'center' });
    const X = (ms) => lerp(HW.x0, HW.x1, ms / HW.msMax);
    // Ruler.
    g.strokeStyle = P.ink3;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(X(0), HW.rulerY);
    g.lineTo(X(HW.msMax), HW.rulerY);
    g.stroke();
    for (const ms of [0, 100, 200, 300, 400, 500]) {
        g.beginPath();
        g.moveTo(X(ms), HW.rulerY);
        g.lineTo(X(ms), HW.rulerY - 16);
        g.stroke();
        label(g, `${ms}`, X(ms), HW.rulerY - 30, { size: 30, weight: 600, color: P.ink2, align: 'center', family: BODY });
    }
    label(g, 'ms of silence after the cut', X(HW.msMax), HW.rulerY + 52, { size: 30, weight: 600, color: P.ink2, align: 'right', family: BODY });
    // Fog fading over 200 ms after the riser stops (model).
    const kf = popIn(t, SC.how + 0.4, 0.4);
    const fogTop = HW.rulerY + 80;
    const fogBot = HW.rulerY + 470;
    for (let ms = 0; ms < 200; ms += 2) {
        const w = 1 - Math.log10(1 + ms / 10) / Math.log10(21);
        g.fillStyle = `rgba(${FOG_RGB},${0.6 * w * kf})`;
        g.fillRect(X(ms), fogTop, X(2) - X(0) + 0.5, fogBot - fogTop);
    }
    label(g, 'fog (model)', X(100), fogBot + 46, { size: 32, weight: 700, color: FOG, align: 'center', alpha: kf, family: BODY });
    // Gap blocks: 32nd, 16th, 8th.
    const blocks = [
        { ms: 58.6, name: '32nd', at: wt('how', 'cut') },
        { ms: 117.2, name: '16th', at: wt('how', 'everything') },
        { ms: 234.4, name: '8th', at: wt('how', 'eighth') - 0.1 },
    ];
    blocks.forEach((b, i) => {
        const k = E.out(popIn(t, b.at, 0.35));
        if (k <= 0) return;
        const y = fogTop + 40 + i * 120;
        const w = (X(b.ms) - X(0)) * k;
        rr(g, X(0), y, w, 70, 10);
        g.fillStyle = i === 2 ? P.cyan : 'rgba(125,211,252,0.35)';
        g.fill();
        label(g, `${b.name} · ${b.ms.toFixed(1)} ms`, X(b.ms) + 64, y + 48, { size: 34, weight: 700, color: i === 2 ? P.cyan : P.ink2, alpha: k });
        // The drop lands at the end of the gap.
        if (k > 0.95) {
            g.fillStyle = P.amber;
            g.beginPath();
            g.arc(X(b.ms) + 30, y + 35, 16, 0, Math.PI * 2);
            g.fill();
        }
    });
    const kc = popIn(t, wt('how', 'early') - 0.05, 0.3);
    if (kc > 0) pill(g, 'clears the fog', X(234.4) + 150, fogTop + 40 + 2 * 120 + 130, { size: 36, bg: P.cyan, fg: P.dark, alpha: kc, scale: E.outBack(kc), weight: 800 });
    // Mute automation on the reverb return.
    const kr = popIn(t, wt('how', 'reverb') - 0.1, 0.3);
    if (kr > 0) {
        const y0 = 1240;
        g.save();
        g.globalAlpha *= kr;
        rr(g, HW.x0 - 20, y0 - 60, HW.x1 - HW.x0 + 40, 150, 18);
        g.fillStyle = 'rgba(255,255,255,0.05)';
        g.fill();
        label(g, 'Reverb return', HW.x0, y0 - 18, { size: 32, weight: 700, color: P.ink2, family: BODY });
        // Automation: up, then muted for the last 234 ms before the drop (ruler reads backwards from the drop on the left).
        const draw = E.inOut(seg(t, wt('how', 'tails') - 0.1, wt('how', 'tails') + 0.4));
        g.strokeStyle = P.cyan;
        g.lineWidth = 6;
        g.beginPath();
        const yUp = y0 + 20;
        const yDn = y0 + 70;
        g.moveTo(X(HW.msMax), yUp);
        g.lineTo(X(234.4), yUp);
        if (draw > 0) {
            g.lineTo(X(234.4) - 8, lerp(yUp, yDn, draw));
            g.lineTo(X(0), lerp(yUp, yDn, draw));
        }
        g.stroke();
        label(g, 'mute', X(117), y0 + 60 - 4, { size: 30, weight: 700, color: P.cyan, align: 'center', alpha: draw, family: BODY });
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
const PH = { x: 540, top: 290, w: 520, h: 840 };
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
    g.translate(0, (1 - lift) * 100);
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
        const tTap = wt('cta', 'play') + 0.05;
        const playing = t > tTap + 0.12;
        const frames = Object.keys(SHOT).filter((k) => k.startsWith('play')).sort();
        const img = playing && frames.length ? SHOT[frames[Math.floor((t - tTap) / 0.35) % frames.length]] : SHOT.idle;
        const s = sw / img.width;
        g.drawImage(img, x0 + 14, PH.top + 14, sw, img.height * s);
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
        pill(g, TL.lesson.url, 540, 1196, { size: 56, bg: P.cyan, fg: P.dark, scale: lerp(0.85, 1, E.outBack(k)) * (1 + 0.04 * btn), alpha: clamp(k * 3), weight: 800 });
        label(g, `Lesson: ${TL.lesson.title}`, 540, 1290, { size: 34, weight: 600, color: P.ink2, align: 'center', alpha: clamp(k * 3) });
    }
    g.restore();
}

// ══ Words on screen: the narration, word by word, two lines at most ══
const KEYWORD = { click: P.amber, kick: P.amber, kicks: P.amber, riser: FOG, fog: FOG };
/** Split words (with widths) into at most two lines of near-equal width, or greedily if they need more. */
function wrapLines(words, maxW, space) {
    const width = (ws) => ws.reduce((p, w) => p + w.width, 0) + space * Math.max(0, ws.length - 1);
    if (width(words) <= maxW) return [words];
    let best = null;
    for (let i = 1; i < words.length; i++) {
        const l1 = words.slice(0, i);
        const l2 = words.slice(i);
        const m = Math.max(width(l1), width(l2));
        if (width(l1) <= maxW && width(l2) <= maxW && (!best || m < best.m)) best = { m, lines: [l1, l2] };
    }
    if (best) return best.lines;
    const lines = [[]];
    for (const w of words) {
        const cur = lines[lines.length - 1];
        if (cur.length && width([...cur, w]) > maxW) lines.push([w]);
        else cur.push(w);
    }
    return lines;
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
    const size = 54;
    font(g, size, 600);
    const space = g.measureText(' ').width;
    const maxW = 780;
    const words = v.words.map((w) => ({ ...w, width: g.measureText(w.w).width }));
    // Groups split at the cue's page breaks; each group becomes pages of two lines at most.
    const cuts = [0, ...(v.breaks ?? []), words.length];
    const pages = [];
    for (let i = 0; i + 1 < cuts.length; i++) {
        const lines = wrapLines(words.slice(cuts[i], cuts[i + 1]), maxW, space);
        for (let j = 0; j < lines.length; j += 2) pages.push(lines.slice(j, j + 2));
    }
    let pi = 0;
    pages.forEach((p, k) => {
        if (p[0][0].s - 0.05 <= t) pi = k;
    });
    const page = pages[pi];
    const lh = 70;
    const y0 = 1388 - ((page.length - 1) * lh) / 2;
    g.save();
    g.textBaseline = 'middle';
    page.forEach((line, li) => {
        const total = line.reduce((p, w) => p + w.width, 0) + space * (line.length - 1);
        let x = 510 - total / 2;
        for (const w of line) {
            const on = clamp((t - w.s + 0.03) / 0.09);
            const key = KEYWORD[norm(w.w)];
            g.fillStyle = on > 0 && key ? key : P.ink;
            g.globalAlpha = fadeIn * fadeOut * lerp(0.36, 1, on);
            g.textAlign = 'left';
            g.fillText(w.w, x, y0 + li * lh);
            x += w.width + space;
        }
    });
    g.restore();
}

function badge(t) {
    const a = 1 - seg(t, SC.end - 0.4, SC.end - 0.15);
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    avatar(g, 96, 206, 32);
    label(g, 'Virzy Guns', 142, 218, { size: 34, weight: 700, color: P.ink });
    g.restore();
}


/** The first frame's composition, for the loop hand-off. */
function frameOne(alpha) {
    if (alpha <= 0) return;
    g.save();
    g.globalAlpha = alpha;
    drawAB(0, true);
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
    // The last half second dissolves into frame one.
    const loop = seg(t, TL.duration - 0.5, TL.duration - 0.05);
    g.save();
    g.globalAlpha = 1;
    drawAB(t);
    drawFog(t);
    drawFresh(t);
    drawHand(t);
    drawBrain(t);
    drawHow(t);
    if (loop < 1) {
        g.save();
        g.globalAlpha = 1 - loop;
        drawEnd(t);
        g.restore();
    }
    g.restore();
    frameOne(loop);
    if (words && loop < 1) subtitles(t);
    badge(t);
}

/** Cover for the profile grid: the hook frame, the question over it. */
function drawCover() {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    ground(g, 0, 0.2);
    // Both versions drawn in full, the hook's last frame, under a large question
    // that sits inside the profile grid's 3:4 crop (y 240 to 1680).
    const tc = demoBy.B.to + 0.6;
    drawAB(tc, false, true);
    label(g, 'Same drop.', 540, 370, { size: 132, weight: 800, color: P.ink, align: 'center', base: 'middle' });
    label(g, 'Which one hits harder?', 540, 500, { size: 78, weight: 800, color: P.ink, align: 'center', base: 'middle' });
    badge(0);
}

window.seek = (t) => draw(t);
window.sceneTimes = () => SCENES.map((s) => ({ id: s.id, start: s.start }));
// Full-size crops of every plot, at the moment each is most complete.
window.plotCrops = () => [
    { id: 'ab', t: demoBy.B.to + 0.1, box: { x: 30, y: 590, width: 960, height: 700 } },
    { id: 'notch', t: vEnd('hook') - 0.1, box: { x: 30, y: 590, width: 960, height: 760 } },
    { id: 'fog', t: vEnd('fog') + 0.15, box: { x: 30, y: 440, width: 960, height: 850 } },
    { id: 'fresh', t: vEnd('fresh') + 0.1, box: { x: 20, y: 600, width: 980, height: 700 } },
    { id: 'hand', t: vEnd('hand') + 0.1, box: { x: 120, y: 440, width: 860, height: 900 } },
    { id: 'brain', t: vEnd('brain') + 0.1, box: { x: 80, y: 500, width: 900, height: 800 } },
    { id: 'how', t: vEnd('how') + 0.1, box: { x: 80, y: 560, width: 920, height: 780 } },
    { id: 'replay', t: demoBy.B2.to + 0.05, box: { x: 30, y: 590, width: 960, height: 700 } },
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
