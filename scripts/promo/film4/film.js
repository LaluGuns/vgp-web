// Film 4 picture: scenes drawn on one 1080 x 1920 canvas, a pure function
// of time. window.seek(t) draws the frame at t seconds. Reads TIMELINE and
// DATA (harmonic levels, the phone's waveform and measured periods, all
// computed with the sound) and the drawing kit in art.js.
//
// One colour rule for the whole film: amber is the fundamental, the missing
// note; cyan is harmonics and other data; everything else is neutral.
/* global TIMELINE, DATA, DP_URL, LESSON, W, H, P, clamp, lerp, seg, E, bump, rand, font, label, rr, pill, shadow, ground, knob, speaker, robotDome, phoneBody, coneSide, clubSub, DISPLAY, BODY */

const TL = TIMELINE;
const D = DATA;
const cv = document.getElementById('film');
cv.width = W;
cv.height = H;
const g = cv.getContext('2d');

const VO = D.vo;
// Narration comes one sentence per line; lines sharing a stem (air-1,
// air-2) form a beat, and a beat can be looked up like a line.
const beatOf = (id) => id.replace(/-?\d+$/, '');
const voBy = Object.fromEntries(VO.map((v) => [v.id, v]));
for (const v of VO) {
    const k = beatOf(v.id);
    if (k === v.id) continue;
    const b = voBy[k];
    if (!b) voBy[k] = { id: k, at: v.at, dur: v.dur, words: [...v.words] };
    else {
        b.dur = Math.max(b.at + b.dur, v.at + v.dur) - b.at;
        b.words = [...b.words, ...v.words];
    }
}
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
/** Film time at which `word` (k-th occurrence) is spoken in narration line `id`. */
function wt(id, word, k = 0) {
    const ws = voBy[id].words.filter((w) => norm(w.w) === norm(word));
    if (!ws[k]) throw new Error(`no word ${word} in ${id}`);
    return ws[k].s;
}
const vEnd = (id) => voBy[id].at + voBy[id].dur;
const SC = Object.fromEntries(TL.scenes.map((s) => [s.id, s.at]));
const BUTTON = TL.sfx.find((s) => s.kind === 'button').at;
const NOTES = D.notes;
const SAT_NOTES = NOTES.filter((q) => q.period);
const KICKS = D.hits.filter((h) => h.voice === 'kick' || h.voice === 'snare');
const segBy = Object.fromEntries(TL.bass.map((s) => [s.id, s]));

/** Piecewise-linear map through [[t, v], ...]. */
function keys(t, ks) {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], (t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]));
    return ks[ks.length - 1][1];
}
const popIn = (t, t0, d = 0.3) => clamp((t - t0) / d);
/** A cue's time, as the sound engine computes it. */
const cueAt = (c) => (c.cue ? wt(c.cue[0], c.cue[1]) + (c.dt ?? 0) : c.at);
/** The same smoothstep ramp the sound engine uses for blend and boost. */
function rampAt(spec, v, t) {
    const k = clamp((t - cueAt(spec)) / spec.to);
    return v * k * k * (3 - 2 * k);
}

/** A pill with a thin straight leader to its target. */
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

/** A slow push-in over a view's life (2%), around the middle of the frame. */
function push(t, a, b, amt = 0.02) {
    const k = 1 + amt * E.inOut(seg(t, a, b));
    g.translate(540, 820);
    g.scale(k, k);
    g.translate(-540, -820);
}

/** One view's opacity: in over 0.2 s from `a`, out over the 0.2 s before `b`. */
function viewAlpha(t, a, b) {
    if (t < a || t > b) return 0;
    return (a <= 0 ? 1 : E.out(seg(t, a, a + 0.2))) * (1 - seg(t, b - 0.2, b));
}

// ── Data at time t ──
const FR = D.frames;
/** Harmonic levels (dB re the clean sub's fundamental) at t: { f0, full, phone } or null. */
function spectrum(t) {
    const k = clamp(Math.round(t * FR.rate), 0, FR.f0.length - 1);
    if (!FR.f0[k]) return null;
    return { f0: FR.f0[k], full: FR.full[k], phone: FR.phone[k] };
}
/** Total level of the harmonics the phone plays at t, in dB. */
function phoneDb(t) {
    const s = spectrum(t);
    if (!s) return -120;
    let p = 0;
    for (const v of s.phone) p += 10 ** (v / 10);
    return 10 * Math.log10(p + 1e-12);
}
const noteAt = (t) => NOTES.filter((q) => q.t <= t && t < q.t + q.dur + 0.05).pop() ?? null;
/** Ages of the bass notes the phone plays clearly (saturated), for the robot's rings. */
function satRings(t, from) {
    const out = [];
    for (const q of SAT_NOTES) if (q.t >= from && t >= q.t && t - q.t < 0.7) out.push((t - q.t) / 0.7);
    return out;
}
function blink(t, from) {
    if (t < from) return 0;
    const p = (t - from) % 3.7;
    return p < 0.14 ? Math.sin((p / 0.14) * Math.PI) : 0;
}

