// Instagram/TikTok carousels (1080x1350) built from a lesson's own data:
// its figures, section headings, captions, DAW steps and quiz.
//
//   npm run carousel -- <slug> [<slug> ...]     one or more lessons
//   npm run carousel -- --all                   every lesson with figures
//
// Writes out/carousel/<slug>/NN.png and out/carousel/<slug>/contact.png,
// and prints any slide whose text or figure had to shrink past the floor.
import fs from 'node:fs';
import path from 'node:path';
import { articles, categories, type BlogArticle } from '@/lib/blog-data';
import { parseArticle, type Block, type Section } from '@/lib/blog/content';
import { getPathPosition } from '@/lib/blog/paths';
import type { FigureSpec } from '@/lib/blog/types';
import { BASE_CSS, LOGO, ROOT, T } from '../shared/brand';
import { launch } from '../shared/browser';
import { figureSvg } from '../shared/figure';
import { overrides, type FigureOverride } from './overrides';

type Slide =
    | { kind: 'cover' | 'figure'; label: string; head: string; sub?: string; short?: string; note?: string; svgs: string[] }
    | { kind: 'steps'; label: string; head: string; steps: string[] }
    | { kind: 'quiz'; label: string; head: string; options: string[] }
    | { kind: 'answer'; label: string; question: string; head: string; letter: string; sub: string }
    | { kind: 'cta'; label: string; head: string; title: string; inside: string[]; next?: string; sources?: string };

const W = 1080;
const H = 1350;
/**
 * Drawing widths to try for each figure. The figure renderers lay out labels
 * in drawing units, so a narrower drawing scaled up gives bigger labels. The
 * page keeps whichever candidate gives the largest labels in the space left.
 */
const DRAW_WIDTHS = [320, 400, 600];
/** Figure labels below this many canvas px (about 8 px on a phone) get flagged. */
const LABEL_FLOOR = 24;

