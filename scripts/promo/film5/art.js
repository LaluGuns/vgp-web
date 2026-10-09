// Film 3 illustration kit: palette, easing, type, and the drawn objects
// (snare, compressor, robot hand, fader, meter, knob, phone). Runs in the
// page. Every function draws from its arguments only, so a frame depends on
// time and nothing else.
/* eslint-disable no-unused-vars */

const W = 1080;
const H = 1920;

const P = {
    bg0: '#050913',
    bg1: '#0a1426',
    bg2: '#11213d',
    haze: '#173158',
    ink: '#f8fafc',
    ink2: 'rgba(248,250,252,0.74)',
    ink3: 'rgba(248,250,252,0.5)',
    ink4: 'rgba(248,250,252,0.16)',
    ink5: 'rgba(248,250,252,0.07)',
    cyan: '#7dd3fc',
    cyan2: '#38bdf8',
    cyanDim: 'rgba(125,211,252,0.2)',
    amber: '#fbbf24',
    amber2: '#f59e0b',
    amberDim: 'rgba(251,191,36,0.22)',
    violet: '#4f6fa8',
    violetHi: '#86a3d6',
    violetLo: '#2c4475',
    steel: '#d3dbe8',
    steelLo: '#8d9ab0',
    steelDk: '#5b6880',
    dev: '#1b2946',
    devHi: '#28395f',
    devLo: '#111b31',
    face: '#0b1427',
    glove: '#f8fafc',
    gloveLo: '#c7d1df',
    wood: '#f3d29b',
    woodLo: '#c9975a',
    shadow: 'rgba(0,0,0,0.38)',
    dark: '#06101d',
};

// ── Maths and easing ──
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
    inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2),
    out: (k) => 1 - (1 - k) ** 3,
    in: (k) => k * k * k,
    outBack: (k) => {
        const c = 1.70158;
        return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
    },
    outQuint: (k) => 1 - (1 - k) ** 5,
};
/** 0 → 1 → 0 bump: rises over `up`, falls over `down`, starting at t0. */
const bump = (t, t0, up, down) => (t < t0 ? 0 : t < t0 + up ? E.out((t - t0) / up) : Math.max(0, 1 - (t - t0 - up) / down));
const toDb = (v) => 20 * Math.log10(Math.max(v, 1e-6));
/** Level in dB as height 0..1 over a 36 dB range: the scale every lane uses. */
const RANGE = 36;
const lvl = (v) => clamp((toDb(v) + RANGE) / RANGE);

function rand(seed) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ── Type ──
const DISPLAY = "'VGP Inter Display', 'VGP Inter', sans-serif";
const BODY = "'VGP Inter', sans-serif";
function font(g, size, weight = 600, family = DISPLAY) {
    g.font = `${weight} ${size}px ${family}`;
}
function label(g, str, x, y, { size = 34, weight = 600, color = P.ink, align = 'left', family = DISPLAY, alpha = 1, base = 'alphabetic' } = {}) {
    g.save();
    g.globalAlpha *= alpha;
    font(g, size, weight, family);
    g.fillStyle = color;
    g.textAlign = align;
    g.textBaseline = base;
    g.fillText(str, x, y);
    g.restore();
}

function rr(g, x, y, w, h, r) {
    const q = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + q, y);
    g.arcTo(x + w, y, x + w, y + h, q);
    g.arcTo(x + w, y + h, x, y + h, q);
    g.arcTo(x, y + h, x, y, q);
    g.arcTo(x, y, x + w, y, q);
    g.closePath();
}

/** Rounded label: filled pill with text, positioned by its centre. */
function pill(g, str, cx, cy, { size = 32, bg = P.ink, fg = P.dark, alpha = 1, scale = 1, weight = 600, ring = null } = {}) {
    if (alpha <= 0) return;
    g.save();
    g.globalAlpha *= alpha;
    g.translate(cx, cy);
    g.scale(scale, scale);
    font(g, size, weight);
    const w = g.measureText(str).width + size * 1.1;
    const h = size * 1.7;
    rr(g, -w / 2, -h / 2, w, h, h / 2);
    g.fillStyle = bg;
    g.fill();
    if (ring) {
        g.strokeStyle = ring;
        g.lineWidth = 4;
        g.stroke();
    }
    g.fillStyle = fg;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(str, 0, size * 0.04);
    g.restore();
}