// ══ The ladder: the bass's harmonics by frequency, low at the bottom ══
// Rungs sit at n x f0 on a log frequency axis. Each rung's outline is that
// harmonic's level in the track (full range); its fill is the level the
// phone plays (after the 200 Hz high-pass). Both come from an FFT of the
// sound playing at that frame. Level scale: -40 dB (no rung) to +10 dB.
const LAD = { fMin: 30, fMax: 1000, dbMin: -40, dbMax: 10, cut: 200 };
function ladder(box, t, o = {}) {
    const { x0, x1, y0, y1 } = box;
    const a = o.alpha ?? 1;
    if (a <= 0) return null;
    const rx1 = box.rx1 ?? x1;
    const Y = (f) => y1 - ((y1 - y0) * Math.log(f / LAD.fMin)) / Math.log(LAD.fMax / LAD.fMin);
    const L = (dB) => (rx1 - x0) * clamp((dB - LAD.dbMin) / (LAD.dbMax - LAD.dbMin));
    const yCut = Y(LAD.cut);
    g.save();
    g.globalAlpha *= a;
    rr(g, x0 - 24, y0 - 24, x1 - x0 + 48, y1 - y0 + 48, 26);
    g.fillStyle = '#081022';
    g.fill();
    // The phone's window, and the dark zone below it.
    g.save();
    rr(g, x0 - 24, y0 - 24, x1 - x0 + 48, y1 - y0 + 48, 26);
    g.clip();
    g.fillStyle = `rgba(125,211,252,${0.05 + 0.1 * (o.windowGlow ?? 0)})`;
    g.fillRect(x0 - 24, y0 - 24, x1 - x0 + 48, yCut - y0 + 24);
    g.fillStyle = `rgba(0,0,0,${0.5 + 0.2 * (o.darkPulse ?? 0)})`;
    g.fillRect(x0 - 24, yCut, x1 - x0 + 48, y1 - yCut + 24);
    g.restore();
    g.save();
    g.setLineDash([12, 9]);
    g.strokeStyle = P.ink2;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x0, yCut);
    g.lineTo(x1, yCut);
    g.stroke();
    g.restore();
    const zs = o.zoneLeft ? 32 : 36;
    if (o.zoneLeft) {
        // Narrow ladders: the two zones are named on the left, by the 200 Hz line.
        const zx = x0 - 34;
        label(g, 'phone', zx, yCut - 80, { size: zs, weight: 700, color: P.cyan, align: 'right', family: BODY });
        label(g, 'plays', zx, yCut - 42, { size: zs, weight: 700, color: P.cyan, align: 'right', family: BODY });
        label(g, 'phone', zx, yCut + 66, { size: zs, weight: 700, color: P.ink2, align: 'right', family: BODY });
        label(g, "can't play", zx, yCut + 104, { size: zs, weight: 700, color: P.ink2, align: 'right', family: BODY });
    } else {
        label(g, 'phone plays', x1 - 4, y0 + zs + 2, { size: zs, weight: 700, color: P.cyan, align: 'right', family: BODY });
        label(g, "phone can't play", x1 - 4, y1 - 8, { size: zs, weight: 700, color: P.ink2, align: 'right', family: BODY });
    }
    // Pitch axis in plain words, and the one frequency that matters.
    if (o.lowHigh) {
        label(g, 'high notes', x0 - 16, y0 + 34, { size: 32, weight: 700, color: P.ink2, align: 'right', family: BODY });
        label(g, 'low notes', x0 - 16, y1 - 8, { size: 32, weight: 700, color: P.ink2, align: 'right', family: BODY });
    }
    for (const f of [200]) {
        label(g, f === 200 ? '200 Hz' : String(f), x0 - 16, Y(f) + 11, { size: 32, weight: 600, color: f === 200 ? P.ink : P.ink2, align: 'right', family: BODY });
        if (f !== 200) {
            g.fillStyle = P.ink4;
            g.fillRect(x0 - 10, Y(f) - 1.5, 10, 3);
        }
    }
    // Rungs.
    const s = o.spec === undefined ? spectrum(t) : o.spec;
    const rungs = [];
    const h = o.rungH ?? 16;
    if (s) {
        for (let k = 0; k < Math.min(s.full.length, o.maxN ?? 99); k++) {
            const f = (k + 1) * s.f0;
            if (f > LAD.fMax) break;
            const y = Y(f);
            rungs.push({ n: k + 1, y, full: s.full[k], phone: s.phone[k] });
            const col = k === 0 ? P.amber : P.cyan;
            const ra = k === 0 ? (o.fundAlpha ?? 1) : (o.harmAlpha ?? 1);
            if (ra <= 0) continue;
            g.save();
            g.globalAlpha *= ra;
            const lf = L(s.full[k]);
            const lp = L(s.phone[k]);
            if (lp > 1) {
                rr(g, x0, y - h / 2, lp, h, 4);
                g.fillStyle = col;
                g.fill();
            }
            if (lf > 1) {
                rr(g, x0, y - h / 2, lf, h, 4);
                g.strokeStyle = col;
                g.lineWidth = 3;
                g.stroke();
            }
            g.restore();
        }
    }
    // The missing note, heard: a dashed amber rung at f0, at the level of the
    // sub the phone removed.
    if (o.ghost > 0 && o.ghostF0) {
        const y = Y(o.ghostF0);
        g.save();
        g.globalAlpha *= o.ghost;
        g.setLineDash([14, 10]);
        rr(g, x0, y - h / 2, L(0), h, 4);
        g.strokeStyle = P.amber;
        g.lineWidth = 3;
        g.stroke();
        g.restore();
    }
    // What a rung's length means, above the panel.
    if (o.scale) label(g, 'longer bar = louder', x0 - 24, y0 - 46, { size: 32, weight: 600, color: P.ink2, family: BODY });
    g.restore();
    return { Y, L, rungs, yCut };
}
/** Legend for a ladder: outline = in the track, fill = what the phone plays. */
function ladderLegend(x, y, a = 1, { size = 32, ghost = 0, gap = 44, row = false } = {}) {
    if (a <= 0) return;
    g.save();
    g.globalAlpha *= a;
    rr(g, x, y - 20, 40, 16, 4);
    g.strokeStyle = P.cyan;
    g.lineWidth = 3;
    g.stroke();
    label(g, 'in the track', x + 54, y - 1, { size, weight: 600, color: P.ink2, family: BODY });
    font(g, size, 600, BODY);
    const x2 = row ? x + 54 + g.measureText('in the track').width + 44 : x;
    const y2 = row ? y : y + gap;
    rr(g, x2, y2 - 20, 40, 16, 4);
    g.fillStyle = P.cyan;
    g.fill();
    label(g, 'what the phone plays', x2 + 54, y2 - 1, { size, weight: 600, color: P.ink2, family: BODY });
    if (ghost > 0) {
        g.globalAlpha *= ghost;
        g.setLineDash([10, 7]);
        rr(g, x, y2 + gap - 22, 40, 20, 5);
        g.strokeStyle = P.amber;
        g.lineWidth = 4;
        g.stroke();
        g.setLineDash([]);
        label(g, 'heard, never played', x + 54, y2 + gap - 1, { size, weight: 700, color: P.amber, family: BODY });
    }
    g.restore();
}

