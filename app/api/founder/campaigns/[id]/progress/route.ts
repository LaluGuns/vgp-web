import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkFounderSession } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await context.params;
        const campaignId = parseInt(params.id);

        if (isNaN(campaignId)) {
            return NextResponse.json({ error: 'Invalid campaign ID.' }, { status: 400 });
        }

        // 1. Get campaign metadata
        const campaignRes = await pool.query(
            `SELECT id, subject, template_type, status, created_at, updated_at, completed_at
             FROM vgp_campaigns
             WHERE id = $1`,
            [campaignId]
        );

        if (campaignRes.rowCount === 0 || campaignRes.rowCount === null) {
            return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
        }

        const campaign = campaignRes.rows[0];

        // 2. Get queue counts grouped by status
        const logsRes = await pool.query(
            `SELECT status, COUNT(*)::int as count
             FROM vgp_recipient_logs
             WHERE campaign_id = $1
             GROUP BY status`,
            [campaignId]
        );

        const stats = {
            total: 0,
            pending: 0,
            sending: 0,
            sent: 0,
            failed: 0,
            skipped: 0,
            cancelled: 0
        };

        logsRes.rows.forEach((row: { status: string; count: number }) => {
            const statusKey = row.status as keyof typeof stats;
            if (statusKey in stats) {
                stats[statusKey] = row.count;
            }
            stats.total += row.count;
        });

        return NextResponse.json({
            success: true,
            campaign,
            stats
        });
    } catch (error) {
        console.error('Campaign Progress GET Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
