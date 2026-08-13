import { NextRequest, NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/auth';
import {
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import {
    consumeOAuthState,
    isProviderStorageError,
    saveProviderConnection,
} from '@/lib/founder-os/provider-storage';
import { providerIdSchema } from '@/lib/founder-os/providers/contracts';
import { ProviderRequestError } from '@/lib/founder-os/providers/http';
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
    // OAuth providers redirect from a different site, so the founder session's
    // SameSite=Strict cookie is intentionally absent here. Authenticate the
    // callback with the one-time state plus the scoped HttpOnly nonce instead.
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

    let phase: 'state_validation' | 'token_exchange' | 'connection_persistence' =
        'state_validation';
    try {
        const consumed = await consumeOAuthState({
            provider,
            state: stateValue,
            nonce,
            requestId,
        });
        const connectedAt = new Date().toISOString();

        phase = 'token_exchange';
        if (provider === 'meta') {
            const tokens = await getMetaClient().exchangeAuthorizationCode(code);
            phase = 'connection_persistence';
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
            phase = 'connection_persistence';
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
        if (error instanceof ProviderRequestError) {
            console.error('Founder OS provider OAuth failed', {
                requestId,
                provider,
                phase,
                providerCode: error.providerCode,
                httpStatus: error.httpStatus,
            });
            return founderOsJson(
                {
                    success: false,
                    error: 'Provider authorization could not be completed.',
                    code: error.providerCode,
                    provider,
                    phase,
                    requestId,
                },
                { status: error.providerCode === 'TIMEOUT' ? 504 : 502 }
            );
        }
        if (isProviderStorageError(error)) {
            console.error('Founder OS provider OAuth storage failed', {
                requestId,
                provider,
                phase,
                storageCode: error.code,
            });
            return founderOsJson(
                {
                    success: false,
                    error: 'Provider connection could not be stored.',
                    code: error.code,
                    provider,
                    phase,
                    requestId,
                },
                { status: error.status }
            );
        }
        return founderOsErrorResponse(error, requestId);
    }
}
