// Film 5 illustration kit, on top of art.js: the speaker cabinets of the
// hook, the ear in cross-section with its hair cells, the limiter console,
// the listener's brain, the DAW arrangement and small props (scissors,
// sparkles, sound waves, fog clouds). Every function draws from its
// arguments only, so a frame depends on time and nothing else.
//
// Object colours here are natural (skin, bone, a pink brain); the three
// code colours of the film keep their meanings: amber is the kick and its
// click, cyan is data, violet-grey is the riser and its fog.
/* eslint-disable no-unused-vars */
/* global P, clamp, lerp, E, rr, shadow, rand, label, font, BODY */

const SKIN = { hi: '#f4bba4', lo: '#d98e78', fold: '#c27765', deep: '#4a2232', deeper: '#26101a' };
const BONE = { hi: '#f6ead8', lo: '#dbc6a7', dot: 'rgba(160,120,80,0.16)' };
const COCH = { hi: '#f4a39a', lo: '#d6726b', line: '#b5524f' };
const CELL = { hi: '#ffe8ec', lo: '#f3b7c3', cilia: '#fff3df' };
const BRAIN = { hi: '#f9b6cb', lo: '#e37fa2', line: '#c9628a', blush: 'rgba(255,120,150,0.45)' };
const FOG_C = '200,203,226';

function circle(g, x, y, r) {
    g.beginPath();
    g.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2);
}

/** Four-point star, the click's spark. */
function sparkle(g, x, y, r, a = 1, color = P.amber) {
    if (a <= 0 || r <= 0) return;
    g.save();
    g.globalAlpha *= a;
    const gl = g.createRadialGradient(x, y, 0, x, y, r * 2.2);
    gl.addColorStop(0, 'rgba(251,191,36,0.55)');
    gl.addColorStop(1, 'rgba(251,191,36,0)');
    g.fillStyle = gl;
    circle(g, x, y, r * 2.2);
    g.fill();
    g.fillStyle = color;
    g.beginPath();
    for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.32;
        g.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
    }
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.85)';
    circle(g, x, y, r * 0.18);
    g.fill();
    g.restore();
}

/** A soft cloud of fog: overlapping blobs that drift slowly. `a` 0..1 is its thickness. */
function fogCloud(g, x, y, w, h, a, t, seed = 3) {
    if (a <= 0.01) return;
    const r = rand(seed);
    g.save();
    for (let i = 0; i < 9; i++) {
        const bx = x + (r() - 0.5) * w + Math.sin(t * 0.7 + i) * 10;
        const by = y + (r() - 0.5) * h + Math.cos(t * 0.6 + i * 1.7) * 8;
        const br = (0.32 + 0.3 * r()) * Math.min(w, h * 1.6);
        const gr = g.createRadialGradient(bx, by, 0, bx, by, br);
        gr.addColorStop(0, `rgba(${FOG_C},${0.62 * a})`);
        gr.addColorStop(0.6, `rgba(${FOG_C},${0.32 * a})`);
        gr.addColorStop(1, `rgba(${FOG_C},0)`);
        g.fillStyle = gr;
        circle(g, bx, by, br);
        g.fill();
    }
    g.restore();
}

/**
 * Sound arriving from the left as arcs travelling right from x0 to x1 along y.
 * `level(age)` gives the source level (0..1) at the moment an arc left x0,
 * `age` seconds ago; arcs are spaced `gap` px apart and move at `speed` px/s.
 */
function soundArcs(g, x0, x1, y, t, level, { gap = 38, speed = 420, color = '126,131,168', h = 70 } = {}) {
    const n = Math.ceil((x1 - x0) / gap) + 1;
    const off = (t * speed) % gap;
    g.save();
    g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
        const x = x0 + off + i * gap;
        if (x > x1) break;
        const lv = level((x - x0) / speed);
        if (lv <= 0.02) continue;
        g.strokeStyle = `rgba(${color},${clamp(0.25 + 0.75 * lv)})`;
        g.lineWidth = 4 + 6 * lv;
        g.beginPath();
        g.arc(x - h * 0.9, y, h * (0.45 + 0.55 * lv), -0.75, 0.75);
        g.stroke();
    }
    g.restore();
}

