import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from './tokens';

/**
 * Verifies if the request or current session has a valid founder session cookie.
 */
export async function checkFounderSession(request?: NextRequest): Promise<boolean> {
    try {
        let token: string | undefined;

        if (request) {
            token = request.cookies.get('founder_session')?.value;
        } else {
            const cookieStore = await cookies();
            token = cookieStore.get('founder_session')?.value;
        }

        if (!token) return false;

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'founder') return false;

        // Verify expiration
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) return false;

        return true;
    } catch (e) {
        return false;
    }
}
