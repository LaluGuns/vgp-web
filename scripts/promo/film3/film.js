// Film 3 picture: scenes drawn on one 1080 x 1920 canvas, a pure function
// of time. window.seek(t) draws the frame at t seconds. Reads TIMELINE,
// SETTINGS and DATA (levels and gain reduction computed with the sound) and
// the drawing kit in art.js.
/* global TIMELINE, SETTINGS, DATA, DP_URL, LESSON, W, H, P, clamp, lerp, seg, E, bump, lvl, rand, font, label, rr, pill, shadow, ground, snareDrum, knob, compressorBox, cable, fader, faderCapY, robot, meter, stopwatch, speaker, DISPLAY, BODY */

const TL = TIMELINE;
const D = DATA;
const cv = document.getElementById('film');
cv.width = W;
cv.height = H;
const g = cv.getContext('2d');

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
const demoBy = Object.fromEntries(D.demos.map((d) => [d.id, d]));
const HITS = [...D.hits].sort((a, b) => a.t - b.t);
const SNARES = HITS.filter((h) => h.voice === 'snare').map((h) => h.t);
const undb = (d) => 10 ** (d / 20);
const msLabel = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`);

// ── Shared pieces ──

/** Stick angle: wind up, strike on each snare hit, rebound. */
function stickAt(t) {
    const REST = -0.42;
    const UP = -0.66;
    let a = REST + 0.03 * Math.sin(t * 2.3);
    let prev = -1;
    let next = -1;
    for (const s of SNARES) {
        if (s <= t) prev = s;
        else {
            next = s;
            break;
        }
    }
    if (prev >= 0 && t - prev < 0.4) a = lerp(0, REST, E.outBack(clamp((t - prev) / 0.4)));
    if (next >= 0 && next - t < 0.15) {
        const k = 1 - (next - t) / 0.15;
        a = k < 0.4 ? lerp(a, UP, E.out(k / 0.4)) : lerp(UP, 0, E.in((k - 0.4) / 0.6));
    }
    return a;
}
const lastSnare = (t) => {
    let p = -9;
    for (const s of SNARES) if (s <= t) p = s;
    return t - p;
};

/** Onset times (seconds from the demo start) of kicks and snares: where cracks are. */
function onsets(demo) {
    return HITS.filter((h) => h.demo === demo.id && h.voice !== 'hatSoft' && h.voice !== 'hat').map((h) => h.t - demo.at);
}

/** Filled level shape between x0 and x1 over n samples, coloured by `isCrack`. */
function levelShape(gc, n, x0, x1, yBase, hgt, val, isCrack, upto = n, colors = [P.amber, P.cyan]) {
    const m = Math.min(n, Math.max(0, Math.floor(upto)));
    if (m < 2) return;
    const X = (i) => x0 + ((x1 - x0) * i) / (n - 1);
    let i = 0;
    while (i < m - 1) {
        const c = isCrack(i);
        let j = i;
        while (j < m - 1 && isCrack(j + 1) === c) j++;
        gc.beginPath();
        gc.moveTo(X(i), yBase);
        for (let k = i; k <= Math.min(j + 1, m - 1); k++) gc.lineTo(X(k), yBase - hgt * lvl(val(k)));
        gc.lineTo(X(Math.min(j + 1, m - 1)), yBase);
        gc.closePath();
        gc.fillStyle = c ? colors[0] : colors[1];
        gc.fill();
        i = j + 1;
    }
}
function levelLine(gc, n, x0, x1, yBase, hgt, val, upto = n, style = P.ink3, width = 3) {
    const m = Math.min(n, Math.floor(upto));
    if (m < 2) return;
    gc.beginPath();
    for (let k = 0; k < m; k++) {
        const x = x0 + ((x1 - x0) * k) / (n - 1);
        const y = yBase - hgt * lvl(val(k));
        if (k) gc.lineTo(x, y);
        else gc.moveTo(x, y);
    }
    gc.strokeStyle = style;
    gc.lineWidth = width;
    gc.lineJoin = 'round';
    gc.stroke();
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

/** Piecewise-linear map through [[t, v], ...]. */
function keys(t, ks) {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], (t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]));
    return ks[ks.length - 1][1];
}

const DP = new Image();
DP.src = DP_URL;
const SHOT = window.LESSON ? Object.fromEntries(['page', 'header', 'nav'].map((k) => [k, Object.assign(new Image(), { src: LESSON[k] })])) : null;

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

/** Display smoothing: a short running max, then a running mean. Shapes only; the numbers stay the model's. */
function smooth(x, r) {
    const n = x.length;
    const mx = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        let m = 0;
        for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) m = Math.max(m, x[j]);
        mx[i] = m;
    }
    const out = new Float32Array(n);
    let s = 0;
    for (let i = 0; i < n + r; i++) {
        if (i < n) s += mx[i];
        if (i - 2 * r - 1 >= 0) s -= mx[i - 2 * r - 1];
        const c = i - r;
        if (c >= 0 && c < n) out[c] = s / (Math.min(n - 1, c + r) - Math.max(0, c - r) + 1);
    }
    return out;
}
const SNS = { env: smooth(D.snare.env, 8), FAST: smooth(D.snare.FAST.out, 8), SLOW: smooth(D.snare.SLOW.out, 8) };
for (const d of D.demos) {
    d.envS = smooth(d.env, 2);
    d.outS = smooth(d.out, 2);
}

// ══ Stage: the hook ══
const SN = { x: 300, y: 610, s: 1.05 };
const CB = { x: 800, y: 650, s: 1.0 };
const LANES = [
    { id: 'A', y: 905, name: '1 ms attack', verdict: 'flat', word: ['flat', 'flat'] },
    { id: 'B', y: 1115, name: '30 ms attack', verdict: 'punchy', word: ['punchy', 'punchy'] },
];
const AB_MAX = (() => {
    let m = 0;
    for (const id of ['A', 'B']) {
        const d = demoBy[id];
        const k = undb(d.makeupDb);
        for (const v of d.outS) m = Math.max(m, v * k);
    }
    return m;
})();

function attackMsAt(t) {
    const kw = wt('knob', 'knob');
    const tw = [[4.98, 1], [5.2, 30], [kw + 0.05, 30], [kw + 0.25, 1], [kw + 0.45, 1], [kw + 0.65, 30]];
    return Math.exp(keys(t, tw.map(([a, b]) => [a, Math.log(b)])));
}
const knobK = (ms) => (Math.log10(ms) + 1) / 3;

function grAt(t) {
    for (const d of D.demos) if (t >= d.at && t < d.to) return d.gr[Math.floor((t - d.at) * D.rate)] ?? 0;
    return 0;
}

function drawLaneAB(gc, lane, t, alpha) {
    const d = demoBy[lane.id];
    const x0 = 70;
    const w = 880;
    const h = 190;
    const playing = t >= d.at && t < d.to;
    const lit = playing ? 1 : t < d.at ? 0.45 : t < 7 ? 0.5 : 0.95;
    gc.save();
    gc.globalAlpha *= alpha;
    rr(gc, x0, lane.y, w, h, 28);
    gc.fillStyle = playing ? 'rgba(125,211,252,0.08)' : 'rgba(255,255,255,0.04)';
    gc.fill();
    gc.strokeStyle = playing ? 'rgba(125,211,252,0.55)' : P.ink5;
    gc.lineWidth = 3;
    gc.stroke();
    label(gc, lane.name, x0 + 30, lane.y + 52, { size: 34, weight: 600, color: playing ? P.cyan : P.ink2 });
    if (playing) speaker(gc, x0 + 300, lane.y + 40, 0.75, lvl(d.out[Math.floor((t - d.at) * D.rate)] ?? 0));
    // Waveform at matched loudness (what you hear), mirrored.
    const k = undb(d.makeupDb) / AB_MAX;
    const ons = onsets(d);
    const n = d.outS.length;
    const upto = t >= d.to ? n : Math.max(0, (t - d.at) * D.rate);
    const cy = lane.y + 124;
    const amp = 56;
    const X = (i) => x0 + 30 + ((w - 60) * i) / (n - 1);
    gc.globalAlpha *= lit;
    const isCrack = (i) => ons.some((o) => i / D.rate - o >= 0 && i / D.rate - o < 0.02);
    let i = 0;
    const m = Math.floor(Math.min(n, upto));
    while (i < m - 1) {
        const c = isCrack(i);
        let j = i;
        while (j < m - 1 && isCrack(j + 1) === c) j++;
        gc.beginPath();
        gc.moveTo(X(i), cy);
        for (let q = i; q <= j + 1 && q < m; q++) gc.lineTo(X(q), cy - amp * Math.min(1, d.outS[q] * k));
        for (let q = Math.min(j + 1, m - 1); q >= i; q--) gc.lineTo(X(q), cy + amp * Math.min(1, d.outS[q] * k));
        gc.closePath();
        gc.fillStyle = c ? P.amber : P.cyan;
        gc.fill();
        i = j + 1;
    }
    if (playing) {
        gc.fillStyle = P.ink;
        gc.fillRect(X(upto) - 2, lane.y + 64, 4, 120);
    }
    gc.restore();
    const tw = wt(lane.word[0], lane.word[1]);
    const a = clamp((t - tw) / 0.25);
    if (a > 0) pill(gc, lane.verdict, x0 + w - 110, lane.y + 46, { size: 32, bg: lane.id === 'A' ? P.ink2 : P.amber, fg: P.dark, alpha: alpha * a, scale: E.outBack(a) });
}

function drawStage(t) {
    // Camera: a push toward the knob on "only one knob changed", then a dive
    // into the box.
    const kWord = wt('knob', 'knob');
    const push = E.inOut(seg(t, kWord - 0.6, kWord));
    const dive = E.in(seg(t, 11.3, 11.9));
    // Push toward the knob, then dive into the box through its little screen.
    const fx = lerp(lerp(540, CB.x - 92 * CB.s, push), CB.x + 84 * CB.s, E.inOut(seg(t, 11.25, 11.6)));
    const fy = lerp(lerp(960, CB.y, push), CB.y - 35 * CB.s, E.inOut(seg(t, 11.25, 11.6)));
    const sx = lerp(540, 600, push);
    const sy = lerp(960, 820, push);
    const z = lerp(1, 1.5, push) * (1 + 7 * dive);
    // The inside opens as an iris over the box, so the stage stays until it is covered.
    const alpha = t < 11.95 ? 1 : 0;
    if (alpha <= 0) return;
    g.save();
    g.globalAlpha = alpha;
    g.translate(sx, sy);
    g.scale(z, z);
    g.translate(-fx, -fy);
    let kick = 0;
    for (const h of HITS) if (h.voice === 'kick' && t >= h.t && t - h.t < 0.2) kick = Math.max(kick, 1 - (t - h.t) / 0.2);
    const ring = lastSnare(t);
    snareDrum(g, SN.x, SN.y, SN.s * (1 + 0.012 * kick), { stick: stickAt(t), ring, squash: ring < 0.12 ? 1 - ring / 0.12 : 0 });
    const pop = E.outBack(seg(t, 1.22, 1.6));
    if (pop > 0) {
        const pulses = [];
        for (const h of HITS) if ((h.voice === 'snare' || h.voice === 'kick') && t >= h.t && t - h.t < 0.3 && h.demo) pulses.push({ u: (t - h.t) / 0.3, a: 1 - (t - h.t) / 0.3 });
        g.save();
        g.globalAlpha *= clamp(pop * 1.4);
        cable(g, { x: SN.x + 175, y: SN.y + 130 }, { x: CB.x - 200 * CB.s, y: CB.y + 44 * CB.s }, { x: SN.x + 260, y: SN.y + 250 }, { x: CB.x - 300 * CB.s, y: CB.y + 110 }, pulses);
        g.restore();
        const ms = attackMsAt(t);
        compressorBox(g, CB.x, CB.y, CB.s * pop, { k: knobK(ms), value: msLabel(ms), gr: grAt(t), glow: bump(t, kWord, 0.2, 1.2) });
    }
    g.restore();
    const la = E.out(seg(t, 2.3, 2.7)) * (1 - push);
    if (la > 0) {
        g.save();
        g.globalAlpha = alpha;
        g.translate(0, (1 - la) * 60);
        for (const lane of LANES) drawLaneAB(g, lane, t, la);
        g.restore();
    }
}

// ══ Inside the box: the hand on the fader ══
const IN = { meterX: 190, top: 430, bottom: 1120, faderX: 520, thr: 0.62, base: { x: 880, y: 1290 } };
function insideState(t) {
    const tCross = wt('pull', 'crosses');
    const tPull = wt('pull', 'pulls') - 0.1;
    const idle = 0.3 + 0.05 * Math.sin(t * 3.1) + 0.035 * Math.sin(t * 7.3 + 1) + 0.02 * Math.sin(t * 13.7 + 2);
    const surge = E.out(seg(t, tCross, tCross + 0.3));
    const pull = E.inOut(seg(t, tPull, tPull + 0.55));
    const high = 0.93 + 0.015 * Math.sin(t * 9);
    const level = lerp(idle, lerp(high, IN.thr + 0.06 + 0.01 * Math.sin(t * 9), pull), surge);
    return { level, gr: 10 * pull, thrDraw: E.out(seg(t, 17.0, 17.45)) };
}
/** Short blinks every few seconds after `from`. */
function blink(t, from) {
    if (t < from) return 0;
    const p = (t - from) % 3.7;
    return p < 0.14 ? Math.sin((p / 0.14) * Math.PI) : 0;
}
function drawInside(t) {
    if (t < 11.55 || t > 20.65) return;
    const iris = E.in(seg(t, 11.55, 11.95));
    const z = lerp(1.4, 1, E.out(seg(t, 11.72, 12.45)));
    const out = E.inOut(seg(t, 20.3, 20.6));
    g.save();
    if (iris < 1) {
        // Opens from the box's little screen, where the camera dived in.
        g.beginPath();
        g.arc(600, 820, 10 + 1300 * iris, 0, Math.PI * 2);
        g.clip();
        g.fillStyle = '#0b1530';
        g.fillRect(0, 0, W, H);
    }
    g.translate(540, 900 - out * H);
    g.scale(z, z);
    g.translate(-540, -900);
    panel(g);
    const st = insideState(t);
    meter(g, IN.meterX, IN.top, IN.bottom, st.level, IN.thr);
    label(g, 'level', IN.meterX, IN.bottom + 64, { size: 36, weight: 600, color: P.ink2, align: 'center' });
    const thrY = IN.bottom - IN.thr * (IN.bottom - IN.top);
    if (st.thrDraw > 0) {
        dashed(g, IN.meterX - 70, thrY, lerp(IN.meterX - 70, IN.faderX - 100, st.thrDraw), thrY, P.ink, 5);
        pill(g, 'threshold', IN.meterX + 150, thrY - 52, { size: 32, bg: P.ink, fg: P.dark, alpha: st.thrDraw, scale: E.outBack(st.thrDraw) });
    }
    const capY = fader(g, IN.faderX, IN.top, IN.bottom, st.gr);
    label(g, 'fader', IN.faderX, IN.bottom + 64, { size: 36, weight: 600, color: P.ink2, align: 'center' });
    // Robot: rises in, reaches for the cap on "a tiny hand".
    const rise = E.outBack(seg(t, 12.3, 12.75));
    const tHand = wt('hand', 'hand');
    const reach = E.inOut(seg(t, tHand - 0.1, tHand + 0.75));
    const grip = { x: IN.faderX + 62, y: capY };
    const away = { x: 1180, y: 560 };
    const hand = { x: lerp(away.x, grip.x, reach), y: lerp(away.y, grip.y, reach) };
    const tEye = wt('watch', 'watches') - 0.05;
    const lid = t < tEye ? 0.85 : t < tEye + 0.15 ? 0.85 * (1 - (t - tEye) / 0.15) : blink(t, tEye + 1.6);
    const look = t > tEye ? { x: IN.meterX, y: IN.bottom - st.level * (IN.bottom - IN.top) } : { x: IN.faderX, y: capY };
    g.save();
    rr(g, PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r);
    g.clip();
    g.translate(0, (1 - rise) * 420);
    robot(g, { x: IN.base.x, y: IN.base.y + 4 * Math.sin(t * 2.1) }, hand, { open: 1 - reach, look, lid, s: 1, arm: 780 });
    g.restore();
    g.restore();
    if (iris > 0 && iris < 1) {
        g.strokeStyle = `rgba(125,211,252,${0.8 * (1 - iris)})`;
        g.lineWidth = 8;
        g.beginPath();
        g.arc(600, 820, 10 + 1300 * iris, 0, Math.PI * 2);
        g.stroke();
    }
}

// ══ Parts: crack and body of one snare hit ══
const PT = { x0: 100, x1: 980, top: 500, base: 1080, ms: 150 };
function drawParts(t) {
    if (t < 20.3 || t > 26.95) return;
    const enter = E.inOut(seg(t, 20.3, 20.6));
    const leave = seg(t, 26.55, 26.72);
    g.save();
    g.globalAlpha = 1 - leave;
    g.translate(0, (1 - enter) * H);
    g.translate(540, 900);
    g.scale(1 - 0.04 * leave, 1 - 0.04 * leave);
    g.translate(-540, -900);
    const S = D.snare;
    const n = Math.round((PT.ms / 1000) * S.rate);
    const hgt = PT.base - PT.top;
    label(g, 'One snare hit, up close', PT.x0, 330, { size: 42, weight: 600, color: P.ink2 });
    g.strokeStyle = P.ink4;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(PT.x0, PT.base);
    g.lineTo(PT.x1, PT.base);
    g.stroke();
    for (const ms of [0, 50, 100, 150]) {
        const x = lerp(PT.x0, PT.x1, ms / PT.ms);
        label(g, ms === 150 ? '150 ms' : String(ms), x, PT.base + 54, { size: 32, weight: 500, color: P.ink3, align: ms === 150 ? 'right' : ms === 0 ? 'left' : 'center', family: BODY });
    }
    const tHit = 20.62;
    const upto = clamp((t - tHit) / (PT.ms / 1000)) * n;
    const tCrack = wt('crack', 'crack');
    const tBody = wt('body', 'body');
    const cA = clamp((t - tCrack) / 0.3);
    const bA = clamp((t - tBody) / 0.3);
    const crackEnd = Math.round(0.02 * S.rate);
    const val = (i) => SNS.env[i];
    levelShape(g, n, PT.x0, PT.x1, PT.base, hgt, val, () => false, upto, [P.ink4, 'rgba(248,250,252,0.2)']);
    if (cA > 0) {
        g.save();
        g.globalAlpha = cA;
        levelShape(g, n, PT.x0, PT.x1, PT.base, hgt, val, (i) => i < crackEnd, Math.min(upto, crackEnd + 1), [P.amber, P.amber]);
        g.restore();
    }
    if (bA > 0) {
        g.save();
        g.globalAlpha = bA;
        g.beginPath();
        g.rect(lerp(PT.x0, PT.x1, crackEnd / (n - 1)), 0, W, H);
        g.clip();
        levelShape(g, n, PT.x0, PT.x1, PT.base, hgt, val, () => false, upto, [P.cyan, P.cyan]);
        g.restore();
    }
    levelLine(g, n, PT.x0, PT.x1, PT.base, hgt, val, upto, P.ink, 4);
    const tTwo = wt('parts', 'two');
    const dv = E.out(seg(t, tTwo, tTwo + 0.4));
    const sx = lerp(PT.x0, PT.x1, crackEnd / (n - 1));
    if (dv > 0) dashed(g, sx, PT.top - 40, sx, lerp(PT.top - 40, PT.base, dv), P.ink, 4, [12, 10]);
    if (cA > 0) pill(g, 'crack', sx - 10, PT.top - 96, { size: 38, bg: P.amber, fg: P.dark, scale: E.outBack(cA), alpha: cA });
    if (bA > 0) pill(g, 'body', lerp(PT.x0, PT.x1, 0.42), PT.base - hgt * lvl(SNS.env[Math.round(0.063 * S.rate)]) - 76, { size: 38, bg: P.cyan, fg: P.dark, scale: E.outBack(bA), alpha: bA });
    g.restore();
}

// ══ Rig: inside the box again, the level on a screen beside the hand ══
const RG = { x0: 100, x1: 712, top: 500, base: 950, trTop: 1066, trBot: 1182, faderX: 830, base2: { x: 900, y: 1290 } };
const SWEEPS = {
    fast: [[wt('fast', 'catches') - 0.1, 0], [wt('fast', 'squashes') - 0.35, 20], [vEnd('fast') + 0.15, 150]],
    slow: [[wt('slips', 'crack'), 0], [wt('slips', 'past') + 0.25, 20], [wt('slips', 'only'), 28], [vEnd('slips'), 150]],
    hold: [[47.6, 0.4], [wt('hold', 'arrives') + 0.2, 1.62]],
    fresh: [[55.55, 0.4], [wt('fresh', 'fresh') + 0.3, 1.62]],
};
const LETGO = { from: wt('release', 'lets') + 0.05, dur: 0.75 };
function rigWindow(sc, t) {
    const set = sc.setting;
    if (sc.mode === 'intro' || sc.mode === 'slowmo' || sc.mode === 'letgo') {
        const S = D.snare;
        const key = set === 'FAST' ? 'FAST' : 'SLOW';
        const src = S[key];
        const n = Math.round(0.15 * S.rate);
        const crack = 0.02 * S.rate;
        const base = { n, env: (i) => SNS.env[i], out: (i) => SNS[key][i], gr: (i) => src.gr[i], crack: (i) => i < crack, kind: 'hit' };
        if (sc.mode === 'letgo') {
            // The 30 ms hit, finished; the hand rides the release back up.
            let pk = 0;
            for (let i = 1; i < n; i++) if (src.gr[i] > src.gr[pk]) pk = i;
            const k = E.inOut(seg(t, LETGO.from, LETGO.from + LETGO.dur));
            return { ...base, pos: lerp(pk, n - 1, k), full: true, relFrom: pk, showOut: true, slow: k > 0 && k < 1 };
        }
        const sw = sc.id === 'fast' ? SWEEPS.fast : sc.id === 'slow' ? SWEEPS.slow : null;
        const ms = sw ? keys(t, sw) : 0;
        return { ...base, pos: (ms / 1000) * S.rate, slow: sw && t > sw[0][0] - 0.3 && t < sw[sw.length - 1][0] + 0.2, showOut: sc.mode === 'slowmo' };
    }
    const id = sc.demo ?? (sc.id === 'hold' ? 'hold' : 'tempo');
    const d = demoBy[id];
    const ons = onsets(d);
    if (sc.mode === 'live') {
        const n = Math.round(TL.bar * D.rate);
        const off = Math.max(0, Math.floor((t - d.at) / TL.bar)) * n;
        const pos = clamp(t - d.at - off / D.rate, 0, TL.bar) * D.rate;
        return { n, env: (i) => d.envS[off + i], out: (i) => d.outS[off + i], gr: (i) => d.gr[off + i], pos, crack: (i) => ons.some((o) => (off + i) / D.rate - o >= 0 && (off + i) / D.rate - o < 0.02), slow: false, kind: 'bar', showOut: true, live: true, ons: ons.map((o) => o * D.rate - off) };
    }
    const [a, b] = [0.4, 1.62];
    const i0 = Math.round(a * D.rate);
    const n = Math.round((b - a) * D.rate);
    const sw = sc.id === 'hold' ? SWEEPS.hold : SWEEPS.fresh;
    const pos = (keys(t, sw) - a) * D.rate;
    return { n, env: (i) => d.envS[i0 + i], out: (i) => d.outS[i0 + i], gr: (i) => d.gr[i0 + i], pos, crack: (i) => ons.some((o) => (i0 + i) / D.rate - o >= 0 && (i0 + i) / D.rate - o < 0.02), slow: t > sw[0][0] - 0.3 && t < sw[1][0] + 0.2, kind: 'groove', showOut: true, ons: ons.map((o) => o * D.rate - i0) };
}

function rigHeader(sc, t) {
    const isRelease = ['letgo', 'groove'].includes(sc.mode) || ['demo-hold', 'demo-tempo'].includes(sc.id);
    const word = isRelease ? 'Release' : 'Attack';
    const S = SETTINGS[sc.setting];
    let value = isRelease ? msLabel(S.release * 1000) : msLabel(S.attack * 1000);
    let show = 1;
    if (sc.id === 'attack') show = clamp((t - wt('fast', 'one')) / 0.2);
    if (sc.id === 'release') show = 0;
    if (sc.id === 'slow' && t < wt('slow', 'thirty')) value = msLabel(1);
    const y = 392;
    const k = isRelease ? (sc.setting === 'HOLD' ? 1 : sc.setting === 'TEMPO' ? 0.3 : 0.2) : knobK(S.attack * 1000);
    stopwatch(g, 122, y - 26, 32, sc.id === 'attack' ? 0 : k * (sc.id === 'release' ? 1 : show));
    label(g, word, 180, y, { size: 74, weight: 800, color: P.ink });
    font(g, 74, 800);
    const wx = 180 + g.measureText(word).width + 24;
    if (show > 0) label(g, value, wx, y, { size: 74, weight: 800, color: P.cyan, alpha: show });
}

function drawRig(t) {
    if (t < 26.62 || t > 61.18) return;
    const enter = E.out(seg(t, 26.62, 26.95));
    const leave = seg(t, 61.0, 61.18);
    const sc = TL.scenes.filter((s) => s.at <= t).pop();
    const rigScenes = TL.scenes.filter((s) => s.view === 'rig');
    const cur = sc.view === 'rig' ? sc : rigScenes[rigScenes.length - 1];
    g.save();
    g.globalAlpha = enter * (1 - leave);
    g.translate(540, 900);
    const z = lerp(1.04, 1, enter);
    g.scale(z, z);
    g.translate(-540, -900 - 80 * E.in(leave));
    panel(g);
    rigHeader(cur, t);
    const L = rigWindow(cur, t);
    const hgt = RG.base - RG.top;
    // Screen.
    rr(g, RG.x0 - 26, RG.top - 34, RG.x1 - RG.x0 + 52, hgt + 68, 26);
    g.fillStyle = '#081022';
    g.fill();
    g.strokeStyle = L.live ? 'rgba(125,211,252,0.6)' : 'rgba(255,255,255,0.08)';
    g.lineWidth = L.live ? 4 : 3;
    g.stroke();
    const X = (i) => RG.x0 + ((RG.x1 - RG.x0) * i) / (L.n - 1);
    const ca = seg(t, cur.at, cur.at + 0.25);
    g.save();
    g.globalAlpha *= ca;
    levelShape(g, L.n, RG.x0, RG.x1, RG.base, hgt, L.env, () => false, L.n, [P.ink5, 'rgba(248,250,252,0.08)']);
    levelLine(g, L.n, RG.x0, RG.x1, RG.base, hgt, L.env, L.n, P.ink3, 3);
    if (L.showOut) levelShape(g, L.n, RG.x0, RG.x1, RG.base, hgt, L.out, L.crack, L.full ? L.n : L.pos);
    g.restore();
    const thrY = RG.base - hgt * lvl(SETTINGS.FAST.threshold);
    dashed(g, RG.x0 - 26, thrY, RG.x1 + 26, thrY, P.ink2, 4);
    label(g, 'threshold', RG.x1 - 6, thrY - 16, { size: 28, weight: 600, color: P.ink2, align: 'right', family: BODY });
    // Legend row: ghost = what comes in, colour = what comes out.
    {
        const ly = 454;
        rr(g, 100, ly - 22, 30, 22, 5);
        g.fillStyle = 'rgba(248,250,252,0.25)';
        g.fill();
        label(g, 'in', 140, ly, { size: 30, weight: 600, color: P.ink3, family: BODY });
        g.fillStyle = P.amber;
        g.fillRect(196, ly - 22, 15, 22);
        g.fillStyle = P.cyan;
        g.fillRect(211, ly - 22, 15, 22);
        label(g, 'out', 236, ly, { size: 30, weight: 600, color: P.ink2, family: BODY });
    }
    if (L.slow) pill(g, 'slow motion', RG.x1 - 86, 444, { size: 26, bg: P.ink, fg: P.dark });
    if (L.live) speaker(g, RG.x1 - 24, 444, 0.75, lvl(L.out(Math.floor(L.pos)) ?? 0));
    const shown = L.showOut && (L.kind !== 'hit' || L.pos > 0 || L.full);
    if (shown) {
        g.fillStyle = P.ink;
        g.fillRect(X(clamp(L.pos, 0, L.n - 1)) - 2, RG.top - 22, 4, hgt + 30);
    }
    // Gain-reduction trace: where the hand has had the fader.
    rr(g, RG.x0 - 26, RG.trTop - 24, RG.x1 - RG.x0 + 52, RG.trBot - RG.trTop + 48, 22);
    g.fillStyle = '#081022';
    g.fill();
    label(g, 'how far the hand pulls', RG.x0 - 20, RG.trTop - 42, { size: 30, weight: 600, color: P.ink3, family: BODY });
    const trH = RG.trBot - RG.trTop;
    const TY = (gr) => RG.trTop + trH * clamp(gr / 18);
    let grNow = 0;
    const m = L.showOut ? Math.floor(L.full ? L.n : L.pos) : 0;
    if (m > 1) {
        g.beginPath();
        g.moveTo(RG.x0, RG.trTop);
        for (let k = 0; k < m; k++) g.lineTo(X(k), TY(L.gr(k)));
        g.lineTo(X(m - 1), RG.trTop);
        g.closePath();
        g.fillStyle = P.cyanDim;
        g.fill();
        g.beginPath();
        for (let k = 0; k < m; k++) (k ? g.lineTo : g.moveTo).call(g, X(k), TY(L.gr(k)));
        g.strokeStyle = P.cyan;
        g.lineWidth = 5;
        g.stroke();
    }
    if (shown) grNow = L.gr(Math.floor(clamp(L.pos, 0, L.n - 1))) ?? 0;
    if (cur.id === 'attack') grNow = 6 * bump(t, wt('attack', 'grabs') - 0.05, 0.08, 0.4);
    // ── Annotations ──
    const pop = (t0) => clamp((t - t0) / 0.3);
    if (cur.id === 'fast') {
        const a = pop(wt('fast', 'squashes'));
        if (a > 0) pill(g, 'crack squashed', RG.x0 + 230, RG.top + 40, { size: 32, bg: P.dark, fg: P.amber, ring: P.amber, alpha: a, scale: E.outBack(a) });
    }
    if (cur.id === 'slow') {
        const tP = wt('punch', 'punch') - 0.1;
        const a = pop(wt('slips', 'past') - 0.2);
        if (a > 0 && t < tP) pill(g, 'crack gets through', RG.x0 + 270, RG.top + 40, { size: 32, bg: P.dark, fg: P.amber, ring: P.amber, alpha: a, scale: E.outBack(a) });
        const p = pop(tP);
        if (p > 0) pill(g, 'punch', RG.x0 + 200, RG.top + 44, { size: 46, bg: P.amber, fg: P.dark, alpha: p, scale: E.outBack(p), weight: 800 });
        const b = pop(wt('slips', 'body') - 0.1);
        if (b > 0) pill(g, 'body turned down', RG.x0 + 390, RG.base - 150, { size: 32, bg: P.dark, fg: P.cyan, ring: P.cyan, alpha: b, scale: E.outBack(b) });
    }
    if (cur.id === 'release') {
        // Highlight the release part of the trace: from the deepest pull back to zero.
        g.beginPath();
        for (let k = L.relFrom; k < L.n; k++) (k > L.relFrom ? g.lineTo : g.moveTo).call(g, X(k), TY(L.gr(k)));
        g.strokeStyle = P.ink;
        g.lineWidth = 8;
        g.stroke();
        const a = pop(LETGO.from - 0.25);
        if (a > 0) pill(g, 'release', X(L.relFrom + (L.n - L.relFrom) * 0.5), RG.trBot + 4, { size: 30, bg: P.ink, fg: P.dark, alpha: a, scale: E.outBack(a) });
    }
    if (cur.id === 'hold') {
        const a = pop(wt('hold', 'arrives') - 0.1);
        if (a > 0) pill(g, 'still holding', RG.x0 + 470, RG.trBot + 4, { size: 30, bg: P.ink, fg: P.dark, alpha: a, scale: E.outBack(a) });
        const f = E.out(seg(t, wt('flatgroove', 'flat') - 0.25, wt('flatgroove', 'flat') + 0.25));
        if (f > 0) {
            let s = 0;
            for (let k = 0; k < L.n; k++) s += L.gr(k);
            const y = TY(s / L.n);
            dashed(g, RG.x0, y, lerp(RG.x0, RG.x1, f), y, P.ink, 5, [20, 10]);
            pill(g, 'flat', RG.x0 + 60, y - 4, { size: 30, bg: P.ink, fg: P.dark, alpha: f, scale: E.outBack(f) });
        }
    }
    if (cur.id === 'fresh' && L.ons) {
        for (const o of L.ons) {
            if (o < 0 || o > L.n) continue;
            const age = (L.pos - o) / D.rate;
            if (age < 0) continue;
            const x = X(o);
            g.strokeStyle = `rgba(125,211,252,${0.8 * Math.max(0, 1 - age * 2.2)})`;
            g.lineWidth = 5;
            g.beginPath();
            g.arc(x, RG.top + 30, 14 + 70 * Math.min(1, age * 2.2), 0, Math.PI * 2);
            g.stroke();
        }
        const a = pop(wt('fresh', 'fresh') - 0.1);
        if (a > 0) pill(g, 'back up before each hit', RG.x0 + 300, RG.trBot + 4, { size: 30, bg: P.cyan, fg: P.dark, alpha: a, scale: E.outBack(a) });
    }
    // Fader and the robot's hand on it.
    const capY = fader(g, RG.faderX, RG.top, RG.base, grNow, { ticks: false, size: 0.8 });
    const playX = shown ? X(clamp(L.pos, 0, L.n - 1)) : RG.x0;
    g.save();
    rr(g, PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r);
    g.clip();
    robot(g, { x: RG.base2.x, y: RG.base2.y + 3 * Math.sin(t * 2.1) }, { x: RG.faderX + 64, y: capY }, { open: 0, look: { x: playX, y: RG.top + 120 }, lid: blink(t, 27.3), s: 0.72, arm: 1000, straight: true });
    g.restore();
    g.restore();
}

// ══ The rule ══
function drawRule(t) {
    if (t < 61.0 || t > 65.1) return;
    const enter = E.out(seg(t, 61.08, 61.4));
    const out = E.inOut(seg(t, 64.6, 65.1));
    g.save();
    g.globalAlpha = enter;
    g.translate(-out * W, (1 - enter) * 80);
    const d = demoBy.tempo;
    let beat = 0;
    for (const h of HITS) if (h.demo === 'tempo' && h.voice === 'snare' && t >= h.t && t - h.t < 0.25) beat = Math.max(beat, 1 - (t - h.t) / 0.25);
    const cards = [
        { y: 320, at: voBy['rule-a'].at, word: 'Attack', what: 'shapes the hit', k: knobK(30) },
        { y: 800, at: voBy['rule-r'].at, word: 'Release', what: 'shapes the groove', k: 0.45 },
    ];
    for (const [ci, c] of cards.entries()) {
        const a = clamp((t - c.at + 0.15) / 0.3);
        if (a <= 0) continue;
        g.save();
        g.globalAlpha *= a;
        const sc = lerp(0.9, 1, E.outBack(a));
        g.translate(540, c.y + 210);
        g.scale(sc, sc);
        g.translate(-540, -(c.y + 210));
        rr(g, 60, c.y, 960, 430, 40);
        g.fillStyle = 'rgba(22,35,63,0.92)';
        g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.07)';
        g.lineWidth = 3;
        g.stroke();
        knob(g, 220, c.y + 180, 80, c.k + 0.03 * Math.sin(t * 2 + ci));
        label(g, c.word, 220, c.y + 350, { size: 54, weight: 800, color: P.ink, align: 'center' });
        g.strokeStyle = P.ink3;
        g.lineWidth = 6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(380, c.y + 180);
        g.lineTo(470, c.y + 180);
        g.moveTo(450, c.y + 160);
        g.lineTo(472, c.y + 180);
        g.lineTo(450, c.y + 200);
        g.stroke();
        if (ci === 0) {
            const S = D.snare;
            const n = Math.round(0.15 * S.rate);
            const ce = Math.round(0.02 * S.rate);
            const s = 1 + 0.07 * beat;
            g.save();
            g.translate(735, c.y + 270);
            g.scale(s, s);
            levelShape(g, n, -215, 215, 0, 200, (i) => SNS.SLOW[i] * 1.7, (i) => i < ce, n);
            g.restore();
        } else {
            const sp = Math.round(TL.bar * D.rate);
            const off = Math.max(0, Math.min(d.outS.length - sp, Math.floor((t - d.at) / TL.bar) * sp));
            const ons = onsets(d);
            levelShape(g, sp, 520, 950, c.y + 240, 160, (i) => d.outS[off + i] * 1.5, (i) => ons.some((o) => (off + i) / D.rate - o >= 0 && (off + i) / D.rate - o < 0.02), sp);
            g.beginPath();
            for (let k = 0; k < sp; k += 4) (k ? g.lineTo : g.moveTo).call(g, lerp(520, 950, k / sp), c.y + 262 + 50 * clamp(d.gr[off + k] / 18));
            g.strokeStyle = P.cyan;
            g.lineWidth = 4;
            g.stroke();
            const ph = clamp((t - d.at - off / D.rate) / TL.bar);
            g.fillStyle = P.ink;
            g.fillRect(lerp(520, 950, ph) - 2, c.y + 64, 4, 260);
        }
        label(g, c.what, 735, c.y + 350, { size: 40, weight: 600, color: P.ink2, align: 'center' });
        g.restore();
    }
    g.restore();
}

// ══ End: who made it, the lesson on a phone, the address ══
const PH = { x: 540, top: 330, w: 460, h: 960 };
function drawEnd(t) {
    if (t < 64.6) return;
    const enter = E.inOut(seg(t, 64.6, 65.1));
    g.save();
    g.translate((1 - enter) * W, 0);
    const btn = bump(t, 71, 0.08, 0.5);
    // Founder row.
    avatar(g, 132, 210, 62 * (1 + 0.08 * btn));
    label(g, 'Virzy Guns', 222, 202, { size: 54, weight: 800, color: P.ink });
    label(g, TL.lesson.tagline, 222, 254, { size: 36, weight: 600, color: btn > 0.05 ? P.cyan : P.ink2 });
    // Phone with the lesson.
    const sw = PH.w - 28;
    const sh = PH.h - 28;
    const x0 = PH.x - PH.w / 2;
    const lift = E.outBack(seg(t, 64.9, 65.5));
    g.save();
    g.translate(0, (1 - lift) * 120);
    const glow = g.createRadialGradient(PH.x, PH.top + PH.h / 2, 0, PH.x, PH.top + PH.h / 2, 620);
    glow.addColorStop(0, 'rgba(125,211,252,0.16)');
    glow.addColorStop(1, 'rgba(125,211,252,0)');
    g.fillStyle = glow;
    g.fillRect(0, PH.top - 200, W, PH.h + 400);
    shadow(g, PH.x, PH.top + PH.h + 18, 290, 34);
    rr(g, x0, PH.top, PH.w, PH.h, 64);
    g.fillStyle = '#26314a';
    g.fill();
    rr(g, x0 + 5, PH.top + 5, PH.w - 10, PH.h - 10, 60);
    g.fillStyle = '#04060a';
    g.fill();
    g.save();
    rr(g, x0 + 14, PH.top + 14, sw, sh, 52);
    g.clip();
    g.fillStyle = '#050607';
    g.fillRect(x0 + 14, PH.top + 14, sw, sh);
    if (SHOT && SHOT.page.width) {
        const s = sw / SHOT.page.width;
        const demoY = Math.min(SHOT.page.height - sh / s, LESSON.demoTop * 2 - 150);
        const tDemo = wt('cta', 'demo');
        const scroll = lerp(0, demoY, E.inOut(seg(t, tDemo - 0.7, tDemo + 0.35)));
        g.drawImage(SHOT.page, 0, scroll, SHOT.page.width, sh / s, x0 + 14, PH.top + 14, sw, sh);
        g.drawImage(SHOT.header, x0 + 14, PH.top + 14, sw, SHOT.header.height * s);
        const nh = SHOT.nav.height * s;
        g.drawImage(SHOT.nav, x0 + 14, PH.top + 14 + sh - nh, sw, nh);
        const tTap = wt('cta', 'play') + 0.05;
        const tap = seg(t, tTap, tTap + 0.55);
        if (tap > 0 && tap < 1) {
            const [bx, by, bw, bh] = LESSON.play;
            const cx = x0 + 14 + (bx + bw / 2) * 2 * s;
            const cy = PH.top + 14 + ((by + bh / 2) * 2 - scroll) * s;
            g.fillStyle = `rgba(255,255,255,${0.5 * (1 - tap)})`;
            g.beginPath();
            g.arc(cx, cy, 18 + 46 * E.out(tap), 0, Math.PI * 2);
            g.fill();
        }
    }
    g.restore();
    rr(g, PH.x - 62, PH.top + 30, 124, 36, 18);
    g.fillStyle = '#000';
    g.fill();
    g.restore();
    const k = clamp((t - vEnd('cta') - 0.25) / 0.35);
    if (k > 0) pill(g, TL.lesson.url, 540, 1400, { size: 58, bg: P.cyan, fg: P.dark, scale: lerp(0.8, 1, E.outBack(k)), alpha: clamp(k * 3), weight: 800 });
    g.restore();
}

// ══ Words on screen: the narration, word by word, two lines at most ══
const KEYWORD = { crack: P.amber, body: P.cyan };
function subtitles(t) {
    const v = VO.filter((x) => t >= x.at - 0.12 && t <= x.at + x.dur + 0.3).pop();
    if (!v) return;
    const fadeIn = clamp((t - v.at + 0.12) / 0.12);
    const fadeOut = 1 - clamp((t - (v.at + v.dur + 0.1)) / 0.2);
    const size = 54;
    font(g, size, 600);
    const space = g.measureText(' ').width;
    const maxW = 900;
    const lines = [[]];
    let lw = 0;
    for (const w of v.words) {
        const ww = g.measureText(w.w).width;
        if (lw > 0 && lw + space + ww > maxW) {
            lines.push([]);
            lw = 0;
        }
        lines[lines.length - 1].push({ ...w, width: ww });
        lw += (lw > 0 ? space : 0) + ww;
    }
    const pages = [];
    for (let i = 0; i < lines.length; i += 2) pages.push(lines.slice(i, i + 2));
    let pi = 0;
    pages.forEach((p, k) => {
        if (p[0][0].s - 0.05 <= t) pi = k;
    });
    const page = pages[pi];
    const lh = 70;
    const y0 = 1388 - ((page.length - 1) * lh) / 2;
    g.save();
    g.globalAlpha = fadeIn * fadeOut;
    g.textBaseline = 'middle';
    page.forEach((line, li) => {
        const total = line.reduce((s, w) => s + w.width, 0) + space * (line.length - 1);
        let x = 540 - total / 2;
        for (const w of line) {
            const on = clamp((t - w.s + 0.03) / 0.09);
            const key = KEYWORD[norm(w.w)];
            g.fillStyle = on > 0 && key ? key : P.ink;
            g.globalAlpha = fadeIn * fadeOut * lerp(0.32, 1, on);
            g.textAlign = 'left';
            g.fillText(w.w, x, y0 + li * lh);
            x += w.width + space;
        }
    });
    g.restore();
}

function badge(t) {
    const a = 1 - seg(t, 64.6, 64.9);
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    avatar(g, 96, 178, 32);
    label(g, 'Virzy Guns', 142, 190, { size: 34, weight: 700, color: P.ink });
    g.restore();
}

function draw(t, { words = true } = {}) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    // The room breathes with the kick while a demo plays.
    let kick = 0;
    for (const h of HITS) if (h.demo && h.voice === 'kick' && t >= h.t && t - h.t < 0.3) kick = Math.max(kick, 1 - (t - h.t) / 0.3);
    ground(g, t, Math.max(bump(t, 59, 0.05, 0.9), 0.35 * kick));
    drawStage(t);
    drawInside(t);
    drawParts(t);
    drawRig(t);
    drawRule(t);
    drawEnd(t);
    if (words) subtitles(t);
    badge(t);
}

/** Cover for the profile grid: the hook's verdict with one line over it. */
function cover() {
    draw(9.3, { words: false });
    const y = 1440;
    label(g, 'Flat or punchy?', 540, y, { size: 96, weight: 800, color: P.ink, align: 'center' });
    label(g, 'One knob decides.', 540, y + 100, { size: 64, weight: 700, color: P.cyan, align: 'center' });
}

window.seek = (t) => draw(t);
window.cover = () => cover();
window.filmReady = (async () => {
    await Promise.all(['600 54px', '800 74px', '700 34px', '500 30px'].map((f) => document.fonts.load(`${f} ${DISPLAY}`)));
    await Promise.all(['500 30px', '600 28px'].map((f) => document.fonts.load(`${f} ${BODY}`)));
    await DP.decode();
    if (SHOT) await Promise.all(Object.values(SHOT).map((i) => i.decode()));
    draw(0);
    return { duration: TL.duration, fps: TL.fps };
})();
