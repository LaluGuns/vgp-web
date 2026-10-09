import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const clip = (value: string | null, max: number) => (value ?? '').trim().slice(0, max);

/**
 * app/og/portrait.png is public/images/founder.jpg prepared once for this
 * card (not a new photo): cropped to the 420x630 slot, its blacks set to the
 * card background, softened by a 0.6 px blur, the left fade into the text column
 * baked in, and reduced to 48 greys. A photo with that few tones keeps the
 * card PNG near 110 KB instead of 310 KB. Drawn at its own size, so the
 * renderer adds no new tones by scaling it.
 */
let portrait: Promise<string> | undefined;
function getPortrait() {
    portrait ??= readFile(path.join(process.cwd(), 'app/og/portrait.png')).then(
        (buffer) => `data:image/png;base64,${buffer.toString('base64')}`,
    );
    return portrait;
}

/**
 * The title with every letter as its own text run. The renderer lays words
 * out by the sum of their letters' widths but draws each run with the
 * font's kerning, so a word with tight pairs ("Synthwave") came out shorter
 * than its box and left a double gap after it. Single letters are never
 * kerned, so the drawing matches the layout and every word gap is one space.
 */
function UnkernedText({ text }: { text: string }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {text.split(/\s+/).map((word, w) => (
                <div key={w} style={{ display: 'flex' }}>
                    {[...`${word}\u00a0`].map((letter, i) => (
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
 */
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const title = clip(params.get('title'), 90) || 'Music should leave you better than it found you.';
    const kicker = clip(params.get('kicker'), 40) || 'Virzy Guns';
    const sub = clip(params.get('sub'), 90);
    const photo = await getPortrait();
    const titleSize = title.length > 60 ? 58 : title.length > 36 ? 68 : 80;

    return new ImageResponse(
        (
            <div style={{ width: '100%', height: '100%', display: 'flex', background: '#050607', color: '#ffffff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 780, padding: '64px 56px 56px 72px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, color: 'rgba(255,255,255,0.7)' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 12, background: '#7dd3fc' }} />
                        {kicker}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                        <div style={{ display: 'flex', fontSize: titleSize, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>
                            <UnkernedText text={title} />
                        </div>
                        {sub ? <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>{sub}</div> : null}
                    </div>
                    <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.5)' }}>virzyguns.com</div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
                <img src={photo} alt="" width={420} height={630} style={{ width: 420, height: 630 }} />
            </div>
        ),
        {
            width: 1200,
            height: 630,
            headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable' },
        },
    );
}
