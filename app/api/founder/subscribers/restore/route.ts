import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkFounderSession, hasValidRequestOrigin } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        const { deleted_batch_id } = await request.json();

        if (!deleted_batch_id) {
            return NextResponse.json({ error: 'Missing batch ID' }, { status: 400 });
        }

        // Restore subscribers from trash in a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Check if there are rows to restore
            const checkRes = await client.query(
                'SELECT COUNT(*) as count FROM vgp_subscribers_trash WHERE deleted_batch_id = $1',
                [deleted_batch_id]
            );
            const count = parseInt(checkRes.rows[0].count || '0');

            if (count === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'No subscribers found for this batch or undo window expired.' }, { status: 404 });
            }

            // 2. Insert back into vgp_subscribers
            await client.query(
                `INSERT INTO vgp_subscribers (
                     name, email, status, tags, created_at, unsubscribed_at,
                     first_name, last_name, account_type, username, user_profile, 
                     location, product_type, license_name, product_title
                 )
                 SELECT name, email, status, tags, created_at, unsubscribed_at,
                        first_name, last_name, account_type, username, user_profile, 
                        location, product_type, license_name, product_title
                 FROM vgp_subscribers_trash
                 WHERE deleted_batch_id = $1
                 ON CONFLICT (email)
                 DO UPDATE SET
                     name = EXCLUDED.name,
                     status = EXCLUDED.status,
                     tags = EXCLUDED.tags,
                     unsubscribed_at = EXCLUDED.unsubscribed_at,
                     first_name = EXCLUDED.first_name,
                     last_name = EXCLUDED.last_name,
                     account_type = EXCLUDED.account_type,
                     username = EXCLUDED.username,
                     user_profile = EXCLUDED.user_profile,
                     location = EXCLUDED.location,
                     product_type = EXCLUDED.product_type,
                     license_name = EXCLUDED.license_name,
                     product_title = EXCLUDED.product_title`,
                [deleted_batch_id]
            );

            // 3. Remove from trash
            await client.query(
                'DELETE FROM vgp_subscribers_trash WHERE deleted_batch_id = $1',
                [deleted_batch_id]
            );

            await client.query('COMMIT');
            return NextResponse.json({ success: true, restored_count: count });
        } catch (txError) {
            await client.query('ROLLBACK');
            throw txError;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Admin Subscribers Restore POST Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
