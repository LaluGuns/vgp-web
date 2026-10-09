// Builds the judge pack for one panel round: contact sheets every 0.5 s,
// full-size frames per scene and plot crops (from render.mjs --pack), the
// hook's two versions as spectrograms, the whole film as a waveform, and the
// captions, checks, script and sources.
//
//   node film5/judge-pack.mjs <round-name>     after `npm run film5` (or --stills)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, REPO } from '../shared/tokens.mjs';
import { TIMELINE } from './timeline.mjs';

const OUT = path.join(ROOT, 'out/film5');
const name = process.argv[2] ?? 'round';
const dir = path.join(OUT, `pack-${name}`);
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
execFileSync('node', [path.join(ROOT, 'film5/render.mjs'), '--pack', dir], { stdio: 'inherit' });

const video = path.join(OUT, 'short_9x16.mp4');
const audio = fs.existsSync(video) && !process.argv.includes('--animatic') ? video : path.join(OUT, 'audio.wav');
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
const beat = TIMELINE.beat;
for (const d of TIMELINE.demos.slice(0, 2)) {
    const len = (d.pre + d.post) * beat;
    ff(['-ss', String(d.at), '-t', String(len), '-i', audio, '-lavfi', `showspectrumpic=s=1200x600:scale=log:fscale=log:legend=1:color=intensity:start=20:stop=20000`, path.join(dir, `spectrogram-hook-version${d.v}.png`)]);
}
ff(['-i', audio, '-lavfi', 'showwavespic=s=2400x400:split_channels=0:colors=white', path.join(dir, 'waveform-film.png')]);
for (const f of ['captions.srt', 'VERIFY.md', 'cover.png', 'contact.png', 'seconds.png']) if (fs.existsSync(path.join(OUT, f))) fs.copyFileSync(path.join(OUT, f), path.join(dir, f));
fs.copyFileSync(path.join(ROOT, 'film5/script.txt'), path.join(dir, 'script.txt'));
fs.copyFileSync(path.join(ROOT, 'SOURCES.md'), path.join(dir, 'SOURCES.md'));
fs.copyFileSync(path.join(REPO, 'lib/blog-posts/030-why-silence-before-the-beat-feels-physical.ts'), path.join(dir, 'lesson-030.ts'));
const scenes = TIMELINE.scenes.map((s) => `- ${s.id}: ${s.teaches}`).join('\n');
fs.writeFileSync(
    path.join(dir, 'README.txt'),
    `Judge pack: ${name}\nFilm: ${TIMELINE.duration} s, 1080x1920, 60 fps. ${audio.endsWith('.mp4') ? 'Full render.' : 'Animatic: stills only, audio from the mixed soundtrack.'}\n\nFiles\n- sheet-NN.png: one frame every 0.5 s (time under each)\n- scene-<id>-<t>s.png: full-size frame 0.3 s into each scene\n- plot-<id>-<t>s.png: full-size crop of each plot when it is most complete\n- frame-first / frame-last: the film's first and last frames (it is built to loop: the last half second plays the build that leads into frame one)\n- spectrogram-hook-version1.png / version2.png: the hook's two versions (version 1 runs into the downbeat, version 2 has the gap)\n- waveform-film.png: the whole soundtrack\n- captions.srt, VERIFY.md (all measurements, claims 1-4), script.txt, SOURCES.md, cover.png\n- lesson-030.ts: the lesson the film promotes (https://www.virzyguns.com/blog/${TIMELINE.lesson.slug})\n\nScenes\n${scenes}\n`,
);
console.log(`judge pack: ${dir}`);