// ── Speaker cabinet, front view; `exc` is the cone's excursion 0..1 ──
function speakerBox(g, x, y, s, { exc = 0, kick = 0, alpha = 1 } = {}) {
    if (alpha <= 0) return;
    g.save();
    g.globalAlpha *= alpha;
    g.translate(x, y);
    g.scale(s, s);
    shadow(g, 6, 112, 84, 16, 0.7);
    rr(g, -66, -100, 132, 204, 24);
    const cab = g.createLinearGradient(-66, -100, 66, 104);
    cab.addColorStop(0, '#2a3d68');
    cab.addColorStop(1, '#121c36');
    g.fillStyle = cab;
    g.fill();
    // Rim light along the top-left edge.
    g.save();
    rr(g, -66, -100, 132, 204, 24);
    g.clip();
    g.strokeStyle = 'rgba(170,205,255,0.32)';
    g.lineWidth = 6;
    rr(g, -63, -97, 132, 204, 22);
    g.stroke();
    g.restore();
    // Tweeter.
    g.fillStyle = '#0a1122';
    circle(g, 0, -62, 16);
    g.fill();
    const tw = g.createRadialGradient(-4, -66, 1, 0, -62, 11);
    tw.addColorStop(0, '#8fa2c8');
    tw.addColorStop(1, '#2c3a5c');
    g.fillStyle = tw;
    circle(g, 0, -62, 10);
    g.fill();
    // Woofer: surround, cone, dust cap.
    const cy = 26;
    const e = clamp(exc);
    g.fillStyle = '#080e1c';
    circle(g, 0, cy, 56);
    g.fill();
    const sur = g.createRadialGradient(-8, cy - 10, 20, 0, cy, 52);
    sur.addColorStop(0, '#34466e');
    sur.addColorStop(1, '#10182c');
    g.fillStyle = sur;
    circle(g, 0, cy, 51);
    g.fill();
    const cr = 40 * (1 + 0.1 * e);
    const cone = g.createRadialGradient(-12, cy - 12, 4, 0, cy, cr);
    cone.addColorStop(0, '#7486ad');
    cone.addColorStop(1, '#222e4a');
    g.fillStyle = cone;
    circle(g, 0, cy, cr);
    g.fill();
    const dr = 15 * (1 + 0.2 * e);
    const cap = g.createRadialGradient(-5, cy - 6, 1, 0, cy, dr);
    cap.addColorStop(0, '#c7d3ea');
    cap.addColorStop(1, '#43537a');
    g.fillStyle = cap;
    circle(g, 0, cy, dr);
    g.fill();
    if (kick > 0.01) {
        g.strokeStyle = `rgba(251,191,36,${0.85 * kick})`;
        g.lineWidth = 6;
        circle(g, 0, cy, 54);
        g.stroke();
    }
    g.restore();
}

