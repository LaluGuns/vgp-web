import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const TRANSPARENT_GIF = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const logIdStr = searchParams.get('logId');

        if (logIdStr) {
            const logId = parseInt(logIdStr, 10);
            if (!isNaN(logId)) {
                // Update opened_at if it has not been recorded yet
                await pool.query(
                    `UPDATE vgp_recipient_logs 
                     SET opened_at = CURRENT_TIMESTAMP 
                     WHERE id = $1 AND opened_at IS NULL`,
                    [logId]
                );
            }
        }
    } catch (error) {
        console.error('Failed to log email open:', error);
    }

    // Always return the transparent 1x1 GIF to the mail client
    return new NextResponse(TRANSPARENT_GIF, {
        status: 200,
        headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0',
        },
    });
}
