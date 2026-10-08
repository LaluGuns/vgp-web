// Four directions for the promo look, rendered side by side as a decision log.
// Run: npx tsx --tsconfig tsconfig.json directions/directions.tsx
import fs from 'node:fs';
import path from 'node:path';
import { articles } from '@/lib/blog-data';
import type { SignalFigure } from '@/lib/blog/types';
import { BASE_CSS, LOGO, ROOT, T } from '../shared/brand';
import { launch } from '../shared/browser';
import { figureSvg } from '../shared/figure';

const lesson = articles.find((a) => a.slug === 'how-compression-changes-motion-not-level')!;
const attack = lesson.figures!.attack as SignalFigure;
const svg = figureSvg({ ...attack, rows: attack.rows.slice(1) }, 600);
const logo = `data:image/png;base64,${fs.readFileSync(LOGO).toString('base64')}`;

const copy = {
    label: 'Mixing & Mastering · Lesson 10',
    head: 'Same compressor. Two different snares.',
    sub: 'Attack time decides whether the crack of a hit gets through.',
};

const shell = (css: string, body: string) =>
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
body{width:1080px;height:1350px;overflow:hidden;position:relative}${css}</style></head><body>${body}</body></html>`;

const footer = (color: string) =>
    `<footer style="position:absolute;left:72px;right:72px;bottom:56px;display:flex;align-items:center;gap:18px;color:${color};font-size:24px">
<img src="${logo}" style="width:44px;height:44px;border-radius:6px"><span style="font-weight:600">Virzy Guns</span><span style="margin-left:auto">virzyguns.com/blog</span><span style="margin-left:28px;font-variant-numeric:tabular-nums">1 / 7</span></footer>`;

const directions = [
    {
        id: 'meter',
        name: 'A. Meter (site system)',
        note: 'Same tokens as the article page: near-black, Inter, one cyan accent for the data, white/grey for the rest. A tap lands on a page that looks the same.',
        html: shell(
            `.wrap{position:absolute;inset:88px 72px 0}`,
            `<div class="wrap"><p style="font-size:26px;color:${T.text60}">${copy.label}</p>
<h1 style="font-family:${T.display};font-weight:800;font-size:96px;line-height:1.02;letter-spacing:-0.025em;margin-top:28px">${copy.head}</h1>
<p style="font-size:34px;line-height:1.4;color:${T.text75};margin-top:32px;max-width:860px">${copy.sub}</p>
<div style="margin-top:56px;border:1px solid ${T.line};background:${T.surface};border-radius:6px;padding:28px 32px">${svg}</div></div>${footer(T.text60)}`,
        ),
    },
    {
        id: 'poster',
        name: 'B. Poster (current carousel)',
        note: 'Black weight, uppercase tracked eyebrow, glow on the lines. Loud in a feed, but the glow and eyebrow are what DESIGN.md bans, and it looks unlike the site.',
        html: shell(
            `.wrap{position:absolute;inset:80px 64px 0}`,
            `<div class="wrap"><p style="font-size:24px;letter-spacing:.32em;color:${T.accent};font-weight:600">MIXING</p><div style="width:120px;height:3px;background:${T.accent};margin:14px 0 10px"></div>