// ── The ear in cross-section, sound arriving from the left ──
// Origin at the eardrum. Canal opening at x -300, cochlea centred at (232, 22).
const EARX = { drum: { x: 0, y: 0 }, cochlea: { x: 232, y: 22, r: 78 }, opening: -300, nerve: { x: 350, y: 70 } };
const BONE_DOTS = (() => {
    const r = rand(23);
    return Array.from({ length: 34 }, () => ({ x: -150 + r() * 450, y: -170 + r() * 340, r: 2 + r() * 4 }));
})();
function earSection(g, x, y, s, { vib = 0, glow = 0, t = 0 } = {}) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    shadow(g, 60, 250, 330, 30, 0.6);
    // Skin and bone of the head, cut through.
    rr(g, -240, -236, 590, 472, 130);
    const sk = g.createLinearGradient(-240, -236, 350, 236);
    sk.addColorStop(0, SKIN.hi);
    sk.addColorStop(1, SKIN.lo);
    g.fillStyle = sk;
    g.fill();
    rr(g, -168, -190, 500, 380, 100);
    const bn = g.createLinearGradient(-168, -190, 330, 190);
    bn.addColorStop(0, BONE.hi);
    bn.addColorStop(1, BONE.lo);
    g.fillStyle = bn;
    g.fill();
    g.fillStyle = BONE.dot;
    for (const d of BONE_DOTS) {
        circle(g, d.x, d.y, d.r);
        g.fill();
    }
    // The outer ear, cut through: a cupped flap above and below the canal's opening.
    const pg = g.createLinearGradient(-350, -200, -236, 200);
    pg.addColorStop(0, SKIN.hi);
    pg.addColorStop(1, SKIN.lo);
    g.fillStyle = pg;
    g.beginPath();
    g.moveTo(-232, -214);
    g.bezierCurveTo(-300, -226, -356, -170, -350, -96);
    g.bezierCurveTo(-346, -62, -330, -44, -300, -40);
    g.lineTo(-232, -42);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(-232, 42);
    g.lineTo(-300, 40);
    g.bezierCurveTo(-336, 60, -350, 130, -322, 178);
    g.bezierCurveTo(-298, 214, -252, 214, -232, 184);
    g.closePath();
    g.fill();
    g.strokeStyle = SKIN.fold;
    g.lineWidth = 9;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-252, -190);
    g.bezierCurveTo(-310, -186, -334, -130, -322, -86);
    g.stroke();
    g.beginPath();
    g.moveTo(-318, 80);
    g.bezierCurveTo(-326, 120, -310, 160, -280, 176);
    g.stroke();
    // The canal: a tube from the opening to the eardrum.
    g.beginPath();
    g.moveTo(-300, -40);
    g.bezierCurveTo(-200, -44, -90, -34, 0, -30);
    g.lineTo(0, 30);
    g.bezierCurveTo(-90, 34, -200, 46, -300, 40);
    g.closePath();
    const cn = g.createLinearGradient(-300, 0, 0, 0);
    cn.addColorStop(0, SKIN.deep);
    cn.addColorStop(1, SKIN.deeper);
    g.fillStyle = cn;
    g.fill();
    g.strokeStyle = SKIN.fold;
    g.lineWidth = 6;
    g.stroke();
    // Middle ear.
    rr(g, 6, -84, 160, 156, 56);
    g.fillStyle = '#5a2b3b';
    g.fill();
    // Eardrum, which moves with the sound.
    const dx = vib * 6;
    g.fillStyle = '#ffd9d9';
    g.beginPath();
    g.ellipse(dx, 0, 10, 46, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#eaa3a3';
    g.lineWidth = 3;
    g.stroke();
    // The three small bones carry it to the cochlea.
    g.strokeStyle = '#fbf3e4';
    g.lineCap = 'round';
    g.lineWidth = 13;
    g.beginPath();
    g.moveTo(8 + dx, -26);
    g.lineTo(58 + dx * 0.8, -50);
    g.lineTo(98 + dx * 0.6, -22);
    g.stroke();
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(98 + dx * 0.6, -22);
    g.lineTo(126 + dx * 0.5, -8);
    g.lineTo(150 + dx * 0.4, 6);
    g.stroke();
    g.fillStyle = '#fbf3e4';
    for (const [bx, by, br] of [[58 + dx * 0.8, -50, 11], [98 + dx * 0.6, -22, 9], [150 + dx * 0.4, 6, 8]]) {
        circle(g, bx, by, br);
        g.fill();
    }
    // Balance canals above the cochlea.
    g.strokeStyle = COCH.hi;
    g.lineWidth = 15;
    for (const [cx, cy, rx, ry, rot] of [[196, -96, 34, 46, -0.4], [244, -110, 30, 40, 0.5], [214, -132, 40, 24, 0]]) {
        g.beginPath();
        g.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
        g.stroke();
    }
    // Cochlea: the snail-shaped spiral where hair cells turn motion into nerve signals.
    const C = EARX.cochlea;
    if (glow > 0) {
        const gl = g.createRadialGradient(C.x, C.y, 10, C.x, C.y, C.r * 1.9);
        gl.addColorStop(0, `rgba(251,191,36,${0.5 * glow})`);
        gl.addColorStop(1, 'rgba(251,191,36,0)');
        g.fillStyle = gl;
        circle(g, C.x, C.y, C.r * 1.9);
        g.fill();
    }
    const cg = g.createRadialGradient(C.x - 26, C.y - 26, 8, C.x, C.y, C.r);
    cg.addColorStop(0, COCH.hi);
    cg.addColorStop(1, COCH.lo);
    g.fillStyle = cg;
    circle(g, C.x, C.y, C.r);
    g.fill();
    g.strokeStyle = COCH.line;
    g.lineWidth = 7;
    g.beginPath();
    const turns = 2.6;
    for (let i = 0; i <= 120; i++) {
        const u = i / 120;
        const ang = u * turns * Math.PI * 2 - Math.PI / 2;
        const rad = C.r * 0.86 * (1 - u * 0.92);
        const px = C.x + Math.cos(ang) * rad;
        const py = C.y + Math.sin(ang) * rad;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
    }
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.lineWidth = 6;
    g.beginPath();
    g.arc(C.x, C.y, C.r - 10, Math.PI * 1.1, Math.PI * 1.55);
    g.stroke();
    // The hearing nerve, to the brain.
    g.strokeStyle = '#f2e7d2';
    g.lineWidth = 7;
    for (let i = 0; i < 4; i++) {
        g.beginPath();
        g.moveTo(C.x + 20, C.y + 10 + i * 8);
        g.bezierCurveTo(C.x + 70, C.y + 20 + i * 10, C.x + 90, C.y + 40 + i * 6, EARX.nerve.x, EARX.nerve.y + i * 9 + Math.sin(t * 2 + i) * 2);
        g.stroke();
    }
    g.restore();
}

