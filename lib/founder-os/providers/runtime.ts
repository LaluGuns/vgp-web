import type {
    DecryptedProviderCredentials,
    ProviderConnectionSummary as StoredConnectionSummary,
} from '@/lib/founder-os/provider-storage/types';
import type {
    ProviderConnectionSummary,
    ProviderCredentials,
    ProviderId,
} from './contracts';
import {
    getMetaProviderConfig,
    getTikTokProviderConfig,
} from './config';
import { MetaProviderClient, metaCapabilities } from './meta';
import { TikTokProviderClient, tiktokCapabilities } from './tiktok';

export function getMetaClient(fetchImpl: typeof fetch = fetch): MetaProviderClient {
    return new MetaProviderClient(getMetaProviderConfig(), fetchImpl);
}

export function getTikTokClient(
    fetchImpl: typeof fetch = fetch
): TikTokProviderClient {
    return new TikTokProviderClient(getTikTokProviderConfig(), fetchImpl);
}

export function normalizeConnectionSummary(
    summary: StoredConnectionSummary
): ProviderConnectionSummary {
    const grantedScopes = summary.grants
        .filter((grant) => grant.type === 'scope' && grant.status === 'granted')
        .map((grant) => grant.name);
    const capabilities = summary.provider === 'meta'
        ? metaCapabilities(grantedScopes)
        : tiktokCapabilities(grantedScopes);
    const status: ProviderConnectionSummary['status'] =
        summary.status === 'connected'
            ? 'connected'
            : summary.status === 'refresh_required'
                ? 'expired'
                : summary.status === 'revoked'
                    ? 'revoked'
                    : summary.status === 'error'
                        ? 'error'
                        : 'not-connected';

    return {
        provider: summary.provider,
        status,
        accountId: summary.providerAccountId || null,
        accountLabel: summary.displayName || summary.username || null,
        grantedScopes,
        capabilities,
        connectedAt: summary.connectedAt,
        expiresAt: summary.grants
            .map((grant) => grant.expiresAt)
            .find((value): value is string => Boolean(value)) ?? null,
        lastVerifiedAt: summary.lastVerifiedAt,
        tokenPresent: summary.status !== 'revoked',
    };
}

export function combineCredentials(
    summary: StoredConnectionSummary,
    decrypted: DecryptedProviderCredentials
): ProviderCredentials {
    const scopes = summary.grants
        .filter((grant) => grant.type === 'scope' && grant.status === 'granted')
        .map((grant) => grant.name);
    return {
        connectionId: summary.id,
        provider: summary.provider,
        accountId: summary.providerAccountId,
        accountLabel: summary.displayName || summary.username || null,
        accessToken: decrypted.accessToken,
        refreshToken: decrypted.refreshToken,
        grantedScopes: scopes,
        expiresAt: decrypted.accessTokenExpiresAt,
    };
}

export function providerChannel(provider: ProviderId): 'instagram' | 'tiktok' {
    return provider === 'meta' ? 'instagram' : 'tiktok';
}
