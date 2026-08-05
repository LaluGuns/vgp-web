import { z } from 'zod';
import type {
    OwnedAnalyticsSnapshot,
    ProviderActionResult,
    ProviderCapability,
    ProviderCredentials,
} from './contracts';
import type { MetaProviderConfig } from './config';
import { assertAllowedMediaUrl } from './config';
import { ProviderRequestError, providerJsonRequest } from './http';

const metaTokenSchema = z.object({
    access_token: z.string().min(1),
    user_id: z.coerce.string().min(1).optional(),
    expires_in: z.coerce.number().int().positive().optional(),
}).passthrough();

const metaProfileSchema = z.object({
    id: z.coerce.string().min(1),
    username: z.string().min(1).optional(),
    name: z.string().optional(),
    account_type: z.string().optional(),
}).passthrough();
const permissionsSchema = z.object({
    data: z.array(z.object({
        permission: z.string(),
        status: z.string(),
    }).passthrough()),
}).passthrough();

const metaIdSchema = z.object({ id: z.coerce.string().min(1) }).passthrough();
const containerStatusSchema = z.object({
    id: z.coerce.string().min(1),
    status_code: z.string().min(1),
    status: z.string().optional(),
}).passthrough();

const insightSchema = z.object({
    data: z.array(z.object({
        name: z.string(),
        period: z.string().optional(),
        values: z.array(z.object({
            value: z.union([z.number(), z.record(z.string(), z.unknown())]),
            end_time: z.string().optional(),
        }).passthrough()).optional(),
        total_value: z.object({
            value: z.union([z.number(), z.record(z.string(), z.unknown())]),
        }).passthrough().optional(),
    }).passthrough()),
}).passthrough();

export interface MetaOAuthTokens {
    accessToken: string;
    accountId: string;
    accountLabel: string | null;
    grantedScopes: string[];
    expiresAt: string | null;
}

export function metaCapabilities(scopes: readonly string[]): ProviderCapability[] {
    const granted = new Set(scopes);
    const capabilities: ProviderCapability[] = [];
    if (granted.has('instagram_business_manage_insights')) {
        capabilities.push('owned-analytics');
    }
    if (granted.has('instagram_business_content_publish')) {
        capabilities.push('reel-container', 'reel-publish');
    }
    if (granted.has('instagram_business_manage_messages')) {
        capabilities.push('inbound-reply');
    }
    return capabilities;
}

export class MetaProviderClient {
    constructor(
        private readonly config: MetaProviderConfig,
        private readonly fetchImpl: typeof fetch = fetch
    ) {}

    buildAuthorizationUrl(state: string): string {
        const url = new URL('https://www.instagram.com/oauth/authorize');
        url.search = new URLSearchParams({
            client_id: this.config.appId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: [
                'instagram_business_basic',
                'instagram_business_manage_insights',
                'instagram_business_content_publish',
                'instagram_business_manage_messages',
            ].join(','),
            state,
            enable_fb_login: '0',
            force_authentication: '1',
        }).toString();
        return url.toString();
    }

