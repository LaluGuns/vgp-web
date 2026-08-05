import { NextRequest, NextResponse } from 'next/server';
import {
    authorizeFounderOsRequest,
    founderOsJson,
} from '@/lib/founder-os/http';
import { createOAuthState } from '@/lib/founder-os/provider-storage';
import { providerIdSchema } from '@/lib/founder-os/providers/contracts';
import {
    getMetaProviderConfig,
    getTikTokProviderConfig,
    isProviderConfigured,
} from '@/lib/founder-os/providers/config';
import {
    getMetaClient,
    getTikTokClient,
} from '@/lib/founder-os/providers/runtime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function safeReturnTo(value: string | null): string | null {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
    return value.startsWith('/founder/os') ? value : null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const unauthorized = await authorizeFounderOsRequest(request, false);
    if (unauthorized) return unauthorized;
    const providerResult = providerIdSchema.safeParse((await params).provider);
    if (!providerResult.success) {
        return founderOsJson(
            { success: false, error: 'Unsupported provider.' },
            { status: 404 }
        );
    }
    const provider = providerResult.data;
    if (!isProviderConfigured(provider)) {
        return founderOsJson(
            {
                success: false,
                error: 'Provider OAuth is not configured.',
                provider,
            },
            { status: 501 }
        );
    }

    const redirectUri = provider === 'meta'
        ? getMetaProviderConfig().redirectUri
        : getTikTokProviderConfig().redirectUri;
    const state = await createOAuthState({
        provider,
        redirectUri,
        returnTo: safeReturnTo(request.nextUrl.searchParams.get('returnTo')),
        ttlSeconds: 600,
    });
    const authorizationUrl = provider === 'meta'
        ? getMetaClient().buildAuthorizationUrl(state.state)
        : getTikTokClient().buildAuthorizationUrl(state.state);
    const response = NextResponse.redirect(authorizationUrl, 302);
    response.cookies.set(`vgp_oauth_${provider}`, state.nonce, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: `/api/founder/os/providers/${provider}/oauth/callback`,
        maxAge: 600,
    });
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    return response;
}
