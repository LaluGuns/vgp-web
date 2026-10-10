// Renders film 5, the narrated 9:16 short on the gap before the drop.
//
//   npm run film5                       sound, stills, video, checks
//   npm run film5 -- --stills           sound + contact sheets only
//   npm run film5 -- --frames 12.5,30   single frames for review [--tag x]
//   npm run film5 -- --refresh-lesson   re-capture the lesson page
//
// Needs assets/ (see README): the Cymatics samples and the narration.
// Output in out/film5/: short_9x16.mp4, audio.wav, captions.srt,
// contact.png, seconds.png, cover.png and VERIFY.md (what was measured).
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { FONTS_CSS, REPO, ROOT, T } from '../shared/tokens.mjs';
import { ASSETS, master, renderAudio } from './audio.mjs';
import { BEAT, FILES, LIMITER, PRE, render as renderDrop } from './drop.mjs';
import { readAudio, RATE } from './dsp.mjs';
import { TIMELINE } from './timeline.mjs';

const OUT = path.join(ROOT, 'out/film5');
const HERE = path.join(ROOT, 'film5');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const report = [];
const log = (line) => {
    console.log(line);
    report.push(line);
};

for (const f of [...Object.values(FILES).map((s) => path.join(ASSETS, 'samples', s)), path.join(ASSETS, 'vo', 'narration.wav')])
    if (!fs.existsSync(f)) throw new Error(`missing ${path.relative(ROOT, f)}; see README.md, "Film 5"`);

function measure(file) {
    const out = execFileSync('sh', ['-c', `ffmpeg -hide_banner -nostats -i "${file}" -af ebur128=peak=true:framelog=quiet -f null - 2>&1`], { encoding: 'utf8' });
    const sum = out.slice(out.lastIndexOf('Summary'));
    return { I: Number(sum.match(/I:\s+(-?[\d.]+)/)[1]), LRA: Number(sum.match(/LRA:\s+(-?[\d.]+)/)[1]), TP: Number(sum.match(/Peak:\s+(-?[\d.]+)/)[1]) };
}