// ══ Hook: the phone, its speaker, and the ladder ══
const HK = { ph: { x: 80, y: 610, w: 340, h: 620 }, lad: { x0: 680, x1: 926, y0: 860, y1: 1230 }, robot: { x: 520, y: 1312 } };
/** Drum hits the phone plays: a flash on the grille and a ring of sound. */
function drumFlash(t) {
    let f = 0;
    for (const h of KICKS) if (t >= h.t && t - h.t < 0.18) f = Math.max(f, (h.voice === 'kick' ? 0.45 : 0.6) * (1 - (t - h.t) / 0.18));
    return f;
}
function phoneScreen(t, bassGlow) {
    return (gc, x, y, w, h) => {
        const gr = gc.createLinearGradient(x, y, x, y + h);
        gr.addColorStop(0, '#13213f');
        gr.addColorStop(1, '#0a1020');
        gc.fillStyle = gr;
        gc.fillRect(x, y, w, h);
        // Album tile with a small sine on it.
        const s = w - 60;
        rr(gc, x + 30, y + 30, s, s, 22);
        const ag = gc.createLinearGradient(x, y, x + s, y + s);
        ag.addColorStop(0, '#1d3368');
        ag.addColorStop(1, '#0d1838');
        gc.fillStyle = ag;
        gc.fill();
        gc.strokeStyle = P.cyan;
        gc.lineWidth = 6;
        gc.lineCap = 'round';
        gc.beginPath();
        for (let i = 0; i <= 60; i++) {
            const u = i / 60;
            const px = x + 60 + u * (s - 60);
            const ph = u * Math.PI * 4 + t * 2;
            const v = lerp(Math.sin(ph), Math.tanh(3 * Math.sin(ph) + 0.8) - Math.tanh(0.8), bassGlow);
            const py = y + 30 + s / 2 + v * s * 0.16;
            if (i) gc.lineTo(px, py);
            else gc.moveTo(px, py);
        }
        gc.stroke();
        if (w >= 280) label(gc, 'Nightfall beat', x + 30, y + s + 82, { size: 34, weight: 700, color: P.ink, family: BODY });
        // Level bars: the drums (white) and the bass the phone plays (cyan).
        const d = drumFlash(t);
        const bars = [0.25 + d, 0.2 + 0.8 * d, 0.15 + bassGlow, 0.2 + bassGlow * 0.8, 0.18 + 0.6 * d];
        bars.forEach((v, i) => {
            const bh = 18 + 70 * clamp(v);
            rr(gc, x + 30 + i * 42, y + s + 200 - bh, 26, bh, 6);
            gc.fillStyle = i === 2 || i === 3 ? P.cyan : P.ink3;
            gc.fill();
        });
    };
}
function drawHook(t) {
    const replay = t >= SC.again;
    const a = replay ? viewAlpha(t, SC.again, SC.end) : viewAlpha(t, 0, SC.air);
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    const tNow = wt('hook-b', 'now');
    // Title: slams in on frame one.
    if (!replay) {
        const s0 = lerp(1.12, 1, E.outBack(seg(t, 0, 0.25)));
        g.save();
        g.translate(540, 335);
        g.scale(s0, s0);
        label(g, "Your phone can't", 0, -10, { size: 88, weight: 800, color: P.ink, align: 'center' });
        label(g, 'play this note.', 0, 84, { size: 88, weight: 800, color: P.ink, align: 'center' });
        g.restore();
        const q = popIn(t, segBy.hookSat.from, 0.35);
        if (q > 0) {
            g.save();
            g.translate(540, 482);
            g.scale(lerp(0.85, 1, E.outBack(q)), lerp(0.85, 1, E.outBack(q)));
            label(g, 'So why can you hear it?', 0, 0, { size: 56, weight: 800, color: P.cyan, align: 'center', alpha: clamp(q * 2) });
            g.restore();
        }
    } else {
        label(g, 'Now listen again', 540, 360, { size: 88, weight: 800, color: P.ink, align: 'center' });
    }
    // What the bass is, above the ladder.
    const sat = replay ? t >= segBy.againSat.from - 0.05 : t >= segBy.hookSat.from - 0.05;
    const pa = 1;
    font(g, 32, 700);
    const ptxt = sat ? '+ saturation' : 'clean sub';
    const pw = g.measureText(ptxt).width + 35;
    label(g, 'Bass:', 530, 651, { size: 36, weight: 800, color: P.ink, alpha: pa });
    pill(g, ptxt, 640 + pw / 2, 640, { size: 32, bg: sat ? P.cyan : P.ink, fg: P.dark, alpha: pa, weight: 700, scale: sat ? lerp(1.12, 1, E.out(popIn(t, (replay ? segBy.againSat : segBy.hookSat).from - 0.05, 0.25))) : 1 });
    ladderLegend(530, 740, pa, { size: 32, gap: 46 });
    // Phone and its speaker.
    const glow = clamp((phoneDb(t) + 34) / 18);
    const d = drumFlash(t);
    phoneBody(g, HK.ph.x, HK.ph.y, HK.ph.w, HK.ph.h, { grille: Math.max(glow, d * 0.8), screen: phoneScreen(t, glow) });
    pill(g, 'phone speaker (simulated)', HK.ph.x + HK.ph.w / 2, HK.ph.y - 48, { size: 32, bg: P.dark, fg: P.ink, ring: P.ink3, weight: 700 });
    // Sound leaving the grille: white rings for drum hits, cyan for bass notes the phone plays.
    const gx = HK.ph.x + HK.ph.w / 2;
    const gy = HK.ph.y + HK.ph.h - 52;
    g.save();
    // Rings only outside the phone, and only on its open side.
    g.beginPath();
    g.rect(0, 0, W, H);
    rr(g, HK.ph.x - 8, HK.ph.y - 8, HK.ph.w + 16, HK.ph.h + 16, HK.ph.w * 0.16);
    g.clip('evenodd');
    g.beginPath();
    g.rect(HK.ph.x, HK.ph.y + HK.ph.h * 0.6, 470, 520);
    g.clip();
    g.lineCap = 'round';
    const ring = (age, color, str) => {
        const r = 120 + 200 * age;
        g.strokeStyle = color;
        g.globalAlpha = a * str * (1 - age);
        g.lineWidth = 6;
        g.beginPath();
        g.arc(gx, gy, r, -0.15, 0.95);
        g.stroke();
    };
    for (const h of KICKS) if (t >= h.t && t - h.t < 0.5) ring((t - h.t) / 0.5, P.ink, 0.35);
    for (const q of NOTES) {
        if (t < q.t || t - q.t > 0.6) continue;
        const str = clamp((phoneDb(q.t + 0.06) + 34) / 18);
        if (str > 0.05) ring((t - q.t) / 0.6, P.cyan, str);
    }
    g.restore();
    // The listener: its antenna turns amber when it hears the rebuilt note.
    const ant = clamp((phoneDb(t) + 30) / 12);
    const satFrom = replay ? segBy.againSat.from : segBy.hookSat.from;
    const lid = sat ? blink(t, satFrom + 0.8) : 0.45 + 0.05 * Math.sin(t * 3);
    // It hops on every note it can hear.
    let hop = 0;
    for (const q of SAT_NOTES) if (q.t >= satFrom && t >= q.t && t - q.t < 0.28) hop = Math.max(hop, Math.sin((Math.PI * (t - q.t)) / 0.28));
    robotDome(g, { x: HK.robot.x, y: HK.robot.y - 16 * hop }, { s: 0.7, look: { x: gx, y: gy }, lid, antenna: ant, rings: satRings(t, satFrom) });
    // While the bass is missing it wonders where it went.
    const qFrom = replay ? segBy.againClean.from + 0.6 : wt('hook-a', 'play');
    const qa = popIn(t, qFrom, 0.25) * (1 - popIn(t, satFrom - 0.25, 0.2));
    if (qa > 0) {
        g.save();
        g.globalAlpha *= qa;
        // A question mark floating over its dome.
        const bx = HK.robot.x - 34;
        const by = HK.robot.y - 92 - 6 * Math.sin(t * 3);
        g.translate(bx, by);
        g.scale(E.outBack(qa), E.outBack(qa));
        label(g, '?', 0, 0, { size: 56, weight: 800, color: P.ink, align: 'center' });
        g.restore();
    }
    // Ladder.
    ladder(HK.lad, t, { zoneLeft: true, maxN: 6, rungH: 18 });
    g.restore();
}