function shadow(g, x, y, rx, ry, a = 1) {
    g.save();
    g.globalAlpha *= a;
    const gr = g.createRadialGradient(x, y, 0, x, y, rx);
    gr.addColorStop(0, 'rgba(0,0,0,0.42)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
}

// ── Ground: deep space blue, two planets, dust and slow bokeh ──
const DUST = (() => {
    const r = rand(7);
    return Array.from({ length: 110 }, () => ({ x: r() * W, y: r() * H, z: 0.3 + r() * 0.7, ph: r() * 6.28, a: 0.08 + r() * 0.32 }));
})();
const BOKEH = (() => {
    const r = rand(19);
    return Array.from({ length: 16 }, () => ({ x: r() * W, y: r() * H, r: 18 + r() * 46, ph: r() * 6.28, a: 0.04 + r() * 0.07 }));
})();
function planet(g, x, y, r, rim) {
    const f = g.createLinearGradient(x - r, y - r, x + r, y + r);
    f.addColorStop(0, '#1d3368');
    f.addColorStop(1, '#0d1838');
    g.fillStyle = f;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(125,211,252,0.16)';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(x, y, r - 3, rim - 0.9, rim + 0.9);
    g.stroke();
}
function ground(g, t, glow = 0) {
    const lin = g.createLinearGradient(0, 0, 0, H);
    lin.addColorStop(0, '#0d1840');
    lin.addColorStop(0.55, '#08112a');
    lin.addColorStop(1, '#050912');
    g.fillStyle = lin;
    g.fillRect(0, 0, W, H);
    g.save();
    g.globalAlpha = 0.85;
    // Top planet kept off screen below y 250, so it never crosses a headline.
    planet(g, W + 120 + 10 * Math.sin(t * 0.06), -20, 300, 2.3);
    planet(g, -W * 0.1, H * 1.04 + 8 * Math.sin(t * 0.05), 440, -0.9);
    g.restore();
    const c = g.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, H * 0.55);
    c.addColorStop(0, `rgba(70,130,230,${0.2 + 0.18 * glow})`);
    c.addColorStop(1, 'rgba(70,130,230,0)');
    g.fillStyle = c;
    g.fillRect(0, 0, W, H);
    for (const b of BOKEH) {
        const x = (((b.x + t * 4) % (W + 200)) + W + 200) % (W + 200) - 100;
        const y = b.y + Math.sin(t * 0.25 + b.ph) * 20;
        const gr = g.createRadialGradient(x, y, 0, x, y, b.r);
        gr.addColorStop(0, `rgba(160,200,255,${b.a})`);
        gr.addColorStop(1, 'rgba(160,200,255,0)');
        g.fillStyle = gr;
        g.beginPath();
        g.arc(x, y, b.r, 0, Math.PI * 2);
        g.fill();
    }
    g.save();
    g.fillStyle = P.ink;
    for (const d of DUST) {
        const x = (((d.x + t * 6 * d.z) % W) + W) % W;
        const y = d.y + Math.sin(t * 0.4 + d.ph) * 12 * d.z;
        g.globalAlpha = d.a * (0.55 + 0.45 * Math.sin(t * 1.3 + d.ph * 3));
        g.beginPath();
        g.arc(x, y, 1 + 1.8 * d.z, 0, Math.PI * 2);
        g.fill();
    }
    g.restore();
}

/** The inside of the compressor: a dark panel with faint circuit traces. */
const PANEL = { x: 40, y: 280, w: 1000, h: 1010, r: 52 };
function panel(g) {
    shadow(g, W / 2, PANEL.y + PANEL.h + 10, 520, 40, 0.7);
    rr(g, PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r);
    const f = g.createLinearGradient(0, PANEL.y, 0, PANEL.y + PANEL.h);
    f.addColorStop(0, '#16233f');
    f.addColorStop(1, '#0e182d');
    g.fillStyle = f;
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.06)';
    g.lineWidth = 3;
    g.stroke();
    g.save();
    rr(g, PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r);
    g.clip();
    const r = rand(11);
    g.strokeStyle = 'rgba(125,211,252,0.06)';
    g.lineWidth = 4;
    for (let i = 0; i < 18; i++) {
        const y = PANEL.y + 30 + r() * (PANEL.h - 60);
        const x = PANEL.x + r() * PANEL.w;
        const l = 80 + r() * 220;
        const up = r() < 0.5 ? -40 : 40;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + l, y);
        g.lineTo(x + l + 40, y + up);
        g.stroke();
        g.fillStyle = 'rgba(125,211,252,0.1)';
        g.beginPath();
        g.arc(x, y, 7, 0, Math.PI * 2);
        g.fill();
    }
    g.restore();
    for (const [sx, sy] of [[PANEL.x + 30, PANEL.y + 30], [PANEL.x + PANEL.w - 30, PANEL.y + 30], [PANEL.x + 30, PANEL.y + PANEL.h - 30], [PANEL.x + PANEL.w - 30, PANEL.y + PANEL.h - 30]]) {
        g.fillStyle = P.steelDk;
        g.beginPath();
        g.arc(sx, sy, 8, 0, Math.PI * 2);
        g.fill();
    }
}

