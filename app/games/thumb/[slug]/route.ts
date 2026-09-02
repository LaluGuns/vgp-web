import h0 from '../../_thumb-data/hear-0';
import h1 from '../../_thumb-data/hear-1';
import h2 from '../../_thumb-data/hear-2';
import h3 from '../../_thumb-data/hear-3';
import b0 from '../../_thumb-data/block-0';
import b1 from '../../_thumb-data/block-1';
import t0 from '../../_thumb-data/tap-0';
import t1 from '../../_thumb-data/tap-1';
import t2 from '../../_thumb-data/tap-2';

export const runtime = 'nodejs';

const images = {
  'hear-the-difference': h0 + h1 + h2 + h3,
  'block-stacker': b0 + b1,
  'tap-groove': t0 + t1 + t2,
} as const;

type ThumbSlug = keyof typeof images;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const encoded = images[slug as ThumbSlug];

  if (!encoded) {
    return new Response('Not found', { status: 404 });
  }

  const bytes = Uint8Array.from(Buffer.from(encoded, 'base64'));

  return new Response(bytes, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
