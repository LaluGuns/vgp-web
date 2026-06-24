import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Generate a secure random cryptographic nonce
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    
    // Construct strict Content-Security-Policy (replaces 'unsafe-inline' with 'nonce-${nonce}')
    const cspHeader = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://pagespeedonline.googleapis.com https://cloudflareinsights.com; frame-src 'self' https://player.beatstars.com https://*.beatstars.com;`.trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set('Content-Security-Policy', cspHeader);

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - static assets with extensions (png, jpg, svg, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|branding|.*\\..*).*)',
    ],
};
