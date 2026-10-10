// Renders the bass-on-phones short (the missing fundamental), narrated, 9:16.
//
//   npm run short:bass-on-phones                       sound, stills, video, checks
//   npm run short:bass-on-phones -- --stills           sound + contact sheets only
//   npm run short:bass-on-phones -- --frames 12.5,30   single frames for review [--tag x]
//   npm run short:bass-on-phones -- --refresh-lesson   re-capture the lesson page
//
// Needs assets/ (see README): the Cymatics samples and the narration.
// Output in out/shorts/bass-on-phones/: short_9x16.mp4, audio.wav, captions.srt,
// contact.png, seconds.png, cover.png and VERIFY.md (what was measured).
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { FONTS_CSS, REPO, ROOT, T } from '../../shared/tokens.mjs';
import { ASSETS, master, renderAudio, VO_TAKE } from './audio.mjs';
import { readAudio } from './dsp.mjs';
import { TIMELINE } from './timeline.mjs';

const OUT = path.join(ROOT, 'out/shorts/bass-on-phones');
const HERE = path.join(ROOT, 'shorts/bass-on-phones');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const report = [];
const log = (line) => {
    console.log(line);
    report.push(line);
};

for (const f of [...Object.values(TIMELINE.samples).map((s) => path.join(ASSETS, 'samples', s)), VO_TAKE])
    if (!fs.existsSync(f)) throw new Error(`missing ${path.relative(ROOT, f)}; see README.md, "Short: bass on phones"`);

function measure(file) {
    const out = execFileSync('sh', ['-c', `ffmpeg -hide_banner -nostats -i "${file}" -af ebur128=peak=true:framelog=quiet -f null - 2>&1`], { encoding: 'utf8' });
    const sum = out.slice(out.lastIndexOf('Summary'));
    return { I: Number(sum.match(/I:\s+(-?[\d.]+)/)[1]), LRA: Number(sum.match(/LRA:\s+(-?[\d.]+)/)[1]), TP: Number(sum.match(/Peak:\s+(-?[\d.]+)/)[1]) };
}

// ── Sound: mix, then master to -16 LUFS with true peak at most -1.5 dBTP ──
const wav = path.join(OUT, 'audio.wav');
const audio = renderAudio(null);
let gain = 0;
let ceiling = 0;
let m;
let clipped;
// Speech must never reach the clipper: count samples over its knee while the voice speaks.
const speech = audio.data.vo.map((v) => [v.at, v.at + v.dur]);
for (let i = 0; i < 24; i++) {
    clipped = master(audio.L, audio.R, gain, ceiling, wav, speech);
    m = measure(wav);
    // AAC adds about 0.6 dB of true peak, so the WAV aims 0.7 dB under the limit.
    if (Math.abs(m.I + 16) <= 0.3 && m.TP <= -2.2) break;
    gain += -16 - m.I;
    if (m.TP > -2.2) ceiling -= m.TP + 2.2 + 0.1;
}
const M = audio.measures;
log(`Audio master: ${m.I} LUFS integrated, ${m.TP} dBTP, LRA ${m.LRA} LU (gain ${gain.toFixed(1)} dB, clip ceiling ${ceiling.toFixed(1)} dBFS)`);
log(`Speech through the master's clipper: ${clipped} samples over its knee while the voice speaks`);
log(`Mix: narration ${M.voLufs.toFixed(1)} LUFS before mastering; bass trim ${M.bassTrimDb.toFixed(1)} dB (saturated bass through the phone 5 dB under the voice in its demos), drums through the phone 6 dB under the voice; saturated version level-matched to the clean sub by ${M.matchDb.toFixed(2)} dB`);
const C = audio.data.claims;
log(`Claim 1, the phone filter (200 Hz high-pass, 24 dB/oct) on each clean sub's fundamental: ${C.claim1.map((c) => `${c.name} ${c.f0} Hz down ${c.dropDb} dB (theory ${c.theoryDb})`).join('; ')}. Target: at least 40 dB.`);
log(`  "almost just the bottom of the stack": the clean sub's strongest harmonic above f0 is ${Math.max(...C.claim1.map((c) => c.cleanTopHarmonicDb))} dB under it`);
log(`Claim 2, bass through the phone at matched full-range loudness (ungated K-weighted level, same two bars): clean ${C.claim2.cleanFull.toFixed(2)} vs saturated ${C.claim2.satFull.toFixed(2)} full range; through the phone clean ${C.claim2.cleanPhone.toFixed(1)}, saturated ${C.claim2.satPhone.toFixed(1)}: saturated ${C.claim2.gainDb.toFixed(1)} dB higher. Target: at least 15 dB.`);
log(`Claim 3, autocorrelation of the phone-filtered saturated bass (highest peak, 2.5-30 ms): ${C.claim3.map((c) => `${c.name} ${c.lagMs.toFixed(2)} ms vs 1/f0 ${c.periodMs.toFixed(2)} ms (${c.errPct.toFixed(2)} %, r ${c.r.toFixed(2)})`).join('; ')}. Target: within 2 %.`);
log(`Claim 4, cone travel for equal level (p ∝ S·x·f², so x ∝ 1/f²): ${C.claim4.map((c) => `${c.hz} Hz ${c.x}×`).join(', ')}`);
log(`Claim 5, every rung on screen is an FFT of the bass playing at that frame (85 ms Hann window, centred on the frame and kept inside the sounding note): ${audio.data.frames.f0.filter(Boolean).length} frames analysed; saturated stack, full range, dB re the clean fundamental: ${M.satStack.map((s) => `${s.name} [${s.db.slice(0, 6).join(', ')}]`).join('; ')}`);