// ══ Air: the same loudness one and two octaves lower ══
// Rows: 200, 100 and 50 Hz at the same level. The cone's travel follows
// x ∝ 1/f² (p ∝ S·x·f²): 1×, 4×, 16×. Motion is slowed down 100 times.
const AIR = { rows: [580, 840, 1100], cone: 410, f: [200, 100, 50], unit: 4 };
function drawAir(t) {
    const a = viewAlpha(t, SC.air, SC.phone);
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    push(t, SC.air, SC.phone);
    label(g, 'Same loudness, lower notes', 540, 330, { size: 64, weight: 800, color: P.ink, align: 'center' });
    label(g, 'how far the cone has to travel', 540, 396, { size: 40, weight: 600, color: P.ink2, align: 'center', alpha: popIn(t, wt('air', 'move') - 0.05) });
    const appear = [voBy.air.at + 0.05, wt('air', 'every'), wt('air', 'lower')];
    const arrowAt = [wt('air', 'move'), wt('air', 'four'), wt('air', 'times')];
    AIR.rows.forEach((y, i) => {
        const k = popIn(t, appear[i], 0.3);
        if (k <= 0) return;
        const f = AIR.f[i];
        const rel = (200 / f) ** 2;
        const w = (2 * Math.PI * f) / 100;
        const amp = AIR.unit * rel;
        const x = amp * Math.sin(w * (t - appear[i]));
        g.save();
        g.globalAlpha *= E.out(k);
        g.translate((1 - E.out(k)) * -40, 0);
        label(g, `${f} Hz`, 222, y + 16, { size: 48, weight: 800, color: P.ink, align: 'right' });
        coneSide(g, AIR.cone, y, 200, x);
        // Air: particles displaced by the wave. Wavelength and displacement
        // both scale with 1/f, so every row squeezes the air equally.
        const lam = 170 * (200 / f);
        const xi = 4.5 * (200 / f);
        g.fillStyle = 'rgba(248,250,252,0.55)';
        const r0 = rand(31 + i);
        for (let c = 0; c < 25; c++) {
            const bx = 530 + c * 17;
            for (let rI = 0; rI < 9; rI++) {
                const by = y - 76 + rI * 19 + (r0() - 0.5) * 6;
                const jx = (r0() - 0.5) * 8;
                const dx = xi * Math.sin(w * (t - appear[i]) - (2 * Math.PI * (bx - 495)) / lam);
                g.beginPath();
                g.arc(bx + jx + dx, by, 3.2, 0, Math.PI * 2);
                g.fill();
            }
        }
        // Travel arrow under the cone, and its multiple.
        const ka = popIn(t, arrowAt[i] - 0.05, 0.35);
        if (ka > 0) {
            const half = Math.max(6, amp * E.out(ka));
            const ay = y + 120;
            const cx = AIR.cone + 2;
            g.strokeStyle = P.ink;
            g.lineWidth = 5;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(cx - half, ay);
            g.lineTo(cx + half, ay);
            for (const sgn of [-1, 1]) {
                const ex = cx + sgn * half;
                g.moveTo(ex - sgn * Math.min(11, half), ay - 9);
                g.lineTo(ex, ay);
                g.lineTo(ex - sgn * Math.min(11, half), ay + 9);
            }
            g.stroke();
            label(g, `${rel}×`, cx + 64 + 26, ay + 15, { size: 44, weight: 800, color: P.ink, alpha: clamp(ka * 2) });
        }
        g.restore();
    });
    g.restore();
}

