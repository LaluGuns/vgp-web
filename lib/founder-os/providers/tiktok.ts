import { z } from 'zod';
import type {
    OwnedAnalyticsSnapshot,
    ProviderActionResult,
    ProviderCapability,
    ProviderCredentials,
} from './contracts';
import type { TikTokProviderConfig } from './config';
import { assertAllowedMediaUrl } from './config';
import { ProviderRequestError, providerJsonRequest } from './http';

const tokenSchema = z.object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1),
    expires_in: z.coerce.number().int().positive(),
    refresh_expires_in: z.coerce.number().int().positive(),
    open_id: z.string().min(1),
    scope: z.string(),
    token_type: z.literal('Bearer'),
}).passthrough();

const tiktokErrorSchema = z.object({
    code: z.string(),
    message: z.string().optional(),
    log_id: z.string().optional(),
}).passthrough();

const userInfoSchema = z.object({
    data: z.object({
        user: z.object({
            open_id: z.string(),
            display_name: z.string().optional(),
            username: z.string().optional(),
            follower_count: z.coerce.number().optional(),
            following_count: z.coerce.number().optional(),
            likes_count: z.coerce.number().optional(),
            video_count: z.coerce.number().optional(),
        }).passthrough(),
    }),
    error: tiktokErrorSchema,
}).passthrough();

const videoListSchema = z.object({
    data: z.object({
        videos: z.array(z.object({
            id: z.string(),
            create_time: z.coerce.number().optional(),
            title: z.string().optional(),
            view_count: z.coerce.number().optional(),
            like_count: z.coerce.number().optional(),
            comment_count: z.coerce.number().optional(),
            share_count: z.coerce.number().optional(),
        }).passthrough()),
        cursor: z.union([z.string(), z.number()]).optional(),
        has_more: z.boolean().optional(),
    }),
    error: tiktokErrorSchema,
}).passthrough();

const creatorInfoSchema = z.object({
    data: z.object({
        creator_username: z.string(),
        creator_nickname: z.string(),
        privacy_level_options: z.array(z.string()),
        comment_disabled: z.boolean(),
        duet_disabled: z.boolean(),
        stitch_disabled: z.boolean(),
        max_video_post_duration_sec: z.coerce.number().int().positive(),
    }).passthrough(),
    error: tiktokErrorSchema,
}).passthrough();

const publishInitSchema = z.object({
    data: z.object({
        publish_id: z.string().min(1).max(64),
        upload_url: z.string().url().optional(),
    }),
    error: tiktokErrorSchema,
}).passthrough();

const publishStatusSchema = z.object({
    data: z.object({
        status: z.string(),
        fail_reason: z.string().optional(),
        publicaly_available_post_id: z.array(
            z.union([z.string(), z.number()]).transform(String)
        ).optional(),
        uploaded_bytes: z.coerce.number().optional(),
        downloaded_bytes: z.coerce.number().optional(),
    }).passthrough(),
    error: tiktokErrorSchema,
}).passthrough();

export interface TikTokOAuthTokens {
    accessToken: string;
    refreshToken: string;
    accountId: string;
    accountLabel: string | null;
    grantedScopes: string[];
    expiresAt: string;
}

export interface TikTokCreatorInfo {
    username: string;
    nickname: string;
    privacyLevelOptions: string[];
    commentDisabled: boolean;
    duetDisabled: boolean;
    stitchDisabled: boolean;
    maxVideoPostDurationSeconds: number;
}

export function tiktokCapabilities(scopes: readonly string[]): ProviderCapability[] {
    const granted = new Set(scopes);
    const capabilities: ProviderCapability[] = [];
    if (granted.has('user.info.stats') && granted.has('video.list')) {
        capabilities.push('owned-analytics');
    }
    if (granted.has('video.publish')) {
        capabilities.push('creator-info', 'direct-post-init', 'post-status');
    }
    if (granted.has('video.upload')) {
        capabilities.push('draft-init', 'post-status');
    }
    return Array.from(new Set(capabilities));
}

export class TikTokProviderClient {
    constructor(
        private readonly config: TikTokProviderConfig,
        private readonly fetchImpl: typeof fetch = fetch
    ) {}

    buildAuthorizationUrl(state: string): string {
        const scopes = [
            'user.info.basic',
            'user.info.profile',
            'user.info.stats',
            'video.list',
            'video.upload',
        ];
        if (this.config.directPostEnabled) {
            scopes.push('video.publish');
        }
        const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
        url.search = new URLSearchParams({
            client_key: this.config.clientKey,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: scopes.join(','),
            state,
        }).toString();
        return url.toString();
    }

