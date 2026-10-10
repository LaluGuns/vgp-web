import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const clip = (value: string | null, max: number) => (value ?? '').trim().slice(0, max);

const CARD_W = 1200;
const CARD_H = 630;
/** The photo is a square as tall as the card, at its right edge. */
const PHOTO = CARD_H;
/** The navy behind the portrait, so the square's edges disappear into the card. */
const CARD_BG = '#01051e';
const HEADERS = { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable' };
// A card without the photo, or the larger PNG fallback, is only kept briefly, so the next request can make the full card.
const SHORT_HEADERS = { 'Cache-Control': 'public, max-age=300, s-maxage=300' };

type Sharp = (typeof import('sharp'))['default'];
let sharpModule: Promise<Sharp | null> | undefined;
/** sharp (a dependency, also next's own image library); if it cannot load, the card is next/og's PNG. */
function getSharp() {
    sharpModule ??= import('sharp').then(
        (m) => m.default,
        () => null,
    );
    return sharpModule;
}

/**
 * The owner's portrait, public/images/virzy-guns-dp.jpg (1200x1200, the blue
 * DP with the VIRZY GUNS lettering), shown whole: resized to the 630x630 slot
 * it is drawn in and never cropped (the owner's rule). Resized once per server
 * process with sharp, so the renderer draws it at its own size; without sharp
 * the renderer scales the original.
 */
let portrait: Promise<string | null> | undefined;
function getPortrait() {
    portrait ??= Promise.all([readFile(path.join(process.cwd(), 'public/images/virzy-guns-dp.jpg')), getSharp()])
        .then(async ([source, sharp]) => {
            if (!sharp) return `data:image/jpeg;base64,${source.toString('base64')}`;
            const resized = await sharp(source).resize(PHOTO, PHOTO, { fit: 'contain', background: CARD_BG }).png().toBuffer();
            return `data:image/png;base64,${resized.toString('base64')}`;
        })
        // A failed read or resize draws this card without the photo and lets the next request try again.
        .catch(() => {
            portrait = undefined;
            return null;
        });
    return portrait;
}

/**
 * The card's two weights, read from disk (no fetch at runtime): next/og's own
 * Geist Regular for the kicker, sub and URL, and KaTeX's sans bold for the
 * title. app/og/KaTeX_SansSerif-Bold.ttf is an unmodified copy of
 * node_modules/katex/dist/fonts/KaTeX_SansSerif-Bold.ttf (SIL Open Font
 * License 1.1, notice in the font's name table), the only bold sans in the
 * installed packages; it lives here so the build's file tracing ships it
 * with this route, as it does the portrait. Its glyphs cover every lesson
 * title (ASCII, curly quotes, dashes); a character it lacks falls back to
 * Geist. If either file cannot be read the card renders with next/og's
 * default font.
 */
type CardFont = { name: string; data: Buffer; weight: 400 | 700; style: 'normal' };
let cardFonts: Promise<CardFont[] | undefined> | undefined;
function getFonts() {
    cardFonts ??= Promise.all([
        readFile(path.join(process.cwd(), 'node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf')),
        readFile(path.join(process.cwd(), 'app/og/KaTeX_SansSerif-Bold.ttf')),
    ]).then(
        ([regular, bold]): CardFont[] => [
            { name: 'Geist', data: regular, weight: 400, style: 'normal' },
            { name: 'Geist', data: bold, weight: 700, style: 'normal' },
        ],
        () => undefined,
    );
    return cardFonts;
}

/**
 * Card text with every letter as its own text run. The renderer lays words
 * out by the sum of their letters' widths but draws each run with the
 * font's kerning, so a word with tight pairs ("Synthwave") came out shorter
 * than its box and left a double gap after it. Single letters are never
 * kerned, so the drawing matches the layout and every word gap is one space.
 */
function UnkernedText({ text, shrink = false }: { text: string; shrink?: boolean }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', ...(shrink ? { flexShrink: 1, minWidth: 0 } : {}) }}>
            {/* Split on plain spaces only: a no-break space keeps two words on one line ("Virzy\u00a0Guns"). */}
            {text.split(/ +/).map((word, w) => (
                <div key={w} style={{ display: 'flex' }}>
                    {[...`${word} `].map((letter, i) => (
                        <span key={i}>{letter}</span>
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Share card for links on WhatsApp, X, LinkedIn and the like.
 * /og?title=...&kicker=...&sub=...  (all optional)
 *
 * 1200x630: the text in a 570 px column on the left, the portrait whole at
 * the right. next/og draws a PNG, and with a full-colour photo that PNG is
 * about 650 KB, so the route re-encodes it with sharp as a JPEG at quality
 * 82 (50 to 65 KB for every card the site uses).
 */
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const title = clip(params.get('title'), 90) || 'Music should leave you better than it found you.';
    const kicker = clip(params.get('kicker'), 40) || 'Virzy Guns';
    // The name never breaks across two lines.
    const sub = clip(params.get('sub'), 90).replace(/Virzy Guns/g, 'Virzy\u00a0Guns');
    const [photo, fonts, sharp] = await Promise.all([getPortrait(), getFonts(), getSharp()]);
    // Sized for the 466 px text box: by length (90 characters fit in five lines at 42 px), then
    // smaller if the longest word would not fit on one line (a capital counts 1.3 letters).
    const longestWord = Math.max(...title.split(/\s+/).map((word) => word.length + 0.3 * (word.match(/[A-Z]/g)?.length ?? 0)));
    const titleSize = Math.min(title.length > 60 ? 42 : title.length > 40 ? 48 : title.length > 24 ? 56 : 64, Math.floor(466 / (0.55 * longestWord)));

    const card = new ImageResponse(
        (
            <div style={{ width: '100%', height: '100%', display: 'flex', background: CARD_BG, color: '#ffffff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: CARD_W - PHOTO, padding: '56px 44px 50px 60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, color: 'rgba(255,255,255,0.72)' }}>
                        <div style={{ width: 11, height: 11, borderRadius: 11, background: '#7dd3fc' }} />
                        <UnkernedText text={kicker} shrink />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', fontSize: titleSize, fontWeight: 700, lineHeight: 1.04, letterSpacing: titleSize > 50 ? -1.5 : -1 }}>
                            <UnkernedText text={title} />
                        </div>
                        {sub ? (
                            <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.62)', lineHeight: 1.3 }}>
                                <UnkernedText text={sub} />
                            </div>
                        ) : null}
                    </div>
                    <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.52)' }}>virzyguns.com</div>
                </div>
                {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser
                    <img src={photo} alt="" width={PHOTO} height={PHOTO} style={{ width: PHOTO, height: PHOTO }} />
                ) : (
                    <div style={{ display: 'flex', width: PHOTO, height: PHOTO }} />
                )}
            </div>
        ),
        {
            width: CARD_W,
            height: CARD_H,
            ...(fonts ? { fonts } : {}),
            headers: photo ? HEADERS : SHORT_HEADERS,
        },
    );

    if (!sharp) return card;
    const png = Buffer.from(await card.arrayBuffer());
    try {
        const jpeg = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
        return new Response(new Uint8Array(jpeg), { headers: { ...(photo ? HEADERS : SHORT_HEADERS), 'Content-Type': 'image/jpeg' } });
    } catch {
        // The PNG is still a valid card, only larger.
        return new Response(new Uint8Array(png), { headers: { ...SHORT_HEADERS, 'Content-Type': 'image/png' } });
    }
}