// ══ Phone: its tiny cone hits its stops; turning the sub up changes nothing ══
const PHS = { ph: { x: 70, y: 400, w: 270, h: 500 }, mag: { x: 690, y: 600, r: 260 }, knob: { x: 190, y: 1120 }, lad: { x0: 700, x1: 926, y0: 1010, y1: 1260 } };
function drawPhone(t) {
    const a = viewAlpha(t, SC.phone, SC.stack);
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    push(t, SC.phone, SC.stack);
    const { ph, mag } = PHS;
    label(g, 'A tiny speaker', 70, 330, { size: 60, weight: 800, color: P.ink, alpha: popIn(t, wt('phone', 'speaker') - 0.05, 0.3) });
    phoneBody(g, ph.x, ph.y, ph.w, ph.h, { grille: 0, screen: phoneScreen(t, 0) });
    // Magnifier: from the grille to a circle showing the speaker inside.
    const gx = ph.x + ph.w / 2;
    const gy = ph.y + ph.h - 52;
    const ma = popIn(t, voBy.phone.at + 0.1, 0.35);
    g.save();
    g.globalAlpha *= ma;
    g.strokeStyle = P.ink3;
    g.lineWidth = 3;
    const ang = Math.atan2(mag.y - gy, mag.x - gx);
    for (const s of [-1, 1]) {
        const a1 = ang + s * Math.PI / 2;
        g.beginPath();
        g.moveTo(gx + Math.cos(a1) * 46, gy + Math.sin(a1) * 46);
        g.lineTo(mag.x + Math.cos(a1) * mag.r, mag.y + Math.sin(a1) * mag.r);
        g.stroke();
    }
    g.beginPath();
    g.arc(gx, gy, 46, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.arc(mag.x, mag.y, mag.r, 0, Math.PI * 2);
    g.fillStyle = '#081022';
    g.fill();
    g.strokeStyle = P.steelLo;
    g.lineWidth = 8;
    g.stroke();
    // The tiny cone tries 50 Hz (slowed down 100 times) and stops at its limit.
    const stop = 10;
    const need = 110;
    const tTry = wt('phone', 'down');
    const w = (2 * Math.PI * 50) / 100;
    const want = t > tTry ? need * Math.sin(w * (t - tTry)) * E.out(popIn(t, tTry, 0.3)) : 0;
    const x = clamp(want, -stop, stop);
    const cx = mag.x - 20;
    const cy = mag.y - 40;
    g.save();
    g.beginPath();
    g.arc(mag.x, mag.y, mag.r - 6, 0, Math.PI * 2);
    g.clip();
    coneSide(g, cx, cy, 190, x);
    label(g, 'trying 50 Hz', mag.x, mag.y - 168, { size: 32, weight: 700, color: P.amber, align: 'center', family: BODY, alpha: popIn(t, tTry - 0.05, 0.3) });
    // A travel gauge under the cone: the dashed span is how far 50 Hz needs
    // it to move, the solid span how far it can, the dot where it is.
    const ly = mag.y + 125;
    const ga = popIn(t, wt('phone', 'barely') - 0.1, 0.3);
    if (ga > 0) {
        g.save();
        g.globalAlpha *= ga;
        g.setLineDash([12, 9]);
        g.strokeStyle = P.ink2;
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(cx - need, ly);
        g.lineTo(cx + need, ly);
        g.stroke();
        g.restore();
    }
    g.lineCap = 'round';
    g.strokeStyle = P.ink;
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(cx - stop, ly);
    g.lineTo(cx + stop, ly);
    g.stroke();
    g.lineWidth = 5;
    for (const sx of [-1, 1]) {
        g.beginPath();
        g.moveTo(cx + sx * (stop + 6), ly - 20);
        g.lineTo(cx + sx * (stop + 6), ly + 20);
        g.stroke();
    }
    g.fillStyle = P.amber;
    g.beginPath();
    g.arc(cx + x, ly, 9, 0, Math.PI * 2);
    g.fill();
    // The stop it is pressed against glows.
    const hit = Math.abs(want) > stop ? clamp((Math.abs(want) - stop) / 30) : 0;
    if (hit > 0) {
        const hx = cx + Math.sign(want) * (stop + 6);
        const gl = g.createRadialGradient(hx, ly, 0, hx, ly, 34);
        gl.addColorStop(0, `rgba(248,250,252,${0.6 * hit})`);
        gl.addColorStop(1, 'rgba(248,250,252,0)');
        g.fillStyle = gl;
        g.beginPath();
        g.arc(hx, ly, 34, 0, Math.PI * 2);
        g.fill();
    }
    g.restore();
    g.restore();
    const la = popIn(t, wt('phone', 'barely') - 0.1, 0.3) * ma;
    label(g, '━  how far it can move', mag.x, mag.y + mag.r + 56, { size: 32, weight: 700, color: P.ink, align: 'center', family: BODY, alpha: la });
    label(g, '- - -  how far 50 Hz needs', mag.x, mag.y + mag.r + 98, { size: 32, weight: 600, color: P.ink2, align: 'center', family: BODY, alpha: la });
    // The sub knob, turned up 6 dB on "Turning", with the bass playing.
    const bs = segBy.boost;
    const boost = rampAt(bs.boostDb, bs.boostDb.db, t);
    const ka = popIn(t, cueAt(segBy.boost.boostDb) - 0.15, 0.3);
    if (ka > 0) {
        g.save();
        g.globalAlpha *= ka;
        knob(g, PHS.knob.x, PHS.knob.y, 64, 0.3 + 0.6 * (boost / 10), { glow: bump(t, cueAt(bs.boostDb), 0.15, 0.9) });
        label(g, 'sub', PHS.knob.x, PHS.knob.y + 130, { size: 40, weight: 800, color: P.amber, align: 'center' });
        label(g, boost > 0.05 ? `+${boost.toFixed(1)} dB` : '0 dB', PHS.knob.x + 100, PHS.knob.y + 14, { size: 44, weight: 800, color: P.ink });
        g.restore();
        ladder(PHS.lad, t, { alpha: ka, zoneLeft: true, maxN: 6 });
    }
    g.restore();
}

// ══ The big ladder: a stack, a clean sub, saturation, the phone's window ══
const BL = { x0: 250, x1: 926, y0: 560, y1: 1250 };
function drawLadder(t) {
    const a = viewAlpha(t, SC.stack, SC.strange);
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    push(t, SC.stack, SC.strange);
    // Section title, crossfading at each beat.
    const titles = [
        [SC.stack, 'A plucked bass note', P.ink],
        [SC.sub, 'Clean sub', P.amber],
        [SC.grow, 'Clean sub + saturation', P.ink],
        [SC.window, 'Through the phone', P.cyan],
    ];
    titles.forEach(([t0, text, color], i) => {
        const t1 = i + 1 < titles.length ? titles[i + 1][0] : SC.strange;
        const k = (i === 0 ? popIn(t, D.plucks[0].t, 0.3) : popIn(t, t0, 0.25)) * (1 - seg(t, t1 - 0.15, t1));
        if (k > 0) label(g, text, 90, 330, { size: 60, weight: 800, color, alpha: k });
    });
    ladderLegend(90, 410, 1, { size: 32, row: true });
    const tNote = wt('window', 'note');
    const tHarm = wt('window', 'harmonics');
    const isWin = t >= SC.window;
    const lad = ladder(BL, t, {
        windowGlow: isWin ? E.out(popIn(t, tHarm - 0.1, 0.4)) : 0,
        darkPulse: bump(t, wt('sub', 'disappears'), 0.15, 0.8) + (isWin ? bump(t, wt('window', 'cant'), 0.15, 0.9) : 0),
        rungH: 26,
        scale: true,
        lowHigh: true,
        maxN: 6,
    });
    // Rung names at each rung's end, on a dark chip (the 200 Hz line passes
    // behind them), fading with their rung.
    const names = [
        ['1×', wt('stack', 'note'), P.amber],
        ['2×', wt('stack', 'two'), P.cyan],
        ['3×', wt('stack', 'three'), P.cyan],
        ['4×', wt('stack', 'four'), P.cyan],
    ];
    if (lad) {
        names.forEach(([text, t0, color], i) => {
            const r = lad.rungs[i];
            if (!r) return;
            const k = popIn(t, t0 - 0.05, 0.25) * clamp((r.full + 34) / 6);
            if (k <= 0) return;
            const x = BL.x0 + lad.L(r.full) + 46;
            g.save();
            g.globalAlpha *= k;
            rr(g, x - 34, r.y - 22, 68, 44, 12);
            g.fillStyle = '#081022';
            g.fill();
            label(g, text, x, r.y + 12, { size: 34, weight: 800, color, align: 'center' });
            g.restore();
        });
        // "Disappears": the clean sub's one line, under the window.
        // The saturation knob, turned by the same blend the sound uses.
        const gs = segBy.grow;
        if (t >= SC.grow - 0.3) {
            const v = rampAt(gs.blend, gs.blend.v, t);
            const ka = popIn(t, SC.grow, 0.3);
            g.save();
            g.globalAlpha *= ka;
            knob(g, 900, 318, 44, v / 0.5, { glow: v > 0 && v < gs.blend.v ? 1 : 0 });
            label(g, 'saturation', 900, 425, { size: 32, weight: 600, color: P.ink2, align: 'center', family: BODY });
            g.restore();
        }
    }
    g.restore();
}

// ══ Scope: what the phone plays repeats at the missing note's period ══
const SCP = { x0: 110, x1: 970, top: 410, base: 700, span: 0.08 };
const SCOPE = D.scope;
const SCOPE_MAX = (() => {
    let m = 0;
    for (const v of SCOPE.x) m = Math.max(m, Math.abs(v));
    return m;
})();
/** The saturated note on the scope at t, and the window start aligned to its period. */
function scopeView(t) {
    let q = null;
    for (const n of SAT_NOTES) if (n.t <= t && n.t >= SCOPE.from + 0.05) q = n;
    if (!q) return null;
    const P0 = q.period;
    const k = Math.max(0, Math.floor((t - SCP.span - q.t - 0.03) / P0));
    const ts = Math.min(q.t + 0.03 + k * P0, q.t + Math.max(0.03, q.dur - SCP.span - 0.005));
    return { q, P0, ts };
}
function drawScope(t) {
    const a = viewAlpha(t, SC.strange, SC.limit);
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    push(t, SC.strange, SC.limit);
    const { x0, x1, top, base } = SCP;
    const mid = (top + base) / 2;
    rr(g, x0 - 50, top - 140, x1 - x0 + 100, base - top + 320, 30);
    g.fillStyle = '#081022';
    g.fill();
    label(g, 'What the phone plays', x0 - 14, top - 76, { size: 44, weight: 800, color: P.ink });
    label(g, '80 ms', x1 + 14, top - 76, { size: 32, weight: 600, color: P.ink2, align: 'right', family: BODY });
    // Legend for the amber curve, on the frame it appears.
    const gl = E.out(popIn(t, wt('brain', 'puts') - 0.1, 0.8));
    if (gl > 0) {
        g.save();
        g.globalAlpha *= gl;
        g.setLineDash([12, 8]);
        g.strokeStyle = P.amber;
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(x1 - 400, top - 30);
        g.lineTo(x1 - 350, top - 30);
        g.stroke();
        g.restore();
        label(g, 'the note you hear', x1 + 14, top - 19, { size: 32, weight: 700, color: P.amber, align: 'right', family: BODY, alpha: gl });
    }
    g.strokeStyle = P.ink4;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x0, mid);
    g.lineTo(x1, mid);
    g.stroke();
    const v = scopeView(t);
    const X = (s) => x0 + ((x1 - x0) * s) / SCP.span;
    const Yv = (val) => mid - ((base - top) / 2) * 0.92 * (val / SCOPE_MAX);
    if (v) {
        // After "repeat", a soft highlight steps from one repeat to the next.
        const tRep = wt('strange', 'repeat') - 0.05;
        if (t > tRep) {
            const cnt = Math.floor(SCP.span / v.P0);
            const i = Math.floor((t - tRep) / 0.45) % cnt;
            g.fillStyle = `rgba(248,250,252,${0.08 * popIn(t, tRep, 0.3)})`;
            g.fillRect(X(i * v.P0), top - 14, X((i + 1) * v.P0) - X(i * v.P0), base - top + 28);
        }
        // The waveform.
        g.save();
        g.beginPath();
        g.rect(x0 - 4, top - 30, x1 - x0 + 8, base - top + 60);
        g.clip();
        g.beginPath();
        const n = Math.round(SCP.span * SCOPE.rate);
        for (let i = 0; i <= n; i++) {
            const idx = Math.round((v.ts - SCOPE.from) * SCOPE.rate) + i;
            const y = Yv(SCOPE.x[idx] ?? 0);
            if (i) g.lineTo(X(i / SCOPE.rate), y);
            else g.moveTo(X(0), y);
        }
        g.strokeStyle = P.cyan;
        g.lineWidth = 5;
        g.lineJoin = 'round';
        g.stroke();
        // The missing note, f0, dashed amber, at the sub's phase: what the brain puts back.
        const gh = E.out(popIn(t, wt('brain', 'puts') - 0.1, 0.8));
        if (gh > 0) {
            g.setLineDash([16, 12]);
            g.strokeStyle = P.amber;
            g.lineWidth = 6;
            g.globalAlpha *= gh;
            g.beginPath();
            for (let i = 0; i <= 160; i++) {
                const s = (SCP.span * i) / 160;
                const y = mid - ((base - top) / 2) * 0.7 * Math.sin(2 * Math.PI * v.q.f0 * (v.ts + s - v.q.t));
                if (i) g.lineTo(X(s), y);
                else g.moveTo(X(s), y);
            }
            g.stroke();
        }
        g.restore();
        // Brackets: one per measured period.
        const ba = popIn(t, wt('strange', 'repeat') - 0.05, 0.3);
        if (ba > 0) {
            const by = base + 54;
            g.save();
            g.globalAlpha *= ba;
            g.strokeStyle = P.ink;
            g.lineWidth = 4;
            g.lineCap = 'round';
            const cnt = Math.floor(SCP.span / v.P0);
            for (let i = 0; i < cnt; i++) {
                const xa = X(i * v.P0) + 5;
                const xb = X((i + 1) * v.P0) - 5;
                const kk = clamp((t - (wt('strange', 'repeat') - 0.05) - i * 0.12) / 0.2);
                if (kk <= 0) continue;
                g.beginPath();
                g.moveTo(xa, by - 18);
                g.lineTo(xa, by);
                g.lineTo(lerp(xa, xb, kk), by);
                if (kk >= 1) g.lineTo(xb, by - 18);
                g.stroke();
            }
            g.restore();
            const ms = (v.P0 * 1000).toFixed(1);
            label(g, `repeats every ${ms} ms`, x0 - 14, base + 130, { size: 40, weight: 700, color: P.ink, alpha: ba });
            const ma = popIn(t, wt('strange', 'missing') - 0.05, 0.3);
            if (ma > 0) pill(g, `= ${(1 / v.P0).toFixed(1)} Hz, the note`, x1 - 170, base + 116, { size: 36, bg: P.amber, fg: P.dark, alpha: ma, scale: E.outBack(ma), weight: 800 });
        }
    }
    // The listener, watching the phone's sound arrive: cyan dots run from the
    // scope down to its antenna; from "puts the note back" the antenna
    // answers in amber, once per note the phone plays.
    const tBrain = wt('brain', 'brain');
    const tPuts = wt('brain', 'puts');
    const RB = { x: 240, y: 1240, s: 0.95 };
    const ax = RB.x + 68 * RB.s;
    const ay = RB.y - 150 * RB.s;
    const ra = popIn(t, SC.strange + 0.15, 0.35);
    if (ra > 0) {
        g.save();
        g.globalAlpha *= ra;
        const y0 = base + 196;
        const yEnd = ay - 56;
        for (let k = 0; k < 6; k++) {
            const u = ((t * 0.9 + k / 6) % 1);
            const yy = lerp(y0, yEnd, u);
            g.fillStyle = `rgba(125,211,252,${0.85 * Math.sin(Math.PI * u)})`;
            g.beginPath();
            g.arc(ax, yy, 7, 0, Math.PI * 2);
            g.fill();
        }
        const ant = E.out(popIn(t, tPuts, 0.4));
        const look = { x: lerp(x0, x1, 0.5 + 0.3 * Math.sin(t * 0.8)), y: mid };
        robotDome(g, RB, { s: RB.s, look, lid: t < tBrain ? 0 : blink(t, tBrain + 1.2), antenna: ant, rings: t > tPuts ? satRings(t, tPuts - 0.4) : [] });
        g.restore();
    }
    // "Puts the note back": the note forms in a thought bubble over the
    // robot, in amber (its wave slowed down to be seen).
    const tNever = wt('ghost', 'never');
    const CL = { x: 470, y: 1010, w: 250, h: 120 };
    const ca = popIn(t, tPuts - 0.15, 0.3) * (1 - popIn(t, tNever + 0.15, 0.3));
    if (ca > 0) {
        g.save();
        g.globalAlpha *= ca;
        g.fillStyle = '#16233f';
        g.strokeStyle = P.ink4;
        g.lineWidth = 3;
        for (const [dx, dy, r] of [[-70, 120, 10], [-48, 92, 15]]) {
            g.beginPath();
            g.arc(CL.x + dx - 40, CL.y + dy, r, 0, Math.PI * 2);
            g.fill();
            g.stroke();
        }
        rr(g, CL.x - CL.w / 2, CL.y - CL.h / 2, CL.w, CL.h, CL.h / 2);
        g.fill();
        g.stroke();
        const drawn = E.out(popIn(t, tPuts, 0.7));
        g.strokeStyle = P.amber;
        g.lineWidth = 6;
        g.lineCap = 'round';
        g.beginPath();
        for (let i = 0; i <= 60 * drawn; i++) {
            const u = i / 60;
            const px = CL.x - CL.w / 2 + 30 + u * (CL.w - 60);
            const py = CL.y - 30 * Math.sin(u * Math.PI * 5 - t * 5);
            if (i) g.lineTo(px, py);
            else g.moveTo(px, py);
        }
        g.stroke();
        g.restore();
    }
    // On "never played": the ladder, and the note flies from the bubble
    // into its dark zone, where the phone played nothing.
    const la = popIn(t, voBy.ghost.at - 0.05, 0.3);
    if (la > 0) {
        const box = { x0: 760, x1: 926, y0: 975, y1: 1262 };
        const q = scopeView(t)?.q;
        const gk = E.out(popIn(t, tNever + 0.35, 0.3));
        // The heard note takes the place of the sub's outline: this ladder is what you hear.
        const lad = ladder(box, t, { alpha: la, ghost: gk, ghostF0: q?.f0 ?? 51.91, zoneLeft: true, maxN: 6, rungH: 14, fundAlpha: 1 - gk });
        const fly = seg(t, tNever, tNever + 0.4);
        if (fly > 0 && fly < 1 && lad) {
            const k = E.inOut(fly);
            const tx = box.x0 + lad.L(0) / 2;
            const ty = lad.Y(q?.f0 ?? 51.91);
            const px = lerp(CL.x, tx, k);
            const py = lerp(CL.y, ty, k) - 80 * Math.sin(Math.PI * k);
            g.strokeStyle = P.amber;
            g.lineWidth = 8;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(px - lerp(50, lad.L(0) / 2, k), py);
            g.lineTo(px + lerp(50, lad.L(0) / 2, k), py);
            g.stroke();
        }
        if (gk > 0) {
            g.save();
            g.globalAlpha *= gk;
            g.setLineDash([10, 7]);
            rr(g, 560, 906, 40, 20, 5);
            g.strokeStyle = P.amber;
            g.lineWidth = 4;
            g.stroke();
            g.restore();
            label(g, 'heard, never played', 614, 927, { size: 32, weight: 700, color: P.amber, family: BODY, alpha: gk });
        }
    }
    g.restore();
}