// ── Sound: mix, then master to -16 LUFS with true peak at most -1.5 dBTP ──
const wav = path.join(OUT, 'audio.wav');
const audio = renderAudio();
let gain = 0;
let ceiling = 0;
let m;
for (let i = 0; i < 8; i++) {
    master(audio.L, audio.R, gain, ceiling, wav);
    m = measure(wav);
    // AAC adds about 0.6 dB of true peak, so the WAV aims 0.7 dB under the limit.
    if (Math.abs(m.I + 16) <= 0.3 && m.TP <= -2.2) break;
    gain += -16 - m.I;
    if (m.TP > -2.2) ceiling -= m.TP + 2.2 + 0.1;
}
const M = audio.measures;
const Q = M.res;
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
log(`Audio master: ${m.I} LUFS integrated, ${m.TP} dBTP, LRA ${m.LRA} LU (gain ${gain.toFixed(1)} dB, clip ceiling ${ceiling.toFixed(1)} dBFS)`);
log(`Mix: narration ${M.voLufs.toFixed(1)} LUFS before mastering; demos ${f1(M.demoGainDb)} dB, their drop bar 4 dB over the narration's loudness; music bed -9 dB alone, -15 under the voice, out under the demos`);
log(`A/B: one 128 BPM build into a drop, rendered twice from the same samples. Version 2 mutes every build source and the build's reverb return ${f1(Q.gapMs)} ms (one 8th) before the downbeat with ${Q.fadeMs} ms fades; version 1 runs into the downbeat.`);
log(`Song-bus limiter (both versions): ceiling ${LIMITER.ceilingDb} dBFS, look-ahead ${LIMITER.lookMs} ms, release ${LIMITER.releaseMs} ms, drive ${Q.driveDb} dB`);
log(`Matching: version 1 turned ${Q.matchOffsetDb >= 0 ? 'up' : 'down'} ${Math.abs(Q.matchOffsetDb).toFixed(2)} dB to version 2's drop-bar loudness (${f1(Q[2].dropLufs)} LUFS, K-weighted, downbeat plus one bar)`);
log(`Gap check: the last 8th before the downbeat sits ${f1(Q[1].gapDb)} dB (version 1) and ${f1(Q[2].gapDb)} dB (version 2) against the drop bar's loudness`);
log(`Build level, version 1, before the limiter: its last bar is ${f1(Q[1].buildVsDropDb)} dB against the drop bar's loudness (${Math.abs(Q[1].buildVsDropDb) < 0.5 ? 'as loud as the drop' : Q[1].buildVsDropDb < 0 ? 'a little under the drop' : 'louder than the drop'}); the riser peaks in its last 8th, which is why that 8th sits ${f1(Q[1].gapDb)} dB over the drop bar after the limiter`);
log(`Claim 1, limiter gain reduction on the first kick (mean over its first 20 ms): version 1 ${f1(Q[1].grMean)} dB, version 2 ${f1(Q[2].grMean)} dB, ${f1(Q.claims[1].db)} dB less with the gap (target 3 dB or more)`);
log(`Claim 2, kick click 2-6 kHz over everything else in that band, first 20 ms: version 1 ${Q[1].clickDb.toFixed(2)} dB, version 2 ${Q[2].clickDb.toFixed(2)} dB, ${f1(Q.claims[2].db)} dB better with the gap (target 10 dB or more; the difference is taken before rounding)`);
log(`  shown on screen (replay), one decimal from the unrounded values: ${Q[1].clickDb.toFixed(1)} dB in 1, ${Q[2].clickDb.toFixed(1)} dB in 2`);
log(`Claim 3, through the phone check (200 Hz high-pass, 24 dB/oct): the kick heard in its first 20 ms is ${f1(Q.claims[3].kickPhone)} dB louder with the gap (${f1(Q.claims[3].kickFull)} dB full band, ${Math.round(Q.claims[3].survive1 * 100)}% survives); the click advantage is ${f1(Q.claims[3].clickPhone)} dB (${Math.round(Q.claims[3].survive2 * 100)}% survives; target 80%)`);
log(`  stricter small-speaker model (500 Hz high-pass at 24 dB/oct, +4 dB at 1 kHz, 10 kHz low-pass): the kick heard is ${f1(Q.claims[3].kickSmall)} dB louder with the gap (${Math.round((Q.claims[3].kickSmall / Q.claims[3].kickFull) * 100)}% of full band); the click advantage is ${f1(Q.claims[3].clickSmall)} dB (${Math.round((Q.claims[3].clickSmall / Q.claims[2].db) * 100)}%)`);
log(`Claim 4, the first kick (K-weighted, first 50 ms) over the drop bar's loudness at matched loudness: version 1 ${f1(Q[1].kickOverBar)} dB, version 2 ${f1(Q[2].kickOverBar)} dB, ${f1(Q.claims[4].db)} dB more prominent with the gap`);
const pass = Q.claims[1].db >= 3 && Q.claims[2].db >= 10 && Q.claims[3].survive1 >= 0.8 && Q.claims[3].survive2 >= 0.8 && Q.claims[4].db > 0;
log(`Claims 1-4: ${pass ? 'all pass' : 'NOT ALL PASS'}`);

const ts = (t) => {
    const ms = Math.round(t * 1000);
    const p = (n, w = 2) => String(n).padStart(w, '0');
    return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

// ── Picture ──
const exe = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => p && fs.existsSync(p));
const browser = exe ? await chromium.launch({ executablePath: exe }) : await chromium.launch({ channel: 'chrome' });

/**
 * The lesson's Listen demo at phone size, for the end card: idle, then three
 * moments after Play is pressed. Cached in out/film5/lesson/.
 */
