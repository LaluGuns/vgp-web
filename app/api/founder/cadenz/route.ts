import { NextRequest, NextResponse } from 'next/server';
import { checkFounderSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const isAuthorized = await checkFounderSession(request);
    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
        success: true,
        connected: false,
        metrics: null,
        integration: {
            eventTable: 'cadenz_events',
            aggregateRoute: '/api/founder/cadenz',
            requiredEvents: ['app_opened', 'playback_started', 'playback_failed', 'session_ended', 'app_version_seen'],
        },
        message: 'CADENZ telemetry is not connected yet. No placeholder metrics are returned.',
    });
}