// ══ Limit: feel on a club sub, hear on a phone ══
function drawLimit(t) {
    const a = viewAlpha(t, SC.limit, SC.rule + 0.1);
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    push(t, SC.limit, SC.rule);
    // Club sub: big cone, air moving.
    const la = popIn(t, voBy.limit.at - 0.05, 0.3);
    const breathe = Math.sin(t * 2 * Math.PI * 1.5);
    g.save();
    g.globalAlpha *= la;
    for (let k = 0; k < 3; k++) {
        const age = ((t * 0.9 + k / 3) % 1);
        g.strokeStyle = `rgba(251,191,36,${0.5 * (1 - age)})`;
        g.lineWidth = 8;
        g.beginPath();
        g.arc(290, 760, 200 + age * 160, -0.9, 0.9);
        g.stroke();
    }
    clubSub(g, 290, 760, 340, breathe);
    label(g, 'Club sub', 290, 470, { size: 52, weight: 800, color: P.ink, align: 'center' });
    g.restore();
    const fa = popIn(t, wt('limit', 'feel') - 0.05, 0.3);
    tag(g, 'feel it', 290, 1080, null, { a: fa, bg: P.amber, fg: P.dark, size: 44, weight: 800 });
    // Phone: the harmonics, heard.
    const pa = popIn(t, wt('limit', 'but') - 0.05, 0.3);
    if (pa > 0) {
        g.save();
        g.globalAlpha *= pa;
        phoneBody(g, 660, 540, 230, 430, { grille: 0.5 + 0.5 * Math.abs(Math.sin(t * 6)), screen: phoneScreen(t, 0.6) });
        for (let k = 0; k < 3; k++) {
            const age = (t * 1.6 + k / 3) % 1;
            g.strokeStyle = `rgba(125,211,252,${0.6 * (1 - age)})`;
            g.lineWidth = 5;
            g.beginPath();
            g.arc(775, 920, 40 + age * 120, 0.2, Math.PI - 0.2);
            g.stroke();
        }
        label(g, 'Phone', 775, 470, { size: 52, weight: 800, color: P.ink, align: 'center' });
        g.restore();
    }
    const ha = popIn(t, wt('limit', 'hear') - 0.05, 0.3);
    tag(g, 'hear the melody', 755, 1170, null, { a: ha, bg: P.cyan, fg: P.dark, size: 44, weight: 800 });
    g.restore();
}