async function lesson() {
    const dir = path.join(OUT, 'lesson');
    const meta = path.join(dir, 'demo.json');
    const cached = fs.existsSync(meta) ? JSON.parse(fs.readFileSync(meta, 'utf8')) : null;
    if (cached?.figure && !args.includes('--refresh-lesson')) return cached;
    fs.mkdirSync(dir, { recursive: true });
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const url = `https://www.${TIMELINE.lesson.url.replace(/\/blog$/, '')}/blog/${TIMELINE.lesson.slug}`;
    let ok = false;
    for (let i = 0; i < 4 && !ok; i++) {
        try {
            await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
            ok = true;
        } catch (e) {
            console.log(`lesson capture retry: ${String(e.message).slice(0, 80)}`);
        }
    }
    if (!ok) {
        await p.close();
        return null;
    }
    // The page from its top down to the demo, for the end card's scroll. Sections
    // reveal once they have been on screen, so scroll down first, then back up.
    const demoTop = await p.evaluate(() => {
        const s = document.querySelector('section[aria-label^="Listen"]');
        return Math.round(s.getBoundingClientRect().top + scrollY - 76);
    });
    for (let y = 0; y <= demoTop + 844; y += 400) {
        await p.evaluate((v) => scrollTo(0, v), y);
        await p.waitForTimeout(150);
    }
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(dir, 'page.jpg'), type: 'jpeg', quality: 80, fullPage: true, clip: { x: 0, y: 0, width: 390, height: demoTop + 844 } });
    // The lesson's gap-length figure (32nd, 16th, 8th, beat against the masking window), for the end card.
    const fig = await p.evaluate(() => {
        const el = [...document.querySelectorAll('figure')].find((f) => /Gap lengths at 128 BPM/.test(f.textContent));
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top + scrollY), height: Math.round(r.height) };
    });
    let figure = null;
    if (fig) {
        await p.evaluate((v) => scrollTo(0, v), Math.max(0, fig.top - 140));
        await p.waitForTimeout(1200);
        await p.screenshot({ path: path.join(dir, 'figure.jpg'), type: 'jpeg', quality: 88, fullPage: true, clip: { x: 0, y: fig.top - 300, width: 390, height: fig.height + 440 } });
        figure = { image: 'figure', height: fig.height + 440 };
    }
    if (cached && !args.includes('--refresh-lesson')) {
        await p.close();
        const out = { ...cached, page: { image: 'page', scrollTo: demoTop }, figure, images: [...new Set([...(cached.images ?? []), ...(figure ? ['figure'] : [])])] };
        fs.writeFileSync(meta, JSON.stringify(out, null, 1));
        return out;
    }
    // Bring the demo up under the site header, let it settle.
    await p.evaluate((v) => scrollTo(0, v), demoTop);
    await p.waitForTimeout(1200);
    const play = await p.evaluate(() => {
        const b = document.querySelector('section[aria-label^="Listen"] button').getBoundingClientRect();
        return [b.left, b.top, b.width, b.height];
    });
    await p.screenshot({ path: path.join(dir, 'idle.jpg'), type: 'jpeg', quality: 86 });
    await p.click('section[aria-label^="Listen"] button');
    for (let k = 1; k <= 3; k++) {
        await p.waitForTimeout(350);
        await p.screenshot({ path: path.join(dir, `play${k}.jpg`), type: 'jpeg', quality: 86 });
    }
    await p.close();
    const out = { url, captured: new Date().toISOString().slice(0, 10), play, images: ['idle', 'play1', 'play2', 'play3', ...(figure ? ['figure'] : [])], page: { image: 'page', scrollTo: demoTop }, figure };
    fs.writeFileSync(meta, JSON.stringify(out, null, 1));
    return out;
}
const L = await lesson();
const lessonData = L ? { play: L.play, scrollTo: L.page?.scrollTo ?? 0, images: Object.fromEntries([...L.images, ...(L.page ? ['page'] : [])].map((k) => [k, `data:image/jpeg;base64,${fs.readFileSync(path.join(OUT, 'lesson', `${k}.jpg`)).toString('base64')}`])) } : null;
log(L ? `End card: ${L.figure ? "the gap-length figure" : 'the Listen demo'} of ${L.url}, captured ${L.captured}` : 'End card: lesson page could not be captured; phone shows a blank page');

