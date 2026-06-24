import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from './tokens';

const TRUSTED_HOSTS = ['www.virzyguns.com', 'virzyguns.com', 'localhost:3000', '127.0.0.1:3000'];

/**
 * Returns the secure base URL of the application.
 * Prioritizes APP_URL environment variable, falls back to request hostname if trusted.
 */
export function getAppBaseUrl(request?: NextRequest): string {
    if (process.env.APP_URL) {
        return process.env.APP_URL.replace(/\/$/, '');
    }
    if (request) {
        const host = request.headers.get('host') || 'www.virzyguns.com';
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        
        // Validate if host is trusted to prevent Host Header Injection
        const isTrusted = TRUSTED_HOSTS.some(trusted => {
            if (trusted.includes(':')) {
                return host === trusted;
            }
            return host === trusted || host.endsWith('.' + trusted);
        });
        if (isTrusted) {
            return `${protocol}://${host}`;
        }
    }
    return 'https://www.virzyguns.com';
}

/**
 * Require browser mutations to come from the exact origin serving this route.
 * A missing or malformed Origin is rejected rather than treated as same-origin.
 */
export function hasValidRequestOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return false;

    try {
        const originOrigin = new URL(origin).origin;
        const baseOrigin = new URL(getAppBaseUrl(request)).origin;
        return originOrigin === baseOrigin;
    } catch {
        return false;
    }
}

export const SESSION_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-founder_session' : 'founder_session';

/**
 * Verifies if the request or current session has a valid founder session cookie.
 */
export async function checkFounderSession(request?: NextRequest): Promise<boolean> {
    try {
        let token: string | undefined;

        if (request) {
            token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
        } else {
            const cookieStore = await cookies();
            token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        }

        if (!token) return false;

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'founder') return false;

        return true;
    } catch (e) {
        return false;
    }
}
