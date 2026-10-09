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
/** Mechanism (slowed-down) views show 0-100 ms, so the crack is a fifth of the width. */
const MN = Math.round(0.1 * ZR);
const CRACK = Math.round(0.02 * ZR);
const sceneAt = (t) => TL.scenes.filter((s) => s.at <= t).pop();
const SC = Object.fromEntries(TL.scenes.map((s) => [s.id, s.at]));
const DRY = HITS.filter((h) => !h.demo).map((h) => h.t);
const PARTS_HIT = () => DRY.find((x) => x >= SC.parts);
const BUTTON = TL.sfx.find((s) => s.kind === 'button').at;
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
function area(gc, box, vals, vmax, upto = box.n ?? ZN, { crack = CRACK, colors = [P.amber, P.cyan], alpha = 1 } = {}) {
    const N = box.n ?? ZN;
    const m = Math.min(vals.length, N, Math.floor(upto));
    if (m < 2) return;
    const X = (i) => box.x0 + ((box.x1 - box.x0) * i) / (N - 1);
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
function curve(gc, box, vals, vmax, { upto = box.n ?? ZN, color = P.ink, width = 4, dash = null, alpha = 1, n = box.n ?? ZN } = {}) {
    const m = Math.min(vals.length, n, Math.floor(upto));
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
    const a2 = demoBy.A2.at;
    const b2 = demoBy.B2.at;
    const tw = [[4.98, 1], [5.2, 30], [kw + 0.05, 30], [kw + 0.25, 1], [kw + 0.45, 1], [kw + 0.65, 30], [a2 - 0.1, 30], [a2, 1], [b2 - 0.02, 1], [b2 + 0.2, 30]];
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
    // A fills while it plays; once B plays, B fills and A is drawn dashed on
    // top, full width, crack included.
    if (B) area(g, box, B.z.heard, HEARD_MAX, B.n);
    else if (A) area(g, box, A.z.heard, HEARD_MAX, A.n);
    if (A && B) curve(g, box, A.z.heard, HEARD_MAX, { color: P.ink, width: 4, dash: [12, 9], alpha: 0.9 });
    const lx = box.x1 - 10;
    if (A && !B) label(g, '1 ms attack', lx, box.top - 40, { size: 38, weight: 700, color: P.ink, align: 'right' });
    if (B) {
        label(g, '30 ms attack', lx, box.top - 40, { size: 38, weight: 700, color: P.cyan, align: 'right' });
        label(g, '- - 1 ms attack', lx, box.top + 4, { size: 34, weight: 600, color: P.ink2, align: 'right' });
    }
    g.restore();
    if (A && B) compareCracks(g, box, A.z.heard, B.z.heard, alpha * popIn(t, demoBy[b].at + 0.55), replay ? null : [wt('flat', 'flat'), wt('punchy', 'punchy')], t);
    if (replay && B) {
        const ci = Math.round(CRACK * 0.45);
        const x = box.x0 + ((box.x1 - box.x0) * ci) / (ZN - 1);
        const y = box.base - (box.base - box.top) * clamp(B.z.heard[ci] / HEARD_MAX);
        tag(g, 'crack gets through', box.x0 + 360, box.top + 40, { x, y }, { a: alpha * popIn(t, demoBy[b].at + 0.6), bg: P.dark, fg: P.amber, ring: P.amber, size: 40 });
    }
    if (replay && A && !B) {
        const ci = Math.round(CRACK * 0.45);
        const x = box.x0 + ((box.x1 - box.x0) * ci) / (ZN - 1);
        const y = box.base - (box.base - box.top) * clamp(A.z.heard[ci] / HEARD_MAX);
        tag(g, 'crack squashed', box.x0 + 330, box.top + 60, { x, y }, { a: alpha * popIn(t, demoBy[a].at + 0.6), bg: P.dark, fg: P.amber, ring: P.amber, size: 40 });
    }
}

/**
 * Two "what you hear" hits compared. Level-matched, their cracks peak at
 * about the same height; what differs is the body: the 1 ms hit's body stays
 * up (flat), the 30 ms hit's body drops so its crack stands out (punchy).
 */
function compareCracks(gc, box, lo, hi, a, words, t) {
    if (a <= 0 || !words) return;
    const N = box.n ?? ZN;
    const X = (i) => box.x0 + ((box.x1 - box.x0) * i) / (N - 1);
    const Y = (v) => box.base - (box.base - box.top) * clamp(v / HEARD_MAX);
    const ci = Math.round(CRACK * 0.45);
    const bi = Math.round(N * 0.28);
    tag(gc, 'punchy', box.x0 + 330, box.top + 30, { x: X(ci), y: Y(hi[ci]) }, { a: a * popIn(t, words[1]), bg: P.dark, fg: P.amber, ring: P.amber, size: 40 });
    tag(gc, 'flat', box.x0 + 560, box.top + 120, { x: X(bi), y: Y(lo[bi]) }, { a: a * popIn(t, words[0]), bg: P.ink, size: 40 });
}

function drawStage(t) {
    const replay = t >= SC.rule;
    const tDive = vEnd('knob') + 0.02;
    const t0 = replay ? SC.replay : 0;
    const t1 = replay ? SC.end : tDive + 0.4;
    if (t < t0 - 0.01 || t > t1 + 0.25) return;
    // Fade: in at the replay, out into the box or the end card.
    const alpha = (replay ? E.out(seg(t, SC.replay + 0.12, SC.replay + 0.3)) : 1) * (1 - seg(t, t1 - 0.2, t1));
    const kWord = wt('knob', 'knob');
    const push = replay ? 0 : E.inOut(seg(t, kWord - 0.6, kWord));
    const dive = replay ? 0 : E.in(seg(t, tDive, tDive + 0.4));
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
    const tBox = wt('same-snare', 'compressor') - 0.08;
    const pop = replay ? 1 : E.outBack(seg(t, tBox, tBox + 0.38));
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
            // Slams in with the first hit, settles, and nudges on the second.
            const s0 = lerp(1.25, 1, E.outBack(seg(t, 0, 0.22))) * (1 + 0.05 * bump(t, DRY[1], 0.05, 0.25));
            g.save();
            g.translate(540, 1095);
            g.scale(s0, s0);
            label(g, 'Flat or punchy?', 0, 25, { size: 96, weight: 800, color: P.ink, align: 'center', alpha: ta });
            g.restore();
        }
    }
    const sa = (replay ? 1 : E.out(seg(t, 2.3, 2.6))) * (1 - push) * alpha;
    if (sa > 0) hookScope(t, sa, replay);
}

