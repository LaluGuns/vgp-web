import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const clip = (value: string | null, max: number) => (value ?? '').trim().slice(0, max);

let portrait: Promise<string> | undefined;
function getPortrait() {
    portrait ??= readFile(path.join(process.cwd(), 'public/images/founder.jpg')).then(
        (buffer) => `data:image/jpeg;base64,${buffer.toString('base64')}`,
    );
    return portrait;
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
                        <div style={{ fontSize: titleSize, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>{title}</div>
                        {sub ? <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>{sub}</div> : null}
                    </div>
                    <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.5)' }}>virzyguns.com</div>
                </div>
                <div style={{ display: 'flex', position: 'relative', width: 420, height: '100%' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
                    <img src={photo} alt="" width={420} height={630} style={{ objectFit: 'cover', objectPosition: '50% 25%', width: 420, height: 630 }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 160, height: 630, display: 'flex', backgroundImage: 'linear-gradient(to right, #050607, rgba(5,6,7,0))' }} />
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable' },
        },
    );
}
