import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkFounderSession, hasValidRequestOrigin } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        const params = await context.params;
        const campaignId = parseInt(params.id);

        if (isNaN(campaignId)) {
            return NextResponse.json({ error: 'Invalid campaign ID.' }, { status: 400 });
        }

        // We can only pause running/queued campaigns
        const result = await pool.query(
            `UPDATE vgp_campaigns
             SET status = 'paused', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND status IN ('queued', 'sending')
             RETURNING id, status`,
            [campaignId]
        );

        if (result.rowCount === 0 || result.rowCount === null) {
            return NextResponse.json(
                { error: 'Campaign not found or is not in a state that can be paused (must be active or queued).' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, campaign: result.rows[0] });
    } catch (error) {
        console.error('Campaign Pause POST Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
