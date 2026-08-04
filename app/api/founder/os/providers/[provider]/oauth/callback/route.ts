import { NextRequest, NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/auth';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import {
    consumeOAuthState,
    saveProviderConnection,
} from '@/lib/founder-os/provider-storage';
import { providerIdSchema } from '@/lib/founder-os/providers/contracts';
import {
    getMetaClient,
    getTikTokClient,
} from '@/lib/founder-os/providers/runtime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function safeReturnTo(value: string | null): string {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return '/founder/os';
    }
    return value.startsWith('/founder/os') ? value : '/founder/os';
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const unauthorized = await authorizeFounderOsRequest(request, false);
    if (unauthorized) return unauthorized;
    const requestId = getFounderOsRequestId(request);
    const providerResult = providerIdSchema.safeParse((await params).provider);
    if (!providerResult.success) {
        return founderOsJson(
            { success: false, error: 'Unsupported provider.', requestId },
            { status: 404 }
        );
    }
    const provider = providerResult.data;
    const errorCode = request.nextUrl.searchParams.get('error');
    if (errorCode) {
        return founderOsJson(
            {
                success: false,
                error: 'Provider authorization was not completed.',
                provider,
                requestId,
            },
            { status: 400 }
        );
    }
    const code = request.nextUrl.searchParams.get('code');
    const stateValue = request.nextUrl.searchParams.get('state');
    const nonce = request.cookies.get(`vgp_oauth_${provider}`)?.value;
    if (!code || !stateValue || !nonce) {
        return founderOsJson(
            {
                success: false,
                error: 'OAuth callback is incomplete or expired.',
                requestId,
            },
            { status: 400 }
        );
    }

    try {
        const consumed = await consumeOAuthState({
            provider,
            state: stateValue,
            nonce,
            requestId,
        });
        const connectedAt = new Date().toISOString();

        if (provider === 'meta') {
            const tokens = await getMetaClient().exchangeAuthorizationCode(code);
            await saveProviderConnection({
                provider,
                providerAccountId: tokens.accountId,
                displayName: tokens.accountLabel ?? 'Instagram Professional Account',
                username: tokens.accountLabel,
                grants: tokens.grantedScopes.map((name) => ({
                    type: 'scope',
                    name,
                    status: 'granted',
                    grantedAt: connectedAt,
                    expiresAt: tokens.expiresAt,
                    lastVerifiedAt: connectedAt,
                })),
                credentials: {
                    accessToken: tokens.accessToken,
                    tokenType: 'Bearer',
                    accessTokenExpiresAt: tokens.expiresAt,
                    issuedAt: connectedAt,
                },
                requestId,
            });
        } else {
            const tokens = await getTikTokClient().exchangeAuthorizationCode(code);
            await saveProviderConnection({
                provider,
                providerAccountId: tokens.accountId,
                displayName: tokens.accountLabel ?? 'TikTok Creator',
                username: tokens.accountLabel,
                profileUrl: tokens.accountLabel
                    ? `https://www.tiktok.com/@${encodeURIComponent(tokens.accountLabel)}`
                    : null,
                grants: tokens.grantedScopes.map((name) => ({
                    type: 'scope',
                    name,
                    status: 'granted',
                    grantedAt: connectedAt,
                    expiresAt: tokens.expiresAt,
                    lastVerifiedAt: connectedAt,
                })),
                credentials: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    tokenType: 'Bearer',
                    accessTokenExpiresAt: tokens.expiresAt,
                    issuedAt: connectedAt,
                },
                requestId,
            });
        }

        const destination = new URL(
            safeReturnTo(consumed.returnTo),
            getAppBaseUrl(request)
        );
        destination.searchParams.set('provider', provider);
        destination.searchParams.set('connected', '1');
        const response = NextResponse.redirect(destination, 303);
        response.cookies.delete(`vgp_oauth_${provider}`);
        response.headers.set('Cache-Control', 'private, no-store, max-age=0');
        return response;
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
