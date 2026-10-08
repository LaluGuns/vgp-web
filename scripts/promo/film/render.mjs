// Renders the explainer film.
//
//   npm run film                      all formats + reduced-motion cut + checks
//   npm run film -- --stills          contact sheets only (fast, for review)
//   npm run film -- --only 9x16       one format
//
// Output in out/film/: master_16x9.mp4, cut_9x16.mp4, cut_1x1.mp4,
// master_16x9_reduced_motion.mp4, captions.srt, audio.wav, contact.png,
// beats-<format>.png and VERIFY.md (what was measured, not claimed).
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { FONTS_CSS, LOGO, ROOT, T } from '../shared/tokens.mjs';
import { master, renderAudio } from './audio.mjs';
import { TIMELINE } from './timeline.mjs';

const OUT = path.join(ROOT, 'out/film');
const HERE = path.join(ROOT, 'film');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const stillsOnly = args.includes('--stills');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const FORMATS = [
    { aspect: '16x9', file: 'master_16x9.mp4' },
    { aspect: '9x16', file: 'cut_9x16.mp4' },
    { aspect: '1x1', file: 'cut_1x1.mp4' },
    { aspect: '16x9', file: 'master_16x9_reduced_motion.mp4', reduced: true },
].filter((f) => !only || only.includes(f.aspect));
const report = [];
const log = (line) => {
    console.log(line);
    report.push(line);
};

// ── Sound: render, then master to about -16 LUFS with true peak at most -1.5 dBTP ──
function loudness(file) {
    const r = execFileSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
    return r;
}
function measure(file) {
    let text = '';
    try {
        text = loudness(file);
    } catch (e) {
        text = String(e.stderr ?? e);
    }
    const res = spawnSyncStderr(file);
    return res;
}
function spawnSyncStderr(file) {
    const out = execFileSync('sh', ['-c', `ffmpeg -hide_banner -nostats -i "${file}" -af ebur128=peak=true:framelog=quiet -f null - 2>&1`], { encoding: 'utf8' });
    const sum = out.slice(out.lastIndexOf('Summary'));
    return { I: Number(sum.match(/I:\s+(-?[\d.]+)/)[1]), LRA: Number(sum.match(/LRA:\s+(-?[\d.]+)/)[1]), TP: Number(sum.match(/Peak:\s+(-?[\d.]+)/)[1]) };
}

const wav = path.join(OUT, 'audio.wav');
const { mix } = renderAudio(TIMELINE, path.join(OUT, 'raw.wav'));
let gain = 0;
let ceiling = 0;
let m;
for (let i = 0; i < 6; i++) {
    master(mix, gain, ceiling, wav);
    m = measure(wav);
    // AAC raises true peak by about 0.6 dB, so the WAV aims 0.7 dB under the delivery limit.
    if (Math.abs(m.I + 16) <= 0.3 && m.TP <= -2.2) break;
    gain += -16 - m.I;
    if (m.TP > -2.2) ceiling -= m.TP + 2.2 + 0.1;
}
fs.rmSync(path.join(OUT, 'raw.wav'), { force: true });
log(`Audio: ${m.I} LUFS integrated, ${m.TP} dBTP true peak, LRA ${m.LRA} LU (master gain ${gain.toFixed(1)} dB, clip ceiling ${ceiling.toFixed(1)} dBFS)`);