// ── Captions: one cue per narration line ──
const ts = (t) => {
    const ms = Math.round(t * 1000);
    const p = (n, w = 2) => String(n).padStart(w, '0');
    return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const vo = audio.data.vo;
fs.writeFileSync(path.join(OUT, 'captions.srt'), vo.map((v, i) => `${i + 1}\n${ts(v.at)} --> ${ts(v.at + v.dur + 0.25)}\n${v.text}\n`).join('\n'));
log(`Captions: ${vo.length} cues, the narration as spoken`);

// ── Picture ──
const exe = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => p && fs.existsSync(p));
const browser = exe ? await chromium.launch({ executablePath: exe }) : await chromium.launch({ channel: 'chrome' });

/**
 * The lesson's Listen demo at phone size, for the end card: idle, then three
 * moments after Play is pressed. Cached in out/shorts/bass-on-phones/lesson/.
 */
async function lesson() {
    const dir = path.join(OUT, 'lesson');
    const meta = path.join(dir, 'demo.json');
    if (fs.existsSync(meta) && !args.includes('--refresh-lesson')) return JSON.parse(fs.readFileSync(meta, 'utf8'));
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
    // Bring the demo up under the site header, let it settle.
    await p.evaluate(() => {
        const s = document.querySelector('section[aria-label^="Listen"]');
        scrollTo(0, s.getBoundingClientRect().top + scrollY - 76);
    });
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
    const out = { url, captured: new Date().toISOString().slice(0, 10), play, images: ['idle', 'play1', 'play2', 'play3'] };
    fs.writeFileSync(meta, JSON.stringify(out, null, 1));
    return out;
}
const L = await lesson();
const lessonData = L ? { play: L.play, images: Object.fromEntries(L.images.map((k) => [k, `data:image/jpeg;base64,${fs.readFileSync(path.join(OUT, 'lesson', `${k}.jpg`)).toString('base64')}`])) } : null;
log(L ? `End card: the Listen demo of ${L.url}, captured ${L.captured}` : 'End card: lesson page could not be captured; phone shows a blank page');

const dpUrl = `data:image/jpeg;base64,${fs.readFileSync(path.join(REPO, 'public/images/virzy-guns-dp.jpg')).toString('base64')}`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS_CSS}
html,body{margin:0;background:${T.bg}}canvas{display:block}</style></head><body><canvas id="film"></canvas>
<script>window.TIMELINE=${JSON.stringify(TIMELINE)};window.DATA=${JSON.stringify(audio.data)};window.DP_URL=${JSON.stringify(dpUrl)};window.LESSON=${JSON.stringify(lessonData)};</script>
<script>${fs.readFileSync(path.join(HERE, 'art.js'), 'utf8')}</script><script>${fs.readFileSync(path.join(HERE, 'film.js'), 'utf8')}</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'preview.html'), html);

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
    console.log(`wrote out/shorts/bass-on-phones/frames/${tag}-*.png`);
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
    const t = 44.5;
    log(`Determinism: frame at ${t} s in two fresh pages is ${(await a.shot(t)).equals(await b.shot(t)) ? 'identical' : 'DIFFERENT'}`);
    await b.p.close();
    // One still per scene, and one per second, each 390 px wide (phone size).
    const stills = [];
    const sc = TIMELINE.scenes;
    for (const [i, s] of sc.entries()) {
        const end = i + 1 < sc.length ? sc[i + 1].at : TIMELINE.duration;
        const t = s.at + (end - s.at) * 0.7;
        stills.push({ png: await a.thumb(t, 600), caption: `<b>${s.id}</b> ${t.toFixed(2)} s · ${s.teaches}` });
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
    let jumps = 0;
    let worst = 0;
    for (let i = 1; i < yavg.length; i++) {
        const d = Math.abs(yavg[i] - yavg[i - 1]);
        worst = Math.max(worst, d);
        if (d > 20) jumps++;
    }
    log(`  flashes: ${jumps} frame-to-frame luma jumps over 20/255 (largest ${worst.toFixed(1)})`);
    // Sync: the first kick of the hook (0.25 s) and the payoff's downbeat
    // (5.0 s), timed on each transient's click (above 2 kHz): the phone
    // filter delays a kick's low body by a few ms, never its click.
    for (const [from, at, what] of [[0.2, 0.25, 'first kick of the hook'], [4.95, 5.0, "payoff's downbeat"]]) {
        const pcm = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(from), '-t', '0.1', '-i', file, '-af', 'highpass=f=2000:poles=2,highpass=f=2000:poles=2', '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], { maxBuffer: 1 << 26 });
        const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 4);
        const peak = x.reduce((p, v) => Math.max(p, Math.abs(v)), 0);
        const first = x.findIndex((v) => Math.abs(v) > peak * 0.3);
        const heard = from + first / 48000;
        log(`  sync: ${what} heard at ${heard.toFixed(4)} s (timeline ${at.toFixed(4)} s, ${((heard - at) * 1000).toFixed(1)} ms)`);
    }
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'VERIFY.md'), `# Short checks: bass on phones\n\nMeasured by \`npm run short:bass-on-phones\` on ${new Date().toISOString().slice(0, 10)}.\n\n${report.map((l) => `- ${l}`).join('\n')}\n`);
