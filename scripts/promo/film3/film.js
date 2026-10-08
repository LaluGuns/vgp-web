// Film 3 picture: scenes drawn on one 1080 x 1920 canvas, a pure function
// of time. window.seek(t) draws the frame at t seconds. Reads TIMELINE,
// SETTINGS and DATA (levels and gain reduction computed with the sound) and
// the drawing kit in art.js.
//
// One rule for every plot: linear level, so a crack looks like a crack.
// Slow-motion views show the mechanism (level in as an outline, level out
// before makeup as a fill); "listen" views show what you hear (level out
// after makeup, compared with the other setting as a dashed outline).
/* global TIMELINE, SETTINGS, DATA, DP_URL, LESSON, W, H, P, clamp, lerp, seg, E, bump, rand, font, label, rr, pill, shadow, ground, panel, PANEL, snareDrum, knob, compressorBox, cable, fader, faderCapY, robotTop, meter, stopwatch, speaker, DISPLAY, BODY */

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
const ZR = D.snare.rate;
const ZN = Math.round(0.15 * ZR);
const CRACK = Math.round(0.02 * ZR);
const sceneAt = (t) => TL.scenes.filter((s) => s.at <= t).pop();
const sceneEnd = (s) => {
    const i = TL.scenes.indexOf(s);
    return i + 1 < TL.scenes.length ? TL.scenes[i + 1].at : TL.duration;
};

/** Piecewise-linear map through [[t, v], ...]. */
function keys(t, ks) {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], (t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]));
    return ks[ks.length - 1][1];
}

/** Display smoothing: a short running max, then a running mean. Shapes only. */
function smooth(x, r) {
    const n = x.length;
    const mx = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        let m = 0;
        for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) m = Math.max(m, x[j]);
        mx[i] = m;
    }
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        let s = 0;
        let c = 0;
        for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) {
            s += mx[j];
            c++;
        }
        out[i] = s / c;
    }
    return out;
}
/** Energy average over +-r samples: how loud a stretch is, for "what you hear" plots. */
function rmsSmooth(x, r) {
    return Float32Array.from(x, (_, i) => {
        let s = 0;
        let c = 0;
        for (let j = Math.max(0, i - r); j <= Math.min(x.length - 1, i + r); j++) {
            s += x[j] * x[j];
            c++;
        }
        return Math.sqrt(s / c);
    });
}
const SN = { env: smooth(D.snare.env, 3), FAST: smooth(D.snare.FAST.out, 3), SLOW: smooth(D.snare.SLOW.out, 3) };
for (const d of D.demos) {
    const k = undb(d.makeupDb);
    for (const z of d.zooms) {
        z.envS = smooth(z.env, 3);
        z.outS = smooth(z.out, 3);
        z.heard = rmsSmooth(z.out, 6).map((v) => v * k);
    }
}
/** Scale for "what you hear" views: the loudest snare after makeup fills 92%. */
const HEARD_MAX = Math.max(...D.demos.flatMap((d) => d.zooms.map((z) => Math.max(...z.heard)))) / 0.92;
const LONE_MAX = Math.max(...SN.env, ...D.demos.flatMap((d) => d.zooms.map((z) => Math.max(...z.envS)))) / 0.9;

/** The latest snare of demo `id` at time t: { z, n } with n samples drawn so far. */
function latestZoom(id, t) {
    const d = demoBy[id];
    let z = null;
    for (const q of d.zooms) if (q.t <= t) z = q;
    if (!z) return null;
    return { z, n: clamp((t - z.t) * ZR, 0, ZN) };
}