// ══ Inside the box: in, the hand on the fader, out ══
const IN = { inX: 190, faderX: 470, outX: 760, top: 520, bottom: 1130, thr: 0.62, shelf: 452 };
function insideState(t) {
    // The soft hits placed inside the box (dry hits between the narration's "crosses" and the cut).
    const hits = DRY.filter((h) => h > wt('pull', 'crosses') - 0.05 && h < SC.parts);
    const idle = 0.3 + 0.04 * Math.sin(t * 3.1) + 0.03 * Math.sin(t * 7.3 + 1) + 0.015 * Math.sin(t * 13.7 + 2);
    let inLevel = idle;
    for (const h of hits) {
        if (t < h) continue;
        const k = t - h;
        const env = Math.min(1, k / 0.06) * Math.exp(-Math.max(0, k - 0.06) / 0.42);
        inLevel = Math.max(inLevel, idle + (0.95 - idle) * env);
    }
    // From the second hit the hand works: what is over the threshold comes out at a quarter.
    const active = hits.length > 1 ? E.out(seg(t, hits[1] + 0.03, hits[1] + 0.09)) : 0;
    const over = Math.max(0, inLevel - IN.thr);
    const outLevel = inLevel - over * 0.75 * active;
    return { inLevel, outLevel, gr: 40 * (inLevel - outLevel), active, thrDraw: E.out(seg(t, voBy.pull.at, voBy.pull.at + 0.45)) };
}
function drawInside(t) {
    const tIn = vEnd('knob') + 0.32;
    if (t < tIn || t > SC.parts + 0.2) return;
    const a = E.out(seg(t, tIn, tIn + 0.22)) * (1 - seg(t, SC.parts - 0.05, SC.parts + 0.15));
    const z = lerp(1.25, 1, E.out(seg(t, tIn, tIn + 0.65)));
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
    const grip = t < tRest ? 0 : Math.max(0.6 * E.out(seg(t, tRest, tRest + 0.3)), gripOf(st.gr));
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
        robotTop(g, IN.faderX, IN.shelf, capY - 38, { grip, look, lid, s: 0.72, reach, pulse: seg(t, wt('hand', 'tiny'), wt('hand', 'tiny') + 0.6) });
        g.restore();
    }
    g.restore();
}

