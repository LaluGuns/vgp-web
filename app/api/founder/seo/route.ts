import { NextRequest, NextResponse } from 'next/server';
import { checkFounderSession } from '@/lib/auth';
import { getFounderSeoDashboard } from '@/lib/seo/dashboard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!await checkFounderSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ success: true, ...(await getFounderSeoDashboard(request.nextUrl.searchParams)) });
  } catch (error) {
    // A missing local migration is a configuration state, never a fake metric.
    const message = error instanceof Error ? error.message : 'SEO dashboard data is unavailable.';
    return NextResponse.json({ success: false, connected: false, error: message, metrics: null }, { status: 503 });
  }
}