/**
 * A hair cell as a small character: a rounded body with a tuft of stiff hairs
 * on top. `tired` 0..1 droops the hairs and closes the eyes (adaptation);
 * `burst` 0..1 is its response to a sound: it jumps, eyes wide, hairs upright.
 */
function hairCell(g, x, y, s, { tired = 0, burst = 0, wobble = 0 } = {}) {
    g.save();
    g.translate(x, y - 14 * burst);
    g.scale(s * (1 + 0.06 * burst), s * (1 - 0.04 * burst));
    // Hairs.
    const droop = tired * 0.75 - burst * 0.1 + wobble * 0.08;
    g.strokeStyle = CELL.cilia;
    g.lineCap = 'round';
    g.lineWidth = 7;
    [[-12, 26], [0, 36], [12, 46]].forEach(([dx, len]) => {
        g.save();
        g.translate(dx, -44);
        g.rotate(droop + wobble * 0.05 * dx);
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(0, -len * (1 - 0.15 * tired));
        g.stroke();
        g.restore();
    });
    // Body.
    rr(g, -26, -46, 52, 92, 24);
    const bd = g.createLinearGradient(-26, -46, 26, 46);
    bd.addColorStop(0, CELL.hi);
    bd.addColorStop(1, CELL.lo);
    g.fillStyle = bd;
    g.fill();
    // Face.
    const lid = clamp(tired * 0.85 - burst);
    for (const ex of [-10, 10]) {
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.ellipse(ex, -10, 8, 9 * (1 + 0.2 * burst), 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#2a1830';
        circle(g, ex + 1, -9, 4.6);
        g.fill();
        g.fillStyle = '#ffffff';
        circle(g, ex - 1, -12, 1.6);
        g.fill();
        if (lid > 0.02) {
            g.fillStyle = CELL.lo;
            g.fillRect(ex - 9, -20, 18, 20 * lid);
            g.strokeStyle = '#b07a88';
            g.lineWidth = 2.5;
            g.beginPath();
            g.moveTo(ex - 8, -20 + 20 * lid);
            g.lineTo(ex + 8, -20 + 20 * lid);
            g.stroke();
        }
    }
    g.strokeStyle = '#8c4b5f';
    g.lineWidth = 3;
    g.beginPath();
    if (burst > 0.2) g.arc(0, 6, 7, 0.15 * Math.PI, 0.85 * Math.PI);
    else {
        g.moveTo(-5, 10 + 2 * tired);
        g.lineTo(5, 10 + 2 * tired);
    }
    g.stroke();
    g.restore();
}

/** A magnifier: a circle showing `draw()` (drawn in its own coordinates), joined to `from` by a cone. */
function magnifier(g, x, y, r, from, draw, { alpha = 1 } = {}) {
    if (alpha <= 0) return;
    g.save();
    g.globalAlpha *= alpha;
    if (from) {
        const d = Math.hypot(x - from.x, y - from.y);
        const ang = Math.atan2(y - from.y, x - from.x);
        const off = Math.asin(clamp(r / d, -1, 1));
        g.fillStyle = 'rgba(248,250,252,0.08)';
        g.beginPath();
        g.moveTo(from.x, from.y);
        g.lineTo(from.x + Math.cos(ang - off) * d * Math.cos(off), from.y + Math.sin(ang - off) * d * Math.cos(off));
        g.lineTo(from.x + Math.cos(ang + off) * d * Math.cos(off), from.y + Math.sin(ang + off) * d * Math.cos(off));
        g.closePath();
        g.fill();
        g.fillStyle = 'rgba(248,250,252,0.7)';
        circle(g, from.x, from.y, 9);
        g.fill();
    }
    shadow(g, x, y + r + 14, r * 0.8, 18, 0.6);
    circle(g, x, y, r);
    const bg = g.createRadialGradient(x, y - r * 0.4, r * 0.2, x, y, r);
    bg.addColorStop(0, '#3a1f33');
    bg.addColorStop(1, '#1d0f1c');
    g.fillStyle = bg;
    g.fill();
    g.save();
    circle(g, x, y, r - 2);
    g.clip();
    draw();
    g.restore();
    g.strokeStyle = 'rgba(248,250,252,0.85)';
    g.lineWidth = 8;
    circle(g, x, y, r);
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.25)';
    g.lineWidth = 6;
    g.beginPath();
    g.arc(x, y, r - 14, Math.PI * 1.1, Math.PI * 1.45);
    g.stroke();
    g.restore();
}

