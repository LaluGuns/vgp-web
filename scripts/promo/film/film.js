/* The film, drawn on one canvas. window.seek(t) paints the frame at time t
 * and nothing else: every frame is a pure function of t, so a frame drawn
 * twice is identical and the render can step at exactly 1/60 s.
 *
 * Expects globals from render.mjs: TIMELINE, the model functions
 * (buildModel, knobGain, compress), T (brand tokens), FILM {aspect, reduced},
 * LOGO_URL.
 */
/* global TIMELINE, buildModel, knobGain, compress, T, FILM, LOGO_URL */
(() => {
    const TL = TIMELINE;
    const SIZES = { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080] };
    const [W, H] = SIZES[FILM.aspect];
    const canvas = document.getElementById('film');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Where things sit, per format. 9:16 keeps text and data clear of the
    // TikTok and Reels buttons (right edge) and caption area (bottom).
    const LAYOUTS = {
        '16x9': { x: 120, label: { y: 86, size: 28 }, head: { y: 132, size: 76, lh: 84 }, maxW: 1680, stage: { y: 320, w: 1680, h: 600 }, readout: { y: 958, size: 28 }, small: 24 },
        '9x16': { x: 72, label: { y: 236, size: 34 }, head: { y: 290, size: 84, lh: 92 }, maxW: 880, stage: { y: 520, w: 880, h: 940 }, readout: { y: 1496, size: 32 }, small: 30 },
        '1x1': { x: 72, label: { y: 64, size: 28 }, head: { y: 106, size: 64, lh: 70 }, maxW: 936, stage: { y: 270, w: 936, h: 620 }, readout: { y: 934, size: 28 }, small: 24 },
    };
    const L = LAYOUTS[FILM.aspect];
    L.stage.x = L.x;

    const RATE = 10000;
    const M = buildModel(TL, RATE);
    const snares = M.hits.filter((h) => h.voice === 'snare').map((h) => h.t);
    const sceneStart = (s) => (s.bar - 1) * TL.bar;
    const sceneEnd = (s) => (s.bar - 1 + s.bars) * TL.bar;
    const sceneAt = (t) => {
        const bar = Math.min(TL.bars, Math.floor(t / TL.bar) + 1);
        return TL.scenes.find((s) => bar >= s.bar && bar < s.bar + s.bars);
    };
    const prevScene = (s) => TL.scenes[TL.scenes.indexOf(s) - 1];

    // Motion: one easing, critically damped, settles without overshoot.
    const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
    const K = 7;
    const settle = (x) => {
        x = clamp01(x);
        return (1 - (1 + K * x) * Math.exp(-K * x)) / (1 - (1 + K) * Math.exp(-K));
    };
    // Reduced motion: the same sequence of ideas, as cuts.
    const prog = (t, start, dur) => (FILM.reduced ? (t >= start ? 1 : 0) : settle((t - start) / dur));
    const lerp = (a, b, e) => a + (b - a) * e;

    // ── Text: every timed line in one list, absolute times ──
    const items = [];
    for (const s of TL.scenes) for (const it of s.text) items.push({ at: sceneStart(s) + it.at, lines: it.lines, scene: s });
    items.sort((a, b) => a.at - b.at);

    let headSize = L.head.size;
    function fitHeadline() {
        ctx.font = `800 ${headSize}px ${T.display}`;
        const widest = Math.max(...items.flatMap((it) => it.lines.map((l) => ctx.measureText(l).width)));
        if (widest > L.maxW) headSize = Math.floor((headSize * L.maxW) / widest);
    }

    function drawText(t) {
        let k = items.findIndex((it, i) => it.at <= t && (i === items.length - 1 || items[i + 1].at > t));
        if (k < 0) return;
        const cur = items[k];
        const next = items[k + 1];
        const lh = (L.head.lh * headSize) / L.head.size;
        cur.lines.forEach((line, i) => {
            // When did this line first appear without a break?
            let since = cur.at;
            for (let j = k - 1; j >= 0 && items[j].lines[i] === line; j--) since = items[j].at;
            if (k === 0 && since === cur.at) since = cur.at;
            let alpha = prog(t, since, 0.5);
            let rise = (1 - prog(t, since, 0.6)) * 26;
            // Fade out just before this slot changes.
            if (next && next.lines[i] !== line) {
                const out = clamp01((t - (next.at - 0.22)) / 0.22);
                alpha *= FILM.reduced ? (out >= 1 ? 0 : 1) : 1 - out;
            }
            if (alpha <= 0) return;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = T.text;
            ctx.font = `800 ${headSize}px ${T.display}`;
            ctx.textBaseline = 'top';
            ctx.fillText(line, L.x, L.head.y + i * lh + rise);
            ctx.globalAlpha = 1;
        });
    }

    // ── Signal helpers ──
    const vMax = 1.75;
    const at = (arr, tt) => {
        const i = Math.round(tt * RATE);
        return i < 0 || i >= arr.length ? 0 : arr[i];
    };
    const gainAt = (tt) => 10 ** (-at(M.gr, tt) / 20);

    // Gain reduction for the frozen reference hit in the model scenes: the
    // slow-attack settings, run on that one window from rest.
    const ILLUS = TL.scenes.find((s) => s.id === 'slow').comp;
    const refHit = (bar) => snares.find((x) => x >= (bar - 1) * TL.bar);
    const illus = (() => {
        const ref = refHit(3);
        const from = Math.round((ref - 0.3) * RATE);
        const to = Math.round((ref + 0.4) * RATE);
        const seg = M.env.slice(from, to);
        const gr = compress(seg, RATE, () => ILLUS);
        return { ref, from, gr };
    })();
    const illusGr = (tt) => {
        const i = Math.round(tt * RATE) - illus.from;
        return i < 0 || i >= illus.gr.length ? 0 : illus.gr[i];
    };

    /** Time window [start, span] the stage shows at time t, with zooms between views. */
    function windowAt(t) {
        const s = sceneAt(t);
        const own = viewWindow(s, t);
        const p = prevScene(s);
        if (!p || p.view === s.view || p.view === 'cta' || s.view === 'cta') return own;
        const span = (v) => (v === 'bar' ? 'wide' : 'tight');
        if (span(p.view) === span(s.view)) return own;
        const from = viewWindow(p, sceneStart(s) - 1e-3);
        const e = prog(t, sceneStart(s), 0.7);
        return { start: lerp(from.start, own.start, e), span: lerp(from.span, own.span, e), ref: own.ref, live: own.live };
    }

    function viewWindow(s, t) {
        const pre = 0.03;
        const span = 0.36;
        if (s.view === 'knob') return { start: refHit(1) - pre, span, ref: refHit(1), live: false };
        if (s.view === 'hit' || s.view === 'cta') {
            const ref = s.id === 'payoff' ? refHit(15) : refHit(3);
            return { start: ref - pre, span, ref, live: false };
        }
        if (s.view === 'live') {
            const startS = sceneStart(s);
            const past = snares.filter((x) => x >= startS - 1e-6 && x <= t + pre);
            if (!past.length) {
                // Before the scene's first snare: hold the last hit, whole.
                const h = [...snares].reverse().find((x) => x < startS);
                return { start: h - pre, span, ref: h, live: false };
            }
            const h = past[past.length - 1];
            return { start: h - pre, span, ref: h, live: true };
        }
        const b = Math.floor(t / TL.bar + 1e-9) * TL.bar;
        return { start: b, span: TL.bar, ref: b, live: true };
    }

    /** Peak of f over each pixel column, so short cracks survive downsampling. */
    function columns(f, start, span, x0, w) {
        const pts = [];
        const per = span / w;
        for (let px = 0; px <= w; px++) {
            const t0 = start + px * per;
            let v = 0;
            for (let k = 0; k < 6; k++) v = Math.max(v, f(t0 + (k / 6) * per));
            pts.push([x0 + px, v]);
        }
        return pts;
    }

    function trace(pts, yOf, color, width, fill, until) {
        const keep = until === undefined ? pts : pts.filter((p) => p[0] <= until);
        if (keep.length < 2) return;
        const base = yOf(0);
        ctx.beginPath();
        ctx.moveTo(keep[0][0], base);
        for (const [x, v] of keep) ctx.lineTo(x, yOf(v));
        ctx.lineTo(keep[keep.length - 1][0], base);
        ctx.closePath();
        if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
        }
        ctx.beginPath();
        keep.forEach(([x, v], i) => (i ? ctx.lineTo(x, yOf(v)) : ctx.moveTo(x, yOf(v))));
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    function label(text, x, y, opts = {}) {
        ctx.font = `${opts.weight ?? 500} ${opts.size ?? L.small}px ${T.body}`;
        ctx.fillStyle = opts.color ?? T.text75;
        ctx.textAlign = opts.align ?? 'left';
        ctx.textBaseline = opts.baseline ?? 'alphabetic';
        ctx.fillText(text, x, y);
        ctx.textAlign = 'left';
    }

    function plate(text, x, y, align) {
        ctx.font = `500 ${L.small}px ${T.body}`;
        const w = ctx.measureText(text).width + 16;
        const left = align === 'right' ? x - w : x;
        ctx.fillStyle = 'rgba(10,14,18,0.92)';
        ctx.fillRect(left, y - L.small - 4, w, L.small + 12);
        label(text, left + 8, y);
    }

    function bracket(x1, x2, y, text, e, below) {
        if (e <= 0) return;
        const xe = lerp(x1, x2, e);
        const d = below ? 1 : -1;
        ctx.strokeStyle = T.text75;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y - d * 8);
        ctx.lineTo(x1, y);
        ctx.lineTo(xe, y);
        if (e >= 1) ctx.lineTo(x2, y - d * 8);
        ctx.stroke();
        ctx.globalAlpha = clamp01(e * 1.4 - 0.3);
        label(text, x1, below ? y + L.small + 8 : y - 14, { color: T.text, weight: 600 });
        ctx.globalAlpha = 1;
    }

    function dashed(x1, x2, y, color) {
        ctx.setLineDash([10, 8]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // ── The stage: the signal, its threshold, and gain reduction ──
    function drawStage(t) {
        const s = sceneAt(t);
        const S = L.stage;
        const show = new Set(s.show ?? []);
        const cta = s.view === 'cta';
        const appear = prog(t, 0, 0.5);
        const leave = cta ? 1 - prog(t, sceneStart(s), 0.5) : 1;
        const alpha = appear * leave;
        if (alpha <= 0.001) return;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = T.surface;
        ctx.strokeStyle = T.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(S.x, S.y, S.w, S.h, 6);
        ctx.fill();
        ctx.stroke();

        const pad = Math.round(S.w * 0.035);
        const x0 = S.x + pad;
        const w = S.w - pad * 2;
        const legendH = L.small + 22;
        // The gain-reduction lane slides in when the scene first needs it.
        const grScene = TL.scenes.find((x) => (x.show ?? []).includes('gr'));
        const grIn = s.view === 'cta' ? 1 : (s.show ?? []).includes('gr') ? (s === grScene || !(prevScene(s)?.show ?? []).includes('gr') ? prog(t, sceneStart(s), 0.6) : 1) : 0;
        const grH = Math.round(S.h * 0.24 * grIn);
        const top = S.y + pad + legendH;
        const bottom = S.y + S.h - pad - (grH ? grH + pad * 0.6 : 0);
        const yOf = (v) => bottom - (Math.min(v, vMax) / vMax) * (bottom - top);

        const win = windowAt(t);
        const xOf = (tt) => x0 + ((tt - win.start) / win.span) * w;
        const playX = win.live && !FILM.reduced ? xOf(t) : FILM.reduced && win.live ? xOf(Math.min(t, win.start + win.span)) : undefined;
        // In reduced motion a live hit appears whole at the moment it sounds.
        const until = win.live ? (FILM.reduced ? (t >= win.ref ? x0 + w : x0) : playX) : undefined;

        // What "after" means in this scene.
        const comp = s.comp;
        let after = null;
        if (s.view === 'knob') after = (tt) => at(M.env, tt) * knobGain(TL, t);
        else if (s.view === 'hit' && (show.has('gr') || show.has('attack') || show.has('release'))) after = (tt) => at(M.env, tt) * 10 ** (-illusGr(tt) / 20);
        else if (comp && s.view !== 'cta') after = (tt) => at(M.env, tt) * gainAt(tt);
        else if (s.view === 'cta' && comp) after = (tt) => at(M.env, tt) * gainAt(tt);

        const before = columns((tt) => at(M.env, tt), win.start, win.span, x0, w);
        // Clip drawing to the plot.
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, top - 6, w + 2, bottom - top + 8);
        ctx.clip();
        if (after) {
            trace(before, yOf, T.faint, 2, 'rgba(255,255,255,0.035)');
            trace(columns(after, win.start, win.span, x0, w), yOf, T.accent, 3.5, T.accentFill, until);
        } else {
            trace(before, yOf, T.accent, 3.5, T.accentFill, until);
        }
        // Threshold zone in the threshold scene: what the compressor will act on.
        const th = (comp ?? ILLUS).threshold;
        if (s.id === 'threshold') {
            const e = prog(t, sceneStart(s) + 0.5, 0.6);
            ctx.save();
            ctx.beginPath();
            ctx.rect(x0, top - 6, w, yOf(th) - top + 6);
            ctx.clip();
            ctx.globalAlpha = alpha * 0.55 * e;
            trace(before, yOf, T.accent, 0, 'rgba(125,211,252,0.45)');
            ctx.restore();
            ctx.globalAlpha = alpha;
        }
        if (playX !== undefined && win.live && playX >= x0 && playX <= x0 + w) {
            ctx.strokeStyle = 'rgba(255,255,255,0.22)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(playX, top);
            ctx.lineTo(playX, bottom);
            ctx.stroke();
        }
        ctx.restore();

        if (show.has('threshold')) {
            const first = !(prevScene(s)?.show ?? []).includes('threshold');
            const e = first ? prog(t, sceneStart(s), 0.7) : 1;
            const y = yOf(th);
            dashed(x0, lerp(x0, x0 + w, e), y, 'rgba(255,255,255,0.55)');
            ctx.globalAlpha = alpha * clamp01(e * 1.5 - 0.5);
            plate('Threshold', x0 + w, y - 10, 'right');
            ctx.globalAlpha = alpha;
        }

        if (show.has('parts')) {
            const first = !(prevScene(s)?.show ?? []).includes('parts');
            const e1 = first ? prog(t, sceneStart(s) + 0.35, 0.5) : 1;
            const e2 = first ? prog(t, sceneStart(s) + 0.95, 0.6) : 1;
            const ref = win.ref;
            bracket(xOf(ref), xOf(ref + 0.013), yOf(1.68), 'Crack', e1);
            bracket(xOf(ref + 0.02), xOf(ref + 0.3), yOf(0.95), 'Body', e2);
        }

        // Time scale, so "1 ms" and "30 ms" have something to be measured against.
        {
            const wide = win.span > 1;
            const len = wide ? TL.bar / 4 : 0.1;
            const sx2 = x0 + w;
            const sx1 = sx2 - (len / win.span) * w;
            const sy = top - 4;
            ctx.strokeStyle = T.text60;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sx1, sy - 6);
            ctx.lineTo(sx1, sy);
            ctx.lineTo(sx2, sy);
            ctx.lineTo(sx2, sy - 6);
            ctx.stroke();
            label(wide ? '1 beat' : '100 ms', sx1 - 10, sy + 2, { size: L.small * 0.92, color: T.text60, align: 'right' });
        }

        // Legend when two traces are on screen.
        if (after) {
            const ly = S.y + pad + L.small;
            ctx.lineWidth = 3;
            ctx.strokeStyle = T.faint;
            ctx.beginPath();
            ctx.moveTo(x0, ly - L.small * 0.35);
            ctx.lineTo(x0 + 34, ly - L.small * 0.35);
            ctx.stroke();
            label('Before', x0 + 46, ly);
            ctx.font = `500 ${L.small}px ${T.body}`;
            const bx = x0 + 46 + ctx.measureText('Before').width + 40;
            ctx.strokeStyle = T.accent;
            ctx.beginPath();
            ctx.moveTo(bx, ly - L.small * 0.35);
            ctx.lineTo(bx + 34, ly - L.small * 0.35);
            ctx.stroke();
            label(s.view === 'knob' ? 'Turned down' : 'After', bx + 46, ly);
        }

        // Gain reduction lane.
        if (grH > 4) {
            const gTop = bottom + pad * 0.6;
            const gBottom = gTop + grH;
            const maxDb = 12;
            const gy = (db) => gTop + 8 + (Math.min(db, maxDb) / maxDb) * (grH - 16);
            ctx.fillStyle = 'rgba(255,255,255,0.035)';
            ctx.fillRect(x0, gTop, w, grH);
            const grOf = s.view === 'hit' || s.view === 'cta' ? (s.comp && s.view !== 'cta' && s.id === 'payoff' ? (tt) => at(M.gr, tt) : illusGr) : (tt) => at(M.gr, tt);
            const gpts = [];
            for (let px = 0; px <= w; px++) {
                const tt = win.start + (px / w) * win.span;
                gpts.push([x0 + px, grOf(tt)]);
            }
            ctx.save();
            ctx.beginPath();
            ctx.rect(x0, gTop, w, grH);
            ctx.clip();
            const keep = until === undefined ? gpts : gpts.filter((p) => p[0] <= until);
            if (keep.length > 1) {
                ctx.beginPath();
                ctx.moveTo(keep[0][0], gy(0));
                for (const [x, db] of keep) ctx.lineTo(x, gy(db));
                ctx.lineTo(keep[keep.length - 1][0], gy(0));
                ctx.closePath();
                ctx.fillStyle = T.accentFill;
                ctx.fill();
                ctx.beginPath();
                keep.forEach(([x, db], i) => (i ? ctx.lineTo(x, gy(db)) : ctx.moveTo(x, gy(db))));
                ctx.strokeStyle = T.accent;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            ctx.restore();
            label('Gain reduction', x0 + w - 12, gBottom - 12, { size: L.small * 0.92, color: T.text60, align: 'right' });
            // Attack and release brackets on the frozen hit.
            if (show.has('attack') || show.has('release')) {
                const ref = win.ref;
                let peakT = ref;
                for (let tt = ref; tt < ref + 0.2; tt += 1 / RATE) if (illusGr(tt) > illusGr(peakT)) peakT = tt;
                let endT = peakT;
                while (endT < ref + 0.33 && illusGr(endT) > 0.4) endT += 1 / RATE;
                const y = gy(illusGr(peakT)) + 26;
                const e = prog(t, sceneStart(s) + 0.3, 0.6);
                // Label under the bracket, clear of the curve.
                const by = Math.min(y, gBottom - L.small - 14);
                if (show.has('attack')) bracket(xOf(ref), xOf(peakT), by, `Attack ${Math.round(ILLUS.attack * 1000)} ms`, e, true);
                if (show.has('release')) bracket(xOf(peakT), xOf(endT), by, `Release ${Math.round(ILLUS.release * 1000)} ms`, e, true);
            }
        }
        ctx.globalAlpha = 1;
    }

    // ── Settings readout: the numbers the viewer is hearing ──
    function drawReadout(t) {
        const s = sceneAt(t);
        if (!(s.show ?? []).includes('readout') || !s.comp) return;
        const p = prevScene(s);
        const first = !(p?.show ?? []).includes('readout');
        const appear = first ? prog(t, sceneStart(s), 0.5) : 1;
        const ms = (v) => (v >= 1 ? `${v.toFixed(1)} s` : `${Math.round(v * 1000)} ms`);
        const chips = [
            ['Attack', ms(s.comp.attack), p?.comp && p.comp.attack !== s.comp.attack],
            ['Release', ms(s.comp.release), p?.comp && p.comp.release !== s.comp.release],
            ['Ratio', `${s.comp.ratio}:1`, false],
        ];
        let x = L.x;
        const size = L.readout.size;
        ctx.globalAlpha = appear;
        for (const [name, value, changed] of chips) {
            ctx.font = `500 ${size}px ${T.body}`;
            const nw = ctx.measureText(`${name} `).width;
            ctx.font = `600 ${size}px ${T.body}`;
            const vw = ctx.measureText(value).width;
            const cw = nw + vw + 40;
            const hot = changed && t - sceneStart(s) < 1.6;
            ctx.strokeStyle = hot ? T.accent : 'rgba(255,255,255,0.22)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x, L.readout.y, cw, size + 28, 6);
            ctx.stroke();
            label(`${name} `, x + 20, L.readout.y + size + 6, { size, color: T.text60 });
            label(value, x + 20 + nw, L.readout.y + size + 6, { size, color: hot ? T.accent : T.text, weight: 600 });
            x += cw + 18;
        }
        ctx.globalAlpha = 1;
    }

    // ── Top label and the closing card ──
    let logo = null;
    function drawLabel() {
        const size = L.label.size;
        if (logo) ctx.drawImage(logo, L.x - 4, L.label.y - size * 0.95, size * 1.5, size * 1.5);
        label('Virzy Guns · Mixing & Mastering', L.x + size * 1.75, L.label.y + size * 0.15, { size, color: T.text60 });
    }

    function drawCta(t) {
        const s = sceneAt(t);
        if (s.view !== 'cta') return;
        const e = prog(t, sceneStart(s) + 0.35, 0.6);
        const S = L.stage;
        ctx.globalAlpha = e;
        ctx.font = `800 100px ${T.display}`;
        const urlSize = Math.min(Math.round(headSize * 1.15), Math.floor((100 * L.maxW) / ctx.measureText(TL.lesson.url).width));
        const mark = urlSize * 2.4;
        const blockH = mark + urlSize * 1.2 + L.readout.size * 2.6;
        const top = S.y + (S.h - blockH) / 2 + (1 - e) * 20;
        if (logo) ctx.drawImage(logo, L.x - mark * 0.06, top, mark, mark);
        ctx.font = `800 ${urlSize}px ${T.display}`;
        ctx.fillStyle = T.text;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(TL.lesson.url, L.x, top + mark + urlSize);
        label('Lesson: Compression changes motion before level', L.x, top + mark + urlSize + L.readout.size * 2.2, { size: L.readout.size, color: T.text75 });
        ctx.globalAlpha = 1;
    }

    function draw(t) {
        ctx.fillStyle = T.bg;
        ctx.fillRect(0, 0, W, H);
        drawLabel();
        drawText(t);
        drawStage(t);
        drawReadout(t);
        drawCta(t);
    }

    window.filmReady = (async () => {
        await Promise.all(['800 40px "VGP Inter Display"', '500 20px "VGP Inter"', '600 20px "VGP Inter"'].map((f) => document.fonts.load(f)));
        if (!document.fonts.check('800 40px "VGP Inter Display"')) throw new Error('bundled font did not load');
        logo = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = LOGO_URL;
        });
        fitHeadline();
        return { W, H, duration: TL.duration, fps: TL.fps };
    })();
    window.seek = (t) => draw(t);
})();