<p style="font-size:20px;letter-spacing:.22em;color:${T.text60}">STRONG + PRACTICE</p>
<h1 style="font-family:${T.display};font-weight:800;font-size:112px;line-height:.95;letter-spacing:-0.045em;margin-top:30px">${copy.head}</h1>
<p style="font-size:34px;line-height:1.3;font-weight:600;margin-top:28px">${copy.sub}</p>
<div style="margin-top:44px;filter:drop-shadow(0 0 10px rgba(125,211,252,.7))">${svg}</div>
<p style="position:absolute;bottom:120px;font-size:18px;color:${T.text50}">Giannoulis, Massberg and Reiss (2012)</p></div>${footer(T.text60)}`,
        ),
    },
    {
        id: 'paper',
        name: 'C. Paper (warm neutral ground)',
        note: 'The explainer prompt default. Calm and print-like, but it breaks from a dark site and a dark logo, and the figures need recolouring.',
        html: shell(
            `body{background:#f3efe7;color:#151515}.wrap{position:absolute;inset:88px 72px 0}`,
            `<div class="wrap"><p style="font-size:26px;color:#5b5750">${copy.label}</p>
<h1 style="font-family:${T.display};font-weight:800;font-size:96px;line-height:1.02;letter-spacing:-0.025em;margin-top:28px">${copy.head}</h1>
<p style="font-size:34px;line-height:1.4;color:#3d3a35;margin-top:32px">${copy.sub}</p>
<div style="margin-top:56px;border-radius:6px;padding:28px 32px;background:#050607;filter:invert(1) hue-rotate(180deg)">${svg}</div></div>${footer('#5b5750')}`,
        ),
    },
    {
        id: 'figure-first',
        name: 'D. Figure first',
        note: 'The drawing fills the top two thirds and the words read like a caption. Strong for one idea, weak for slides that need a sentence.',
        html: shell(
            ``,
            `<div style="position:absolute;inset:72px 40px auto">${svg}</div>
<div style="position:absolute;left:72px;right:72px;bottom:150px"><p style="font-size:26px;color:${T.text60}">${copy.label}</p>
<h1 style="font-family:${T.display};font-weight:800;font-size:76px;line-height:1.04;letter-spacing:-0.02em;margin-top:18px">${copy.head}</h1></div>${footer(T.text60)}`,
        ),
    },
];

const outDir = path.join(ROOT, 'out/directions');
fs.mkdirSync(outDir, { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
const shots: Record<string, string> = {};
for (const d of directions) {
    await page.setContent(d.html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot();
    fs.writeFileSync(path.join(outDir, `${d.id}.png`), png);
    // JPEG in the committed log keeps it small; the PNGs stay in out/.
    const jpg = await page.screenshot({ type: 'jpeg', quality: 82 });
    shots[d.id] = `data:image/jpeg;base64,${jpg.toString('base64')}`;
}

const winner = 'meter';
const log = `<!doctype html><html><head><meta charset="utf-8"><title>Promo directions</title><style>*{box-sizing:border-box;margin:0}html,body{background:${T.bg};color:#fff;font-family:Inter,system-ui,sans-serif}
body{padding:48px;width:2400px}h1{font-size:44px}.row{display:flex;gap:32px;margin-top:32px}
.c{width:552px}.c img{width:552px;border-radius:6px;border:1px solid ${T.line}}.c.win img{outline:4px solid ${T.accent};outline-offset:6px}
.c h2{font-size:24px;margin:22px 0 8px}.c p{font-size:19px;line-height:1.5;color:${T.text75}}.verdict{margin-top:40px;font-size:24px;line-height:1.5;max-width:1500px;color:${T.text75}}</style></head>
<body><h1>Promo directions: compression lesson cover</h1><div class="row">${directions
    .map((d) => `<div class="c${d.id === winner ? ' win' : ''}"><img src="${shots[d.id]}"><h2>${d.name}${d.id === winner ? ' · chosen' : ''}</h2><p>${d.note}</p></div>`)
    .join('')}</div>
<p class="verdict"><b style="color:#fff">Chosen: A, with B's headline weight.</b> The promo's job is to send people to the lesson, so it should look like the lesson: same ground, same cyan for data, same figures. From B we keep the heavy, tight headline that stops a thumb, and drop the glow and the shouting eyebrow.</p></body></html>`;
fs.writeFileSync(path.join(ROOT, 'directions/directions.html'), log);
const big = await browser.newPage({ viewport: { width: 2400, height: 900 } });
await big.setContent(log, { waitUntil: 'load' });
await big.screenshot({ path: path.join(outDir, 'directions.png'), fullPage: true });
await browser.close();
console.log('wrote directions/directions.html and out/directions/*.png');