    async exchangeAuthorizationCode(code: string): Promise<MetaOAuthTokens> {
        const shortBody = await providerJsonRequest(
            this.fetchImpl,
            'https://api.instagram.com/oauth/access_token',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: this.config.appId,
                    client_secret: this.config.appSecret,
                    grant_type: 'authorization_code',
                    redirect_uri: this.config.redirectUri,
                    code,
                }),
            },
            { externalWrite: false }
        );
        const shortToken = metaTokenSchema.parse(shortBody);

        const exchangeUrl = new URL('https://graph.instagram.com/access_token');
        exchangeUrl.search = new URLSearchParams({
            grant_type: 'ig_exchange_token',
            client_secret: this.config.appSecret,
            access_token: shortToken.access_token,
        }).toString();
        const longBody = await providerJsonRequest(
            this.fetchImpl,
            exchangeUrl.toString(),
            { method: 'GET' },
            { externalWrite: false }
        );
        const longToken = metaTokenSchema.parse(longBody);
        const profile = await this.getProfile(longToken.access_token);
        const grantedScopes = await this.getGrantedScopes(longToken.access_token);
        const expiresAt = longToken.expires_in
            ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
            : null;

        return {
            accessToken: longToken.access_token,
            accountId: profile.id,
            accountLabel: profile.username ?? profile.name ?? null,
            grantedScopes,
            expiresAt,
        };
    }

    async revoke(accessToken: string): Promise<void> {
        const credentials: ProviderCredentials = {
            connectionId: 'disconnect',
            provider: 'meta',
            accountId: 'me',
            accountLabel: null,
            accessToken,
            refreshToken: null,
            grantedScopes: [],
            expiresAt: null,
        };
        await this.authorizedRequest(
            credentials,
            this.graphUrl('me/permissions'),
            { method: 'DELETE' },
            true
        );
    }

    async getOwnedAnalytics(
        credentials: ProviderCredentials
    ): Promise<OwnedAnalyticsSnapshot> {
        this.requireCapability(credentials, 'owned-analytics');
        const url = this.graphUrl(`${credentials.accountId}/insights`, {
            metric: 'reach,profile_views',
            period: 'day',
        });
        const body = await this.authorizedRequest(credentials, url, {
            method: 'GET',
        }, false);
        const parsed = insightSchema.parse(body);
        const account: Record<string, string | number | boolean | null> = {};
        for (const metric of parsed.data) {
            const value = metric.total_value?.value ?? metric.values?.at(-1)?.value;
            account[metric.name] = typeof value === 'number' ? value : null;
        }
        return {
            provider: 'meta',
            accountId: credentials.accountId,
            observedAt: new Date().toISOString(),
            account,
            content: [],
            nextCursor: null,
        };
    }

    async createReelContainer(
        credentials: ProviderCredentials,
        input: { videoUrl: string; caption: string; shareToFeed: boolean }
    ): Promise<ProviderActionResult> {
        this.requireCapability(credentials, 'reel-container');
        assertAllowedMediaUrl(input.videoUrl, this.config.allowedMediaHosts);
        const body = await this.authorizedRequest(
            credentials,
            this.graphUrl(`${credentials.accountId}/media`),
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    media_type: 'REELS',
                    video_url: input.videoUrl,
                    caption: input.caption,
                    share_to_feed: input.shareToFeed,
                }),
            },
            true
        );
        const parsed = this.parseExternalWrite(metaIdSchema, body);
        return {
            providerReference: parsed.id,
            detail: { containerId: parsed.id },
        };
    }

    async getReelContainerStatus(
        credentials: ProviderCredentials,
        containerId: string
    ): Promise<{ id: string; statusCode: string; status: string | null }> {
        this.requireCapability(credentials, 'reel-publish');
        const body = await this.authorizedRequest(
            credentials,
            this.graphUrl(containerId, { fields: 'status_code,status' }),
            { method: 'GET' },
            false
        );
        const parsed = containerStatusSchema.parse(body);
        return {
            id: parsed.id,
            statusCode: parsed.status_code,
            status: parsed.status ?? null,
        };
    }

    async publishReel(
        credentials: ProviderCredentials,
        creationId: string
    ): Promise<ProviderActionResult> {
        this.requireCapability(credentials, 'reel-publish');
        const status = await this.getReelContainerStatus(credentials, creationId);
        if (status.statusCode !== 'FINISHED') {
            throw new ProviderRequestError('Reel container is not ready.', {
                providerCode: `CONTAINER_${status.statusCode}`,
            });
        }
        const body = await this.authorizedRequest(
            credentials,
            this.graphUrl(`${credentials.accountId}/media_publish`),
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creation_id: creationId }),
            },
            true
        );
        const parsed = this.parseExternalWrite(metaIdSchema, body);
        return {
            providerReference: parsed.id,
            detail: { mediaId: parsed.id },
        };
    }

    async replyToInbound(
        credentials: ProviderCredentials,
        recipientScopedId: string,
        text: string
    ): Promise<ProviderActionResult> {
        this.requireCapability(credentials, 'inbound-reply');
        const body = await this.authorizedRequest(
            credentials,
            this.graphUrl(`${credentials.accountId}/messages`),
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: { id: recipientScopedId },
                    message: { text },
                }),
            },
            true
        );
        const parsed = this.parseExternalWrite(z.object({
            message_id: z.string().min(1),
            recipient_id: z.string().min(1).optional(),
        }).passthrough(), body);
        return {
            providerReference: parsed.message_id,
            detail: { messageId: parsed.message_id },
        };
    }

    private async getProfile(accessToken: string) {
        const credentials: ProviderCredentials = {
            connectionId: 'oauth',
            provider: 'meta',
            accountId: 'me',
            accountLabel: null,
            accessToken,
            refreshToken: null,
            grantedScopes: [],
            expiresAt: null,
        };
        const body = await this.authorizedRequest(
            credentials,
            this.graphUrl('me', {
                fields: 'id,username,name,account_type',
            }),
            { method: 'GET' },
            false
        );
        return metaProfileSchema.parse(body);
    }

    private async getGrantedScopes(accessToken: string): Promise<string[]> {
        const credentials: ProviderCredentials = {
            connectionId: 'oauth',
            provider: 'meta',
            accountId: 'me',
            accountLabel: null,
            accessToken,
            refreshToken: null,
            grantedScopes: [],
            expiresAt: null,
        };
        const body = await this.authorizedRequest(
            credentials,
            this.graphUrl('me/permissions'),
            { method: 'GET' },
            false
        );
        return permissionsSchema.parse(body).data
            .filter((permission) => permission.status === 'granted')
            .map((permission) => permission.permission);
    }

    private graphUrl(path: string, query?: Record<string, string>): string {
        const url = new URL(
            `${this.config.apiVersion}/${path}`,
            'https://graph.instagram.com/'
        );
        if (query) url.search = new URLSearchParams(query).toString();
        return url.toString();
    }

    private authorizedRequest(
        credentials: ProviderCredentials,
        url: string,
        init: RequestInit,
        externalWrite: boolean
    ) {
        const headers = new Headers(init.headers);
        headers.set('Authorization', `Bearer ${credentials.accessToken}`);
        return providerJsonRequest(
            this.fetchImpl,
            url,
            { ...init, headers },
            { externalWrite }
        );
    }

    private requireCapability(
        credentials: ProviderCredentials,
        capability: ProviderCapability
    ): void {
        if (!metaCapabilities(credentials.grantedScopes).includes(capability)) {
            throw new ProviderRequestError('Provider scope is not granted.', {
                providerCode: 'MISSING_SCOPE',
            });
        }
    }

    private parseExternalWrite<T extends z.ZodTypeAny>(
        schema: T,
        body: unknown
    ): z.infer<T> {
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            throw new ProviderRequestError('Provider write response was inconclusive.', {
                providerCode: 'INVALID_WRITE_RESPONSE',
                ambiguous: true,
            });
        }
        return parsed.data;
    }
}
