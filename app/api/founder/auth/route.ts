import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { signToken } from '@/lib/tokens';
import { hasValidRequestOrigin, SESSION_COOKIE_NAME } from '@/lib/auth';
import crypto from 'crypto';

function getFounderPasscode(): string {
    const passcode = process.env.FOUNDER_PASSCODE;
    if (!passcode) {
        throw new Error('CRITICAL ENVIRONMENT ERROR: FOUNDER_PASSCODE is not configured in environment variables.');
    }
    return passcode;
}

const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION_MINUTES = 15;

function safeCompare(input: string, secret: string): boolean {
    const inputHash = crypto.createHash('sha256').update(input).digest();
    const secretHash = crypto.createHash('sha256').update(secret).digest();
    return crypto.timingSafeEqual(inputHash, secretHash);
}

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';

    try {
        // CSRF check
        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        // 1. Check current rate limit status from Database
        const rateLimitRes = await pool.query(
            `SELECT attempts, window_start, blocked_until 
             FROM vgp_login_attempts 
             WHERE ip_address = $1`,
            [ip]
        );

        if (rateLimitRes.rowCount !== null && rateLimitRes.rowCount > 0) {
            const { attempts, window_start, blocked_until } = rateLimitRes.rows[0];
            const now = new Date();

            if (blocked_until && new Date(blocked_until) > now) {
                const waitTimeMs = new Date(blocked_until).getTime() - now.getTime();
                const waitMinutes = Math.ceil(waitTimeMs / (60 * 1000));
                return NextResponse.json(
                    { error: `Too many failed login attempts. Locked out. Please try again in ${waitMinutes} minutes.` },
                    { status: 429 }
                );
            }

            // Reset attempts if the rate limit window has expired (e.g. 15 mins since start)
            const windowStartMs = new Date(window_start).getTime();
            if (now.getTime() - windowStartMs > BLOCK_DURATION_MINUTES * 60 * 1000) {
                await pool.query(
                    `DELETE FROM vgp_login_attempts WHERE ip_address = $1`,
                    [ip]
                );
            }
        }

        // 2. Parse request body
        const { passcode } = await request.json();

        if (!passcode || typeof passcode !== 'string') {
            return NextResponse.json({ error: 'Passcode is required.' }, { status: 400 });
        }

        // 3. Timing-safe verification
        const isValid = safeCompare(passcode, getFounderPasscode());

        if (isValid) {
            // Successful Login: Reset rate limits
            await pool.query(
                `DELETE FROM vgp_login_attempts WHERE ip_address = $1`,
                [ip]
            );

            // Generate session token: valid for 24 hours
            const sessionDurationSeconds = 60 * 60 * 24;
            const exp = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
            const token = signToken({
                role: 'founder',
                exp
            });

            // Set cookie securely
            const cookieStore = await cookies();
            const isProd = process.env.NODE_ENV === 'production';
            cookieStore.set(SESSION_COOKIE_NAME, token, {
                httpOnly: true,
                secure: isProd, // Must be true in production when using __Host- prefix
                sameSite: 'strict', // Change from lax to strict for admin dashboard access
                path: '/',
                maxAge: sessionDurationSeconds,
            });

            return NextResponse.json({ success: true });
        } else {
            // Failed Login: Record/increment attempt
            const rateLimitCheck = await pool.query(
                `SELECT attempts, window_start FROM vgp_login_attempts WHERE ip_address = $1`,
                [ip]
            );

            if (rateLimitCheck.rowCount === 0 || rateLimitCheck.rowCount === null) {
                // First failed attempt: insert record
                await pool.query(
                    `INSERT INTO vgp_login_attempts (ip_address, attempts, window_start, last_attempt_at)
                     VALUES ($1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [ip]
                );
            } else {
                const currentAttempts = rateLimitCheck.rows[0].attempts;
                const nextAttempts = currentAttempts + 1;

                if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
                    // Block client
                    const blockedUntil = new Date(Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000);
                    await pool.query(
                        `UPDATE vgp_login_attempts
                         SET attempts = $2, last_attempt_at = CURRENT_TIMESTAMP, blocked_until = $3
                         WHERE ip_address = $1`,
                        [ip, nextAttempts, blockedUntil]
                    );
                } else {
                    // Increment count
                    await pool.query(
                        `UPDATE vgp_login_attempts
                         SET attempts = $2, last_attempt_at = CURRENT_TIMESTAMP
                         WHERE ip_address = $1`,
                        [ip, nextAttempts]
                    );
                }
            }

            return NextResponse.json({ error: 'Invalid passcode.' }, { status: 401 });
        }
    } catch (error) {
        console.error('Founder Auth API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