const dpUrl = `data:image/jpeg;base64,${fs.readFileSync(path.join(REPO, 'public/images/virzy-guns-dp.jpg')).toString('base64')}`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS_CSS}
html,body{margin:0;background:${T.bg}}canvas{display:block}</style></head><body><canvas id="film"></canvas>
<script>window.TIMELINE=${JSON.stringify(TIMELINE)};window.DATA=${JSON.stringify(audio.data)};window.DP_URL=${JSON.stringify(dpUrl)};window.LESSON=${JSON.stringify(lessonData)};</script>
<script>${fs.readFileSync(path.join(HERE, 'art.js'), 'utf8')}</script><script>${fs.readFileSync(path.join(HERE, 'art5.js'), 'utf8')}</script><script>${fs.readFileSync(path.join(HERE, 'film.js'), 'utf8')}</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'preview.html'), html);

// ── Captions: one cue per caption page, as the film shows them ──
{
    const p = await browser.newPage({ viewport: { width: TIMELINE.width, height: TIMELINE.height } });
    await p.setContent(html, { waitUntil: 'load' });
    await p.evaluate(() => window.filmReady);
    const cues = await p.evaluate(() => window.captionPages());
    await p.close();
    fs.writeFileSync(path.join(OUT, 'captions.srt'), cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n'));
    const longest = Math.max(...cues.flatMap((c) => c.text.split('\n').map((l) => l.length)));
    log(`Captions: ${cues.length} cues, the narration as spoken, paged as on screen (at most 2 lines; longest line ${longest} characters; longest cue ${Math.max(...cues.map((c) => c.end - c.start)).toFixed(1)} s)`);
}

async function open() {
    const p = await browser.newPage({ viewport: { width: TIMELINE.width, height: TIMELINE.height }, deviceScaleFactor: 1 });
    const errors = [];
    p.on('pageerror', (e) => errors.push(String(e)));
    await p.setContent(html, { waitUntil: 'load' });
    const info = await p.evaluate(() => window.filmReady);
    if (errors.length) throw new Error(errors.join('\n'));
    const cdp = await p.context().newCDPSession(p);
    const shot = async (t) => {
        await p.evaluate((x) => window.seek(x), t);
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
        if (errors.length) throw new Error(errors.join('\n'));
        return Buffer.from(data, 'base64');
    };
    // Small JPEG for contact sheets: `w` pixels wide.
    const thumb = async (t, w) => {
        await p.evaluate((x) => window.seek(x), t);
        const scale = w / TIMELINE.width;
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: TIMELINE.width, height: TIMELINE.height, scale } });
        return Buffer.from(data, 'base64');
    };
    return { p, info, shot, thumb };
}

if (opt('--frames')) {
    const tag = opt('--tag') ?? 'frame';
    const dir = path.join(OUT, 'frames');
    fs.mkdirSync(dir, { recursive: true });
    const o = await open();
    for (const t of opt('--frames').split(',')) fs.writeFileSync(path.join(dir, `${tag}-${t}.png`), await o.shot(Number(t)));
    await browser.close();
    console.log(`wrote out/film5/frames/${tag}-*.png`);
    process.exit(0);
}

