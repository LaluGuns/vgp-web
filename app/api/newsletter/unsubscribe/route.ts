import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
    try {
        // CSRF check
        const origin = request.headers.get('origin');
        const host = request.headers.get('host') || 'www.virzyguns.com';
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const baseUrl = `${protocol}://${host}`;

        if (origin && origin !== baseUrl && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        const { token } = await request.json();

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'Unsubscribe token is required.' }, { status: 400 });
        }

        // Verify the token signature and expiration
        const decoded = verifyToken(token);

        if (!decoded || decoded.purpose !== 'unsubscribe' || !decoded.subscriber_id || !decoded.email) {
            return NextResponse.json(
                { error: 'Invalid or expired unsubscribe link. Please contact support or reply to our emails.' },
                { status: 400 }
            );
        }

        // Soft unsubscribe in the database
        const result = await pool.query(
            `UPDATE vgp_subscribers
             SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND email = $2
             RETURNING email`,
            [decoded.subscriber_id, decoded.email.trim().toLowerCase()]
        );

        if (result.rowCount === 0 || result.rowCount === null) {
            return NextResponse.json(
                { error: 'Subscriber record not found or could not be updated.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            email: result.rows[0].email,
            message: 'You have been successfully unsubscribed from the newsletter.'
        });
    } catch (error) {
        console.error('Unsubscribe API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}
