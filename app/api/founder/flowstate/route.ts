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
        users: null,
        breakdowns: null,
        errors: { connected: false },
        message,
    });
}

// ── Sentry error stats (optional) ───────────────────────────────────────
// Honest by design: without SENTRY_AUTH_TOKEN (scopes: event:read
// project:read) or on any API failure this returns { connected: false } —
// never fabricated numbers.
type SentryErrors =
    | { connected: false }
    | { connected: true; unresolvedIssues: number; unresolvedCapped: boolean; events24h: number; events7d: number };

async function fetchSentryErrors(): Promise<SentryErrors> {
    const token = process.env.SENTRY_AUTH_TOKEN;
    if (!token) return { connected: false };

    const org = process.env.SENTRY_ORG || 'virzy-guns-production';
    const project = process.env.SENTRY_PROJECT_SLUG || 'flowstate';
    const headers = { Authorization: `Bearer ${token}` };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
        const [issuesRes, statsRes] = await Promise.all([
            // Unresolved issues for the project (slug-scoped endpoint).
            fetch(
                `https://sentry.io/api/0/projects/${org}/${project}/issues/?query=is%3Aunresolved&limit=100`,
                { headers, signal: controller.signal }
            ),
            // Hourly received-event counts for the last 7 days.
            fetch(
                `https://sentry.io/api/0/projects/${org}/${project}/stats/?stat=received&resolution=1h&since=${Math.floor(Date.now() / 1000) - 7 * 24 * 3600}`,
                { headers, signal: controller.signal }
            ),
        ]);
        if (!issuesRes.ok || !statsRes.ok) return { connected: false };

        const issues = (await issuesRes.json()) as unknown[];
        const stats = (await statsRes.json()) as [number, number][];
        if (!Array.isArray(issues) || !Array.isArray(stats)) return { connected: false };

        const cutoff24h = Math.floor(Date.now() / 1000) - 24 * 3600;
        let events7d = 0;
        let events24h = 0;
        for (const [ts, count] of stats) {
            events7d += count;
            if (ts >= cutoff24h) events24h += count;
        }

        return {
            connected: true,
            unresolvedIssues: issues.length,
            // The issues endpoint pages at 100; flag when the count is a floor.
            unresolvedCapped: issues.length >= 100,
            events24h,
            events7d,
        };
    } catch {
        return { connected: false };
    } finally {
        clearTimeout(timer);
    }
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
        const [plansRes, subsRes, sessionsRes, dailyRes, signupsRes, usersRes, breakdownRes, sentryErrors] = await Promise.all([
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
            // Per-user analytics: email from auth.users (the postgres role can
            // read the auth schema), presence columns (nullable until the
            // first /api/presence ping), and per-user session aggregates.
            // Non-fatal (.catch → null): if the presence-columns migration has
            // not been applied yet, the rest of the tab still renders.
            flowstateQuery(
                `SELECT
                    u.email,
                    p.plan::text AS plan,
                    p.created_at,
                    p.last_seen_at,
                    p.os,
                    p.browser,
                    p.device_type,
                    p.country,
                    p.city,
                    COALESCE(s.session_count, 0)::int AS sessions,
                    COALESCE(s.minutes, 0)::int AS minutes
                 FROM flowstate_profiles p
                 JOIN auth.users u ON u.id = p.id
                 LEFT JOIN (
                    SELECT user_id,
                           COUNT(*)::int AS session_count,
                           ROUND(COALESCE(SUM(actual_duration_s), 0) / 60.0)::int AS minutes
                    FROM flowstate_focus_sessions
                    WHERE actual_duration_s IS NOT NULL
                    GROUP BY user_id
                 ) s ON s.user_id = p.id
                 ORDER BY p.last_seen_at DESC NULLS LAST, p.created_at DESC
                 LIMIT 100`
            ).catch((err) => {
                console.error('Flowstate users query failed (presence migration applied?):', err);
                return null;
            }),
            // Presence breakdowns — one pass, dimension-tagged; nulls excluded.
            flowstateQuery(
                `SELECT 'os' AS dim, os AS value, COUNT(*)::int AS count
                   FROM flowstate_profiles WHERE os IS NOT NULL GROUP BY os
                 UNION ALL
                 SELECT 'browser', browser, COUNT(*)::int
                   FROM flowstate_profiles WHERE browser IS NOT NULL GROUP BY browser
                 UNION ALL
                 SELECT 'country', country, COUNT(*)::int
                   FROM flowstate_profiles WHERE country IS NOT NULL GROUP BY country
                 UNION ALL
                 SELECT 'device', device_type, COUNT(*)::int
                   FROM flowstate_profiles WHERE device_type IS NOT NULL GROUP BY device_type
                 ORDER BY dim, count DESC`
            ).catch((err) => {
                console.error('Flowstate breakdowns query failed (presence migration applied?):', err);
                return null;
            }),
            fetchSentryErrors(),
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

        const users = (usersRes?.rows ?? []).map((row) => ({
            email: row.email as string,
            plan: row.plan as string,
            createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
            lastSeenAt: row.last_seen_at
                ? (row.last_seen_at instanceof Date ? row.last_seen_at.toISOString() : String(row.last_seen_at))
                : null,
            os: (row.os as string | null) ?? null,
            browser: (row.browser as string | null) ?? null,
            deviceType: (row.device_type as string | null) ?? null,
            country: (row.country as string | null) ?? null,
            city: (row.city as string | null) ?? null,
            sessions: Number(row.sessions) || 0,
            minutes: Number(row.minutes) || 0,
        }));

        const breakdowns: Record<'os' | 'browser' | 'country' | 'device', { value: string; count: number }[]> = {
            os: [],
            browser: [],
            country: [],
            device: [],
        };
        for (const row of breakdownRes?.rows ?? []) {
            const dim = row.dim as keyof typeof breakdowns;
            if (breakdowns[dim]) breakdowns[dim].push({ value: String(row.value), count: Number(row.count) || 0 });
        }

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
            users,
            breakdowns,
            errors: sentryErrors,
        });
    } catch (error) {
        console.error('Flowstate metrics API error:', error);
        return notConnected('Could not reach the Flowstate database. No placeholder metrics are shown.');
    }
}