// ── The limiter console ──
function knobSmall(g, x, y, r, k) {
    shadow(g, x + 3, y + r * 0.9, r * 1.1, r * 0.35, 0.6);
    const kg = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
    kg.addColorStop(0, '#e9eef6');
    kg.addColorStop(1, '#7e8ba3');
    g.fillStyle = kg;
    circle(g, x, y, r);
    g.fill();
    const a = -Math.PI * 1.25 + Math.PI * 1.5 * k;
    g.strokeStyle = P.dark;
    g.lineWidth = 4;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25);
    g.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8);
    g.stroke();
}
/** Desk body with wooden cheeks and a dark faceplate. */
function consoleDesk(g, x0, y0, w, h) {
    shadow(g, x0 + w / 2, y0 + h + 20, w * 0.55, 34, 0.8);
    for (const cx of [x0 - 28, x0 + w]) {
        rr(g, cx, y0 - 10, 28, h + 20, 12);
        const wd = g.createLinearGradient(cx, 0, cx + 28, 0);
        wd.addColorStop(0, '#6e5a49');
        wd.addColorStop(1, '#45372d');
        g.fillStyle = wd;
        g.fill();
    }
    rr(g, x0, y0, w, h, 26);
    const fp = g.createLinearGradient(0, y0, 0, y0 + h);
    fp.addColorStop(0, '#22304f');
    fp.addColorStop(1, '#131d35');
    g.fillStyle = fp;
    g.fill();
    g.strokeStyle = 'rgba(170,205,255,0.18)';
    g.lineWidth = 3;
    g.stroke();
    g.fillStyle = P.steelDk;
    for (const [sx, sy] of [[x0 + 22, y0 + 22], [x0 + w - 22, y0 + 22], [x0 + 22, y0 + h - 22], [x0 + w - 22, y0 + h - 22]]) {
        circle(g, sx, sy, 7);
        g.fill();
    }
}
/** Gain-reduction meter: segments light from the top down, 1 dB each, to `gr` dB. */
function grMeter(g, x, top, bottom, gr, max = 8) {
    const n = max * 2;
    const h = (bottom - top) / n;
    for (let i = 0; i < n; i++) {
        const y = top + i * h;
        rr(g, x - 13, y + 2, 26, h - 4, 4);
        const on = (i + 0.5) / 2 <= gr;
        g.fillStyle = on ? P.ink : 'rgba(248,250,252,0.1)';
        g.fill();
    }
}