// ── Plot primitives (linear level) ──
/** Area from the baseline up to the curve, crack in amber and body in cyan. */
function area(gc, box, vals, vmax, upto = ZN, { crack = CRACK, colors = [P.amber, P.cyan], alpha = 1 } = {}) {
    const m = Math.min(vals.length, Math.floor(upto));
    if (m < 2) return;
    const X = (i) => box.x0 + ((box.x1 - box.x0) * i) / (ZN - 1);
    const Y = (v) => box.base - (box.base - box.top) * clamp(v / vmax);
    gc.save();
    gc.globalAlpha *= alpha;
    for (const [a, b, c] of [[0, Math.min(m, crack + 1), colors[0]], [crack, m, colors[1]]]) {
        if (b - a < 2) continue;
        gc.beginPath();
        gc.moveTo(X(a), box.base);
        for (let i = a; i < b; i++) gc.lineTo(X(i), Y(vals[i]));
        gc.lineTo(X(b - 1), box.base);
        gc.closePath();
        gc.fillStyle = c;
        gc.fill();
    }
    gc.restore();
}
function curve(gc, box, vals, vmax, { upto = ZN, color = P.ink, width = 4, dash = null, alpha = 1, n = ZN } = {}) {
    const m = Math.min(vals.length, Math.floor(upto));
    if (m < 2) return;
    gc.save();
    gc.globalAlpha *= alpha;
    if (dash) gc.setLineDash(dash);
    gc.beginPath();
    for (let i = 0; i < m; i++) {
        const x = box.x0 + ((box.x1 - box.x0) * i) / (n - 1);
        const y = box.base - (box.base - box.top) * clamp(vals[i] / vmax);
        if (i) gc.lineTo(x, y);
        else gc.moveTo(x, y);
    }
    gc.strokeStyle = color;
    gc.lineWidth = width;
    gc.lineJoin = 'round';
    gc.stroke();
    gc.restore();
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
/** A pill in a label lane with a thin leader line down (or up) to its target. */
function tag(gc, text, x, y, target, { bg = P.ink, fg = P.dark, ring = null, a = 1, size = 40, weight = 700 } = {}) {
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
const popIn = (t, t0, d = 0.3) => clamp((t - t0) / d);

/** Glove grip from gain reduction: closes as the pull begins. */
const gripOf = (gr) => clamp(gr / 2.5);

// ── Stick ──
function stickAt(t) {
    const REST = 0.42;
    const UP = 0.7;
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
/** Short blinks every few seconds after `from`. */
function blink(t, from) {
    if (t < from) return 0;
    const p = (t - from) % 3.7;
    return p < 0.14 ? Math.sin((p / 0.14) * Math.PI) : 0;
}

// ══ Stage: the hook, and the same hook replayed before the end ══
const ST = { sn: { x: 300, y: 600, s: 1.05 }, cb: { x: 800, y: 640, s: 1.0 }, scope: { x0: 120, x1: 900, top: 990, base: 1270 } };
const knobK = (ms) => (Math.log10(ms) + 1) / 3;
function attackMsAt(t) {
    const kw = wt('knob', 'knob');
    const tw = [[4.98, 1], [5.2, 30], [kw + 0.05, 30], [kw + 0.25, 1], [kw + 0.45, 1], [kw + 0.65, 30], [64.9, 30], [65.0, 1], [66.98, 1], [67.2, 30]];
    return Math.exp(keys(t, tw.map(([a, b]) => [a, Math.log(b)])));
}
function grAt(t) {
    for (const d of D.demos) if (t >= d.at && t < d.to) return d.gr[Math.floor((t - d.at) * D.rate)] ?? 0;
    return 0;
}

/** The "snare up close" scope under the drum: what you hear, A against B. */
function hookScope(t, alpha, replay) {
    const [a, b] = replay ? ['A2', 'B2'] : ['A', 'B'];
    const box = ST.scope;
    const A = latestZoom(a, Math.min(t, demoBy[a].to));
    const B = t >= demoBy[b].at ? latestZoom(b, t) : null;
    const playing = [a, b].find((id) => t >= demoBy[id].at && t < demoBy[id].to);
    g.save();
    g.globalAlpha *= alpha;
    rr(g, box.x0 - 50, box.top - 150, box.x1 - box.x0 + 100, box.base - box.top + 200, 30);
    g.fillStyle = playing ? 'rgba(125,211,252,0.07)' : 'rgba(255,255,255,0.04)';
    g.fill();
    g.strokeStyle = playing ? 'rgba(125,211,252,0.5)' : 'rgba(255,255,255,0.07)';
    g.lineWidth = 3;
    g.stroke();
    label(g, replay ? 'Now listen again' : 'The snare, up close', box.x0 - 14, box.top - 88, { size: replay ? 48 : 42, weight: 800, color: P.ink });
    if (playing) speaker(g, box.x1 + 6, box.top - 104, 0.85, 0.5 + 0.5 * Math.sin(t * 20));
    g.strokeStyle = P.ink4;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(box.x0, box.base);
    g.lineTo(box.x1, box.base);
    g.stroke();
    // A: filled while it plays, then a dashed outline to compare against.
    if (A) {
        if (!B) area(g, box, A.z.heard, HEARD_MAX, A.n);
        else curve(g, box, A.z.heard, HEARD_MAX, { color: P.ink, width: 5, dash: [14, 10], alpha: 0.85 });
    }
    if (B) area(g, box, B.z.heard, HEARD_MAX, B.n);
    // Legend, written on the plot.
    const lx = box.x1 - 10;
    if (A && !B) label(g, '1 ms attack', lx, box.top - 40, { size: 38, weight: 700, color: P.ink, align: 'right' });
    if (B) {
        label(g, '30 ms attack', lx, box.top - 40, { size: 38, weight: 700, color: P.cyan, align: 'right' });
        label(g, '- - 1 ms attack', lx, box.top + 4, { size: 34, weight: 600, color: P.ink2, align: 'right' });
    }
    g.restore();
    // Verdict: pills in the lane above the plot, leaders to the two cracks.
    if (!replay && A && B) {
        const peakA = Math.max(...A.z.heard.slice(0, CRACK));
        const peakB = Math.max(...B.z.heard.slice(0, CRACK));
        const cx = box.x0 + ((box.x1 - box.x0) * (CRACK * 0.5)) / (ZN - 1);
        const yA = box.base - (box.base - box.top) * clamp(peakA / HEARD_MAX);
        const yB = box.base - (box.base - box.top) * clamp(peakB / HEARD_MAX);
        const bi = Math.round(ZN * 0.3);
        const xA = box.x0 + ((box.x1 - box.x0) * bi) / (ZN - 1);
        const yAb = box.base - (box.base - box.top) * clamp(A.z.heard[bi] / HEARD_MAX);
        tag(g, 'flat', 660, box.top + 120, { x: xA, y: yAb }, { a: alpha * popIn(t, wt('flat', 'flat')), bg: P.ink, size: 42 });
        tag(g, 'punchy', 470, box.top + 40, { x: cx + 6, y: yB }, { a: alpha * popIn(t, wt('punchy', 'punchy')), bg: P.amber, fg: P.dark, size: 42, weight: 800 });
        void yA;
    }
    if (replay) {
        const cx = box.x0 + ((box.x1 - box.x0) * (CRACK * 0.5)) / (ZN - 1);
        const top = (z) => box.base - (box.base - box.top) * clamp(Math.max(...z.heard.slice(0, CRACK)) / HEARD_MAX);
        if (A && !B) tag(g, 'crack squashed', 520, box.top + 60, { x: cx + 10, y: top(A.z) }, { a: alpha * popIn(t, demoBy[a].at + 0.55), bg: P.ink, size: 40 });
        if (B) tag(g, 'crack gets through', 540, box.top + 40, { x: cx + 6, y: top(B.z) }, { a: alpha * popIn(t, demoBy[b].at + 0.55), bg: P.amber, fg: P.dark, size: 40, weight: 800 });
    }
}

function drawStage(t) {
    const replay = t >= 60;
    const t0 = replay ? 64.2 : 0;
    const t1 = replay ? 69.1 : 11.65;
    if (t < t0 - 0.01 || t > t1 + 0.25) return;
    // Fade: in at the replay, out into the box or the end card.
    const alpha = (replay ? E.out(seg(t, 64.32, 64.5)) : 1) * (1 - seg(t, t1 - 0.2, t1));
    const kWord = wt('knob', 'knob');
    const push = replay ? 0 : E.inOut(seg(t, kWord - 0.6, kWord));
    const dive = replay ? 0 : E.in(seg(t, 11.25, 11.65));
    const fx = lerp(540, ST.cb.x + 84 * ST.cb.s, Math.max(push * 0.6, dive));
    const fy = lerp(960, ST.cb.y, Math.max(push * 0.6, dive));
    const z = lerp(1, 1.35, push) * (1 + 2.2 * dive);
    g.save();
    g.globalAlpha = alpha;
    g.translate(540, 960);
    g.scale(z, z);
    g.translate(-fx, -fy);
    let kick = 0;
    for (const h of HITS) if (h.voice === 'kick' && h.demo && t >= h.t && t - h.t < 0.2) kick = Math.max(kick, 1 - (t - h.t) / 0.2);
    const ring = lastSnare(t);
    snareDrum(g, ST.sn.x, ST.sn.y, ST.sn.s * (1 + 0.012 * kick), { stick: stickAt(t), ring, squash: ring < 0.12 ? 1 - ring / 0.12 : 0 });
    const pop = replay ? 1 : E.outBack(seg(t, 1.22, 1.6));
    if (pop > 0) {
        const pulses = [];
        for (const h of HITS) if ((h.voice === 'snare' || h.voice === 'kick') && t >= h.t && t - h.t < 0.3 && h.demo) pulses.push({ u: (t - h.t) / 0.3, a: 1 - (t - h.t) / 0.3 });
        g.save();
        g.globalAlpha *= clamp(pop * 1.4);
        cable(g, { x: 470, y: 772 }, { x: ST.cb.x - 200 * ST.cb.s, y: ST.cb.y + 44 * ST.cb.s }, { x: 560, y: 860 }, { x: 520, y: 700 }, pulses);
        g.restore();
        const ms = attackMsAt(t);
        compressorBox(g, ST.cb.x, ST.cb.y, ST.cb.s * pop, { k: knobK(ms), value: msLabel(ms), glow: replay ? 0 : bump(t, kWord, 0.2, 1.2) });
    }
    g.restore();
    // Title on the opening frames, then the scope.
    if (!replay) {
        const ta = 1 - seg(t, 2.0, 2.3);
        if (ta > 0) {
            label(g, 'Flat or punchy?', 540, 1120, { size: 92, weight: 800, color: P.ink, align: 'center', alpha: ta });
        }
    }
    const sa = (replay ? 1 : E.out(seg(t, 2.3, 2.6))) * (1 - push) * alpha;
    if (sa > 0) hookScope(t, sa, replay);
}

// ══ Inside the box: in, the hand on the fader, out ══
const IN = { inX: 190, faderX: 470, outX: 760, top: 520, bottom: 1130, thr: 0.62, shelf: 452 };
function insideState(t) {
    const tCross = wt('pull', 'crosses');
    const tPull = wt('pull', 'pulls') - 0.1;
    const idle = 0.3 + 0.05 * Math.sin(t * 3.1) + 0.035 * Math.sin(t * 7.3 + 1) + 0.02 * Math.sin(t * 13.7 + 2);
    const surge = E.out(seg(t, tCross, tCross + 0.3));
    const pull = E.inOut(seg(t, tPull, tPull + 0.55));
    const high = 0.93 + 0.015 * Math.sin(t * 9);
    const inLevel = lerp(idle, high, surge);
    // What the fader lets out: everything, until the hand pulls it down.
    const outLevel = lerp(inLevel, IN.thr + 0.05 + 0.01 * Math.sin(t * 9), pull * surge);
    return { inLevel, outLevel, gr: 9 * pull, pull, thrDraw: E.out(seg(t, 17.0, 17.45)) };
}
function drawInside(t) {
    if (t < 11.62 || t > 20.65) return;
    const a = E.out(seg(t, 11.64, 11.86)) * (1 - seg(t, 20.25, 20.45));
    const z = lerp(1.25, 1, E.out(seg(t, 11.64, 12.3)));
    g.save();
    g.globalAlpha = a;
    g.translate(540, 820);
    g.scale(z, z);
    g.translate(-540, -820);
    panel(g);
    const st = insideState(t);
    meter(g, IN.inX, IN.top, IN.bottom, st.inLevel, IN.thr);
    meter(g, IN.outX, IN.top, IN.bottom, st.outLevel, IN.thr);
    for (const [x, s] of [[IN.inX, 'in'], [IN.faderX, 'fader'], [IN.outX, 'out']]) label(g, s, x, IN.bottom + 66, { size: 40, weight: 700, color: P.ink2, align: 'center' });
    const thrY = IN.bottom - IN.thr * (IN.bottom - IN.top);
    if (st.thrDraw > 0) {
        dashed(g, IN.inX - 70, thrY, lerp(IN.inX - 70, IN.outX + 70, st.thrDraw), thrY, P.ink, 5);
        pill(g, 'threshold', (IN.inX + IN.faderX) / 2 - 6, thrY - 48, { size: 36, bg: P.ink, fg: P.dark, alpha: st.thrDraw, scale: E.outBack(st.thrDraw) });
    }
    // Arrows: in → fader → out.
    g.strokeStyle = P.ink4;
    g.lineWidth = 5;
    g.lineCap = 'round';
    for (const [x0, x1] of [[IN.inX + 70, IN.faderX - 100], [IN.faderX + 100, IN.outX - 70]]) {
        const y = IN.bottom - 30;
        g.beginPath();
        g.moveTo(x0, y);
        g.lineTo(x1, y);
        g.moveTo(x1 - 14, y - 12);
        g.lineTo(x1, y);
        g.lineTo(x1 - 14, y + 12);
        g.stroke();
    }
    const capY = fader(g, IN.faderX, IN.top, IN.bottom, st.gr, { ticks: false });
    // Robot on its shelf above the fader: the glove arrives on "hand".
    const tHand = wt('hand', 'hand');
    const tRest = wt('hand', 'resting');
    const appear = E.outBack(seg(t, tHand - 0.25, tHand + 0.1));
    const reach = E.inOut(seg(t, tHand, tRest + 0.1));
    const grip = t < tRest ? 0 : lerp(0.35, 1, st.pull) * E.out(seg(t, tRest, tRest + 0.3)) + (t >= tRest ? 0 : 0);
    const tEye = wt('watch', 'watches') - 0.05;
    const lid = t < tEye ? 0.85 : t < tEye + 0.15 ? 0.85 * (1 - (t - tEye) / 0.15) : blink(t, tEye + 1.6);
    const look = t > tEye ? { x: IN.inX, y: IN.bottom - st.inLevel * (IN.bottom - IN.top) } : { x: IN.faderX, y: capY };
    if (appear > 0) {
        g.save();
        g.globalAlpha *= clamp(appear * 1.5);
        const sc = lerp(0.6, 1, appear);
        g.translate(IN.faderX, IN.shelf);
        g.scale(sc, sc);
        g.translate(-IN.faderX, -IN.shelf);
        robotTop(g, IN.faderX, IN.shelf, capY - 38, { grip, look, lid, s: 0.72, reach });
        g.restore();
    }
    g.restore();
}

// ══ Parts: crack and body of one snare hit ══
const PT = { x0: 110, x1: 970, top: 560, base: 1120 };
function drawParts(t) {
    if (t < 20.3 || t > 26.75) return;
    const a = E.out(seg(t, 20.35, 20.55)) * (1 - seg(t, 26.5, 26.7));
    g.save();
    g.globalAlpha = a;
    label(g, 'One snare hit, up close', PT.x0, 360, { size: 48, weight: 800, color: P.ink });
    g.strokeStyle = P.ink4;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(PT.x0, PT.base);
    g.lineTo(PT.x1, PT.base);
    g.stroke();
    for (const ms of [0, 50, 100, 150]) {
        const x = lerp(PT.x0, PT.x1, ms / 150);
        label(g, ms === 150 ? '150 ms' : String(ms), x, PT.base + 56, { size: 36, weight: 600, color: P.ink2, align: ms === 150 ? 'right' : ms === 0 ? 'left' : 'center', family: BODY });
    }
    const tHit = 20.62;
    const upto = clamp((t - tHit) / 0.15) * ZN;
    const cA = popIn(t, wt('crack', 'crack'));
    const bA = popIn(t, wt('body', 'body'));
    const box = { x0: PT.x0, x1: PT.x1, top: PT.top, base: PT.base };
    area(g, box, SN.env, LONE_MAX, upto, { colors: ['rgba(248,250,252,0.22)', 'rgba(248,250,252,0.22)'] });
    if (cA > 0) area(g, box, SN.env, LONE_MAX, Math.min(upto, CRACK + 1), { colors: [P.amber, P.amber], alpha: cA });
    if (bA > 0) {
        g.save();
        g.beginPath();
        g.rect(lerp(PT.x0, PT.x1, CRACK / (ZN - 1)), 0, W, H);
        g.clip();
        area(g, box, SN.env, LONE_MAX, upto, { colors: [P.cyan, P.cyan], alpha: bA });
        g.restore();
    }
    curve(g, box, SN.env, LONE_MAX, { upto, color: P.ink, width: 4 });
    const tTwo = wt('parts', 'two');
    const dv = E.out(seg(t, tTwo, tTwo + 0.4));
    const sx = lerp(PT.x0, PT.x1, CRACK / (ZN - 1));
    if (dv > 0) dashed(g, sx, PT.top - 60, sx, lerp(PT.top - 60, PT.base, dv), P.ink, 4, [12, 10]);
    const yC = PT.base - (PT.base - PT.top) * clamp(Math.max(...SN.env.slice(0, CRACK)) / LONE_MAX);
    tag(g, 'crack', 330, 470, { x: lerp(PT.x0, sx, 0.5), y: yC }, { a: cA, bg: P.amber, fg: P.dark, size: 44, weight: 800 });
    const bx = lerp(PT.x0, PT.x1, 0.42);
    const by = PT.base - (PT.base - PT.top) * clamp(SN.env[Math.round(0.063 * ZR)] / LONE_MAX);
    tag(g, 'body', 700, 640, { x: bx, y: by }, { a: bA, bg: P.cyan, fg: P.dark, size: 44, weight: 800 });
    g.restore();
}

// ══ Rig: inside the box, a hit on the screen and the hand on its fader ══
const RG = { x0: 110, x1: 670, top: 600, base: 990, trTop: 1104, trBot: 1214, faderX: 830, fTop: 580, fBot: 1040, shelf: 506 };
const SWEEPS = {
    fast: [[wt('fast', 'catches') - 0.1, 0], [wt('fast', 'squashes') - 0.35, 20], [vEnd('fast') + 0.15, 150]],
    slow: [[wt('slips', 'crack'), 0], [wt('slips', 'past') + 0.25, 20], [wt('slips', 'and'), 28], [vEnd('slips'), 150]],
    hold: [[47.6, 0.4], [wt('hold', 'arrives') + 0.25, 1.62]],
    fresh: [[55.55, 0.4], [wt('fresh', 'fresh') + 0.3, 1.62]],
};
const LETGO = { from: wt('release', 'lets') + 0.05, dur: 0.75 };
const COMPARE = { 'demo-slow': 'fast', 'demo-tempo': 'hold' };
const COMPARE_LABEL = { fast: '1 ms', slow: '30 ms', hold: '2.5 s release', tempo: '90 ms release' };

/** What the rig shows at t for its scene: the screen, the trace and the gain now. */
function rigState(sc, t) {
    const set = SETTINGS[sc.setting];
    const lone = sc.setting === 'FAST' ? 'FAST' : 'SLOW';
    if (sc.mode === 'intro' || sc.mode === 'slowmo' || sc.mode === 'letgo') {
        const gr = D.snare[lone].gr;
        let pos = 0;
        let full = false;
        if (sc.mode === 'slowmo') pos = (keys(t, SWEEPS[sc.id]) / 1000) * ZR;
        if (sc.mode === 'letgo') {
            full = true;
            let pk = 0;
            for (let i = 1; i < ZN; i++) if (gr[i] > gr[pk]) pk = i;
            pos = lerp(pk, ZN - 1, E.inOut(seg(t, LETGO.from, LETGO.from + LETGO.dur)));
            return { kind: 'hit', inV: SN.env, outV: SN[lone], vmax: LONE_MAX, pos, full, gr, trN: ZN, trPos: ZN, grNow: gr[Math.floor(pos)], relFrom: pk, slow: t > LETGO.from && t < LETGO.from + LETGO.dur };
        }
        const sw = SWEEPS[sc.id];
        const grNow = sc.mode === 'intro' ? 6 * bump(t, wt('attack', 'grabs') - 0.05, 0.08, 0.4) : gr[Math.floor(clamp(pos, 0, ZN - 1))];
        return { kind: 'hit', inV: SN.env, outV: SN[lone], vmax: LONE_MAX, pos, full: false, showOut: sc.mode === 'slowmo', gr, trN: ZN, trPos: sc.mode === 'slowmo' ? pos : 0, grNow, slow: sw && t > sw[0][0] - 0.3 && t < sw[sw.length - 1][0] + 0.2 };
    }
    const id = sc.demo ?? (sc.id === 'hold' ? 'hold' : 'tempo');
    const d = demoBy[id];
    if (sc.mode === 'live') {
        const n = Math.round(TL.bar * D.rate);
        const off = Math.max(0, Math.floor((t - d.at) / TL.bar)) * n;
        const trPos = clamp(t - d.at - off / D.rate, 0, TL.bar) * D.rate;
        const zm = latestZoom(id, t);
        return { kind: 'listen', id, zoom: zm, gr: d.gr.slice(off, off + n), trN: n, trPos, grNow: d.gr[Math.floor((t - d.at) * D.rate)] ?? 0, onsets: HITS.filter((h) => h.demo === id && h.voice === 'snare').map((h) => (h.t - d.at) * D.rate - off), set };
    }
    // Groove: the bar replayed slowly; the screen shows the snare under the playhead.
    const [a, b] = [0.4, 1.62];
    const i0 = Math.round(a * D.rate);
    const n = Math.round((b - a) * D.rate);
    const sw = SWEEPS[sc.id];
    const tt = keys(t, sw);
    const trPos = (tt - a) * D.rate;
    let zm = null;
    for (const z of d.zooms) if (z.t - d.at <= tt) zm = { z, n: clamp((tt - (z.t - d.at)) * ZR, 0, ZN) };
    return { kind: 'groove', id, zoom: zm, gr: d.gr.slice(i0, i0 + n), trN: n, trPos, grNow: d.gr[Math.floor(tt * D.rate)] ?? 0, onsets: d.zooms.map((z) => (z.t - d.at) * D.rate - i0), slow: t > sw[0][0] - 0.3 && t < sw[1][0] + 0.2, set };
}

function rigHeader(sc, t) {
    const isRelease = ['letgo', 'groove'].includes(sc.mode) || ['demo-hold', 'demo-tempo'].includes(sc.id);
    const word = isRelease ? 'Release' : 'Attack';
    const S = SETTINGS[sc.setting];
    let value = isRelease ? msLabel(S.release * 1000) : msLabel(S.attack * 1000);
    let show = 1;
    if (sc.id === 'attack') show = clamp((t - wt('fast', 'one')) / 0.2);
    if (sc.id === 'slow' && t < wt('slow', 'thirty')) value = msLabel(1);
    const y = 392;
    const k = isRelease ? clamp(Math.log10(S.release * 1000) / Math.log10(2500)) : knobK(S.attack * 1000);
    stopwatch(g, 128, y - 24, 30, k * show);
    label(g, word, 184, y, { size: 68, weight: 800, color: P.ink });
    font(g, 68, 800);
    const wx = 184 + g.measureText(word).width + 22;
    if (show > 0) label(g, value, wx, y, { size: 68, weight: 800, color: P.cyan, alpha: show });
}

function drawRig(t) {
    if (t < 26.55 || t > 61.15) return;
    const a = E.out(seg(t, 26.6, 26.85)) * (1 - seg(t, 60.95, 61.12));
    const sc = sceneAt(t);
    const cur = sc.view === 'rig' ? sc : TL.scenes.filter((s) => s.view === 'rig').pop();
    const S = rigState(cur, t);
    g.save();
    g.globalAlpha = a;
    panel(g);
    rigHeader(cur, t);
    const box = { x0: RG.x0, x1: RG.x1, top: RG.top, base: RG.base };
    const hgt = RG.base - RG.top;
    const live = S.kind === 'listen';
    // Screen.
    rr(g, RG.x0 - 40, RG.top - 50, RG.x1 - RG.x0 + 80, hgt + 90, 26);
    g.fillStyle = '#081022';
    g.fill();
    g.strokeStyle = live ? 'rgba(125,211,252,0.6)' : 'rgba(255,255,255,0.08)';
    g.lineWidth = live ? 4 : 3;
    g.stroke();
    g.strokeStyle = P.ink4;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(RG.x0, RG.base);
    g.lineTo(RG.x1, RG.base);
    g.stroke();
    const ca = seg(t, cur.at, cur.at + 0.2);
    const X = (i) => RG.x0 + ((RG.x1 - RG.x0) * i) / (ZN - 1);
    const Yl = (v, vmax) => RG.base - hgt * clamp(v / vmax);
    g.save();
    g.globalAlpha *= ca;
    if (S.kind === 'hit') {
        // Mechanism: level in as an outline, level out (before makeup) filled.
        if (S.showOut || S.full) area(g, box, S.outV, S.vmax, S.full ? ZN : S.pos);
        curve(g, box, S.inV, S.vmax, { color: P.ink, width: 3, alpha: 0.75 });
        label(g, 'in', X(230), Yl(S.inV[230], S.vmax) - 18, { size: 36, weight: 700, color: P.ink2 });
        if ((S.showOut || S.full) && S.pos > 120) label(g, 'out', X(120) + 8, Yl(S.outV[120], S.vmax) - 14, { size: 36, weight: 700, color: P.cyan });
    } else if (S.zoom) {
        const zv = live ? S.zoom.z.heard : S.zoom.z.outS;
        const vmax = live ? HEARD_MAX : LONE_MAX;
        // Compare a "listen" view with the setting heard before it.
        const cmp = live && COMPARE[cur.id] ? latestZoom(COMPARE[cur.id], demoBy[COMPARE[cur.id]].to) : null;
        if (cmp) curve(g, box, cmp.z.heard, HEARD_MAX, { color: P.ink, width: 5, dash: [14, 10], alpha: 0.8 });
        area(g, box, zv, vmax, S.zoom.n);
        if (!live) curve(g, box, S.zoom.z.envS, LONE_MAX, { color: P.ink, width: 3, alpha: 0.75 });
        if (cmp) label(g, `- - ${COMPARE_LABEL[COMPARE[cur.id]]}`, RG.x1 - 6, RG.top + 50, { size: 34, weight: 600, color: P.ink2, align: 'right' });
    }
    g.restore();
    // Threshold, on the mechanism views (a level in, not a level heard).
    if (S.kind === 'hit' || S.kind === 'groove') {
        const thrY = Yl(SETTINGS.FAST.threshold, LONE_MAX);
        dashed(g, RG.x0 - 20, thrY, RG.x1 + 20, thrY, P.ink2, 4);
        label(g, 'threshold', RG.x0 - 16, thrY - 14, { size: 32, weight: 600, color: P.ink2, family: BODY });
    }
    // Screen title, inside its frame.
    const title = live ? `Listen: ${SETTINGS[cur.setting].label}` : S.kind === 'groove' ? 'The second snare, slowed down' : 'One snare, slowed down';
    label(g, title, RG.x0 - 14, RG.top - 10, { size: 34, weight: 700, color: live ? P.cyan : P.ink2, family: BODY });
    if (live) speaker(g, RG.x1 + 4, RG.top - 22, 0.7, 0.5 + 0.5 * Math.sin(t * 20));
    // Playhead on single-hit views.
    if (S.kind === 'hit' && (S.showOut || S.full) && S.pos > 0) {
        g.fillStyle = P.ink;
        g.fillRect(X(clamp(S.pos, 0, ZN - 1)) - 2, RG.top - 4, 4, hgt + 8);
    }
    // ── Trace: where the hand has had the fader ──
    rr(g, RG.x0 - 40, RG.trTop - 64, RG.x1 - RG.x0 + 80, RG.trBot - RG.trTop + 90, 22);
    g.fillStyle = '#081022';
    g.fill();
    label(g, 'How far the hand pulls', RG.x0 - 14, RG.trTop - 20, { size: 34, weight: 700, color: P.ink2, family: BODY });
    const trH = RG.trBot - RG.trTop;
    const TX = (i) => RG.x0 + ((RG.x1 - RG.x0) * i) / (S.trN - 1);
    const TY = (gr) => RG.trTop + trH * clamp(gr / 18);
    const m = Math.floor(clamp(S.trPos, 0, S.trN));
    if (m > 1) {
        g.beginPath();
        g.moveTo(RG.x0, RG.trTop);
        for (let k = 0; k < m; k++) g.lineTo(TX(k), TY(S.gr[k]));
        g.lineTo(TX(m - 1), RG.trTop);
        g.closePath();
        g.fillStyle = P.cyanDim;
        g.fill();
        g.beginPath();
        for (let k = 0; k < m; k++) (k ? g.lineTo : g.moveTo).call(g, TX(k), TY(S.gr[k]));
        g.strokeStyle = P.cyan;
        g.lineWidth = 5;
        g.stroke();
    }
    if (S.kind !== 'hit') {
        // Snare onsets on the trace, and the playhead.
        for (const o of S.onsets ?? []) {
            if (o < 0 || o >= S.trN) continue;
            g.fillStyle = P.amber;
            g.beginPath();
            g.arc(TX(o), RG.trTop - 4, 7, 0, Math.PI * 2);
            g.fill();
        }
        g.fillStyle = P.ink;
        g.fillRect(TX(clamp(S.trPos, 0, S.trN - 1)) - 2, RG.trTop - 8, 4, trH + 16);
    }
    // ── Annotations, in the lanes above the screen and below the trace ──
    const laneY = RG.top - 112;
    if (cur.id === 'fast') {
        const pk = Math.max(...SN.FAST.slice(0, CRACK));
        tag(g, 'crack squashed', 360, laneY, { x: X(CRACK / 2), y: Yl(pk, LONE_MAX) }, { a: popIn(t, wt('fast', 'squashes')), bg: P.dark, fg: P.amber, ring: P.amber, size: 38 });
    }
    if (cur.id === 'slow') {
        const tP = wt('punch', 'punch') - 0.1;
        const pk = Math.max(...SN.SLOW.slice(0, CRACK));
        if (t < tP) tag(g, 'crack gets through', 380, laneY, { x: X(CRACK / 2), y: Yl(pk, LONE_MAX) }, { a: popIn(t, wt('slips', 'past') - 0.2), bg: P.dark, fg: P.amber, ring: P.amber, size: 38 });
        else tag(g, 'punch', 300, laneY, { x: X(CRACK / 2), y: Yl(pk, LONE_MAX) }, { a: popIn(t, tP), bg: P.amber, fg: P.dark, size: 46, weight: 800 });
        const bi = Math.round(0.06 * ZR);
        tag(g, 'body turned down', 470, RG.top + 110, { x: X(bi), y: Yl(SN.SLOW[bi], LONE_MAX) }, { a: popIn(t, wt('slips', 'body') - 0.1), bg: P.dark, fg: P.cyan, ring: P.cyan, size: 36 });
    }
    if (cur.id === 'release') {
        g.beginPath();
        for (let k = S.relFrom; k < ZN; k++) (k > S.relFrom ? g.lineTo : g.moveTo).call(g, TX(k), TY(S.gr[k]));
        g.strokeStyle = P.ink;
        g.lineWidth = 8;
        g.stroke();
        tag(g, 'release', 520, RG.trTop + 22, { x: TX(lerp(S.relFrom, ZN, 0.55)), y: TY(S.gr[Math.round(lerp(S.relFrom, ZN, 0.55))]) }, { a: popIn(t, LETGO.from - 0.25), bg: P.ink, size: 38 });
    }
    if (cur.id === 'hold' || cur.id === 'fresh') {
        // A ruler for the release time, against the gap between the hits.
        const msPx = (RG.x1 - RG.x0) / ((1.62 - 0.4) * 1000);
        const rel = SETTINGS[cur.setting].release * 1000;
        const rx0 = RG.x0;
        const rx1 = Math.min(RG.x1 + 20, rx0 + rel * msPx);
        const ry = RG.trBot + 22;
        g.strokeStyle = P.ink2;
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(rx0, ry - 10);
        g.lineTo(rx0, ry + 10);
        g.moveTo(rx0, ry);
        g.lineTo(rx1, ry);
        if (rx0 + rel * msPx > RG.x1 + 20) {
            g.moveTo(rx1 - 14, ry - 10);
            g.lineTo(rx1, ry);
            g.lineTo(rx1 - 14, ry + 10);
        } else {
            g.moveTo(rx1, ry - 10);
            g.lineTo(rx1, ry + 10);
        }
        g.stroke();
        label(g, `release ${msLabel(rel)}`, rx1 + (rx1 > RG.x1 ? -6 : 12), ry + 44, { size: 32, weight: 600, color: P.ink2, align: rx1 > RG.x1 ? 'right' : 'left', family: BODY });
        const o2 = (S.onsets ?? [])[1];
        if (cur.id === 'hold' && o2 !== undefined) {
            const pk = S.zoom ? Math.max(...S.zoom.z.outS.slice(0, CRACK)) : 0;
            const second = S.zoom && S.zoom.z === demoBy.hold.zooms[1];
            tag(g, 'still holding', TX(o2) - 170, RG.trTop + 22, { x: TX(o2), y: TY(S.gr[Math.max(0, Math.floor(o2))]) }, { a: popIn(t, wt('hold', 'arrives') - 0.1), bg: P.ink, size: 36 });
            if (second) tag(g, 'crack squashed', 380, laneY, { x: X(CRACK / 2), y: Yl(pk, LONE_MAX) }, { a: popIn(t, wt('flatgroove', 'flat') - 0.3), bg: P.dark, fg: P.amber, ring: P.amber, size: 38 });
        }
        if (cur.id === 'fresh' && S.zoom) {
            const pk = Math.max(...S.zoom.z.outS.slice(0, CRACK));
            tag(g, 'fresh crack', 360, laneY, { x: X(CRACK / 2), y: Yl(pk, LONE_MAX) }, { a: popIn(t, wt('fresh', 'fresh') - 0.1), bg: P.amber, fg: P.dark, size: 40, weight: 800 });
        }
    }
    // ── Fader and the robot's hand on it ──
    const fs = 0.8;
    const capY = fader(g, RG.faderX, RG.fTop, RG.fBot, Math.max(-1.2, S.grNow), { ticks: true, size: fs });
    let grip = gripOf(S.grNow);
    if (cur.id === 'attack') grip = Math.max(grip, 0.25);
    if (cur.mode === 'letgo') grip = clamp(S.grNow / 6);
    const look = { x: S.kind === 'hit' ? X(clamp(S.pos, 0, ZN - 1)) : TX(clamp(S.trPos, 0, S.trN - 1)), y: RG.top + 150 };
    robotTop(g, RG.faderX, RG.shelf, capY - 38 * fs, { grip, look, lid: blink(t, 27.3), s: 0.62 });
    g.restore();
}

// ══ The rule ══
function drawRule(t) {
    if (t < 60.95 || t > 64.35) return;
    const a = E.out(seg(t, 60.98, 61.18)) * (1 - seg(t, 64.18, 64.32));
    g.save();
    g.globalAlpha = a;
    const cards = [
        { y: 320, at: voBy['rule-a'].at, word: 'Attack', k: knobK(30) },
        { y: 830, at: voBy['rule-r'].at, word: 'Release', k: 0.45 },
    ];
    let beat = 0;
    for (const h of HITS) if (h.demo === 'tempo' && h.voice === 'snare' && t >= h.t && t - h.t < 0.25) beat = Math.max(beat, 1 - (t - h.t) / 0.25);
    for (const [ci, c] of cards.entries()) {
        const k = popIn(t, c.at - 0.15);
        if (k <= 0) continue;
        g.save();
        g.globalAlpha *= k;
        const sc = lerp(0.92, 1, E.outBack(k));
        g.translate(540, c.y + 220);
        g.scale(sc, sc);
        g.translate(-540, -(c.y + 220));
        rr(g, 60, c.y, 880, 440, 40);
        g.fillStyle = 'rgba(22,35,63,0.94)';
        g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.07)';
        g.lineWidth = 3;
        g.stroke();
        knob(g, 200, c.y + 190, 76, c.k + 0.03 * Math.sin(t * 2 + ci));
        label(g, c.word, 200, c.y + 360, { size: 52, weight: 800, color: P.ink, align: 'center' });
        if (ci === 0) {
            // Two hits as you hear them: 1 ms (flat) and 30 ms (punchy).
            const za = demoBy.A.zooms[1];
            const zb = demoBy.B.zooms[1];
            for (const [i, z, lab] of [[0, za, '1 ms'], [1, zb, '30 ms']]) {
                const x0 = 360 + i * 290;
                const s = 1 + (i === 1 ? 0.05 * beat : 0);
                g.save();
                g.translate(x0 + 120, c.y + 300);
                g.scale(s, s);
                area(g, { x0: -120, x1: 120, top: -230, base: 0 }, z.heard, HEARD_MAX);
                g.restore();
                label(g, lab, x0 + 120, c.y + 360, { size: 40, weight: 700, color: i ? P.amber : P.ink2, align: 'center' });
            }
        } else {
            // The hand over a bar: 2.5 s never lets go, 90 ms breathes.
            for (const [i, id, lab] of [[0, 'hold', '2.5 s'], [1, 'tempo', '90 ms']]) {
                const d = demoBy[id];
                const x0 = 360 + i * 290;
                const n = Math.round(TL.bar * D.rate);
                g.strokeStyle = P.ink4;
                g.lineWidth = 3;
                g.beginPath();
                g.moveTo(x0, c.y + 110);
                g.lineTo(x0 + 240, c.y + 110);
                g.stroke();
                g.beginPath();
                for (let q = 0; q < n; q += 5) (q ? g.lineTo : g.moveTo).call(g, x0 + (240 * q) / n, c.y + 110 + 190 * clamp(d.gr[q] / 18));
                g.strokeStyle = i ? P.cyan : P.ink2;
                g.lineWidth = 5;
                g.stroke();
                label(g, lab, x0 + 120, c.y + 360, { size: 40, weight: 700, color: i ? P.cyan : P.ink2, align: 'center' });
            }
        }
        g.restore();
    }
    g.restore();
}

// ══ End: who made it, the lesson's demo on a phone, the address ══
const PH = { x: 540, top: 330, w: 520, h: 860 };
function drawEnd(t) {
    if (t < 68.95) return;
    const a = E.out(seg(t, 69.0, 69.3));
    g.save();
    g.globalAlpha = a;
    const btn = bump(t, 75, 0.08, 0.6);
    avatar(g, 132, 212, 62 * (1 + 0.08 * btn));
    label(g, 'Virzy Guns', 222, 204, { size: 54, weight: 800, color: P.ink });
    label(g, TL.lesson.tagline, 222, 256, { size: 36, weight: 600, color: P.ink2 });
    const sw = PH.w - 28;
    const sh = PH.h - 28;
    const x0 = PH.x - PH.w / 2;
    const lift = E.outBack(seg(t, 69.05, 69.6));
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
    if (k > 0) pill(g, TL.lesson.url, 540, 1260, { size: 56, bg: P.cyan, fg: P.dark, scale: lerp(0.85, 1, E.outBack(k)) * (1 + 0.04 * btn), alpha: clamp(k * 3), weight: 800 });
    g.restore();
}

// ══ Words on screen: the narration, word by word, two lines at most ══
const KEYWORD = { crack: P.amber, body: P.cyan };
const LISTEN = { A: 'Listen: 1 ms attack', B: 'Listen: 30 ms attack', fast: 'Listen: 1 ms attack', slow: 'Listen: 30 ms attack', hold: 'Listen: 2.5 s release', tempo: 'Listen: 90 ms release', A2: '1 ms attack', B2: '30 ms attack' };
function subtitles(t) {
    const v = VO.filter((x) => t >= x.at - 0.12 && t <= x.at + x.dur + 0.3).pop();
    if (!v) {
        // During a demo with no narration: say what to listen for.
        const d = D.demos.find((q) => t >= q.at && t < q.to);
        if (d && LISTEN[d.id]) {
            const a = clamp((t - d.at) / 0.15) * (1 - clamp((t - d.to + 0.15) / 0.15));
            label(g, LISTEN[d.id], 510, 1408, { size: 54, weight: 700, color: P.cyan, align: 'center', alpha: a });
        }
        return;
    }
    const fadeIn = clamp((t - v.at + 0.12) / 0.12);
    const fadeOut = 1 - clamp((t - (v.at + v.dur + 0.1)) / 0.2);
    const size = 54;
    font(g, size, 600);
    const space = g.measureText(' ').width;
    const maxW = 780;
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
    g.textBaseline = 'middle';
    page.forEach((line, li) => {
        const total = line.reduce((s, w) => s + w.width, 0) + space * (line.length - 1);
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
    const a = 1 - seg(t, 68.7, 68.95);
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
    ground(g, t, Math.max(bump(t, 59, 0.05, 0.9), 0.3 * kick));
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
function drawCover() {
    draw(9.3, { words: false });
    label(g, 'Flat or punchy?', 540, 1420, { size: 92, weight: 800, color: P.ink, align: 'center' });
    label(g, 'One knob decides.', 540, 1520, { size: 64, weight: 700, color: P.cyan, align: 'center' });
}

window.seek = (t) => draw(t);
window.cover = () => drawCover();
window.filmReady = (async () => {
    await Promise.all(['600 54px', '800 74px', '700 34px', '500 30px'].map((f) => document.fonts.load(`${f} ${DISPLAY}`)));
    await Promise.all(['500 30px', '600 28px', '700 32px'].map((f) => document.fonts.load(`${f} ${BODY}`)));
    await DP.decode();
    if (SHOT) await Promise.all(Object.values(SHOT).map((i) => i.decode()));
    draw(0);
    return { duration: TL.duration, fps: TL.fps };
})();
