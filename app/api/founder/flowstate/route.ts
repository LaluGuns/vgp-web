import { NextRequest, NextResponse } from 'next/server';
import { checkFounderSession } from '@/lib/auth';
import { isFlowstateConfigured, flowstateQuery } from '@/lib/founder/flowstate-db';

export const dynamic = 'force-dynamic';

// Variant prices (USD). The Lemon Squeezy webhook sync does not persist the
// variant price in flowstate_subscriptions (see flowstate/supabase/migrations/
// 001_initial_schema.sql — no price column), so MRR is derived from the plan
// enum with the published prices: monthly $9.99, yearly $59.99.
const MONTHLY_PRICE = 9.99;
const YEARLY_PRICE = 59.99;

function notConnected(message: string) {
    return NextResponse.json({
        success: true,
        connected: false,
        metrics: null,
        message,
    });
}

export async function GET(request: NextRequest) {
    const isAuthorized = await checkFounderSession(request);
    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isFlowstateConfigured()) {
        return notConnected('Flowstate database is not connected. Set FLOWSTATE_DATABASE_URL to light this panel up — no placeholder metrics are shown.');
    }

    try {
        const [plansRes, subsRes, sessionsRes, dailyRes, signupsRes] = await Promise.all([
            // Users per plan (free vs paid), from the profile plan column.
            flowstateQuery(
                `SELECT plan::text AS plan, COUNT(*)::int AS users
                 FROM flowstate_profiles
                 GROUP BY plan`
            ),
            // Active subscriptions per plan — mirrors flowstate_is_premium():
            // active/trialing, and either lifetime or period still running.
            flowstateQuery(
                `SELECT plan::text AS plan, COUNT(*)::int AS subs
                 FROM flowstate_subscriptions
                 WHERE status IN ('active', 'trialing')
                   AND (plan = 'lifetime' OR current_period_end > NOW())
                 GROUP BY plan`
            ),
            // Focus sessions: measured minutes only (actual_duration_s), 7d + 30d windows.
            flowstateQuery(
                `SELECT
                    COUNT(*) FILTER (WHERE started_at >= NOW() - make_interval(days => $1))::int AS sessions_7d,
                    COALESCE(SUM(actual_duration_s) FILTER (WHERE started_at >= NOW() - make_interval(days => $1)), 0)::bigint AS seconds_7d,
                    COUNT(*)::int AS sessions_30d,
                    COALESCE(SUM(actual_duration_s), 0)::bigint AS seconds_30d
                 FROM flowstate_focus_sessions
                 WHERE started_at >= NOW() - make_interval(days => $2)
                   AND actual_duration_s IS NOT NULL`,
                [7, 30]
            ),
            // Daily series for the 30-day chart (measured focus minutes + session count).
            flowstateQuery(
                `SELECT
                    d.day::date AS date,
                    COALESCE(COUNT(s.id), 0)::int AS sessions,
                    COALESCE(SUM(s.actual_duration_s), 0)::bigint AS seconds
                 FROM generate_series(
                    (NOW() - make_interval(days => $1))::date,
                    NOW()::date,
                    '1 day'::interval
                 ) AS d(day)
                 LEFT JOIN flowstate_focus_sessions s
                   ON s.started_at >= d.day
                  AND s.started_at < d.day + INTERVAL '1 day'
                  AND s.actual_duration_s IS NOT NULL
                 GROUP BY d.day
                 ORDER BY d.day`,
                [29]
            ),
            // Signups from profile created_at.
            flowstateQuery(
                `SELECT
                    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS signups_24h,
                    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS signups_7d
                 FROM flowstate_profiles`
            ),
        ]);

        const planCounts: Record<string, number> = {};
        for (const row of plansRes.rows) planCounts[row.plan] = row.users;
        const freeUsers = planCounts['free'] || 0;
        const totalUsers = Object.values(planCounts).reduce((a, b) => a + b, 0);
        const paidUsers = totalUsers - freeUsers;

        const subCounts: Record<string, number> = {};
        for (const row of subsRes.rows) subCounts[row.plan] = row.subs;
        const monthlySubs = subCounts['monthly'] || 0;
        const yearlySubs = subCounts['yearly'] || 0;
        const lifetimeSubs = subCounts['lifetime'] || 0;
        const mrr = monthlySubs * MONTHLY_PRICE + yearlySubs * (YEARLY_PRICE / 12);

        const s = sessionsRes.rows[0] || {};
        const signups = signupsRes.rows[0] || {};

        return NextResponse.json({
            success: true,
            connected: true,
            metrics: {
                users: {
                    total: totalUsers,
                    free: freeUsers,
                    paid: paidUsers,
                    byPlan: planCounts,
                },
                revenue: {
                    mrr: Math.round(mrr * 100) / 100,
                    monthlySubs,
                    yearlySubs,
                    lifetimeSubs,
                    monthlyPrice: MONTHLY_PRICE,
                    yearlyPrice: YEARLY_PRICE,
                    pricingSource: 'variant prices (monthly $9.99 / yearly $59.99); no stored price column in flowstate_subscriptions',
                },
                sessions: {
                    count7d: Number(s.sessions_7d) || 0,
                    minutes7d: Math.round((Number(s.seconds_7d) || 0) / 60),
                    count30d: Number(s.sessions_30d) || 0,
                    minutes30d: Math.round((Number(s.seconds_30d) || 0) / 60),
                    daily: dailyRes.rows.map((row) => ({
                        date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date),
                        sessions: Number(row.sessions) || 0,
                        minutes: Math.round((Number(row.seconds) || 0) / 60),
                    })),
                },
                signups: {
                    last24h: Number(signups.signups_24h) || 0,
                    last7d: Number(signups.signups_7d) || 0,
                },
            },
        });
    } catch (error) {
        console.error('Flowstate metrics API error:', error);
        return notConnected('Could not reach the Flowstate database. No placeholder metrics are shown.');
    }
}