// ── The listener's brain, a character ──
const BRAIN_LOBES = [[-92, -10, 62], [-50, -56, 64], [8, -74, 66], [64, -54, 62], [100, -8, 58], [66, 34, 60], [6, 44, 64], [-56, 36, 62]];
function brainChar(g, x, y, s, { look = null, joy = 0, lean = 0, blink = 0, t = 0 } = {}) {
    g.save();
    g.translate(x, y);
    g.rotate(lean * 0.12);
    g.scale(s * (1 + 0.04 * joy), s * (1 - 0.03 * joy));
    shadow(g, 0, 150, 150, 22, 0.7);
    // Stem.
    rr(g, -18, 70, 40, 70, 18);
    g.fillStyle = BRAIN.lo;
    g.fill();
    // Lobes, one shape.
    const bg = g.createLinearGradient(-150, -140, 150, 100);
    bg.addColorStop(0, BRAIN.hi);
    bg.addColorStop(1, BRAIN.lo);
    g.fillStyle = bg;
    g.beginPath();
    for (const [lx, ly, lr] of BRAIN_LOBES) {
        g.moveTo(lx + lr, ly);
        g.arc(lx, ly, lr, 0, Math.PI * 2);
    }
    g.fill();
    // Folds.
    g.strokeStyle = BRAIN.line;
    g.lineWidth = 6;
    g.lineCap = 'round';
    for (const [ax, ay, bx, by, cx, cy] of [[-120, -30, -90, -70, -60, -40], [-30, -110, -10, -80, 20, -112], [60, -100, 90, -70, 120, -80], [90, 20, 120, 40, 130, 10], [-110, 40, -80, 70, -50, 60], [0, -20, 4, 0, 0, 20]]) {
        g.beginPath();
        g.moveTo(ax, ay);
        g.quadraticCurveTo(bx, by, cx, cy);
        g.stroke();
    }
    // Highlight.
    g.strokeStyle = 'rgba(255,255,255,0.4)';
    g.lineWidth = 8;
    g.beginPath();
    g.arc(-40, -60, 70, Math.PI * 1.1, Math.PI * 1.45);
    g.stroke();
    // Face: two eyes that follow `look`, cheeks, a mouth.
    const eyes = [[-34, -6], [34, -6]];
    for (const [ex, ey] of eyes) {
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.ellipse(ex, ey, 22, 26 * (1 - 0.9 * blink), 0, 0, Math.PI * 2);
        g.fill();
        let ox = 0;
        let oy = 0;
        if (look) {
            const wx = (look.x - x) / s - ex;
            const wy = (look.y - y) / s - ey;
            const d = Math.hypot(wx, wy) || 1;
            ox = (wx / d) * 9;
            oy = (wy / d) * 9;
        }
        if (blink < 0.6) {
            g.fillStyle = '#2b1530';
            circle(g, ex + ox, ey + oy, 12);
            g.fill();
            g.fillStyle = '#ffffff';
            circle(g, ex + ox - 4, ey + oy - 5, 4);
            g.fill();
        }
    }
    g.fillStyle = BRAIN.blush;
    for (const cx of [-62, 62]) {
        g.beginPath();
        g.ellipse(cx, 26, 16, 9, 0, 0, Math.PI * 2);
        g.fill();
    }
    g.strokeStyle = '#7a2d4c';
    g.lineWidth = 5;
    g.beginPath();
    if (joy > 0.15) {
        g.arc(0, 26, 12 + 6 * joy, 0.12 * Math.PI, 0.88 * Math.PI);
    } else {
        g.ellipse(0, 34, 7, 9, 0, 0, Math.PI * 2);
    }
    g.stroke();
    g.restore();
}