// ── Captions: the on-screen lines, timed ──
const items = TIMELINE.scenes.flatMap((s) => s.text.map((it) => ({ at: (s.bar - 1) * TIMELINE.bar + it.at, lines: it.lines })));
items.sort((a, b) => a.at - b.at);
const ts = (t) => {
    const ms = Math.round(t * 1000);
    const p = (n, w = 2) => String(n).padStart(w, '0');
    return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const srt = items.map((it, i) => `${i + 1}\n${ts(it.at)} --> ${ts(i + 1 < items.length ? items[i + 1].at : TIMELINE.duration)}\n${it.lines.join('\n')}\n`).join('\n');
fs.writeFileSync(path.join(OUT, 'captions.srt'), srt);
log(`Captions: ${items.length} cues, longest line ${Math.max(...items.flatMap((i) => i.lines.map((l) => l.split(' ').length)))} words, at most ${Math.max(...items.map((i) => i.lines.length))} lines on screen`);

// ── Picture ──
const modelSrc = fs.readFileSync(path.join(HERE, 'model.mjs'), 'utf8').replace(/^export /gm, '');
const filmSrc = fs.readFileSync(path.join(HERE, 'film.js'), 'utf8');
const logoUrl = `data:image/png;base64,${fs.readFileSync(LOGO).toString('base64')}`;
const page = (film) => `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS_CSS}
html,body{margin:0;background:${T.bg}}canvas{display:block}</style></head><body><canvas id="film"></canvas>
<script>window.TIMELINE=${JSON.stringify(TIMELINE)};window.T=${JSON.stringify(T)};window.FILM=${JSON.stringify(film)};window.LOGO_URL=${JSON.stringify(logoUrl)};</script>
<script>${modelSrc}</script><script>${filmSrc}</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'preview.html'), page({ aspect: '16x9', reduced: false }));

const exe = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => p && fs.existsSync(p));
const browser = exe ? await chromium.launch({ executablePath: exe }) : await chromium.launch({ channel: 'chrome' });

async function open(film) {
    const size = { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080] }[film.aspect];
    const p = await browser.newPage({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 1 });
    await p.setContent(page(film), { waitUntil: 'load' });
    const info = await p.evaluate(() => window.filmReady);
    const cdp = await p.context().newCDPSession(p);
    const shot = async (t) => {
        await p.evaluate((x) => window.seek(x), t);
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
        return Buffer.from(data, 'base64');
    };
    return { p, info, shot };
}

// Single frames for review: --frames 16x9@18.6,9x16@25.4 [--tag before]
if (args.includes('--frames')) {
    const tag = args.includes('--tag') ? args[args.indexOf('--tag') + 1] : 'frame';
    const dir = path.join(OUT, 'frames');
    fs.mkdirSync(dir, { recursive: true });
    for (const spec of args[args.indexOf('--frames') + 1].split(',')) {
        const [aspect, t] = spec.split('@');
        const o = await open({ aspect, reduced: false });
        fs.writeFileSync(path.join(dir, `${tag}-${aspect}-${t}.png`), await o.shot(Number(t)));
        await o.p.close();
    }
    await browser.close();
    console.log(`wrote out/film/frames/${tag}-*.png`);
    process.exit(0);
}

// Determinism: one frame, two fresh pages, byte-identical.
{
    const a = await open({ aspect: '16x9', reduced: false });
    const b = await open({ aspect: '16x9', reduced: false });
    const t = 21.37;
    const same = (await a.shot(t)).equals(await b.shot(t));
    log(`Determinism: frame at ${t} s rendered in two fresh pages is ${same ? 'identical' : 'DIFFERENT'}`);
    await a.p.close();
    await b.p.close();
}

// Contact sheet (one still per scene, 16:9) and a still at every beat per format, shown 390 px wide.
async function sheet(stills, cols, width, file) {
    const html = `<!doctype html><html><head><style>${FONTS_CSS}body{margin:0;padding:24px;background:#000;color:#fff;font:15px 'VGP Inter';display:grid;grid-template-columns:repeat(${cols},${width}px);gap:18px 14px;width:${cols * (width + 14) + 34}px}
img{width:${width}px;display:block;border:1px solid #222}p{margin:6px 0 0;opacity:.75;line-height:1.35}</style></head><body>${stills
        .map((s) => `<div><img src="data:image/png;base64,${s.png.toString('base64')}"><p>${s.caption}</p></div>`)
        .join('')}</body></html>`;
    const p = await browser.newPage({ viewport: { width: cols * (width + 14) + 34, height: 300 } });
    await p.setContent(html, { waitUntil: 'load' });
    await p.screenshot({ path: path.join(OUT, file), fullPage: true });
    await p.close();
}
{
    const v = await open({ aspect: '16x9', reduced: false });
    const stills = [];
    for (const s of TIMELINE.scenes) {
        const start = (s.bar - 1) * TIMELINE.bar;
        const t = start + s.bars * TIMELINE.bar * 0.72;
        stills.push({ png: await v.shot(t), caption: `<b>${s.id}</b> ${t.toFixed(2)} s · ${s.teaches}` });
    }
    await sheet(stills, 4, 460, 'contact.png');
    await v.p.close();
    for (const f of [...new Set(FORMATS.map((x) => x.aspect))]) {
        const o = await open({ aspect: f, reduced: false });
        const beats = [];
        for (let b = 0; b < TIMELINE.bars * 4; b++) {
            const t = b * (TIMELINE.bar / 4) + TIMELINE.bar / 8;
            beats.push({ png: await o.shot(t), caption: `${t.toFixed(2)} s` });
        }
        await sheet(beats, f === '9x16' ? 8 : 4, 390, `beats-${f}.png`);
        await o.p.close();
    }
    log('Stills: contact.png (one per scene), beats-<format>.png (one per beat, 390 px wide)');
}

if (!stillsOnly) {
    for (const f of FORMATS) {
        const o = await open({ aspect: f.aspect, reduced: Boolean(f.reduced) });
        const frames = Math.round(o.info.duration * o.info.fps);
        const out = path.join(OUT, f.file);
        const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(o.info.fps), '-i', '-', '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
        const t0 = Date.now();
        for (let n = 0; n < frames; n++) {
            const buf = await o.shot(n / o.info.fps);
            if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain');
            if (n % 600 === 0) process.stdout.write(`  ${f.file}: frame ${n}/${frames}\r`);
        }
        ff.stdin.end();
        await once(ff, 'close');
        await o.p.close();
        const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,pix_fmt:format=duration', '-of', 'json', out], { encoding: 'utf8' }));
        const vs = probe.streams.find((s) => s.codec_type === 'video');
        const as = probe.streams.find((s) => s.codec_type === 'audio');
        log(`${f.file}: ${vs.width}x${vs.height} ${vs.codec_name} ${vs.pix_fmt} ${vs.r_frame_rate} fps, ${vs.nb_read_frames} frames (expected ${frames}), ${Number(probe.format.duration).toFixed(2)} s, audio ${as?.codec_name ?? 'missing'}; rendered in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
        const enc = measure(out);
        log(`  delivered audio: ${enc.I} LUFS integrated, ${enc.TP} dBTP true peak after AAC`);
        // Full decode for errors.
        const errs = execFileSync('sh', ['-c', `ffmpeg -v error -i "${out}" -f null - 2>&1 | wc -l`], { encoding: 'utf8' }).trim();
        log(`  decode errors: ${errs}`);
        // Flashes: count large frame-to-frame luminance jumps per second.
        const yavg = execFileSync('sh', ['-c', `ffmpeg -hide_banner -i "${out}" -vf signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=- -an -f null - 2>/dev/null | grep YAVG | cut -d= -f2`], { encoding: 'utf8' })
            .trim()
            .split('\n')
            .map(Number);
        let jumps = 0;
        let worst = 0;
        for (let i = 1; i < yavg.length; i++) {
            const d = Math.abs(yavg[i] - yavg[i - 1]);
            worst = Math.max(worst, d);
            if (d > 20) jumps++;
        }
        log(`  flashes: ${jumps} frame-to-frame luma jumps over 20/255 (largest ${worst.toFixed(1)})`);
    }
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'VERIFY.md'), `# Film checks\n\nMeasured by \`npm run film\` on ${new Date().toISOString().slice(0, 10)}.\n\n${report.map((l) => `- ${l}`).join('\n')}\n`);