if (opt('--pack')) {
    // Judge pack frames: every 0.5 s at 360 px (contact sheets), every scene at
    // its start + 0.3 s at full size, and full-size crops of every plot at the
    // moment it is most complete.
    const dir = path.resolve(opt('--pack'));
    fs.mkdirSync(dir, { recursive: true });
    const o = await open();
    const all = [];
    for (let t = 0; t < TIMELINE.duration; t += 0.5) all.push({ png: await o.thumb(t, 360), caption: `${t.toFixed(1)} s` });
    for (let i = 0; i * 32 < all.length; i++) await sheet(all.slice(i * 32, i * 32 + 32), 8, 180, path.relative(OUT, path.join(dir, `sheet-${String(i + 1).padStart(2, '0')}.png`)));
    // The loop: the first and the last frame, which should match.
    fs.writeFileSync(path.join(dir, 'frame-first-0.000s.png'), await o.shot(0));
    const last = (Math.round(TIMELINE.duration * TIMELINE.fps) - 1) / TIMELINE.fps;
    fs.writeFileSync(path.join(dir, `frame-last-${last.toFixed(3)}s.png`), await o.shot(last));
    const scenes = await o.p.evaluate(() => window.sceneTimes());
    for (const s of scenes) fs.writeFileSync(path.join(dir, `scene-${s.id}-${(s.start + 0.3).toFixed(2)}s.png`), await o.shot(s.start + 0.3));
    for (const c of await o.p.evaluate(() => window.plotCrops())) {
        await o.p.evaluate((x) => window.seek(x), c.t);
        const { data } = await o.p.context().newCDPSession(o.p).then((cdp) => cdp.send('Page.captureScreenshot', { format: 'png', clip: { ...c.box, scale: 1 } }));
        fs.writeFileSync(path.join(dir, `plot-${c.id}-${c.t.toFixed(2)}s.png`), Buffer.from(data, 'base64'));
    }
    await browser.close();
    console.log(`wrote pack frames to ${dir}`);
    process.exit(0);
}

async function sheet(stills, cols, width, file) {
    const page = `<!doctype html><html><head><style>${FONTS_CSS}body{margin:0;padding:24px;background:#000;color:#fff;font:15px 'VGP Inter';display:grid;grid-template-columns:repeat(${cols},${width}px);gap:18px 14px;width:${cols * (width + 14) + 34}px}
img{width:${width}px;display:block;border:1px solid #222}p{margin:6px 0 0;opacity:.75;line-height:1.35}</style></head><body>${stills.map((s) => `<div><img src="data:image/jpeg;base64,${s.png.toString('base64')}"><p>${s.caption}</p></div>`).join('')}</body></html>`;
    const p = await browser.newPage({ viewport: { width: cols * (width + 14) + 34, height: 300 } });
    await p.setContent(page, { waitUntil: 'load' });
    await p.screenshot({ path: path.join(OUT, file), fullPage: true });
    await p.close();
}

{
    // Determinism: one frame in two fresh pages, byte-identical.
    const a = await open();
    const b = await open();
    const t = 31.4;
    log(`Determinism: frame at ${t} s in two fresh pages is ${(await a.shot(t)).equals(await b.shot(t)) ? 'identical' : 'DIFFERENT'}`);
    await b.p.close();
    // One still per scene, and one per second, each 390 px wide (phone size).
    const stills = [];
    const sc = await a.p.evaluate(() => window.sceneTimes());
    for (const [i, s] of sc.entries()) {
        const end = i + 1 < sc.length ? sc[i + 1].start : TIMELINE.duration;
        const t = s.start + (end - s.start) * 0.7;
        stills.push({ png: await a.thumb(t, 600), caption: `<b>${s.id}</b> ${t.toFixed(2)} s · ${TIMELINE.scenes[i].teaches}` });
    }
    await sheet(stills, 6, 300, 'contact.png');
    const secs = [];
    for (let t = 0.5; t < TIMELINE.duration; t += 1) secs.push({ png: await a.thumb(t, 400), caption: `${t.toFixed(1)} s` });
    await sheet(secs, 12, 200, 'seconds.png');
    await a.p.evaluate(() => window.cover());
    await a.p.screenshot({ path: path.join(OUT, 'cover.png') });
    await a.p.close();
    log('Stills: contact.png (one per scene), seconds.png (one per second), cover.png');
}

