// Film 4 illustration kit (from film 3's): palette, easing, type, and the
// drawn objects (phone, speaker cone, club sub, the listening robot, knob).
// Runs in the
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
    planet(g, W * 1.1 + 10 * Math.sin(t * 0.06), -H * 0.035, 330, 2.3);
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

/** The robot's dome with its one eye; `base` is the middle of its flat bottom. */
function robotDome(g, base, { look = null, lid = 0, s = 1, antenna = 0, rings = [] } = {}) {
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
    // Antenna light: cyan at rest, amber while it hears the rebuilt note.
    const ax = base.x + 68 * s;
    const ay = base.y - 150 * s;
    for (const r of rings) {
        if (r <= 0 || r >= 1) continue;
        g.strokeStyle = `rgba(251,191,36,${0.85 * (1 - r)})`;
        g.lineWidth = 5 * s;
        g.beginPath();
        g.arc(ax, ay, (14 + 70 * r) * s, 0, Math.PI * 2);
        g.stroke();
    }
    if (antenna > 0) {
        const gl = g.createRadialGradient(ax, ay, 0, ax, ay, 46 * s);
        gl.addColorStop(0, `rgba(251,191,36,${0.55 * antenna})`);
        gl.addColorStop(1, 'rgba(251,191,36,0)');
        g.fillStyle = gl;
        g.beginPath();
        g.arc(ax, ay, 46 * s, 0, Math.PI * 2);
        g.fill();
    }
    g.fillStyle = antenna > 0.5 ? P.amber : P.cyan;
    g.beginPath();
    g.arc(ax, ay, (10 + 3 * antenna) * s, 0, Math.PI * 2);
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

/**
 * A phone, front view, origin at its top-left. `grille` 0..1 lights the
 * speaker slot at the bottom; `screen(g, x, y, w, h)` draws the display.
 */
function phoneBody(g, x, y, w, h, { grille = 0, screen = null } = {}) {
    g.save();
    shadow(g, x + w / 2, y + h + 14, w * 0.62, 26, 0.8);
    rr(g, x, y, w, h, w * 0.14);
    const body = g.createLinearGradient(x, y, x + w, y + h);
    body.addColorStop(0, '#34405c');
    body.addColorStop(1, '#1b2338');
    g.fillStyle = body;
    g.fill();
    rr(g, x + 7, y + 7, w - 14, h - 14, w * 0.12);
    g.fillStyle = '#04060a';
    g.fill();
    const sx = x + 18;
    const sy = y + 70;
    const sw = w - 36;
    const sh = h - 170;
    rr(g, sx, sy, sw, sh, 18);
    g.fillStyle = '#0a1020';
    g.fill();
    if (screen) {
        g.save();
        rr(g, sx, sy, sw, sh, 18);
        g.clip();
        screen(g, sx, sy, sw, sh);
        g.restore();
    }
    // Earpiece and camera.
    rr(g, x + w / 2 - 34, y + 30, 68, 10, 5);
    g.fillStyle = '#1e2740';
    g.fill();
    g.fillStyle = '#1e2740';
    g.beginPath();
    g.arc(x + w / 2 + 62, y + 35, 8, 0, Math.PI * 2);
    g.fill();
    // Speaker grille: a row of slots at the bottom edge.
    const gy = y + h - 52;
    const slots = Math.min(9, Math.floor((w - 60) / 22) | 1);
    for (let i = 0; i < slots; i++) {
        const gx = x + w / 2 + (i - (slots - 1) / 2) * 22;
        rr(g, gx - 6, gy - 13, 12, 26, 6);
        g.fillStyle = grille > 0 ? `rgba(125,211,252,${0.25 + 0.75 * grille})` : '#1e2740';
        g.fill();
    }
    g.restore();
}

/**
 * A loudspeaker in cross-section, facing right, origin at the centre of its
 * cone's mouth when at rest. `x` is the cone's displacement in px (positive
 * pushes out to the right), `size` the cone's height.
 */
function coneSide(g, cx, cy, size, x, { body = P.devHi, cone = P.steel, stops = null, deep = 0 } = {}) {
    const h = size;
    const d = size * 0.42;
    g.save();
    // Basket and magnet stay put; `deep` sets the motor further back, for long travel.
    const m = d + deep;
    g.fillStyle = P.dev;
    rr(g, cx - m - h * 0.34, cy - h * 0.2, h * 0.3, h * 0.4, 10);
    g.fill();
    g.fillStyle = P.steelDk;
    rr(g, cx - m - h * 0.08, cy - h * 0.13, h * 0.12, h * 0.26, 6);
    g.fill();
    g.strokeStyle = body;
    g.lineWidth = Math.max(4, h * 0.03);
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(cx - m + 4, cy - h * 0.12);
    g.lineTo(cx + 6, cy - h * 0.52);
    g.moveTo(cx - m + 4, cy + h * 0.12);
    g.lineTo(cx + 6, cy + h * 0.52);
    g.stroke();
    // Frame lips the surround hangs from.
    g.fillStyle = body;
    rr(g, cx - 4, cy - h * 0.56, 14, h * 0.1, 4);
    g.fill();
    rr(g, cx - 4, cy + h * 0.46, 14, h * 0.1, 4);
    g.fill();
    if (stops) {
        // How far this cone can travel: two small stops either side of rest.
        g.fillStyle = P.ink2;
        for (const sx of [-stops, stops]) {
            rr(g, cx - d * 0.52 + sx - 3, cy - h * 0.04 - 26, 6, 18, 3);
            g.fill();
        }
    }
    // Surround (top and bottom) and spider stretch to wherever the cone is.
    g.strokeStyle = P.steelDk;
    g.lineWidth = Math.max(6, h * 0.04);
    g.lineCap = 'round';
    g.beginPath();
    for (const sy of [-1, 1]) {
        g.moveTo(cx + 3, cy + sy * h * 0.51);
        g.lineTo(cx + 3 + x, cy + sy * h * 0.49);
        g.moveTo(cx - d * 0.55, cy + sy * h * 0.12);
        g.lineTo(cx - d * 0.55 + x, cy + sy * h * 0.09);
    }
    g.stroke();
    // The moving cone: diaphragm, dust cap and voice coil.
    g.save();
    g.translate(x, 0);
    g.fillStyle = P.steelLo;
    rr(g, cx - d * 0.6 - h * 0.08, cy - h * 0.07, h * 0.12, h * 0.14, 4);
    g.fill();
    g.beginPath();
    g.moveTo(cx - d * 0.55, cy - h * 0.08);
    g.lineTo(cx, cy - h * 0.46);
    g.quadraticCurveTo(cx + 10, cy - h * 0.5 + 0, cx + 2, cy - h * 0.5);
    g.lineTo(cx + 2, cy + h * 0.5);
    g.quadraticCurveTo(cx + 10, cy + h * 0.5, cx, cy + h * 0.46);
    g.lineTo(cx - d * 0.55, cy + h * 0.08);
    g.closePath();
    const cg = g.createLinearGradient(cx - d, cy - h / 2, cx, cy + h / 2);
    cg.addColorStop(0, cone);
    cg.addColorStop(1, P.steelLo);
    g.fillStyle = cg;
    g.fill();
    g.fillStyle = P.steelDk;
    g.beginPath();
    g.ellipse(cx - d * 0.5, cy, h * 0.05, h * 0.1, 0, -Math.PI / 2, Math.PI / 2);
    g.fill();
    g.restore();
    g.restore();
}

/** A club subwoofer cabinet, front view, its cone breathing by `x` (0..1). */
function clubSub(g, cx, cy, w, x) {
    const h = w * 1.18;
    g.save();
    shadow(g, cx, cy + h / 2 + 12, w * 0.6, 24, 0.9);
    rr(g, cx - w / 2, cy - h / 2, w, h, 24);
    g.fillStyle = '#141c2e';
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.08)';
    g.lineWidth = 4;
    g.stroke();
    const r = w * 0.4;
    const k = 1 + 0.035 * x;
    g.fillStyle = '#0b1120';
    g.beginPath();
    g.arc(cx, cy, r * 1.08, 0, Math.PI * 2);
    g.fill();
    const cg = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r * k);
    cg.addColorStop(0, '#5b6880');
    cg.addColorStop(1, '#232e46');
    g.fillStyle = cg;
    g.beginPath();
    g.arc(cx, cy, r * k, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 3;
    for (const q of [0.62, 0.84]) {
        g.beginPath();
        g.arc(cx, cy, r * q * k, 0, Math.PI * 2);
        g.stroke();
    }
    g.fillStyle = '#3a4762';
    g.beginPath();
    g.arc(cx, cy, r * 0.3 * (1 + 0.06 * x), 0, Math.PI * 2);
    g.fill();
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        g.fillStyle = P.steelDk;
        g.beginPath();
        g.arc(cx + sx * (w / 2 - 26), cy + sy * (h / 2 - 26), 8, 0, Math.PI * 2);
        g.fill();
    }
    g.restore();
}