// ══ Parts: crack and body of one snare hit ══
const PT = { x0: 110, x1: 970, top: 560, base: 1120 };
function drawParts(t) {
    if (t < SC.parts || t > SC.attack + 0.2) return;
    const a = E.out(seg(t, SC.parts + 0.05, SC.parts + 0.25)) * (1 - seg(t, SC.attack - 0.05, SC.attack + 0.15));
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
    const tHit = PARTS_HIT();
    const upto = clamp((t - tHit) / 0.15) * ZN;
    const cA = popIn(t, wt('crack', 'crack') - 0.1, 0.2);
    const bA = popIn(t, wt('body', 'body') - 0.1, 0.2);
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
const RG = { x0: 110, x1: 670, top: 610, base: 990, trTop: 1100, trBot: 1200, faderX: 830, fTop: 580, fBot: 1040, shelf: 506 };
/** Mechanism scale: the hit at twice the size, its crack running off the top (with a soft edge). */
const MECH_MAX = Math.max(...SN.env) * 0.55;
const SWEEPS = {
    fast: [[wt('fast', 'catches') - 0.1, 0], [wt('fast', 'squashes') - 0.35, 20], [vEnd('fast') + 0.15, 100]],
    slow: [[wt('slips', 'crack'), 0], [wt('slips', 'past') + 0.25, 20], [wt('slips', 'and'), 28], [vEnd('slips'), 100]],
    hold: [[voBy.hold.at + 0.2, 0.4], [wt('hold', 'arrives') + 0.25, 1.62]],
    fresh: [[voBy.fresh.at + 0.25, 0.4], [wt('fresh', 'fresh') + 0.3, 1.62]],
};
const LETGO = { from: wt('release', 'lets') + 0.05, dur: 0.75 };
// Release demos as a strip of hits: 0.4-1.62 s of the bar (snare, kick, kick, snare).
const STRIP = { a: 0.4, b: 1.62 };
const STRIPS = (() => {
    const out = {};
    for (const id of ['hold', 'tempo']) {
        const d = demoBy[id];
        const k = undb(d.makeupDb);
        const i0 = Math.round(STRIP.a * D.rate);
        const n = Math.round((STRIP.b - STRIP.a) * D.rate);
        const heard = rmsSmooth(d.out.slice(i0, i0 + n), 2).map((v) => v * k);
        const ons = HITS.filter((h) => h.demo === id && (h.voice === 'snare' || h.voice === 'kick')).map((h) => ({ i: (h.t - d.at - STRIP.a) * D.rate, voice: h.voice })).filter((o) => o.i >= 0 && o.i < n);
        out[id] = { heard, n, ons };
    }
    return out;
})();
const STRIP_MAX = Math.max(...STRIPS.hold.heard, ...STRIPS.tempo.heard) / 0.92;

/** A strip of hits, each crack (20 ms from an onset) amber, the rest cyan. */
function stripArea(gc, box, S, vals, vmax, upto, alpha = 1) {
    const m = Math.min(S.n, Math.floor(upto));
    if (m < 2) return;
    const X = (i) => box.x0 + ((box.x1 - box.x0) * i) / (S.n - 1);
    const Y = (v) => box.base - (box.base - box.top) * clamp(v / vmax);
    const crack = (i) => S.ons.some((o) => i >= o.i && i < o.i + 20);
    gc.save();
    gc.globalAlpha *= alpha;
    let i = 0;
    while (i < m - 1) {
        const c = crack(i);
        let j = i;
        while (j < m - 1 && crack(j + 1) === c) j++;
        gc.beginPath();
        gc.moveTo(X(i), box.base);
        for (let q = i; q <= Math.min(j + 1, m - 1); q++) gc.lineTo(X(q), Y(vals[q]));
        gc.lineTo(X(Math.min(j + 1, m - 1)), box.base);
        gc.closePath();
        gc.fillStyle = c ? P.amber : P.cyan;
        gc.fill();
        i = j + 1;
    }
    gc.restore();
}

/** What the rig shows at t for its scene. */
function rigState(sc, t) {
    const lone = sc.setting === 'FAST' ? 'FAST' : 'SLOW';
    if (sc.mode === 'intro' || sc.mode === 'slowmo' || sc.mode === 'letgo') {
        const gr = D.snare[lone].gr;
        const base = { kind: 'hit', inV: SN.env, outV: SN[lone], gr, trN: MN };
        if (sc.mode === 'letgo') {
            let pk = 0;
            for (let i = 1; i < MN; i++) if (gr[i] > gr[pk]) pk = i;
            const pos = lerp(pk, MN - 1, E.inOut(seg(t, LETGO.from, LETGO.from + LETGO.dur)));
            return { ...base, pos, full: true, showOut: true, trPos: MN, grNow: gr[Math.floor(pos)], relFrom: pk, slow: t > LETGO.from && t < LETGO.from + LETGO.dur };
        }
        const sw = SWEEPS[sc.id];
        const pos = sw ? (keys(t, sw) / 1000) * ZR : 0;
        const grNow = sc.mode === 'intro' ? 6 * bump(t, wt('attack', 'grabs') - 0.05, 0.08, 0.4) : gr[Math.floor(clamp(pos, 0, MN - 1))];
        return { ...base, pos, full: false, showOut: sc.mode === 'slowmo', trPos: sc.mode === 'slowmo' ? pos : 0, grNow, slow: sw && t > sw[0][0] - 0.3 && t < sw[sw.length - 1][0] + 0.2 };
    }
    const id = sc.demo ?? (sc.id === 'hold' ? 'hold' : 'tempo');
    const d = demoBy[id];
    if (sc.mode === 'live' && (id === 'fast' || id === 'slow')) {
        // Attack, as heard: the latest snare up close, its gain over the same 150 ms.
        const zm = latestZoom(id, t);
        return { kind: 'listen', id, zoom: zm, gr: zm ? zm.z.gr : [], trN: ZN, trPos: zm ? zm.n : 0, grNow: d.gr[Math.floor((t - d.at) * D.rate)] ?? 0 };
    }
    if (sc.mode === 'live') {
        // Release, as heard: four hits, and the hand over the same 1.22 s.
        const bar = Math.max(0, Math.floor((t - d.at) / TL.bar));
        const i0 = Math.round((bar * TL.bar + STRIP.a) * D.rate);
        const n = STRIPS[id].n;
        const pos = clamp((t - d.at - bar * TL.bar - STRIP.a) * D.rate, 0, n);
        return { kind: 'strip', id, gr: d.gr.slice(i0, i0 + n), trN: n, trPos: pos, grNow: d.gr[Math.floor((t - d.at) * D.rate)] ?? 0, ons: STRIPS[id].ons };
    }
    // Groove: the bar replayed slowly. The screen waits for the second snare,
    // then shows it, slowed down, as the playhead reaches it.
    const i0 = Math.round(STRIP.a * D.rate);
    const n = STRIPS[id].n;
    const tt = keys(t, SWEEPS[sc.id]);
    const z = d.zooms[1];
    const o2 = (z.t - d.at - STRIP.a) * D.rate;
    const reached = tt >= z.t - d.at;
    return { kind: 'groove', id, z, zn: reached ? clamp((tt - (z.t - d.at)) * ZR, 0, MN) : 0, reached, o2, gr: d.gr.slice(i0, i0 + n), trN: n, trPos: (tt - STRIP.a) * D.rate, grNow: d.gr[Math.floor(tt * D.rate)] ?? 0, ons: STRIPS[id].ons, slow: true };
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
    const k = isRelease ? clamp(Math.log10(S.release * 1000) / Math.log10(2500)) : knobK(S.attack * 1000);
    stopwatch(g, 128, y - 24, 30, k * (sc.id === 'release' ? 0.4 : show));
    label(g, word, 184, y, { size: 68, weight: 800, color: P.ink });
    font(g, 68, 800);
    const wx = 184 + g.measureText(word).width + 22;
    if (show > 0) label(g, value, wx, y, { size: 68, weight: 800, color: P.cyan, alpha: show });
}

/** A tag in the lane above the screen, left-aligned, its leader dropping straight onto a point. */
function laneTag(text, target, opts) {
    const size = opts.size ?? 38;
    font(g, size, opts.weight ?? 700);
    const w = g.measureText(text).width + size * 1.1;
    const cx = RG.x0 - 6 + w / 2;
    const y = RG.top - 118;
    const a = opts.a;
    if (a <= 0) return;
    g.save();
    g.globalAlpha *= a;
    g.strokeStyle = opts.ring ?? opts.bg;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(target.x, y + size * 0.85);
    g.lineTo(target.x, target.y);
    g.stroke();
    g.fillStyle = opts.ring ?? opts.bg;
    g.beginPath();
    g.arc(target.x, target.y, 7, 0, Math.PI * 2);
    g.fill();
    g.restore();
    pill(g, text, cx, y, { size, bg: opts.bg, fg: opts.fg, ring: opts.ring, alpha: a, scale: E.outBack(clamp(a)), weight: opts.weight ?? 700 });
}

function drawRig(t) {
    if (t < SC.attack + 0.05 || t > SC.rule + 0.2) return;
    const a = E.out(seg(t, SC.attack + 0.1, SC.attack + 0.35)) * (1 - seg(t, SC.rule, SC.rule + 0.17));
    const sc = sceneAt(t);
    const cur = sc.view === 'rig' ? sc : TL.scenes.filter((s) => s.view === 'rig').pop();
    const S = rigState(cur, t);
    g.save();
    g.globalAlpha = a;
    panel(g);
    rigHeader(cur, t);
    const hgt = RG.base - RG.top;
    const listen = S.kind === 'listen' || S.kind === 'strip';
    const mech = S.kind === 'hit' || S.kind === 'groove';
    const box = { x0: RG.x0, x1: RG.x1, top: RG.top, base: RG.base, n: mech ? MN : ZN };
    // Screen.
    rr(g, RG.x0 - 40, RG.top - 56, RG.x1 - RG.x0 + 80, hgt + 96, 26);
    g.fillStyle = '#081022';
    g.fill();
    g.strokeStyle = listen ? 'rgba(125,211,252,0.6)' : 'rgba(255,255,255,0.08)';
    g.lineWidth = listen ? 4 : 3;
    g.stroke();
    label(g, listen ? 'Listen' : 'Slowed down', RG.x1 + 14, RG.top - 16, { size: 34, weight: 700, color: listen ? P.cyan : P.ink2, align: 'right', family: BODY });
    if (listen) speaker(g, RG.x0 + 14, RG.top - 28, 0.7, 0.5 + 0.5 * Math.sin(t * 20));
    g.strokeStyle = P.ink4;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(RG.x0, RG.base);
    g.lineTo(RG.x1, RG.base);
    g.stroke();
    const X = (i) => RG.x0 + ((RG.x1 - RG.x0) * i) / (box.n - 1);
    const Ym = (v) => RG.base - hgt * clamp(v / MECH_MAX);
    const ca = seg(t, cur.at, cur.at + 0.2);
    g.save();
    g.beginPath();
    g.rect(RG.x0 - 30, RG.top - 4, RG.x1 - RG.x0 + 60, hgt + 8);
    g.clip();
    g.globalAlpha *= ca;
    if (S.kind === 'hit') {
        if (S.showOut || S.full) area(g, box, S.outV, MECH_MAX, S.full ? MN : S.pos);
        curve(g, box, S.inV, MECH_MAX, { color: P.ink, width: 4, alpha: 0.7 });
    } else if (S.kind === 'groove') {
        if (S.reached) area(g, box, S.z.outS, MECH_MAX, S.zn);
        curve(g, box, S.z.envS, MECH_MAX, { color: P.ink, width: 4, alpha: S.reached ? 0.7 : 0.45 });
    } else if (S.kind === 'listen' && S.zoom) {
        area(g, box, S.zoom.z.heard, HEARD_MAX, S.zoom.n);
        if (cur.id === 'demo-slow') {
            const cmp = latestZoom('fast', demoBy.fast.to);
            curve(g, box, cmp.z.heard, HEARD_MAX, { color: P.ink, width: 4, dash: [12, 9], alpha: 0.9 });
        }
    } else if (S.kind === 'strip') {
        const sb = { x0: RG.x0, x1: RG.x1, top: RG.top, base: RG.base };
        stripArea(g, sb, STRIPS[S.id], STRIPS[S.id].heard, STRIP_MAX, S.trPos);
        if (S.id === 'tempo') {
            const H2 = STRIPS.hold;
            g.save();
            g.setLineDash([12, 9]);
            g.strokeStyle = P.ink;
            g.lineWidth = 4;
            g.globalAlpha *= 0.9;
            g.beginPath();
            for (let q = 0; q < H2.n; q += 2) (q ? g.lineTo : g.moveTo).call(g, RG.x0 + ((RG.x1 - RG.x0) * q) / (H2.n - 1), RG.base - hgt * clamp(H2.heard[q] / STRIP_MAX));
            g.stroke();
            g.restore();
        }
    }
    g.restore();
    // Soft top edge where a crack runs off the screen.
    if (mech) {
        const fade = g.createLinearGradient(0, RG.top - 4, 0, RG.top + 36);
        fade.addColorStop(0, 'rgba(8,16,34,1)');
        fade.addColorStop(1, 'rgba(8,16,34,0)');
        g.fillStyle = fade;
        g.fillRect(RG.x0 - 30, RG.top - 4, RG.x1 - RG.x0 + 60, 40);
    }
    // Legend, top right inside the screen.
    if (mech) {
        const ly = RG.top + 34;
        label(g, 'out', RG.x1 - 6, ly, { size: 30, weight: 700, color: P.ink2, align: 'right', family: BODY });
        g.fillStyle = P.amber;
        g.fillRect(RG.x1 - 98, ly - 22, 13, 22);
        g.fillStyle = P.cyan;
        g.fillRect(RG.x1 - 85, ly - 22, 13, 22);
        label(g, 'in', RG.x1 - 128, ly, { size: 30, weight: 700, color: P.ink2, align: 'right', family: BODY });
        g.strokeStyle = P.ink;
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(RG.x1 - 196, ly - 11);
        g.lineTo(RG.x1 - 160, ly - 11);
        g.stroke();
    } else if (S.kind === 'listen' && cur.id === 'demo-slow') {
        label(g, '- - 1 ms attack', RG.x1 - 6, RG.top + 34, { size: 32, weight: 600, color: P.ink2, align: 'right', family: BODY });
    } else if (S.kind === 'strip' && S.id === 'tempo') {
        label(g, '- - 2.5 s release', RG.x1 - 6, RG.top + 34, { size: 32, weight: 600, color: P.ink2, align: 'right', family: BODY });
    }
    // Threshold, on the mechanism views, labelled at the right over empty plot.
    if (mech) {
        const thrY = Ym(SETTINGS.FAST.threshold);
        dashed(g, RG.x0 - 20, thrY, RG.x1 + 20, thrY, P.ink2, 4);
        label(g, 'threshold', RG.x1 - 6, thrY - 14, { size: 32, weight: 600, color: P.ink2, align: 'right', family: BODY });
    }
    if (S.kind === 'hit' && (S.showOut || S.full) && S.pos > 0) {
        g.fillStyle = P.ink;
        g.fillRect(X(clamp(S.pos, 0, MN - 1)) - 2, RG.top - 4, 4, hgt + 8);
    }
    if (S.kind === 'strip') {
        g.fillStyle = P.ink;
        g.fillRect(RG.x0 + ((RG.x1 - RG.x0) * clamp(S.trPos, 0, S.trN - 1)) / (S.trN - 1) - 2, RG.top - 4, 4, hgt + 8);
    }
    // ── Trace: where the hand has had the fader, on the same time scale as the screen ──
    rr(g, RG.x0 - 40, RG.trTop - 64, RG.x1 - RG.x0 + 80, RG.trBot - RG.trTop + 120, 22);
    g.fillStyle = '#081022';
    g.fill();
    label(g, 'How far the hand pulls', RG.x0 - 14, RG.trTop - 22, { size: 34, weight: 700, color: P.ink2, family: BODY });
    const trH = RG.trBot - RG.trTop;
    const TX = (i) => RG.x0 + ((RG.x1 - RG.x0) * i) / (S.trN - 1);
    const TY = (gr) => RG.trTop + trH * clamp(gr / 18);
    const m = Math.floor(clamp(S.trPos, 0, S.trN));
    if (S.kind === 'groove') {
        // The 100 ms of the trace that the screen above shows slowed down.
        const w = clamp((S.trPos - S.o2) / 40);
        if (w > 0) {
            const bx = TX(S.o2);
            const bw = TX(S.o2 + 0.1 * D.rate) - bx;
            g.save();
            g.globalAlpha *= w;
            g.fillStyle = 'rgba(251,191,36,0.16)';
            g.fillRect(bx, RG.trTop - 6, bw, trH + 12);
            g.fillStyle = P.amber;
            g.fillRect(bx, RG.trTop - 6, bw, 4);
            g.restore();
        }
    }
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
    const span = S.trN === MN ? '100 ms' : S.trN === ZN ? '150 ms' : '1.2 s';
    label(g, span, RG.x1 + 14, RG.trTop - 22, { size: 30, weight: 600, color: P.ink3, align: 'right', family: BODY });
    if (S.kind === 'groove' || S.kind === 'strip') {
        // Hits along the bottom, shown as the playhead reaches them: snares amber, kicks grey.
        let first = true;
        for (const o of S.ons) {
            if (o.i > S.trPos) continue;
            const x = TX(o.i);
            if (o.voice === 'snare') {
                g.fillStyle = P.amber;
                g.beginPath();
                g.arc(x, RG.trBot + 14, 8, 0, Math.PI * 2);
                g.fill();
                if (first) label(g, 'snare', x + 14, RG.trBot + 24, { size: 28, weight: 700, color: P.amber, family: BODY });
                first = false;
            } else {
                g.fillStyle = P.ink3;
                g.fillRect(x - 2, RG.trBot + 6, 4, 16);
            }
        }
        g.fillStyle = P.ink;
        g.fillRect(TX(clamp(S.trPos, 0, S.trN - 1)) - 2, RG.trTop - 8, 4, trH + 16);
    }
    // ── Annotations ──
    const crackX = X(CRACK / 2);
    if (cur.id === 'fast') {
        const pk = Math.max(...SN.FAST.slice(0, CRACK));
        laneTag('crack squashed', { x: crackX, y: Ym(pk) }, { a: popIn(t, wt('fast', 'squashes')), bg: P.dark, fg: P.amber, ring: P.amber });
    }
    if (cur.id === 'slow') {
        const tP = wt('punch', 'punch') - 0.1;
        const pk = Math.min(Math.max(...SN.SLOW.slice(0, CRACK)), MECH_MAX);
        if (t < tP) laneTag('crack gets through', { x: crackX, y: Ym(pk) + 6 }, { a: popIn(t, wt('slips', 'past') - 0.2), bg: P.dark, fg: P.amber, ring: P.amber });
        else laneTag('punch', { x: crackX, y: Ym(pk) + 6 }, { a: popIn(t, tP), bg: P.amber, fg: P.dark, size: 46, weight: 800 });
        const bi = Math.round(0.06 * ZR);
        tag(g, 'body turned down', 500, RG.base - 170, { x: X(bi), y: Ym(SN.SLOW[bi]) }, { a: popIn(t, wt('slips', 'body') - 0.1), bg: P.dark, fg: P.cyan, ring: P.cyan, size: 36 });
    }
    if (cur.id === 'release') {
        g.beginPath();
        for (let k = S.relFrom; k < MN; k++) (k > S.relFrom ? g.lineTo : g.moveTo).call(g, TX(k), TY(S.gr[k]));
        g.strokeStyle = P.ink;
        g.lineWidth = 8;
        g.stroke();
        const ri = Math.round(lerp(S.relFrom, MN, 0.55));
        tag(g, 'release', 560, RG.trTop + 26, { x: TX(ri), y: TY(S.gr[ri]) }, { a: popIn(t, LETGO.from - 0.25), bg: P.ink, size: 36 });
    }
    if (S.kind === 'groove') {
        // The release time as a ruler, inside the trace card.
        const msPx = (RG.x1 - RG.x0) / ((STRIP.b - STRIP.a) * 1000);
        const rel = SETTINGS[cur.setting].release * 1000;
        const over = rel * msPx > RG.x1 - RG.x0;
        const rx1 = over ? RG.x1 : RG.x0 + rel * msPx;
        const ry = RG.trBot + 46;
        g.strokeStyle = P.ink2;
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(RG.x0 + 80, ry - 8);
        g.lineTo(RG.x0 + 80, ry + 8);
        const relText = `release ${msLabel(rel)}`;
        font(g, 30, 600, BODY);
        // Longer than the trace: the label sits in a break in the line, which runs on off the edge.
        const lx = over ? RG.x0 + 116 : rx1 + 94;
        const lw = g.measureText(relText).width;
        g.moveTo(RG.x0 + 80, ry);
        g.lineTo(over ? lx - 14 : rx1 + 80, ry);
        if (over) {
            g.moveTo(lx + lw + 14, ry);
            g.lineTo(rx1, ry);
            g.moveTo(rx1 - 12, ry - 9);
            g.lineTo(rx1, ry);
            g.lineTo(rx1 - 12, ry + 9);
        } else {
            g.moveTo(rx1 + 80, ry - 8);
            g.lineTo(rx1 + 80, ry + 8);
        }
        g.stroke();
        label(g, relText, lx, ry + 10, { size: 30, weight: 600, color: P.ink2, align: 'left', family: BODY });
        const pk = Math.min(Math.max(...S.z.outS.slice(0, CRACK)), MECH_MAX);
        if (cur.id === 'hold') {
            tag(g, 'still holding', TX(S.o2) - 160, RG.trTop + 26, { x: TX(S.o2), y: TY(S.gr[Math.max(0, Math.floor(S.o2))]) }, { a: popIn(t, wt('hold', 'arrives') - 0.1), bg: P.ink, size: 34 });
            laneTag('crack squashed', { x: crackX, y: Ym(pk) }, { a: S.reached ? popIn(t, wt('squashed', 'squashed') - 0.3) : 0, bg: P.dark, fg: P.amber, ring: P.amber });
        } else {
            laneTag('fresh crack', { x: crackX, y: Ym(pk) + 6 }, { a: S.reached ? popIn(t, wt('fresh', 'fresh') - 0.1) : 0, bg: P.amber, fg: P.dark, weight: 800 });
        }
    }
    // ── Fader and the robot's hand on it ──
    const fs = 0.8;
    const capY = fader(g, RG.faderX, RG.fTop, RG.fBot, Math.max(-1.2, S.grNow), { ticks: false, size: fs });
    let grip = gripOf(S.grNow);
    if (cur.mode === 'letgo') grip = clamp(S.grNow / 6);
    const lookX = S.kind === 'hit' ? X(clamp(S.pos, 0, MN - 1)) : TX(clamp(S.trPos, 0, S.trN - 1));
    robotTop(g, RG.faderX, RG.shelf, capY - 38 * fs, { grip, look: { x: lookX, y: RG.top + 150 }, lid: blink(t, 27.3), s: 0.62 });
    g.restore();
}

/** A small check mark in a white circle. */
function check(gc, x, y) {
    gc.save();
    gc.fillStyle = P.ink;
    gc.beginPath();
    gc.arc(x, y, 17, 0, Math.PI * 2);
    gc.fill();
    gc.strokeStyle = P.dark;
    gc.lineWidth = 5;
    gc.lineCap = 'round';
    gc.lineJoin = 'round';
    gc.beginPath();
    gc.moveTo(x - 8, y);
    gc.lineTo(x - 2, y + 6);
    gc.lineTo(x + 9, y - 7);
    gc.stroke();
    gc.restore();
}

// ══ The rule ══
function drawRule(t) {
    if (t < SC.rule || t > SC.replay + 0.15) return;
    const a = E.out(seg(t, SC.rule + 0.03, SC.rule + 0.23)) * (1 - seg(t, SC.replay - 0.02, SC.replay + 0.12));
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
                label(g, lab, x0 + 120, c.y + 360, { size: 40, weight: 700, color: i ? P.ink : P.ink2, align: 'center' });
                if (i) check(g, x0 + 200, c.y + 346);
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
                label(g, lab, x0 + 120, c.y + 360, { size: 40, weight: 700, color: i ? P.ink : P.ink2, align: 'center' });
                if (i) check(g, x0 + 200, c.y + 346);
            }
        }
        g.restore();
    }
    g.restore();
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
const KEYWORD = { crack: P.amber, body: P.cyan };
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
        const d = D.demos.find((q) => t >= q.at && t < q.to);
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

function draw(t, { words = true } = {}) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    // The room breathes with the kick while a demo plays.
    let kick = 0;
    for (const h of HITS) if (h.demo && h.voice === 'kick' && t >= h.t && t - h.t < 0.3) kick = Math.max(kick, 1 - (t - h.t) / 0.3);
    ground(g, t, Math.max(bump(t, demoBy.tempo.at, 0.05, 0.9), 0.3 * kick));
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
