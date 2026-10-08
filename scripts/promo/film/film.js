/* The film, drawn on one canvas. window.seek(t) paints the frame at time t
 * and nothing else: every frame is a pure function of t, so a frame drawn
 * twice is identical and the render can step at exactly 1/60 s.
 *
 * Expects globals from render.mjs: TIMELINE, the model functions
 * (buildModel, knobGain, compress), T (brand tokens), FILM {aspect, reduced},
 * DP_URL (the artist picture with the Virzy Guns lettering).
 */
/* global TIMELINE, buildModel, knobGain, compress, T, FILM, DP_URL */
(() => {
    const TL = TIMELINE;
    const SIZES = { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080] };
    const [W, H] = SIZES[FILM.aspect];
    const canvas = document.getElementById('film');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Where things sit, per format. 9:16 keeps text and data clear of the
    // TikTok and Reels buttons (right edge) and the caption area (bottom 500 px).
    const LAYOUTS = {
        '16x9': { x: 120, w: 1680, badge: { y: 62, size: 26 }, head: { y: 122, size: 104, maxLines: 2 }, lanes: { y: 420, h: 470 }, readout: { y: 958, size: 28 }, small: 26, stroke: 4 },
        '9x16': { x: 72, w: 880, badge: { y: 196, size: 32 }, head: { y: 262, size: 104, maxLines: 4 }, lanes: { y: 730, h: 560 }, readout: { y: 1322, size: 34 }, small: 34, stroke: 5 },
        '1x1': { x: 72, w: 936, badge: { y: 54, size: 26 }, head: { y: 104, size: 84, maxLines: 2 }, lanes: { y: 350, h: 520 }, readout: { y: 928, size: 30 }, small: 30, stroke: 4 },
    };
    const L = LAYOUTS[FILM.aspect];
    const GREY = 'rgba(255,255,255,0.42)';

    const RATE = 10000;
    const M = buildModel(TL, RATE);
    const snares = M.hits.filter((h) => h.voice === 'snare').map((h) => h.t);
    const sceneStart = (s) => (s.bar - 1) * TL.bar;
    const sceneAt = (t) => {
        const bar = Math.min(TL.bars, Math.floor(t / TL.bar) + 1);
        return TL.scenes.find((s) => bar >= s.bar && bar < s.bar + s.bars);
    };
    const prevScene = (s) => TL.scenes[TL.scenes.indexOf(s) - 1];
    const shows = (s, k) => (s?.show ?? []).includes(k);

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

    function label(text, x, y, opts = {}) {
        ctx.font = `${opts.weight ?? 500} ${opts.size ?? L.small}px ${opts.display ? T.display : T.body}`;
        ctx.fillStyle = opts.color ?? T.text75;
        ctx.textAlign = opts.align ?? 'left';
        ctx.fillText(text, x, y);
        ctx.textAlign = 'left';
    }

    // ── Kinetic headline: lines land on the beat, the key word in the accent ──
    const items = [];
    for (const s of TL.scenes) for (const it of s.text) items.push({ at: sceneStart(s) + it.at, lines: it.lines, key: it.key, scene: s });
    items.sort((a, b) => a.at - b.at);

    let headSize = L.head.size;
    const headFont = (size) => `800 ${size}px ${T.display}`;
    /** Authored lines, each wrapped to the width if it has to be. */
    function wrap(lines, size) {
        ctx.font = headFont(size);
        const out = [];
        lines.forEach((line, li) => {
            let cur = '';
            // A number keeps its unit: "90 ms" never breaks.
            const words = line.split(' ').reduce((acc, wd) => (/^(ms|s|dB)[.:,]?$/.test(wd) && acc.length ? [...acc.slice(0, -1), `${acc[acc.length - 1]} ${wd}`] : [...acc, wd]), []);
            for (const word of words) {
                const next = cur ? `${cur} ${word}` : word;
                if (cur && ctx.measureText(next).width > L.w) {
                    out.push({ text: cur, src: li });
                    cur = word;
                } else cur = next;
            }
            out.push({ text: cur, src: li });
        });
        return out;
    }
    function fitHeadline() {
        while (headSize > 56 && items.some((it) => wrap(it.lines, headSize).length > L.head.maxLines)) headSize -= 2;
    }

    function drawWords(text, x, y, key) {
        ctx.font = headFont(headSize);
        ctx.textBaseline = 'top';
        const k = key ? text.indexOf(key) : -1;
        const parts = k < 0 ? [[text, false]] : [[text.slice(0, k), false], [key, true], [text.slice(k + key.length), false]];
        let cx = x;
        for (const [part, hot] of parts) {
            if (!part) continue;
            ctx.fillStyle = hot ? T.accent : T.text;
            ctx.fillText(part, cx, y);
            cx += ctx.measureText(part).width;
        }
        ctx.textBaseline = 'alphabetic';
    }

    function drawHeadline(t) {
        const k = items.findIndex((it, i) => it.at <= t && (i === items.length - 1 || items[i + 1].at > t));
        if (k < 0) return;
        const cur = items[k];
        if (cur.scene.view === 'end') return; // the end card places its own
        const next = items[k + 1];
        const lh = headSize * 1.04;
        wrap(cur.lines, headSize).forEach((v, i) => {
            const line = cur.lines[v.src];
            // When did this authored line first appear without a break?
            let since = cur.at;
            for (let j = k - 1; j >= 0 && items[j].lines[v.src] === line; j--) since = items[j].at;
            // The very first line is on screen in frame one: it is the thumbnail.
            const start = since === 0 ? -1 : since + (since === cur.at ? i * 0.06 : 0);
            let alpha = prog(t, start, 0.28);
            const rise = (1 - prog(t, start, 0.42)) * headSize * 0.32;
            if (next && next.lines[v.src] !== line) {
                const out = clamp01((t - (next.at - 0.14)) / 0.14);
                alpha *= FILM.reduced ? (out >= 1 ? 0 : 1) : 1 - out;
            }
            if (alpha <= 0) return;
            ctx.globalAlpha = alpha;
            // The key word belongs to the newest line, so it reads as the news.
            const key = v.src === cur.lines.length - 1 && cur.key && v.text.includes(cur.key) ? cur.key : null;
            drawWords(v.text, L.x, L.head.y + i * lh + rise, key);
            ctx.globalAlpha = 1;
        });
    }

    // ── Signals ──
    const vMax = 1.72;
    const at = (arr, tt) => {
        const i = Math.round(tt * RATE);
        return i < 0 || i >= arr.length ? 0 : arr[i];
    };
    const gainAt = (tt) => 10 ** (-at(M.gr, tt) / 20);
    /** Gain reduction (dB) on one hit's window, run from rest with fixed settings. */
    const isoCache = new Map();
    function isolated(ref, settings) {
        const key = `${ref}|${JSON.stringify(settings)}`;
        if (!isoCache.has(key)) {
            const from = Math.round((ref - 0.3) * RATE);
            const gr = compress(M.env.slice(from, Math.round((ref + 0.4) * RATE)), RATE, () => settings);
            isoCache.set(key, (tt) => {
                const i = Math.round(tt * RATE) - from;
                return i < 0 || i >= gr.length ? 0 : gr[i];
            });
        }
        return isoCache.get(key);
    }
    const firstSnareIn = (s) => snares.find((x) => x >= sceneStart(s) - 1e-6);
    const REF = firstSnareIn(TL.scenes.find((s) => s.id === 'shape'));
    const illusGr = isolated(REF, TL.settings.SLOW);

    const PRE = 0.02;
    const SPAN = 0.22;
    /** Time window the lanes show at time t: [start, span], plus the hit it follows. */
    function viewWindow(s, t) {
        if (s.view === 'bar') {
            const b = Math.floor(t / TL.bar + 1e-9) * TL.bar;
            return { start: b, span: TL.bar, ref: b, live: true };
        }
        if (s.view === 'live' || s.view === 'split') {
            const past = snares.filter((x) => x >= sceneStart(s) - 1e-6 && x <= t + PRE);
            if (!past.length) {
                // Before the scene's first snare: show that snare, whole, with
                // this scene's settings, so the label never sits on old data.
                const h = firstSnareIn(s);
                return { start: h - PRE, span: SPAN, ref: h, live: false, held: true };
            }
            const h = past[past.length - 1];
            return { start: h - PRE, span: SPAN, ref: h, live: true };
        }
        return { start: REF - PRE, span: SPAN, ref: REF, live: false };
    }
    function windowAt(t) {
        const s = sceneAt(t);
        const own = viewWindow(s, t);
        const p = prevScene(s);
        if (!p || p.view === 'end' || s.view === 'end') return own;
        const wide = (v) => v === 'bar';
        if (wide(p.view) === wide(s.view)) return own;
        // The camera reframes between one hit and a whole bar.
        const from = viewWindow(p, sceneStart(s) - 1e-3);
        const e = prog(t, sceneStart(s), 0.6);
        return { ...own, start: lerp(from.start, own.start, e), span: lerp(from.span, own.span, e) };
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
        if (fill) {
            ctx.beginPath();
            ctx.moveTo(keep[0][0], base);
            for (const [x, v] of keep) ctx.lineTo(x, yOf(v));
            ctx.lineTo(keep[keep.length - 1][0], base);
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
        }
        if (width > 0) {
            ctx.beginPath();
            keep.forEach(([x, v], i) => (i ? ctx.lineTo(x, yOf(v)) : ctx.moveTo(x, yOf(v))));
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
    }

    function dashed(x1, x2, y, color) {
        ctx.setLineDash([12, 10]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function plate(text, x, y, align) {
        ctx.font = `500 ${L.small}px ${T.body}`;
        const w = ctx.measureText(text).width + 18;
        const left = align === 'right' ? x - w : x;
        ctx.fillStyle = 'rgba(5,6,7,0.9)';
        ctx.fillRect(left, y - L.small - 6, w, L.small + 14);
        label(text, left + 9, y);
    }

    function bracket(x1, x2, y, text, e, below) {
        if (e <= 0) return;
        const xe = lerp(x1, x2, e);
        const d = below ? 1 : -1;
        const keep = ctx.globalAlpha;
        ctx.strokeStyle = T.text;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x1, y - d * 10);
        ctx.lineTo(x1, y);
        ctx.lineTo(xe, y);
        if (e >= 1) ctx.lineTo(x2, y - d * 10);
        ctx.stroke();
        ctx.globalAlpha = keep * clamp01(e * 1.4 - 0.3);
        label(text, x1, below ? y + L.small + 10 : y - 14, { color: T.text, weight: 600, size: L.small * 1.08 });
        ctx.globalAlpha = keep;
    }

    /**
     * One lane: a level plot of the drum bus over the window, the "before"
     * in grey and the "after" in the accent, drawn up to the playhead when live.
     */
    function lane(t, box, win, opts) {
        const { x0, w, top, bottom } = box;
        const yOf = (v) => bottom - (Math.min(v, vMax) / vMax) * (bottom - top);
        const xOf = (tt) => x0 + ((tt - win.start) / win.span) * w;
        let until;
        if (win.live) until = FILM.reduced ? (t >= win.ref ? x0 + w : x0) : xOf(t);
        ctx.strokeStyle = 'rgba(255,255,255,0.16)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, bottom);
        ctx.lineTo(x0 + w, bottom);
        ctx.stroke();
        const before = columns((tt) => at(M.env, tt), win.start, win.span, x0, w);
        // A hit thickens the line for a moment: the impact you hear.
        const sinceHit = win.live ? t - win.ref : 1;
        const pulse = FILM.reduced ? 0 : sinceHit >= 0 && sinceHit < 0.25 ? 1 - sinceHit / 0.25 : 0;
        const sw = L.stroke + 3 * pulse;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0 - 2, top - 8, w + 4, bottom - top + 10);
        ctx.clip();
        if (opts.after) {
            trace(before, yOf, GREY, 2.5, 'rgba(255,255,255,0.04)');
            trace(columns(opts.after, win.start, win.span, x0, w), yOf, T.accent, sw, 'rgba(125,211,252,0.14)', until);
        } else {
            trace(before, yOf, T.accent, sw, 'rgba(125,211,252,0.14)', until);
        }
        if (opts.zone) {
            // What sits above the threshold: what the compressor acts on first.
            ctx.save();
            ctx.beginPath();
            ctx.rect(x0, top - 8, w, yOf(opts.zone.th) - top + 8);
            ctx.clip();
            ctx.globalAlpha *= 0.6 * opts.zone.e;
            trace(before, yOf, T.accent, 0, 'rgba(125,211,252,0.5)');
            ctx.restore();
        }
        if (win.live && !FILM.reduced && until > x0 && until < x0 + w) {
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(until, top);
            ctx.lineTo(until, bottom);
            ctx.stroke();
        }
        ctx.restore();
        return { yOf, xOf, until };
    }

    function legend(x, y, afterName) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = GREY;
        ctx.beginPath();
        ctx.moveTo(x, y - L.small * 0.35);
        ctx.lineTo(x + 34, y - L.small * 0.35);
        ctx.stroke();
        label('Before', x + 46, y);
        ctx.font = `500 ${L.small}px ${T.body}`;
        const bx = x + 46 + ctx.measureText('Before').width + 40;
        ctx.strokeStyle = T.accent;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bx, y - L.small * 0.35);
        ctx.lineTo(bx + 34, y - L.small * 0.35);
        ctx.stroke();
        label(afterName, bx + 46, y);
    }

    function scaleBar(x2, y, win) {
        const wide = win.span > 1;
        const len = wide ? TL.bar / 4 : 0.05;
        const sx1 = x2 - (len / win.span) * L.w;
        ctx.strokeStyle = T.text60;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx1, y - 7);
        ctx.lineTo(sx1, y);
        ctx.lineTo(x2, y);
        ctx.lineTo(x2, y - 7);
        ctx.stroke();
        label(wide ? '1 beat' : '50 ms', sx1 - 12, y + 3, { size: L.small * 0.92, color: T.text60, align: 'right' });
    }

    // ── The stage: lanes, threshold, gain reduction, annotations ──
    function drawStage(t) {
        const s = sceneAt(t);
        const leave = s.view === 'end' ? 1 - prog(t, sceneStart(s), 0.35) : 1;
        if (leave <= 0.001) return;
        ctx.globalAlpha = leave;
        const win = windowAt(t);
        const x0 = L.x;
        const w = L.w;
        const legendH = L.small + 26;
        const comp = s.comp;
        const th = (comp ?? TL.settings.SLOW).threshold;

        if (s.view === 'split') {
            // Two lanes, same snare, same compressor, one setting apart.
            // No readout during the hook, so the lanes take its room too.
            const gap = L.small * 2.4;
            const laneH = (L.lanes.h + (L.readout.y - L.lanes.y - L.lanes.h) + L.readout.size + 28 - gap) / 2;
            const rows = [
                { id: 'fast', name: '1 ms attack', set: TL.settings.FAST },
                { id: 'slow', name: '30 ms attack', set: TL.settings.SLOW },
            ];
            rows.forEach((r, i) => {
                const lit = s.lit === r.id;
                const top = L.lanes.y + i * (laneH + gap) + legendH;
                const bottom = L.lanes.y + i * (laneH + gap) + laneH;
                ctx.globalAlpha = leave * (lit ? 1 : 0.3);
                label(r.name, x0, top - legendH + L.small, { color: T.text, weight: 600, size: L.small * 1.1 });
                // The lit lane follows the hit you hear; the other holds its shape.
                const gr = isolated(win.ref, r.set);
                lane(t, { x0, w, top, bottom }, lit ? win : { ...win, live: false }, { after: (tt) => at(M.env, tt) * 10 ** (-gr(tt) / 20) });
            });
            ctx.globalAlpha = leave;
            legend(x0 + w * 0.42, L.lanes.y + L.small, 'After');
            ctx.globalAlpha = 1;
            return;
        }

        const grIn = shows(s, 'gr') ? (shows(prevScene(s), 'gr') ? 1 : prog(t, sceneStart(s), 0.5)) : 0;
        const grH = Math.round(L.lanes.h * 0.26 * grIn);
        const top = L.lanes.y + legendH;
        const bottom = L.lanes.y + L.lanes.h - (grH ? grH + L.small * 1.4 : 0);

        let after = null;
        let afterName = 'After';
        // Gain reduction as drawn: frozen hits use one run from rest, a held
        // hit uses this scene's settings, live views use what you hear.
        let grOf = (tt) => at(M.gr, tt);
        if (s.view === 'knob') {
            after = (tt) => at(M.env, tt) * knobGain(TL, t);
            afterName = 'Turned down';
        } else if (s.view === 'hit' && comp) {
            grOf = illusGr;
            after = (tt) => at(M.env, tt) * 10 ** (-illusGr(tt) / 20);
        } else if (win.held && comp) {
            grOf = isolated(win.ref, comp);
            after = (tt) => at(M.env, tt) * 10 ** (-grOf(tt) / 20);
        } else if (comp) after = (tt) => at(M.env, tt) * gainAt(tt);

        const zoneE = s.id === 'threshold' ? prog(t, sceneStart(s) + 0.35, 0.5) : 0;
        const { yOf, xOf, until } = lane(t, { x0, w, top, bottom }, win, { after, zone: zoneE > 0 ? { th, e: zoneE } : null });
        if (after) legend(x0, L.lanes.y + L.small, afterName);
        scaleBar(x0 + w, L.lanes.y + L.small * 0.6, win);

        if (shows(s, 'threshold')) {
            const e = shows(prevScene(s), 'threshold') ? 1 : prog(t, sceneStart(s), 0.5);
            const y = yOf(th);
            dashed(x0, lerp(x0, x0 + w, e), y, 'rgba(255,255,255,0.6)');
            ctx.globalAlpha = leave * clamp01(e * 1.5 - 0.5);
            plate('Threshold', x0 + w, y - 12, 'right');
            ctx.globalAlpha = leave;
        }
        if (shows(s, 'parts')) {
            const e1 = prog(t, sceneStart(s) + 0.25, 0.4);
            const e2 = prog(t, sceneStart(s) + 0.75, 0.5);
            bracket(xOf(win.ref), xOf(win.ref + 0.012), yOf(1.66), 'Crack', e1);
            bracket(xOf(win.ref + 0.018), xOf(win.ref + 0.2), yOf(0.72), 'Body', e2);
        }

        if (grH > 4) {
            const gTop = bottom + L.small * 1.4;
            const gBottom = gTop + grH;
            const maxDb = 12;
            const gy = (db) => gTop + 6 + (Math.min(db, maxDb) / maxDb) * (grH - 12);
            dashed(x0, x0 + w, gy(0), 'rgba(255,255,255,0.2)');
            const pts = [];
            for (let px = 0; px <= w; px += 2) pts.push([x0 + px, grOf(win.start + (px / w) * win.span)]);
            const keep = until === undefined ? pts : pts.filter((p) => p[0] <= until);
            if (keep.length > 1) {
                ctx.beginPath();
                ctx.moveTo(keep[0][0], gy(0));
                for (const [x, db] of keep) ctx.lineTo(x, gy(db));
                ctx.lineTo(keep[keep.length - 1][0], gy(0));
                ctx.closePath();
                ctx.fillStyle = 'rgba(125,211,252,0.14)';
                ctx.fill();
                ctx.beginPath();
                keep.forEach(([x, db], i) => (i ? ctx.lineTo(x, gy(db)) : ctx.moveTo(x, gy(db))));
                ctx.strokeStyle = T.accent;
                ctx.lineWidth = L.stroke - 1;
                ctx.stroke();
            }
            label('Gain reduction', x0 + w, gTop - L.small * 0.35, { size: L.small * 0.92, color: T.text60, align: 'right' });
            if (shows(s, 'attack') || shows(s, 'release')) {
                let peakT = win.ref;
                for (let tt = win.ref; tt < win.ref + 0.15; tt += 1 / RATE) if (illusGr(tt) > illusGr(peakT)) peakT = tt;
                let endT = peakT;
                while (endT < win.ref + 0.2 && illusGr(endT) > 0.4) endT += 1 / RATE;
                const by = Math.min(gy(illusGr(peakT)) + 24, gBottom - L.small - 16);
                const e = prog(t, sceneStart(s) + 0.25, 0.5);
                const set = TL.settings.SLOW;
                if (shows(s, 'attack')) bracket(xOf(win.ref), xOf(peakT), by, `${Math.round(set.attack * 1000)} ms`, e, true);
                if (shows(s, 'release')) bracket(xOf(peakT), xOf(endT), by, `${Math.round(set.release * 1000)} ms`, e, true);
            }
        }
        ctx.globalAlpha = 1;
    }

    // ── Settings readout: the numbers the viewer is hearing ──
    function drawReadout(t) {
        const s = sceneAt(t);
        if (!shows(s, 'readout') || !s.comp) return;
        const p = prevScene(s);
        const appear = shows(p, 'readout') ? 1 : prog(t, sceneStart(s), 0.4);
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
            const hot = changed && t - sceneStart(s) < 1.2;
            ctx.strokeStyle = hot ? T.accent : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = hot ? 3 : 2;
            ctx.beginPath();
            ctx.roundRect(x, L.readout.y, cw, size + 28, 6);
            ctx.stroke();
            label(`${name} `, x + 20, L.readout.y + size + 6, { size, color: T.text60 });
            label(value, x + 20 + nw, L.readout.y + size + 6, { size, color: hot ? T.accent : T.text, weight: 600 });
            x += cw + 18;
        }
        ctx.globalAlpha = 1;
    }

    // ── Brand: a small badge throughout, the full picture on the end card ──
    let dp = null;
    function drawBadge(t) {
        const s = sceneAt(t);
        const a = s.view === 'end' ? 1 - prog(t, sceneStart(s), 0.3) : 1;
        if (a <= 0 || !dp) return;
        const size = L.badge.size;
        const d = size * 2;
        const cy = L.badge.y;
        ctx.globalAlpha = a;
        ctx.save();
        ctx.beginPath();
        ctx.arc(L.x + d / 2, cy, d / 2, 0, Math.PI * 2);
        ctx.clip();
        // The face sits in the upper middle of the picture.
        ctx.drawImage(dp, 330, 90, 520, 520, L.x, cy - d / 2, d, d);
        ctx.restore();
        label('Virzy Guns', L.x + d + 16, cy + size * 0.36, { size, color: T.text, weight: 600 });
        ctx.font = `600 ${size}px ${T.body}`;
        const nx = L.x + d + 16 + ctx.measureText('Virzy Guns').width + 14;
        label(TL.lesson.tagline, nx, cy + size * 0.36, { size, color: T.text60 });
        ctx.globalAlpha = 1;
    }

    function drawEnd(t) {
        const s = sceneAt(t);
        if (s.view !== 'end') return;
        const t0 = sceneStart(s);
        const e = prog(t, t0 + 0.05, 0.5);
        const e2 = prog(t, t0 + 0.3, 0.5);
        const e3 = prog(t, t0 + 0.55, 0.5);
        const url = TL.lesson.url;
        let pic;
        let col;
        if (FILM.aspect === '9x16') {
            pic = { x: L.x, y: 380, s: 820 };
            col = { x: L.x, y: 1225, w: L.w, head: false };
            // One line on top, where every other headline sat.
            ctx.globalAlpha = prog(t, t0, 0.3);
            drawWordsAt('Free lesson + demo', L.x, L.head.y, Math.min(headSize, 84));
        } else if (FILM.aspect === '16x9') {
            pic = { x: L.x, y: 150, s: 780 };
            col = { x: L.x + 860, y: 260, w: W - L.x - 860 - 100, head: true };
        } else {
            pic = { x: L.x, y: 200, s: 480 };
            col = { x: L.x + 530, y: 250, w: W - L.x - 530 - 72, head: true };
        }
        // The picture settles from slightly large, on the downbeat with the hit.
        ctx.globalAlpha = e;
        const ps = pic.s * lerp(1.05, 1, e);
        const off = (ps - pic.s) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(pic.x - off, pic.y - off, ps, ps, 6);
        ctx.clip();
        if (dp) ctx.drawImage(dp, pic.x - off, pic.y - off, ps, ps);
        ctx.restore();
        let y = col.y;
        const rise = (e) => (1 - e) * 18;
        if (col.head) {
            ctx.globalAlpha = e2;
            const hs = Math.min(headSize, FILM.aspect === '16x9' ? 76 : 44);
            drawWordsAt('Free lesson + demo', col.x, y + rise(e2), hs);
            y += hs * 1.35;
        }
        // The lesson, then where to find it.
        ctx.globalAlpha = e2;
        const ts = Math.round(L.readout.size * (FILM.aspect === '1x1' ? 1.05 : 1.25));
        const titleLines = wrapPlain(TL.lesson.title, ts, col.w);
        titleLines.forEach((ln, i) => label(ln, col.x, y + ts + i * ts * 1.3 + rise(e2), { size: ts, color: T.text, weight: 600 }));
        y += ts * 1.3 * titleLines.length + ts * 0.9;
        ctx.font = headFont(100);
        const us = Math.min(FILM.aspect === '9x16' ? 92 : 80, Math.floor((100 * col.w) / ctx.measureText(url).width));
        ctx.font = headFont(us);
        ctx.fillStyle = T.text;
        ctx.fillText(url, col.x, y + us + rise(e2));
        y += us * 1.55;
        ctx.globalAlpha = e3;
        label(TL.lesson.tagline, col.x, y + ts, { size: ts * 1.1, color: T.accent, weight: 600 });
        ctx.globalAlpha = 1;
    }
    function drawWordsAt(text, x, y, size) {
        ctx.font = headFont(size);
        ctx.fillStyle = T.text;
        ctx.textBaseline = 'top';
        ctx.fillText(text, x, y);
        ctx.textBaseline = 'alphabetic';
    }
    function wrapPlain(text, size, width) {
        ctx.font = `600 ${size}px ${T.body}`;
        const out = [];
        let cur = '';
        for (const word of text.split(' ')) {
            const next = cur ? `${cur} ${word}` : word;
            if (cur && ctx.measureText(next).width > width) {
                out.push(cur);
                cur = word;
            } else cur = next;
        }
        out.push(cur);
        return out;
    }

    function draw(t) {
        ctx.fillStyle = T.bg;
        ctx.fillRect(0, 0, W, H);
        drawBadge(t);
        drawHeadline(t);
        drawStage(t);
        drawReadout(t);
        drawEnd(t);
    }

    window.filmReady = (async () => {
        await Promise.all(['800 40px "VGP Inter Display"', '500 20px "VGP Inter"', '600 20px "VGP Inter"'].map((f) => document.fonts.load(f)));
        if (!document.fonts.check('800 40px "VGP Inter Display"')) throw new Error('bundled font did not load');
        dp = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('artist picture did not load'));
            img.src = DP_URL;
        });
        fitHeadline();
        return { W, H, duration: TL.duration, fps: TL.fps, headSize };
    })();
    window.seek = (t) => draw(t);
})();