// ── Snare drum: violet shell, chrome hoops, white head, one stick ──
// Origin at the centre of the head. `stick` is the stick's angle in radians
// (0 = touching the head), `ring` the age in seconds of the last strike.
function snareDrum(g, x, y, s, { stick = -0.6, ring = 9, squash = 0 } = {}) {
    g.save();
    g.translate(x, y);
    g.scale(s, s * (1 - 0.03 * squash));
    shadow(g, 0, 205, 230, 34);
    const rx = 180;
    const ry = 42;
    const hgt = 160;
    // Shell, front face.
    g.beginPath();
    g.moveTo(-rx, 0);
    g.lineTo(-rx, hgt);
    g.ellipse(0, hgt, rx, ry, 0, Math.PI, 0, true);
    g.lineTo(rx, 0);
    g.ellipse(0, 0, rx, ry, 0, 0, Math.PI, false);
    g.closePath();
    const sh = g.createLinearGradient(-rx, 0, rx, 0);
    sh.addColorStop(0, P.violetHi);
    sh.addColorStop(0.42, P.violet);
    sh.addColorStop(1, P.violetLo);
    g.fillStyle = sh;
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = 'rgba(255,255,255,0.16)';
    g.fillRect(-rx + 34, -50, 26, hgt + 100);
    g.fillStyle = 'rgba(255,255,255,0.07)';
    g.fillRect(-rx + 72, -50, 10, hgt + 100);
    g.restore();
    // Lugs around the front.
    for (const th of [2.75, 2.25, 1.85, 1.29, 0.89, 0.39]) {
        const lx = rx * Math.cos(th);
        const depth = Math.sin(th);
        g.save();
        g.translate(lx, 0);
        g.scale(0.55 + 0.45 * depth, 1);
        rr(g, -11, ry * depth + 28, 22, 70, 9);
        g.fillStyle = P.steel;
        g.fill();
        rr(g, -11, ry * depth + 28, 8, 70, 4);
        g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fill();
        g.restore();
    }
    // Bottom hoop.
    g.lineWidth = 16;
    g.strokeStyle = P.steelLo;
    g.beginPath();
    g.ellipse(0, hgt, rx, ry, 0, Math.PI, 0, true);
    g.stroke();
    // Head and top hoop.
    g.fillStyle = '#eef2f8';
    g.beginPath();
    g.ellipse(0, 0, rx - 6, ry - 4, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(15,23,42,0.06)';
    g.beginPath();
    g.ellipse(14, 6, rx - 40, ry - 14, 0, 0, Math.PI * 2);
    g.fill();
    // Vibration rings from the strike point.
    if (ring < 0.6) {
        g.save();
        g.beginPath();
        g.ellipse(0, 0, rx - 8, ry - 6, 0, 0, Math.PI * 2);
        g.clip();
        for (let k = 0; k < 3; k++) {
            const a = ring - k * 0.07;
            if (a < 0) continue;
            g.strokeStyle = `rgba(79,111,168,${0.6 * (1 - a / 0.6)})`;
            g.lineWidth = 5;
            g.beginPath();
            g.ellipse(40, -4, 30 + a * 420, (30 + a * 420) * 0.23, 0, 0, Math.PI * 2);
            g.stroke();
        }
        g.restore();
    }
    g.lineWidth = 14;
    g.strokeStyle = P.steel;
    g.beginPath();
    g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 4;
    g.strokeStyle = 'rgba(255,255,255,0.7)';
    g.beginPath();
    g.ellipse(0, -2, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.6);
    g.stroke();
    // Impact burst above the head.
    if (ring < 0.22) {
        const k = ring / 0.22;
        g.save();
        g.strokeStyle = `rgba(248,250,252,${0.9 * (1 - k)})`;
        g.lineWidth = 6;
        g.lineCap = 'round';
        for (const a of [-2.4, -1.95, -1.5, -1.05, -0.6]) {
            const r0 = 40 + 50 * k;
            const r1 = 70 + 90 * k;
            g.beginPath();
            g.moveTo(40 + Math.cos(a) * r0, -8 + Math.sin(a) * r0 * 0.7);
            g.lineTo(40 + Math.cos(a) * r1, -8 + Math.sin(a) * r1 * 0.7);
            g.stroke();
        }
        g.restore();
    }
    // Stick, pivoting from a hand above and to the right.
    g.save();
    g.translate(300, -270);
    g.rotate(stick);
    const tip = { x: 40 - 300, y: -8 + 270 };
    const len = Math.hypot(tip.x, tip.y);
    g.rotate(Math.atan2(tip.y, tip.x));
    g.lineCap = 'round';
    g.strokeStyle = P.woodLo;
    g.lineWidth = 22;
    g.beginPath();
    g.moveTo(-60, 0);
    g.lineTo(len - 24, 0);
    g.stroke();
    g.strokeStyle = P.wood;
    g.lineWidth = 16;
    g.beginPath();
    g.moveTo(-60, -2);
    g.lineTo(len - 24, -1);
    g.stroke();
    g.fillStyle = P.wood;
    g.beginPath();
    g.ellipse(len - 10, 0, 16, 11, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
    g.restore();
}

// ── Knob: steel, ticks around, a cyan pointer. `k` is 0..1 of its travel. ──
function knob(g, x, y, r, k, { ticks = true, glow = 0 } = {}) {
    const a0 = -Math.PI * 1.25;
    const a1 = Math.PI * 0.25;
    const a = lerp(a0, a1, k);
    g.save();
    g.translate(x, y);
    if (glow > 0) {
        g.strokeStyle = `rgba(125,211,252,${0.5 * glow})`;
        g.lineWidth = 6;
        g.beginPath();
        g.arc(0, 0, r * 1.3, 0, Math.PI * 2);
        g.stroke();
    }
    if (ticks) {
        g.lineCap = 'round';
        for (let i = 0; i <= 10; i++) {
            const ta = lerp(a0, a1, i / 10);
            g.strokeStyle = i / 10 <= k + 1e-6 ? P.cyan : P.ink4;
            g.lineWidth = 5;
            g.beginPath();
            g.moveTo(Math.cos(ta) * r * 1.18, Math.sin(ta) * r * 1.18);
            g.lineTo(Math.cos(ta) * r * 1.32, Math.sin(ta) * r * 1.32);
            g.stroke();
        }
    }
    shadow(g, 6, r * 0.25, r * 1.15, r * 1.05, 0.8);
    const b = g.createLinearGradient(-r, -r, r, r);
    b.addColorStop(0, '#eef2f8');
    b.addColorStop(1, P.steelLo);
    g.fillStyle = b;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = P.steel;
    g.beginPath();
    g.arc(0, 0, r * 0.78, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = P.dark;
    g.lineWidth = r * 0.14;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
    g.lineTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
    g.stroke();
    g.restore();
}

// ── The compressor: a rounded box with one big Attack knob and a gain
// reduction meter. Origin at its centre. ──
function compressorBox(g, x, y, s, { k = 0, value = '', gr = 0, glow = 0 } = {}) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    shadow(g, 0, 150, 240, 30);
    rr(g, -200, -130, 400, 260, 34);
    g.fillStyle = P.dev;
    g.fill();
    g.save();
    rr(g, -200, -130, 400, 260, 34);
    g.clip();
    g.fillStyle = P.devHi;
    g.fillRect(-200, -130, 400, 34);
    g.fillStyle = P.devLo;
    g.fillRect(-200, 104, 400, 26);
    g.restore();
    for (const [sx, sy] of [[-178, -110], [178, -110], [-178, 112], [178, 112]]) {
        g.fillStyle = P.steelDk;
        g.beginPath();
        g.arc(sx, sy, 6, 0, Math.PI * 2);
        g.fill();
    }
    rr(g, -176, -88, 352, 186, 22);
    g.fillStyle = P.face;
    g.fill();
    knob(g, -92, 0, 50, k, { glow });
    label(g, 'Attack', -92, 104, { size: 32, weight: 600, color: P.ink2, align: 'center', family: BODY });
    // Value display.
    rr(g, 10, -36, 148, 72, 14);
    g.fillStyle = '#071021';
    g.fill();
    label(g, value, 84, 13, { size: 38, weight: 600, color: P.cyan, align: 'center' });
    // Jacks.
    for (const sx of [-200, 200]) {
        rr(g, sx - 12, 24, 24, 40, 8);
        g.fillStyle = P.steelLo;
        g.fill();
    }
    g.restore();
}

/** A cable as a cubic curve, with pulses travelling along it at `pulses` (0..1 positions). */
function cable(g, a, b, c1, c2, pulses = []) {
    g.save();
    g.lineCap = 'round';
    g.strokeStyle = P.dark;
    g.lineWidth = 18;
    g.beginPath();
    g.moveTo(a.x, a.y);
    g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, b.x, b.y);
    g.stroke();
    g.strokeStyle = '#2b3a58';
    g.lineWidth = 10;
    g.stroke();
    for (const p of pulses) {
        const u = p.u;
        const m = 1 - u;
        const px = m * m * m * a.x + 3 * m * m * u * c1.x + 3 * m * u * u * c2.x + u * u * u * b.x;
        const py = m * m * m * a.y + 3 * m * m * u * c1.y + 3 * m * u * u * c2.y + u * u * u * b.y;
        const gr = g.createRadialGradient(px, py, 0, px, py, 26);
        gr.addColorStop(0, `rgba(125,211,252,${0.95 * p.a})`);
        gr.addColorStop(1, 'rgba(125,211,252,0)');
        g.fillStyle = gr;
        g.beginPath();
        g.arc(px, py, 26, 0, Math.PI * 2);
        g.fill();
    }
    g.restore();
}

// ── Fader: a slot with dB ticks and a steel cap. `gr` in dB pulls it down. ──
const FADER_RANGE = 18;
function faderCapY(top, bottom, gr) {
    return lerp(top + 40, bottom - 40, clamp(gr / FADER_RANGE));
}
function fader(g, x, top, bottom, gr, { ticks = true, size = 1 } = {}) {
    g.save();
    rr(g, x - 11 * size, top, 22 * size, bottom - top, 11 * size);
    g.fillStyle = P.dark;
    g.fill();
    if (ticks) {
        for (const d of [0, 6, 12, 18]) {
            const ty = faderCapY(top, bottom, d);
            g.strokeStyle = P.ink4;
            g.lineWidth = 4;
            g.beginPath();
            g.moveTo(x + 92 * size, ty);
            g.lineTo(x + 118 * size, ty);
            g.stroke();
            label(g, d === 0 ? '0 dB' : `−${d}`, x + 130 * size, ty + 10 * size, { size: 30 * size, weight: 500, color: P.ink3, align: 'left', family: BODY });
        }
    }
    const cy = faderCapY(top, bottom, gr);
    shadow(g, x + 8, cy + 30 * size, 110 * size, 26 * size, 0.7);
    rr(g, x - 80 * size, cy - 38 * size, 160 * size, 76 * size, 16 * size);
    const cg = g.createLinearGradient(0, cy - 38 * size, 0, cy + 38 * size);
    cg.addColorStop(0, '#eef2f8');
    cg.addColorStop(1, P.steelLo);
    g.fillStyle = cg;
    g.fill();
    g.fillStyle = 'rgba(6,16,29,0.45)';
    for (const dy of [-14, 0, 14]) g.fillRect(x - 54 * size, cy + dy * size - 2, 108 * size, 4);
    g.restore();
    return cy;
}

// ── The robot: a dome with one big eye and an arm ending in a white glove.
// `hand` is where the glove grips (the right end of the fader cap), `arm`
// the arm's full length, `open` 0..1 opens the fingers, `look` is where the
// eye looks. ──
function robot(g, base, hand, { open = 0, look = null, lid = 0, s = 1, arm = 460, straight = false } = {}) {
    g.save();
    // Arm: two segments, elbow solved so the wrist lands just right of `hand`.
    const sh = { x: base.x - 40 * s, y: base.y - 70 * s };
    const l1 = (arm / 2) * s;
    const l2 = (arm / 2) * s;
    let dx = hand.x + 62 * s - sh.x;
    let dy = hand.y + 4 * s - sh.y;
    let d = Math.hypot(dx, dy);
    const maxD = (l1 + l2) * 0.995;
    if (d > maxD) {
        dx *= maxD / d;
        dy *= maxD / d;
        d = maxD;
    }
    const a = Math.atan2(dy, dx);
    const b = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    const wr = { x: sh.x + dx, y: sh.y + dy };
    const el = straight ? { x: lerp(sh.x, wr.x, 0.45), y: lerp(sh.y, wr.y, 0.45) } : { x: sh.x + l1 * Math.cos(a + b), y: sh.y + l1 * Math.sin(a + b) };
    g.lineCap = 'round';
    if (straight) {
        // Telescopic: a wide sleeve and a thinner rod sliding out of it.
        tube(g, sh, el, s * 1.25);
        tube(g, el, wr, s * 0.85);
    } else for (const [p, q] of [[sh, el], [el, wr]]) tube(g, p, q, s);
    for (const j of [sh, el]) {
        g.fillStyle = P.devHi;
        g.beginPath();
        g.arc(j.x, j.y, 25 * s, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = P.steelLo;
        g.beginPath();
        g.arc(j.x, j.y, 10 * s, 0, Math.PI * 2);
        g.fill();
    }
    glove(g, wr.x, wr.y, s, open, Math.PI);
    // Dome body with the eye.
    shadow(g, base.x, base.y + 12 * s, 160 * s, 26 * s);
    g.fillStyle = P.devHi;
    g.beginPath();
    g.arc(base.x, base.y, 120 * s, Math.PI, 0);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.07)';
    g.beginPath();
    g.arc(base.x - 30 * s, base.y - 40 * s, 70 * s, Math.PI * 1.05, Math.PI * 1.55);
    g.lineTo(base.x - 30 * s, base.y - 40 * s);
    g.fill();
    rr(g, base.x - 128 * s, base.y - 6 * s, 256 * s, 22 * s, 11 * s);
    g.fillStyle = P.dev;
    g.fill();
    // Antenna with a small light.
    g.strokeStyle = P.steelLo;
    g.lineWidth = 6 * s;
    g.beginPath();
    g.moveTo(base.x + 50 * s, base.y - 108 * s);
    g.lineTo(base.x + 72 * s, base.y - 160 * s);
    g.stroke();
    g.fillStyle = P.cyan;
    g.beginPath();
    g.arc(base.x + 74 * s, base.y - 164 * s, 10 * s, 0, Math.PI * 2);
    g.fill();
    const ex = base.x - 10 * s;
    const ey = base.y - 62 * s;
    g.fillStyle = P.dark;
    g.beginPath();
    g.arc(ex, ey, 50 * s, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#f1f5fb';
    g.beginPath();
    g.arc(ex, ey, 42 * s, 0, Math.PI * 2);
    g.fill();
    let ox = 0;
    let oy = 0;
    if (look) {
        const la = Math.atan2(look.y - ey, look.x - ex);
        ox = Math.cos(la) * 15 * s;
        oy = Math.sin(la) * 15 * s;
    }
    g.fillStyle = P.cyan2;
    g.beginPath();
    g.arc(ex + ox, ey + oy, 21 * s, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = P.dark;
    g.beginPath();
    g.arc(ex + ox * 1.15, ey + oy * 1.15, 10 * s, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(ex + ox - 7 * s, ey + oy - 8 * s, 5 * s, 0, Math.PI * 2);
    g.fill();
    if (lid > 0) {
        g.save();
        g.beginPath();
        g.arc(ex, ey, 43 * s, 0, Math.PI * 2);
        g.clip();
        g.fillStyle = P.devHi;
        g.fillRect(ex - 50 * s, ey - 50 * s, 100 * s, 100 * s * lid);
        g.restore();
    }
    g.restore();
}

/** The robot's dome with its one eye; `base` is the middle of its flat bottom. */
function robotDome(g, base, { look = null, lid = 0, s = 1 } = {}) {
    shadow(g, base.x, base.y + 10 * s, 150 * s, 22 * s, 0.8);
    g.fillStyle = P.devHi;
    g.beginPath();
    g.arc(base.x, base.y, 110 * s, Math.PI, 0);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.08)';
    g.beginPath();
    g.arc(base.x - 26 * s, base.y - 38 * s, 64 * s, Math.PI * 1.05, Math.PI * 1.55);
    g.lineTo(base.x - 26 * s, base.y - 38 * s);
    g.fill();
    rr(g, base.x - 118 * s, base.y - 6 * s, 236 * s, 20 * s, 10 * s);
    g.fillStyle = P.dev;
    g.fill();
    g.strokeStyle = P.steelLo;
    g.lineWidth = 6 * s;
    g.beginPath();
    g.moveTo(base.x + 46 * s, base.y - 98 * s);
    g.lineTo(base.x + 66 * s, base.y - 146 * s);
    g.stroke();
    g.fillStyle = P.cyan;
    g.beginPath();
    g.arc(base.x + 68 * s, base.y - 150 * s, 10 * s, 0, Math.PI * 2);
    g.fill();
    const ex = base.x - 6 * s;
    const ey = base.y - 54 * s;
    g.fillStyle = P.dark;
    g.beginPath();
    g.arc(ex, ey, 46 * s, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#f1f5fb';
    g.beginPath();
    g.arc(ex, ey, 38 * s, 0, Math.PI * 2);
    g.fill();
    let ox = 0;
    let oy = 0;
    if (look) {
        const la = Math.atan2(look.y - ey, look.x - ex);
        ox = Math.cos(la) * 14 * s;
        oy = Math.sin(la) * 14 * s;
    }
    g.fillStyle = P.cyan2;
    g.beginPath();
    g.arc(ex + ox, ey + oy, 19 * s, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = P.dark;
    g.beginPath();
    g.arc(ex + ox * 1.15, ey + oy * 1.15, 9 * s, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(ex + ox - 6 * s, ey + oy - 7 * s, 4.5 * s, 0, Math.PI * 2);
    g.fill();
    if (lid > 0) {
        g.save();
        g.beginPath();
        g.arc(ex, ey, 47 * s, 0, Math.PI * 2);
        g.clip();
        g.fillStyle = P.devHi;
        g.fillRect(ex - 48 * s, ey - 48 * s, 96 * s, 96 * s * clamp(lid * 1.15));
        g.restore();
        if (lid > 0.8) {
            // Closed: one curved lid line.
            g.strokeStyle = P.dark;
            g.lineWidth = 6 * s;
            g.lineCap = 'round';
            g.beginPath();
            g.arc(ex, ey - 6 * s, 30 * s, Math.PI * 0.2, Math.PI * 0.8);
            g.stroke();
        }
    }
}

/**
 * The robot on a shelf above its fader, reaching down with a telescopic arm.
 * `capTop` is the top edge of the fader cap; `grip` 0..1 closes the glove on
 * it, and an open glove hovers above the cap.
 */
function robotTop(g, x, shelfY, capTop, { grip = 1, look = null, lid = 0, s = 0.75, reach = 1, pulse = 0 } = {}) {
    // The glove's palm sits on the cap when gripping and hovers above it when open.
    const lift = (1 - grip) * 44 * s;
    const wrist = { x, y: lerp(shelfY + 40 * s, capTop - 44 * s * 1.4 - lift, reach) };
    const mid = { x, y: lerp(shelfY + 8 * s, wrist.y, 0.5) };
    tube(g, { x, y: shelfY + 4 * s }, mid, s * 1.25);
    tube(g, mid, wrist, s * 0.85);
    gloveDown(g, wrist.x, wrist.y, s * 1.4, grip, capTop, pulse);
    robotDome(g, { x, y: shelfY }, { look, lid, s });
}

/**
 * The white glove seen from the front, hand hanging down from the wrist.
 * grip 0: an open hand, fingers fanned, hovering. grip 1: palm on the cap,
 * four fingers folded over its front edge, knuckles showing.
 */
function gloveDown(g, x, y, s, grip, capTop, pulse = 0) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    if (pulse > 0) {
        g.strokeStyle = `rgba(125,211,252,${0.8 * (1 - pulse)})`;
        g.lineWidth = 5 / s;
        g.beginPath();
        g.arc(0, 40, 50 + 70 * pulse, 0, Math.PI * 2);
        g.stroke();
    }
    // Cuff.
    rr(g, -24, -8, 48, 20, 8);
    g.fillStyle = P.steel;
    g.fill();
    // Palm.
    g.fillStyle = P.gloveLo;
    g.beginPath();
    g.ellipse(2, 34, 30, 26, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = P.glove;
    g.beginPath();
    g.ellipse(0, 32, 29, 25, 0, 0, Math.PI * 2);
    g.fill();
    g.lineCap = 'round';
    // Thumb: out to the side when open, tucked when gripping.
    const ta = lerp(-0.2, 0.9, grip);
    g.strokeStyle = P.glove;
    g.lineWidth = 15;
    g.beginPath();
    g.moveTo(22, 26);
    g.lineTo(22 + Math.cos(ta) * 26, 26 + Math.sin(ta) * 26);
    g.stroke();
    for (let i = 0; i < 4; i++) {
        const fx = -18 + i * 12;
        if (grip > 0.5) {
            // Folded over the cap: short fingers ending in round knuckles.
            const len = lerp(30, 20, (grip - 0.5) * 2);
            g.strokeStyle = P.gloveLo;
            g.lineWidth = 13;
            g.beginPath();
            g.moveTo(fx + 1, 46);
            g.lineTo(fx + 1, 46 + len);
            g.stroke();
            g.strokeStyle = P.glove;
            g.lineWidth = 11;
            g.beginPath();
            g.moveTo(fx, 44);
            g.lineTo(fx, 44 + len);
            g.stroke();
            g.fillStyle = P.gloveLo;
            g.beginPath();
            g.arc(fx, 46 + len, 4, 0, Math.PI * 2);
            g.fill();
        } else {
            // Open: fingers fanned out and down.
            const a = Math.PI / 2 + (i - 1.5) * lerp(0.42, 0.2, grip * 2);
            const len = 34 - Math.abs(i - 1.5) * 4;
            const bx = fx * 0.6;
            g.strokeStyle = P.gloveLo;
            g.lineWidth = 12;
            g.beginPath();
            g.moveTo(bx + 1, 50);
            g.lineTo(bx + 1 + Math.cos(a) * len, 50 + Math.sin(a) * len);
            g.stroke();
            g.strokeStyle = P.glove;
            g.lineWidth = 10;
            g.beginPath();
            g.moveTo(bx, 48);
            g.lineTo(bx + Math.cos(a) * len, 48 + Math.sin(a) * len);
            g.stroke();
        }
    }
    g.restore();
    void capTop;
}

function tube(g, p, q, s) {
    g.lineCap = 'round';
    g.strokeStyle = P.steelDk;
    g.lineWidth = 36 * s;
    g.beginPath();
    g.moveTo(p.x, p.y);
    g.lineTo(q.x, q.y);
    g.stroke();
    g.strokeStyle = P.steelLo;
    g.lineWidth = 22 * s;
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.lineWidth = 6 * s;
    g.beginPath();
    g.moveTo(p.x - 4 * s, p.y - 7 * s);
    g.lineTo(q.x - 4 * s, q.y - 7 * s);
    g.stroke();
}

/** The same hand, closer: its arm reaches in from the right edge. */
function edgeArm(g, hand, s, open = 0) {
    const wr = { x: hand.x + 62 * s, y: hand.y + 4 * s };
    const el = { x: wr.x + 120 * s, y: wr.y + 60 * s };
    tube(g, { x: W + 60, y: el.y + 40 * s }, el, s);
    tube(g, el, wr, s);
    g.fillStyle = P.devHi;
    g.beginPath();
    g.arc(el.x, el.y, 24 * s, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = P.steelLo;
    g.beginPath();
    g.arc(el.x, el.y, 10 * s, 0, Math.PI * 2);
    g.fill();
    glove(g, wr.x, wr.y, s, open, Math.PI);
}

/** The glove, wrist at (x, y), pointing along `dir`, gripping when open = 0. */
function glove(g, x, y, s, open, dir) {
    g.save();
    g.translate(x, y);
    g.rotate(dir);
    g.scale(s, s);
    // Cuff.
    rr(g, -34, -26, 30, 52, 10);
    g.fillStyle = P.steel;
    g.fill();
    // Palm.
    g.fillStyle = P.gloveLo;
    g.beginPath();
    g.ellipse(26, 4, 38, 33, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = P.glove;
    g.beginPath();
    g.ellipse(24, 0, 36, 31, 0, 0, Math.PI * 2);
    g.fill();
    // Four fingers: curled over the cap when gripping, straight when open.
    g.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
        const fy = -21 + i * 14;
        const curl = (1 - open) * (0.9 + i * 0.12);
        const ax = 50;
        const len = 40 - i * 3;
        const ang = curl * 1.1 - open * 0.25 * (i - 1.5);
        g.strokeStyle = P.gloveLo;
        g.lineWidth = 17;
        g.beginPath();
        g.moveTo(ax - 6, fy + 2);
        g.lineTo(ax + Math.cos(ang) * len, fy + 2 + Math.sin(ang) * len);
        g.stroke();
        g.strokeStyle = P.glove;
        g.lineWidth = 14;
        g.beginPath();
        g.moveTo(ax - 6, fy);
        g.lineTo(ax + Math.cos(ang) * len, fy + Math.sin(ang) * len);
        g.stroke();
    }
    // Thumb.
    g.strokeStyle = P.glove;
    g.lineWidth = 16;
    const ta = -0.9 - open * 0.5;
    g.beginPath();
    g.moveTo(26, -24);
    g.lineTo(26 + Math.cos(ta) * 34, -24 + Math.sin(ta) * 34);
    g.stroke();
    g.restore();
}

// ── Level meter: a column of segments; above the threshold they turn amber. ──
function meter(g, x, top, bottom, level, thr, { w = 96, segs = 28 } = {}) {
    const h = (bottom - top) / segs;
    for (let i = 0; i < segs; i++) {
        const v = (i + 0.5) / segs;
        const y = bottom - (i + 1) * h;
        rr(g, x - w / 2, y + 3, w, h - 6, 6);
        const on = v <= level;
        g.fillStyle = on ? (v > thr ? P.ink : P.cyan) : P.ink5;
        g.fill();
    }
}

/** Stopwatch icon with a filled sweep for `k` (0..1) of its face. */
function stopwatch(g, x, y, r, k, color = P.cyan) {
    g.save();
    g.translate(x, y);
    g.strokeStyle = P.ink;
    g.lineWidth = r * 0.16;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.stroke();
    rr(g, -r * 0.22, -r * 1.48, r * 0.44, r * 0.3, r * 0.08);
    g.fillStyle = P.ink;
    g.fill();
    if (k > 0) {
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(0, 0);
        g.arc(0, 0, r * 0.74, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(k));
        g.closePath();
        g.fill();
    }
    g.strokeStyle = P.ink;
    g.lineWidth = r * 0.12;
    g.lineCap = 'round';
    const a = -Math.PI / 2 + Math.PI * 2 * clamp(k);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72);
    g.stroke();
    g.restore();
}

/** Speaker with sound waves; `level` 0..1 lights the waves. */
function speaker(g, x, y, s, level) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    g.fillStyle = P.ink;
    g.beginPath();
    g.moveTo(-22, -10);
    g.lineTo(-10, -10);
    g.lineTo(6, -24);
    g.lineTo(6, 24);
    g.lineTo(-10, 10);
    g.lineTo(-22, 10);
    g.closePath();
    g.fill();
    g.lineCap = 'round';
    g.lineWidth = 5;
    for (let i = 0; i < 3; i++) {
        g.strokeStyle = `rgba(125,211,252,${clamp(level * 3 - i) * 0.9 + 0.12})`;
        g.beginPath();
        g.arc(6, 0, 14 + i * 11, -0.8, 0.8);
        g.stroke();
    }
    g.restore();
}
