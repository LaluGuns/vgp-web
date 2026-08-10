import { NextResponse } from 'next/server';
import { z } from 'zod';

const eventSchema = z.object({
  event: z.enum(['seo_landing_view', 'seo_cta_clicked', 'music_preview_started', 'collection_selected', 'outbound_clicked']),
  distinct_id: z.string().min(1).max(200),
  properties: z.object({
    site_scope: z.literal('root'),
    funnel: z.enum(['root', 'cadenz']),
    route_key: z.string().min(1).max(240),
    locale: z.string().min(2).max(12),
    intent: z.string().min(1).max(120),
    bpm: z.number().int().min(1).max(300).nullable(),
    destination_type: z.string().min(1).max(120),
    source_position: z.string().min(1).max(120),
  }).passthrough(),
});

export async function POST(request: Request) {
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_event' }, { status: 400 });
  const key = process.env.POSTHOG_PROJECT_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return new Response(null, { status: 204, headers: { 'X-Analytics-State': 'not_configured' } });
  const host = (process.env.POSTHOG_CAPTURE_HOST || 'https://us.i.posthog.com').replace(/\/$/, '');
  try {
    const response = await fetch(host + '/capture/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event: parsed.data.event,
        distinct_id: parsed.data.distinct_id,
        properties: { ...parsed.data.properties, $current_url: new URL(parsed.data.properties.route_key, request.url).toString() },
      }),
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    if (!response.ok) return new Response(null, { status: 204, headers: { 'X-Analytics-State': 'error' } });
    return new Response(null, { status: 204, headers: { 'X-Analytics-State': 'connected' } });
  } catch {
    return new Response(null, { status: 204, headers: { 'X-Analytics-State': 'error' } });
  }
}
