import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { hasValidRequestOrigin, SESSION_COOKIE_NAME } from '@/lib/auth';
import { verifyToken } from '@/lib/tokens';
import redis from '@/lib/redis';

export async function POST(request: NextRequest) {
    try {
        // CSRF check
        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

        if (token) {
            const decoded = await verifyToken(token);
            if (decoded) {
                const parts = token.split('.');
                const signature = parts[2];
                
                const now = Math.floor(Date.now() / 1000);
                const exp = decoded.exp || (now + 60 * 60 * 24); // fallback 24h
                const timeLeft = exp - now;
                
                if (timeLeft > 0 && redis) {
                    // Store signature in Redis with the remaining TTL of the token
                    await redis.set(
                        `bl:${signature}`,
                        '1',
                        'EX',
                        Math.max(1, timeLeft)
                    );
                }
            }
        }

        // Clear the cookie securely
        cookieStore.set(SESSION_COOKIE_NAME, '', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