    async exchangeAuthorizationCode(code: string): Promise<TikTokOAuthTokens> {
        const body = await providerJsonRequest(
            this.fetchImpl,
            'https://open.tiktokapis.com/v2/oauth/token/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_key: this.config.clientKey,
                    client_secret: this.config.clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: this.config.redirectUri,
                }),
            },
            { externalWrite: false }
        );
        const token = tokenSchema.parse(body);
        const scopes = token.scope.split(',').map((scope) => scope.trim()).filter(Boolean);
        const profileCredentials: ProviderCredentials = {
            connectionId: 'oauth',
            provider: 'tiktok',
            accountId: token.open_id,
            accountLabel: null,
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            grantedScopes: scopes,
            expiresAt: null,
        };
        const profile = await this.getUserInfo(profileCredentials);
        return {
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            accountId: token.open_id,
            accountLabel: profile.display_name ?? profile.username ?? null,
            grantedScopes: scopes,
            expiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
        };
    }

    async revoke(accessToken: string): Promise<void> {
        await providerJsonRequest(
            this.fetchImpl,
            'https://open.tiktokapis.com/v2/oauth/revoke/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_key: this.config.clientKey,
                    client_secret: this.config.clientSecret,
                    token: accessToken,
                }),
            },
            { externalWrite: true }
        );
    }

    async getOwnedAnalytics(
        credentials: ProviderCredentials
    ): Promise<OwnedAnalyticsSnapshot> {
        this.requireCapability(credentials, 'owned-analytics');
        const [user, videosBody] = await Promise.all([
            this.getUserInfo(credentials),
            this.authorizedRequest(
                credentials,
                this.apiUrl('video/list/', {
                    fields: [
                        'id',
                        'create_time',
                        'title',
                        'view_count',
                        'like_count',
                        'comment_count',
                        'share_count',
                    ].join(','),
                }),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ max_count: 20 }),
                },
                false
            ),
        ]);
        const videos = this.parseTikTok(videoListSchema, videosBody).data;
        return {
            provider: 'tiktok',
            accountId: credentials.accountId,
            observedAt: new Date().toISOString(),
            account: {
                displayName: user.display_name ?? null,
                username: user.username ?? null,
                followerCount: user.follower_count ?? null,
                followingCount: user.following_count ?? null,
                likesCount: user.likes_count ?? null,
                videoCount: user.video_count ?? null,
            },
            content: videos.videos.map((video) => ({
                id: video.id,
                createdAt: video.create_time ?? null,
                title: video.title ?? null,
                views: video.view_count ?? null,
                likes: video.like_count ?? null,
                comments: video.comment_count ?? null,
                shares: video.share_count ?? null,
            })),
            nextCursor: videos.has_more && videos.cursor !== undefined
                ? String(videos.cursor)
                : null,
        };
    }

    async getCreatorInfo(
        credentials: ProviderCredentials
    ): Promise<TikTokCreatorInfo> {
        this.requireCapability(credentials, 'creator-info');
        const body = await this.authorizedRequest(
            credentials,
            this.apiUrl('post/publish/creator_info/query/'),
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: '{}',
            },
            false
        );
        const parsed = this.parseTikTok(creatorInfoSchema, body).data;
        return {
            username: parsed.creator_username,
            nickname: parsed.creator_nickname,
            privacyLevelOptions: parsed.privacy_level_options,
            commentDisabled: parsed.comment_disabled,
            duetDisabled: parsed.duet_disabled,
            stitchDisabled: parsed.stitch_disabled,
            maxVideoPostDurationSeconds: parsed.max_video_post_duration_sec,
        };
    }

    async initDraft(
        credentials: ProviderCredentials,
        videoUrl: string
    ): Promise<ProviderActionResult> {
        this.requireCapability(credentials, 'draft-init');
        assertAllowedMediaUrl(videoUrl, this.config.allowedMediaHosts);
        return this.initPublish(
            credentials,
            'post/publish/inbox/video/init/',
            {
                source_info: {
                    source: 'PULL_FROM_URL',
                    video_url: videoUrl,
                },
            }
        );
    }

    async initDirectPost(
        credentials: ProviderCredentials,
        input: {
            videoUrl: string;
            title: string;
            privacyLevel: string;
            allowComment: boolean;
            allowDuet: boolean;
            allowStitch: boolean;
            brandContent: boolean;
            brandOrganic: boolean;
            isAiGenerated: boolean;
        }
    ): Promise<ProviderActionResult> {
        if (!this.config.directPostEnabled) {
            throw new ProviderRequestError(
                'TikTok Direct Post remains disabled until provider audit approval.',
                { providerCode: 'DIRECT_POST_AUDIT_REQUIRED' }
            );
        }
        this.requireCapability(credentials, 'direct-post-init');
        assertAllowedMediaUrl(input.videoUrl, this.config.allowedMediaHosts);
        const creator = await this.getCreatorInfo(credentials);
        if (!creator.privacyLevelOptions.includes(input.privacyLevel)) {
            throw new ProviderRequestError('Selected privacy level is unavailable.', {
                providerCode: 'PRIVACY_LEVEL_UNAVAILABLE',
            });
        }
        if (
            (input.allowComment && creator.commentDisabled)
            || (input.allowDuet && creator.duetDisabled)
            || (input.allowStitch && creator.stitchDisabled)
        ) {
            throw new ProviderRequestError('Selected interaction is disabled by creator settings.', {
                providerCode: 'INTERACTION_UNAVAILABLE',
            });
        }
        return this.initPublish(
            credentials,
            'post/publish/video/init/',
            {
                post_info: {
                    title: input.title,
                    privacy_level: input.privacyLevel,
                    disable_comment: !input.allowComment,
                    disable_duet: !input.allowDuet,
                    disable_stitch: !input.allowStitch,
                    brand_content_toggle: input.brandContent,
                    brand_organic_toggle: input.brandOrganic,
                    is_aigc: input.isAiGenerated,
                },
                source_info: {
                    source: 'PULL_FROM_URL',
                    video_url: input.videoUrl,
                },
            }
        );
    }

    async getPostStatus(
        credentials: ProviderCredentials,
        publishId: string
    ): Promise<{
        status: string;
        failReason: string | null;
        publicPostIds: string[];
    }> {
        this.requireCapability(credentials, 'post-status');
        const body = await this.authorizedRequest(
            credentials,
            this.apiUrl('post/publish/status/fetch/'),
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({ publish_id: publishId }),
            },
            false
        );
        const parsed = this.parseTikTok(publishStatusSchema, body).data;
        return {
            status: parsed.status,
            failReason: parsed.fail_reason ?? null,
            publicPostIds: parsed.publicaly_available_post_id ?? [],
        };
    }

    private async getUserInfo(credentials: ProviderCredentials) {
        const body = await this.authorizedRequest(
            credentials,
            this.apiUrl('user/info/', {
                fields: [
                    'open_id',
                    'display_name',
                    'username',
                    'follower_count',
                    'following_count',
                    'likes_count',
                    'video_count',
                ].join(','),
            }),
            { method: 'GET' },
            false
        );
        return this.parseTikTok(userInfoSchema, body).data.user;
    }

    private async initPublish(
        credentials: ProviderCredentials,
        path: string,
        payload: unknown
    ): Promise<ProviderActionResult> {
        const body = await this.authorizedRequest(
            credentials,
            this.apiUrl(path),
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(payload),
            },
            true
        );
        const parsedResult = publishInitSchema.safeParse(body);
        if (!parsedResult.success) {
            throw new ProviderRequestError('TikTok write response was inconclusive.', {
                providerCode: 'INVALID_WRITE_RESPONSE',
                ambiguous: true,
            });
        }
        if (parsedResult.data.error.code !== 'ok') {
            throw new ProviderRequestError('TikTok rejected the request.', {
                providerCode: parsedResult.data.error.code,
            });
        }
        const parsed = parsedResult.data.data;
        return {
            providerReference: parsed.publish_id,
            detail: {
                publishId: parsed.publish_id,
                uploadRequired: Boolean(parsed.upload_url),
            },
        };
    }

    private parseTikTok<T extends {
        error: { code: string };
    }>(
        schema: z.ZodType<T>,
        body: unknown
    ): T {
        const parsed = schema.parse(body);
        if (parsed.error.code !== 'ok') {
            throw new ProviderRequestError('TikTok rejected the request.', {
                providerCode: parsed.error.code,
            });
        }
        return parsed;
    }

    private apiUrl(path: string, query?: Record<string, string>): string {
        const url = new URL(`v2/${path}`, 'https://open.tiktokapis.com/');
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
        if (!tiktokCapabilities(credentials.grantedScopes).includes(capability)) {
            throw new ProviderRequestError('Provider scope is not granted.', {
                providerCode: 'MISSING_SCOPE',
            });
        }
    }
}
