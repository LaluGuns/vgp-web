import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkFounderSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Founder metrics — real, derived data only (no fabricated series).
 *
 * `growth` is the cumulative subscriber count per day for the last 30 days,
 * computed directly from each subscriber's actual created_at timestamp. This
 * is true history available immediately, not a synthetic line.
 *
 * `snapshots` are the daily rows captured by the daily-report cron, used for
 * trends that cannot be reconstructed after the fact (e.g. PageSpeed score over
 * time). Empty until the cron has run / the table exists.
 */
export async function GET(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const growthRes = await pool.query(
            `WITH days AS (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '29 days',
                    CURRENT_DATE,
                    INTERVAL '1 day'
                )::date AS day
            )
            SELECT
                d.day AS date,
                (SELECT COUNT(*) FROM vgp_subscribers s
                   WHERE s.created_at < d.day + INTERVAL '1 day') AS total,
                (SELECT COUNT(*) FROM vgp_subscribers s
                   WHERE s.created_at >= d.day
                     AND s.created_at < d.day + INTERVAL '1 day') AS new_that_day
            FROM days d
            ORDER BY d.day ASC`
        );

        const growth = growthRes.rows.map((r) => ({
            date: r.date,
            total: parseInt(r.total || '0'),
            new: parseInt(r.new_that_day || '0'),
        }));

        // Forward-looking snapshots; tolerate the table not existing yet.
        let snapshots: any[] = [];
        try {
            const snapRes = await pool.query(
                `SELECT snapshot_date, total_subscribers, active_subscribers,
                        unsubscribed, new_24h, emails_sent_24h, pagespeed_score
                 FROM vgp_metric_snapshots
                 ORDER BY snapshot_date ASC
                 LIMIT 60`
            );
            snapshots = snapRes.rows;
        } catch {
            snapshots = [];
        }

        return NextResponse.json({ success: true, growth, snapshots });
    } catch (error) {
        console.error('Founder Metrics GET Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
