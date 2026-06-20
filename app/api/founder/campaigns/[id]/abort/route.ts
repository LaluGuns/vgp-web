import { NextRequest, NextResponse } from 'next/server';
import pool, { withTransaction } from '@/lib/db';
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

        let updatedCampaign: any = null;

        await withTransaction(async (client) => {
            // 1. Update campaign status to cancelled
            const campRes = await client.query(
                `UPDATE vgp_campaigns
                 SET status = 'cancelled', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1 AND status IN ('queued', 'sending', 'paused', 'draft')
                 RETURNING id, status, completed_at`,
                [campaignId]
            );

            if (campRes.rowCount === 0) {
                throw new Error('Campaign not found or cannot be aborted.');
            }

            updatedCampaign = campRes.rows[0];

            // 2. Set all unsent recipient log rows (pending, failed, sending) to skipped
            await client.query(
                `UPDATE vgp_recipient_logs
                 SET status = 'skipped', locked_at = NULL, last_error = 'Campaign aborted by administrator', updated_at = CURRENT_TIMESTAMP
                 WHERE campaign_id = $1 AND status IN ('pending', 'failed', 'sending')`,
                [campaignId]
            );
        });

        return NextResponse.json({ success: true, campaign: updatedCampaign });
    } catch (error: any) {
        console.error('Campaign Abort POST Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
    }
}