if (!args.includes('--stills')) {
    const o = await open();
    const frames = Math.round(o.info.duration * o.info.fps);
    const file = path.join(OUT, 'short_9x16.mp4');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(o.info.fps), '-i', '-', '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', file], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let n = 0; n < frames; n++) {
        const buf = await o.shot(n / o.info.fps);
        if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain');
        if (n % 300 === 0) process.stdout.write(`  frame ${n}/${frames}\r`);
    }
    ff.stdin.end();
    await once(ff, 'close');
    await o.p.close();
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,pix_fmt:format=duration,size', '-of', 'json', file], { encoding: 'utf8' }));
    const vs = probe.streams.find((s) => s.codec_type === 'video');
    const as = probe.streams.find((s) => s.codec_type === 'audio');
    log(`short_9x16.mp4: ${vs.width}x${vs.height} ${vs.codec_name} ${vs.pix_fmt} ${vs.r_frame_rate} fps, ${vs.nb_read_frames} frames (expected ${frames}), ${Number(probe.format.duration).toFixed(2)} s, ${(Number(probe.format.size) / 1e6).toFixed(1)} MB, audio ${as?.codec_name ?? 'missing'}; rendered in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    const enc = measure(file);
    log(`  delivered audio: ${enc.I} LUFS integrated, ${enc.TP} dBTP true peak after AAC`);
    log(`  decode errors: ${execFileSync('sh', ['-c', `ffmpeg -v error -i "${file}" -f null - 2>&1 | wc -l`], { encoding: 'utf8' }).trim()}`);
    const yavg = execFileSync('sh', ['-c', `ffmpeg -hide_banner -i "${file}" -vf signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=- -an -f null - 2>/dev/null | grep YAVG | cut -d= -f2`], { encoding: 'utf8' }).trim().split('\n').map(Number);
    const jumps = [];
    let worst = 0;
    for (let i = 1; i < yavg.length; i++) {
        const d = Math.abs(yavg[i] - yavg[i - 1]);
        worst = Math.max(worst, d);
        if (d > 20) jumps.push(`${(i / TIMELINE.fps).toFixed(2)} s (${d.toFixed(1)})`);
    }
    log(`  flashes: ${jumps.length} frame-to-frame luma jumps over 20/255${jumps.length ? `: ${jumps.join(', ')}` : ''} (largest ${worst.toFixed(1)})`);
    // Sync: the hook's first kick is at its demo's downbeat. Cross-correlate the
    // delivered audio around it with version 1 as rendered, and report the lag.
    const d0 = TIMELINE.demos[0];
    const down = d0.at + d0.pre * BEAT;
    const pcm = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(down - 0.15), '-t', '0.3', '-i', file, '-ac', '1', '-ar', String(RATE), '-f', 'f32le', '-'], { maxBuffer: 1 << 26 });
    const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 4);
    const ref = renderDrop(false).out;
    const y = Float32Array.from({ length: x.length }, (_, k) => ref.L[Math.round((PRE - 0.15) * RATE) + k] + ref.R[Math.round((PRE - 0.15) * RATE) + k]);
    let best = 0;
    let lag = 0;
    for (let L = -240; L <= 240; L++) {
        let c = 0;
        for (let k = 300; k < x.length - 300; k++) c += x[k] * y[k - L];
        if (c > best) [best, lag] = [c, L];
    }
    log(`  sync: the hook's first kick is heard ${((lag / RATE) * 1000).toFixed(2)} ms from its timeline time (${down.toFixed(4)} s); limit 2 ms`);
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'VERIFY.md'), `# Film 5 checks\n\nMeasured by \`npm run film5\` on ${new Date().toISOString().slice(0, 10)}.\n\n${report.map((l) => `- ${l}`).join('\n')}\n`);