// ══ The rule ══
function drawRule(t) {
    const a = viewAlpha(t, SC.rule, SC.again);
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    push(t, SC.rule, SC.again);
    const cards = [
        { y: 330, at: wt('rule', 'keep'), head: 'Sub: clean, mono', headColor: P.amber, lines: ['for big speakers'], icon: 'sub' },
        { y: 800, at: wt('rule', 'add'), head: 'Harmonics:', headColor: P.cyan, lines: ['parallel saturation,', 'high-pass 120 Hz,', 'for small speakers'], icon: 'phone' },
    ];
    for (const c of cards) {
        const k = popIn(t, c.at - 0.1, 0.3);
        if (k <= 0) continue;
        g.save();
        g.globalAlpha *= k;
        const sc = lerp(0.92, 1, E.outBack(k));
        g.translate(540, c.y + 200);
        g.scale(sc, sc);
        g.translate(-540, -(c.y + 200));
        rr(g, 70, c.y, 880, 400, 40);
        g.fillStyle = 'rgba(22,35,63,0.94)';
        g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.07)';
        g.lineWidth = 3;
        g.stroke();
        if (c.icon === 'sub') clubSub(g, 230, c.y + 200, 200, Math.sin(t * 9));
        else phoneBody(g, 160, c.y + 60, 150, 280, { grille: 0.6, screen: null });
        label(g, c.head, 370, c.y + 120, { size: 48, weight: 800, color: c.headColor });
        c.lines.forEach((ln, i) => label(g, ln, 370, c.y + 190 + i * 58, { size: 42, weight: 600, color: i === c.lines.length - 1 ? P.ink : P.ink2 }));
        // A tiny ladder, as the film drew them: the sub alone, or the sub with its harmonics.
        const gx = 856;
        const gy = c.y + 330;
        rr(g, gx - 10, c.y + 70, 100, 290, 16);
        g.fillStyle = '#081022';
        g.fill();
        const bars = c.icon === 'sub' ? [[0, 70, P.amber]] : [[0, 70, P.amber], [1, 34, P.cyan], [2, 54, P.cyan], [3, 44, P.cyan], [4, 36, P.cyan]];
        for (const [i, len, col] of bars) {
            const by = gy - 22 - i * 46;
            const grow = E.out(popIn(t, c.at + 0.1 + i * 0.08, 0.3));
            rr(g, gx + 4, by - 8, Math.max(2, len * grow), 16, 4);
            g.fillStyle = col;
            g.fill();
        }
        g.restore();
    }
    g.restore();
}

