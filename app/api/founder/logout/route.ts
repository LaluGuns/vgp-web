import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { hasValidRequestOrigin, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // CSRF check
        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        const cookieStore = await cookies();
        cookieStore.delete(SESSION_COOKIE_NAME);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
