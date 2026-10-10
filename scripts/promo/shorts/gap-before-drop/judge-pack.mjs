// Builds the judge pack for one panel round: contact sheets every 0.5 s,
// full-size frames per scene and plot crops (from render.mjs --pack), the
// hook's two versions as spectrograms, the whole film as a waveform, and the
// captions, checks, script and sources.
//
//   node shorts/gap-before-drop/judge-pack.mjs <round-name>     after `npm run short:gap-before-drop` (or --stills)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, REPO } from '../../shared/tokens.mjs';
import { TIMELINE } from './timeline.mjs';

const OUT = path.join(ROOT, 'out/shorts/gap-before-drop');
const name = process.argv[2] ?? 'round';
const dir = path.join(OUT, `pack-${name}`);
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
execFileSync('node', [path.join(ROOT, 'shorts/gap-before-drop/render.mjs'), '--pack', dir], { stdio: 'inherit' });

const video = path.join(OUT, 'short_9x16.mp4');
const audio = fs.existsSync(video) && !process.argv.includes('--animatic') ? video : path.join(OUT, 'audio.wav');
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
const beat = TIMELINE.beat;
for (const d of TIMELINE.demos.slice(0, 2)) {
    const len = (d.pre + d.post) * beat;
    ff(['-ss', String(d.at), '-t', String(len), '-i', audio, '-lavfi', `showspectrumpic=s=1200x600:scale=log:fscale=log:legend=1:color=intensity:start=20:stop=20000`, path.join(dir, `spectrogram-hook-version${d.v}.png`)]);
}
ff(['-i', audio, '-lavfi', 'showwavespic=s=2400x400:split_channels=0:colors=white', path.join(dir, 'waveform-film.png')]);
// Motion: how much the picture changes, measured from the video at 10 fps (mean frame-to-frame
// luma difference, 0-255), per half second, so judges working from stills can tell motion from a hold.
if (audio === video) {
    const out = execFileSync('ffmpeg', ['-v', 'error', '-i', video, '-an', '-vf', 'fps=10,scale=270:-2,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-', '-f', 'null', '-'], { maxBuffer: 64 << 20 }).toString();
    const pts = [];
    let tNow = 0;
    for (const line of out.split('\n')) {
        const m1 = line.match(/pts_time:([\d.]+)/);
        if (m1) tNow = Number(m1[1]);
        const m2 = line.match(/YAVG=([\d.]+)/);
        if (m2) pts.push([tNow, Number(m2[1])]);
    }
    const bins = [];
    for (let b = 0; b * 0.5 < TIMELINE.duration; b++) bins.push(Math.max(0, ...pts.filter(([tt]) => tt >= b * 0.5 && tt < b * 0.5 + 0.5).map(([, v]) => v)));
    // Tiers: under 0.25 nothing moves; 0.25-0.8 only background drift or a caption highlight; over 0.8 a clear change.
    const STILL = 0.25;
    const CLEAR = 0.8;
    const runs = (test) => {
        const found = [];
        let run = null;
        [...bins, Infinity].forEach((v, b) => {
            if (test(v)) run ??= b;
            else if (run !== null) {
                if ((b - run) * 0.5 >= 1.5) found.push(`${(run * 0.5).toFixed(1)}-${(b * 0.5).toFixed(1)} s`);
                run = null;
            }
        });
        return found.length ? found.join(', ') : 'none';
    };
    const tier = (v) => (v < STILL ? 'still' : v < CLEAR ? 'subtle' : 'clear');
    const lines = bins.map((v, b) => `${(b * 0.5).toFixed(1)} s  ${v.toFixed(2)}  ${tier(v)}`);
    fs.writeFileSync(
        path.join(dir, 'motion.txt'),
        `Motion per half second: the largest mean frame-to-frame luma change (0-255) at 10 fps, measured from short_9x16.mp4.\nTiers: under ${STILL} still (nothing moves); ${STILL}-${CLEAR} subtle (background drift or a caption highlight only); over ${CLEAR} clear (a visible change of picture).\nStretches of 1.5 s or more that are still: ${runs((v) => v < STILL)}\nStretches of 1.5 s or more with no clear change (still or subtle only): ${runs((v) => v < CLEAR)}\n\n${lines.join('\n')}\n`,
    );
}
for (const f of ['captions.srt', 'VERIFY.md', 'cover.png', 'contact.png', 'seconds.png']) if (fs.existsSync(path.join(OUT, f))) fs.copyFileSync(path.join(OUT, f), path.join(dir, f));
fs.copyFileSync(path.join(ROOT, 'shorts/gap-before-drop/script.txt'), path.join(dir, 'script.txt'));
fs.copyFileSync(path.join(ROOT, 'SOURCES.md'), path.join(dir, 'SOURCES.md'));
// --lesson <file>: the lesson as it will ship, when its fix lives on another branch.
const li = process.argv.indexOf('--lesson');
const lessonSrc = li > 0 ? process.argv[li + 1] : path.join(REPO, 'lib/blog-posts/030-why-silence-before-the-beat-feels-physical.ts');
fs.copyFileSync(lessonSrc, path.join(dir, 'lesson-030.ts'));
const scenes = TIMELINE.scenes.map((s) => `- ${s.id}: ${s.teaches}`).join('\n');
fs.writeFileSync(
    path.join(dir, 'README.txt'),
    `Judge pack: ${name}\nFilm: ${TIMELINE.duration} s, 1080x1920, 60 fps. ${audio.endsWith('.mp4') ? 'Full render.' : 'Animatic: stills only, audio from the mixed soundtrack.'}\nNarration in this cut is a temporary synthetic guide track (Kokoro-82M); the release voice is generated with ElevenLabs on the same script and timings, and carries the platforms' AI-generated label.\n\nFiles\n- sheet-NN.png: one frame every 0.5 s (time under each)\n- scene-<id>-<t>s.png: full-size frame 0.3 s into each scene\n- plot-<id>-<t>s.png: full-size crop of each plot when it is most complete\n- frame-first / frame-last: the film's first and last frames (it is built to loop: the last half second plays the build that leads into frame one)\n- spectrogram-hook-version1.png / version2.png: the hook's two versions (version 1 runs into the downbeat, version 2 has the gap)\n- waveform-film.png: the whole soundtrack\n- captions.srt, VERIFY.md (all measurements, claims 1-4), script.txt, SOURCES.md, cover.png\n- motion.txt: how much the picture changes in each half second, measured from the video (the stills cannot show motion between them)\n- lesson-030.ts: the lesson the film promotes (https://www.virzyguns.com/blog/${TIMELINE.lesson.slug})${li > 0 ? ', in the revision that ships with the film' : ''}\n\nScenes\n${scenes}\n`,
);
console.log(`judge pack: ${dir}`);