// ══ End: who made it, the lesson's demo on a phone, the address (as film 3) ══
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
const KEYWORD = { harmonics: P.cyan };
/** Split words (with widths) into at most two lines of near-equal width, or greedily if they need more. */
function wrapLines(words, maxW, space) {
    const width = (ws) => ws.reduce((p, w) => p + w.width, 0) + space * Math.max(0, ws.length - 1);
    if (width(words) <= maxW) return [words];
    let best = null;
    for (let i = 1; i < words.length; i++) {
        const l1 = words.slice(0, i);
        const l2 = words.slice(i);
        // Never split a name.
        if (norm(l1[l1.length - 1].w) === 'virzy') continue;
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

/**
 * A line's subtitle pages, each at most two balanced rows. A line too long
 * for two rows is split once, recursively, preferring a sentence end, then a
 * comma, then the most even split; never inside "Virzy Guns".
 */
const PAGES = {};
function pagesOf(v, words, maxW, space) {
    if (PAGES[v.id]) return PAGES[v.id];
    const split = (ws) => {
        if (wrapLines(ws, maxW, space).length <= 2) return [wrapLines(ws, maxW, space)];
        let best = null;
        for (let i = 2; i < ws.length - 1; i++) {
            const end = ws[i - 1].w;
            if (norm(end) === 'virzy') continue;
            const cost = (/[.?!…:]$/.test(end) ? 0 : /,$/.test(end) ? 2 : 6) + Math.abs(2 * i - ws.length) / ws.length;
            if (!best || cost < best.cost) best = { cost, i };
        }
        return [...split(ws.slice(0, best.i)), ...split(ws.slice(best.i))];
    };
    PAGES[v.id] = split(words);
    return PAGES[v.id];
}

function subtitles(t) {
    const v = VO.filter((x) => t >= x.at - 0.12 && t <= x.at + x.dur + 0.3).pop();
    if (!v) {
        // During a demo with no narration: a speaker and "Listen", the cue to turn the sound on.
        const d = TL.bass.find((q) => q.drums && t >= q.from + 0.5 && t < q.to);
        if (d) {
            const a = clamp((t - d.from - 0.5) / 0.15) * (1 - clamp((t - d.to + 0.15) / 0.15));
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
    const pages = pagesOf(v, words, maxW, space);
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
            g.globalAlpha = fadeIn * fadeOut * lerp(0.55, 1, on);
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
    for (const h of D.hits) if (h.voice === 'kick' && t >= h.t && t - h.t < 0.3) kick = Math.max(kick, 1 - (t - h.t) / 0.3);
    ground(g, t, 0.3 * kick);
    drawHook(t);
    drawAir(t);
    drawPhone(t);
    drawLadder(t);
    drawScope(t);
    drawLimit(t);
    drawRule(t);
    drawEnd(t);
    if (words) subtitles(t);
    badge(t);
}

/** Cover for the profile grid: the payoff frame of the hook, without subtitles. */
function drawCover() {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    ground(g, 9.3, 0);
    g.translate(0, 110);
    drawHook(9.3);
    g.setTransform(1, 0, 0, 1, 0, 0);
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
