import { NextRequest, NextResponse } from 'next/server';
import { runSeoIngestion } from '@/lib/seo/ingestion';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runSeoIngestion();
    return NextResponse.json({ success: !result.gsc.error, ...result }, { status: result.gsc.error ? 502 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SEO ingestion failed.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