const strip = (html: string) =>
    html
        .replace(/<span class="katex-mathml">[\s\S]*?<\/span>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** First sentence of a caption, if it is short enough to sit under a figure. */
function firstSentence(text: string, max = 130): string | undefined {
    const m = text.match(/^(.+?[.!?])(\s|$)/);
    const s = m ? m[1] : text;
    return s.length <= max ? s : undefined;
}

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

/** A note under a figure has to add something: not the headline again, not a fragment. */
function noteFor(caption: string, head: string): string | undefined {
    const n = firstSentence(caption);
    if (!n || words(n) === words(head) || n.split(' ').length < 5) return undefined;
    return n;
}

/** Height of a figure's phone drawing per unit width: lower means bigger labels on a slide. */
function tallness(spec: FigureSpec): number {
    const m = figureSvg(spec, 320).match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    return m ? Number(m[2]) / Number(m[1]) : 1;
}

/** For the cover, a tall multi-row signal shows its last two rows: usually the before and after. */
function coverCut(spec: FigureSpec): FigureSpec {
    return spec.type === 'signal' && spec.rows.length > 2 ? { ...spec, rows: spec.rows.slice(-2) } : spec;
}

function figureIds(sections: Section[], lead: Block[]) {
    const out: { id: string; section?: Section }[] = [];
    for (const b of lead) if (b.kind === 'figure') out.push({ id: b.id });
    for (const s of sections) for (const b of s.blocks) if (b.kind === 'figure') out.push({ id: b.id, section: s });
    return out;
}

/** "Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Title..." -> "Giannoulis, Massberg and Reiss (2012)" */
function shortCite(item: string): string | null {
    const text = strip(item);
    const m = text.match(/^(.+?)\((\d{4}[a-z]?)\)/);
    if (!m) return null;
    const names = m[1]
        .replace(/,?\s*&\s*/g, ', ')
        .split(/,\s*/)
        .map((p) => p.trim())
        .filter((p) => p && !/^([A-Z]\.\s?-?)+$/.test(p) && !/^et al\.?$/.test(p));
    if (!names.length) return null;
    const etAl = /et al/.test(m[1]) || names.length > 3;
    const who = etAl ? `${names[0]} et al.` : names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
    return `${who} (${m[2]})`;
}

function withRows(spec: FigureSpec, o?: FigureOverride): FigureSpec {
    if (spec.type === 'signal' && o?.rows) return { ...spec, rows: o.rows.map((i) => spec.rows[i]) };
    return spec;
}

const svgs = (spec: FigureSpec) => DRAW_WIDTHS.map((w) => figureSvg(spec, w));

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function buildSlides(article: BlogArticle): Slide[] {
    const o = overrides[article.slug] ?? {};
    const { lead, sections } = parseArticle(article.content);
    const pos = getPathPosition(article);
    const pathName = categories.find((c) => c.slug === article.category)?.name ?? '';
    const where = pos ? `${pathName} · Lesson ${pos.index + 1} of ${pos.path.articles.length}` : pathName;
    const figs = figureIds(sections, lead).filter((f) => article.figures?.[f.id]);

    const slides: Slide[] = [];
    // Cover: the more legible of the first two figures, unless an override picks one.
    const firstTwo = figs.slice(0, 2).map((f) => ({ id: f.id, h: tallness(coverCut(article.figures![f.id])) }));
    const coverId = o.cover?.figure ?? (firstTwo.length === 2 && firstTwo[1].h < firstTwo[0].h * 0.8 ? firstTwo[1].id : firstTwo[0]?.id);
    const rawCover = coverId ? article.figures?.[coverId] : undefined;
    const coverSpec = rawCover && !o.cover?.rows ? coverCut(rawCover) : rawCover;
    slides.push({
        kind: 'cover',
        label: where,
        head: o.cover?.head ?? article.title,
        sub: o.cover?.sub ?? article.excerpt,
        short: o.cover?.sub ? undefined : firstSentence(article.excerpt, 200),
        svgs: coverSpec ? svgs(withRows(coverSpec, o.cover)) : [],
    });

    for (const f of figs) {
        const fo = o.figures?.[f.id];
        // The cover already shows its figure; a second slide would repeat it smaller.
        if (f.id === coverId || fo?.skip) continue;
        const spec = article.figures![f.id];
        slides.push({
            kind: 'figure',
            label: f.section?.label ?? pathName,
            head: fo?.head ?? f.section?.title ?? article.title,
            note: fo?.note !== undefined ? fo.note || undefined : noteFor(spec.caption, fo?.head ?? f.section?.title ?? ''),
            svgs: svgs(withRows(spec, fo)),
        });
    }

    const exp = sections.find((s) => s.role === 'experiment');
    const ol = exp?.blocks.find((b): b is Extract<Block, { kind: 'ol' }> => b.kind === 'ol');
    if (exp && ol) slides.push({ kind: 'steps', label: 'Try it in your DAW', head: exp.title, steps: ol.items.map(strip) });

    // Default to the shortest question: it reads best at slide size.
    const quiz = article.quiz ?? [];
    const size = (k: number) => quiz[k].q.length + quiz[k].options.join('').length;
    const shortest = quiz.reduce((best, _, k) => (size(k) < size(best) ? k : best), 0);
    const q = quiz[o.quiz ?? shortest];
    if (q) {
        slides.push({ kind: 'quiz', label: 'Check yourself', head: q.q, options: q.options });
        slides.push({ kind: 'answer', label: 'Answer', question: q.q, head: q.options[q.answer], letter: 'ABCD'[q.answer], sub: q.why });
    }

    const refs = sections.find((s) => s.role === 'references');
    const refItems = refs?.blocks.find((b): b is Extract<Block, { kind: 'ul' }> => b.kind === 'ul')?.items ?? [];
    const cites = refItems
        .map(shortCite)
        .filter((c): c is string => Boolean(c))
        .slice(0, 3);
    const demos = (article.content.match(/^::demo\s+\S+/gm) ?? []).length;
    const inside = [
        figs.length ? plural(figs.length, 'diagram', 'diagrams') : '',
        demos ? `${demos === 1 ? 'A listening demo' : `${demos} listening demos`} you can play` : '',
        exp ? 'A DAW experiment to try today' : '',
        article.quiz?.length ? `A ${article.quiz.length}-question quiz` : '',
        refItems.length ? plural(refItems.length, 'source', 'sources') : '',
    ].filter(Boolean);
    slides.push({
        kind: 'cta',
        label: where,
        head: 'Read the full lesson',
        title: article.title,
        inside,
        next: pos?.next?.title,
        sources: cites.length ? `Sources include ${cites.join('; ')}` : undefined,
    });
    return slides;
}

const logo = `data:image/png;base64,${fs.readFileSync(LOGO).toString('base64')}`;

const CSS = `${BASE_CSS}
body{width:${W}px;height:${H}px;overflow:hidden}
.slide{position:absolute;inset:0;padding:96px 72px 176px;display:flex;flex-direction:column}
.label{font-size:30px;color:${T.text60};font-weight:500}
h1{font-family:${T.display};font-weight:800;font-size:var(--h,96px);line-height:1.03;letter-spacing:-0.025em;margin-top:26px;text-wrap:balance}
.sub{font-size:var(--s,38px);line-height:1.4;color:${T.text75};margin-top:30px;text-wrap:pretty}
.fig{flex:1 1 0;min-height:0;margin-top:48px;border:1px solid ${T.line};background:${T.surface};border-radius:6px;padding:28px;display:flex;align-items:center;justify-content:center}
.fig svg{width:100%;height:100%;display:block}
.note{margin-top:30px;font-size:var(--s,36px);line-height:1.4;color:${T.text75};text-wrap:pretty}
ol{list-style:none;margin-top:44px;display:flex;flex-direction:column;gap:var(--g,26px);counter-reset:s}
ol li{display:flex;gap:26px;font-size:var(--s,36px);line-height:1.38;color:${T.text75}}
ol li::before{counter-increment:s;content:counter(s);flex:none;width:58px;height:58px;border:2px solid rgba(255,255,255,.3);border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:600;color:#fff;margin-top:-4px}
.more{margin-top:30px;font-size:30px;color:${T.text60}}
.opts{margin-top:48px;display:flex;flex-direction:column;gap:22px}
.opt{display:flex;gap:26px;align-items:center;border:2px solid rgba(255,255,255,.16);border-radius:6px;padding:24px 30px;font-size:var(--s,36px);line-height:1.32}
.opt b{flex:none;width:52px;height:52px;border-radius:999px;border:2px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-size:26px}
.slide[data-kind=answer] .q{margin-bottom:auto}.slide[data-kind=answer] .sub{margin-bottom:auto}
.hint{margin-top:auto;padding-top:30px;font-size:30px;color:${T.text60}}
.q{margin-top:22px;font-size:30px;line-height:1.4;color:${T.text60}}
.check{display:flex;align-items:center;gap:20px;margin-top:56px;font-size:32px;color:${T.accent};font-weight:600}
.check b{width:60px;height:60px;border-radius:999px;background:${T.accent};color:${T.bg};display:flex;align-items:center;justify-content:center;font-size:28px}
.title{margin-top:30px;font-size:40px;line-height:1.3;font-weight:600;color:#fff;text-wrap:balance}
.inside{list-style:none;margin-top:44px;border-top:1px solid ${T.line}}
.inside li{font-size:34px;line-height:1.3;color:${T.text75};padding:22px 0;border-bottom:1px solid ${T.line}}
.url{margin-top:auto;padding-top:40px;font-family:${T.display};font-weight:800;font-size:76px;letter-spacing:-0.02em}
.next{margin-top:20px;font-size:30px;line-height:1.4;color:${T.text75}}
.src{margin-top:26px;font-size:24px;line-height:1.45;color:${T.text50}}
footer{position:absolute;left:72px;right:72px;bottom:62px;display:flex;align-items:center;gap:16px;color:${T.text60};font-size:28px}
footer img{width:64px;height:64px;margin-left:-6px}footer .me{font-weight:600;color:${T.text75}}
footer .page{margin-left:28px;font-variant-numeric:tabular-nums}`;

function slideHtml(s: Slide, i: number, n: number): string {
    let body = `<p class="label">${esc(s.label)}</p>`;
    if (s.kind === 'cover' || s.kind === 'figure') {
        body += `<h1>${esc(s.head)}</h1>`;
        if (s.sub) body += `<p class="sub"${s.short && s.short !== s.sub ? ` data-short="${esc(s.short)}"` : ''}>${esc(s.sub)}</p>`;
        if (s.svgs.length) body += `<div class="fig">${s.svgs.map((svg, k) => `<div class="cand" data-k="${k}" style="display:${k ? 'none' : 'contents'}">${svg}</div>`).join('')}</div>`;
        if (s.note) body += `<p class="note">${esc(s.note)}</p>`;
    } else if (s.kind === 'steps') {
        body += `<h1>${esc(s.head)}</h1><ol>${s.steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol><p class="more" hidden></p>`;
    } else if (s.kind === 'quiz') {
        body += `<h1>${esc(s.head)}</h1><div class="opts">${s.options.map((t, k) => `<div class="opt"><b>${'ABCD'[k]}</b><span>${esc(t)}</span></div>`).join('')}</div><p class="hint">Answer on the next slide.</p>`;
    } else if (s.kind === 'answer') {
        body += `<p class="q">${esc(s.question)}</p><p class="check"><b>${s.letter}</b>Right answer</p><h1>${esc(s.head)}</h1><p class="sub">${esc(s.sub)}</p>`;
    } else if (s.kind === 'cta') {
        body += `<h1>${esc(s.head)}</h1><p class="title">${esc(s.title)}</p><ul class="inside">${s.inside.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><p class="url">virzyguns.com/blog</p>${s.next ? `<p class="next">Next in this path: ${esc(s.next)}</p>` : ''}${s.sources ? `<p class="src">${esc(s.sources)}</p>` : ''}`;
    }
    const footer = `<footer><img src="${logo}" alt=""><span class="me">Virzy Guns</span><span style="margin-left:auto">virzyguns.com/blog</span><span class="page">${i + 1} / ${n}</span></footer>`;
    return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><main class="slide" data-kind="${s.kind}">${body}</main>${footer}</body></html>`;
}

/**
 * Runs in the page. Shrinks the headline, then the text, then drops the
 * figure note or the last DAW steps, until nothing runs into the footer and
 * the figure labels are as large as the space allows. Keeps the drawing
 * width that gives the largest labels. Returns what it did.
 */
function fit(floor: number): { overflow: boolean; figLabel: number | null; dropped: number; noteDropped: boolean; withNote: number } {
    const root = document.querySelector('main') as HTMLElement;
    const kind = root.dataset.kind;
    const h1 = root.querySelector('h1') as HTMLElement;
    const fig = root.querySelector('.fig') as HTMLElement | null;
    const note = root.querySelector('.note') as HTMLElement | null;
    const lines = (el: HTMLElement) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    const limit = () => root.getBoundingClientRect().bottom - parseFloat(getComputedStyle(root).paddingBottom);
    const over = () => [...root.children].some((el) => !(el as HTMLElement).hidden && el.getBoundingClientRect().bottom > limit() + 1);
    const cands = fig ? ([...fig.querySelectorAll('.cand')] as HTMLElement[]) : [];
    // Label size each candidate drawing would get in the figure box as it is now.
    const labelFor = (c: HTMLElement) => {
        const vb = (c.querySelector('svg') as SVGSVGElement).viewBox.baseVal;
        const box = fig!.getBoundingClientRect();
        const pad = parseFloat(getComputedStyle(fig!).paddingLeft) * 2;
        return 12 * Math.min((box.width - pad) / vb.width, (box.height - pad) / vb.height);
    };
    const best = () => (cands.length ? Math.max(...cands.map(labelFor)) : Infinity);
    const small = () => best() < floor;

    let h = 96;
    let s = kind === 'steps' || kind === 'quiz' ? 36 : 38;
    const apply = () => {
        root.style.setProperty('--h', `${h}px`);
        root.style.setProperty('--s', `${s}px`);
        root.style.setProperty('--g', `${Math.round(s * 0.7)}px`);
    };
    apply();
    const maxLines = kind === 'figure' ? 2 : kind === 'answer' ? 4 : 3;
    while (lines(h1) > maxLines && h > (kind === 'quiz' ? 52 : 64)) {
        h -= 4;
        apply();
    }
    while ((over() || small()) && s > 30) {
        s -= 2;
        apply();
    }
    // A cover keeps its whole excerpt only if the drawing still reads.
    const sub = root.querySelector('.sub[data-short]') as HTMLElement | null;
    if (sub && small()) sub.textContent = sub.dataset.short!;
    let noteDropped = false;
    const withNote = best();
    // The note is the takeaway; give it up only when labels would get really small.
    if (note && best() < floor - 3) {
        note.remove();
        noteDropped = true;
    }
    const minH = kind === 'quiz' ? 52 : 64;
    while ((over() || small()) && h > minH) {
        h -= 4;
        apply();
    }
    let dropped = 0;
    const items = [...root.querySelectorAll('ol li')] as HTMLElement[];
    const more = root.querySelector('.more') as HTMLElement | null;
    if (more && over()) more.hidden = false;
    while (over() && items.length - dropped > 3) {
        dropped++;
        items[items.length - dropped].remove();
        more!.textContent = `${dropped} more ${dropped === 1 ? 'step' : 'steps'} in the lesson.`;
    }
    let figLabel: number | null = null;
    if (cands.length) {
        const scores = cands.map(labelFor);
        const k = scores.indexOf(Math.max(...scores));
        cands.forEach((c, j) => (c.style.display = j === k ? 'contents' : 'none'));
        figLabel = scores[k];
    }
    return { overflow: over(), figLabel, dropped, noteDropped, withNote };
}

async function render(slugs: string[]) {
    const browser = await launch();
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    const warnings: string[] = [];
    for (const slug of slugs) {
        const article = articles.find((a) => a.slug === slug);
        if (!article) {
            warnings.push(`${slug}: no such lesson`);
            continue;
        }
        const slides = buildSlides(article);
        const dir = path.join(ROOT, 'out/carousel', slug);
        fs.rmSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir, { recursive: true });
        const files: string[] = [];
        for (const [i, s] of slides.entries()) {
            await page.setContent(slideHtml(s, i, slides.length), { waitUntil: 'load' });
            await page.evaluate(() => document.fonts.ready);
            // tsx wraps functions in a __name() helper that does not exist in the page.
            await page.evaluate('window.__name = (f) => f');
            const r = await page.evaluate(fit, LABEL_FLOOR);
            const at = `${slug} ${i + 1}`;
            if (r.overflow) warnings.push(`${at}: text runs into the footer`);
            if (r.figLabel !== null && r.figLabel < LABEL_FLOOR) warnings.push(`${at}: figure labels ${r.figLabel.toFixed(0)} px`);
            if (r.noteDropped) warnings.push(`${at}: figure note dropped to make room (labels would be ${r.withNote.toFixed(0)} px with it)`);
            if (r.dropped) warnings.push(`${at}: ${r.dropped} steps moved to "more in the lesson"`);
            const file = path.join(dir, `${String(i + 1).padStart(2, '0')}.png`);
            await page.screenshot({ path: file });
            files.push(file);
        }
        // Contact sheet: every slide at a third of its size, in order.
        const cols = Math.min(files.length, 4);
        const tw = 360;
        const th = 450;
        const sheet = `<!doctype html><html><head><style>${BASE_CSS}body{padding:24px;display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:16px;width:${cols * (tw + 16) + 32}px}img{width:${tw}px;height:${th}px;border:1px solid ${T.line}}</style></head><body>${files
            .map((f) => `<img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}">`)
            .join('')}</body></html>`;
        const cs = await browser.newPage({ viewport: { width: cols * (tw + 16) + 32, height: 400 } });
        await cs.setContent(sheet, { waitUntil: 'load' });
        await cs.screenshot({ path: path.join(dir, 'contact.png'), fullPage: true });
        await cs.close();
        console.log(`${slug}: ${slides.length} slides`);
    }
    await browser.close();
    console.log(warnings.length ? `\nWarnings:\n  ${warnings.join('\n  ')}` : '\nNo warnings.');
}

const args = process.argv.slice(2);
const slugs = args.includes('--all') ? articles.filter((a) => a.figures && Object.keys(a.figures).length).map((a) => a.slug) : args;
if (!slugs.length) {
    console.log('Usage: npm run carousel -- <slug> [<slug> ...] | --all');
    process.exit(1);
}
await render(slugs);