// ── Props ──
function scissors(g, x, y, s, open = 0.3, rot = 0) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.scale(s, s);
    for (const side of [-1, 1]) {
        g.save();
        g.rotate(side * open * 0.5);
        // Blade: a long tapered point.
        g.fillStyle = side < 0 ? '#eef2f8' : '#c3cede';
        g.beginPath();
        g.moveTo(-6, -9 * side);
        g.quadraticCurveTo(60, -12 * side, 104, 0);
        g.quadraticCurveTo(60, 4 * side, -6, 9 * side);
        g.closePath();
        g.fill();
        // Handle: a thick ring.
        g.strokeStyle = '#f8fafc';
        g.lineWidth = 11;
        g.beginPath();
        g.moveTo(-6, 4 * side);
        g.lineTo(-22, 14 * side);
        g.stroke();
        g.beginPath();
        g.ellipse(-44, 22 * side, 24, 17, side * 0.3, 0, Math.PI * 2);
        g.stroke();
        g.restore();
    }
    g.fillStyle = P.steelDk;
    circle(g, 0, 0, 7);
    g.fill();
    g.restore();
}

/** A clip in an arrangement lane: rounded body, a header strip, a mini waveform. */
function clip(g, x, y, w, h, color, { wave = null, alpha = 1, name = '' } = {}) {
    if (w <= 1 || alpha <= 0) return;
    g.save();
    g.globalAlpha *= alpha;
    rr(g, x, y, w, h, 10);
    g.fillStyle = color.body;
    g.fill();
    g.save();
    rr(g, x, y, w, h, 10);
    g.clip();
    g.fillStyle = color.head;
    g.fillRect(x, y, w, 46);
    if (wave) {
        g.fillStyle = color.wave;
        const mid = y + 46 + (h - 46) / 2;
        for (let px = 0; px < w; px += 6) {
            const a = wave(px / w) * ((h - 58) / 2);
            g.fillRect(x + px, mid - a, 4, 2 * a);
        }
    }
    g.restore();
    if (name) label(g, name, x + 14, y + 35, { size: 32, weight: 700, color: color.text ?? P.dark, family: BODY });
    g.restore();
}

// ── A crowd along the bottom edge, in silhouette; `jump(i)` gives each figure's lift in px ──
const CROWD = (() => {
    const r = rand(77);
    const out = [];
    for (let i = 0; i < 17; i++) {
        const x = -30 + i * 70 + (r() - 0.5) * 30;
        out.push({ x, h: 150 + r() * 70, w: 70 + r() * 18, ph: r() * 6.28, arms: r() < 0.45, back: i % 2, delay: r() * 0.05 });
    }
    return out.sort((a, b) => b.back - a.back);
})();
function crowd(g, t, jump) {
    g.save();
    CROWD.forEach((c, i) => {
        const lift = jump(c.delay) * (0.8 + 0.4 * ((i * 37) % 10) / 10);
        const sway = Math.sin(t * 1.6 + c.ph) * 4;
        const by = H + 10 - (c.back ? 40 : 0) - lift;
        const top = by - c.h;
        g.fillStyle = c.back ? '#0a1430' : '#0e1b3c';
        // Body.
        rr(g, c.x - c.w / 2 + sway * 0.3, top + 52, c.w, c.h, 30);
        g.fill();
        // Head.
        g.beginPath();
        g.arc(c.x + sway, top + 24, 28, 0, Math.PI * 2);
        g.fill();
        // Arms up when the crowd jumps.
        if (c.arms) {
            const up = clamp(lift / 30);
            g.strokeStyle = g.fillStyle;
            g.lineWidth = 16;
            g.lineCap = 'round';
            for (const side of [-1, 1]) {
                g.beginPath();
                g.moveTo(c.x + side * (c.w / 2 - 8), top + 70);
                g.lineTo(c.x + side * (c.w / 2 + 14 - 10 * up), top + 70 - lerp(-30, 90, up));
                g.stroke();
            }
        }
        // Rim light on the head.
        g.strokeStyle = 'rgba(170,205,255,0.22)';
        g.lineWidth = 3;
        g.beginPath();
        g.arc(c.x + sway, top + 24, 27, Math.PI * 1.1, Math.PI * 1.7);
        g.stroke();
    });
    g.restore();
}
