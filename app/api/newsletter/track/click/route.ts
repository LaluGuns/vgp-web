import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const logIdStr = searchParams.get('logId');
    const targetUrl = searchParams.get('url');

    if (logIdStr) {
        try {
            const logId = parseInt(logIdStr, 10);
            if (!isNaN(logId)) {
                // Update clicked_at if it has not been recorded yet
                await pool.query(
                    `UPDATE vgp_recipient_logs 
                     SET clicked_at = CURRENT_TIMESTAMP 
                     WHERE id = $1 AND clicked_at IS NULL`,
                    [logId]
                );
            }
        } catch (error) {
            console.error('Failed to log email click:', error);
        }
    }

    // Default fallback redirect if no target URL is provided
    let redirectUrl = 'https://www.virzyguns.com';
    if (targetUrl) {
        try {
            // Validate that it's a valid URL
            const parsedUrl = new URL(targetUrl);
            const allowedHosts = ['www.virzyguns.com', 'virzyguns.com'];
            const isAllowed = allowedHosts.some(host => 
                parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host)
            );
            
            if (isAllowed) {
                redirectUrl = targetUrl;
            }
        } catch (e) {
            // If relative path, resolve against the request origin (ensure no protocol-relative redirect like //evil.com)
            const origin = request.nextUrl.origin;
            if (targetUrl.startsWith('/') && !targetUrl.startsWith('//')) {
                redirectUrl = `${origin}${targetUrl}`;
            }
        }
    }

    return NextResponse.redirect(redirectUrl, 302);
}
