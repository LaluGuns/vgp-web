import type { ProviderId } from './contracts';

export interface MetaProviderConfig {
    appId: string;
    appSecret: string;
    redirectUri: string;
    apiVersion: string;
    allowedMediaHosts: string[];
}

export interface TikTokProviderConfig {
    clientKey: string;
    clientSecret: string;
    redirectUri: string;
    allowedMediaHosts: string[];
    directPostEnabled: boolean;
}

function splitHosts(value: string | undefined): string[] {
    return (value ?? '')
        .split(',')
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean);
}

function requireEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Missing provider configuration: ${name}`);
    return value;
}

export function isProviderConfigured(provider: ProviderId): boolean {
    if (provider === 'meta') {
        return Boolean(
            process.env.META_APP_ID
            && process.env.META_APP_SECRET
            && process.env.META_REDIRECT_URI
            && process.env.META_GRAPH_API_VERSION
        );
    }
    return Boolean(
        process.env.TIKTOK_CLIENT_KEY
        && process.env.TIKTOK_CLIENT_SECRET
        && process.env.TIKTOK_REDIRECT_URI
    );
}

export function getMetaProviderConfig(): MetaProviderConfig {
    return {
        appId: requireEnv('META_APP_ID'),
        appSecret: requireEnv('META_APP_SECRET'),
        redirectUri: requireEnv('META_REDIRECT_URI'),
        apiVersion: requireEnv('META_GRAPH_API_VERSION'),
        allowedMediaHosts: splitHosts(process.env.PROVIDER_ALLOWED_MEDIA_HOSTS),
    };
}

export function getTikTokProviderConfig(): TikTokProviderConfig {
    return {
        clientKey: requireEnv('TIKTOK_CLIENT_KEY'),
        clientSecret: requireEnv('TIKTOK_CLIENT_SECRET'),
        redirectUri: requireEnv('TIKTOK_REDIRECT_URI'),
        allowedMediaHosts: splitHosts(process.env.PROVIDER_ALLOWED_MEDIA_HOSTS),
        directPostEnabled: process.env.TIKTOK_DIRECT_POST_ENABLED === 'true',
    };
}

export function assertAllowedMediaUrl(urlValue: string, allowedHosts: string[]): void {
    const url = new URL(urlValue);
    const hostname = url.hostname.toLowerCase();
    const allowed = allowedHosts.some(
        (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
    if (url.protocol !== 'https:' || !allowed) {
        throw new Error('Media URL must use an explicitly allowed HTTPS host.');
    }
}
