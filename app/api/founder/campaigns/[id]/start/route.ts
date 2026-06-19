import { NextRequest, NextResponse } from 'next/server';
import pool, { withTransaction } from '@/lib/db';
import { checkFounderSession } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const origin = request.headers.get('origin');
        const host = request.headers.get('host') || 'www.virzyguns.com';
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const baseUrl = `${protocol}://${host}`;

        if (origin && origin !== baseUrl && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        const params = await context.params;
        const campaignId = parseInt(params.id);

        if (isNaN(campaignId)) {
            return NextResponse.json({ error: 'Invalid campaign ID.' }, { status: 400 });
        }

        // Fetch current campaign status
        const campaignCheck = await pool.query(
            `SELECT status FROM vgp_campaigns WHERE id = $1`,
            [campaignId]
        );

        if (campaignCheck.rowCount === 0 || campaignCheck.rowCount === null) {
            return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
        }

        const currentStatus = campaignCheck.rows[0].status;
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
            return NextResponse.json(
                { error: `Cannot start a campaign that is already ${currentStatus}.` },
                { status: 400 }
            );
        }

        if (currentStatus === 'queued' || currentStatus === 'sending') {
            return NextResponse.json(
                { error: 'Campaign is already running or queued.' },
                { status: 400 }
            );
        }

        // Transition status and build queue atomically
        await withTransaction(async (client) => {
            // 1. Update status
            await client.query(
                `UPDATE vgp_campaigns
                 SET status = 'queued', updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [campaignId]
            );

            // 2. Populate queue for active subscribers (skipping existing logs to prevent duplicates on resume)
            await client.query(
                `INSERT INTO vgp_recipient_logs (campaign_id, subscriber_id, status)
                 SELECT $1, id, 'pending'
                 FROM vgp_subscribers
                 WHERE status = 'subscribed'
                 ON CONFLICT (campaign_id, subscriber_id) DO NOTHING`,
                [campaignId]
            );
        });

        return NextResponse.json({ success: true, message: 'Campaign queued successfully.' });
    } catch (error) {
        console.error('Campaign Start POST Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
