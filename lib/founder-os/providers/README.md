# Founder OS official provider connectors

These adapters use only official Meta Instagram Platform and TikTok APIs. They
do not scrape profiles, discover cold-DM targets, schedule publishing, or
automatically retry ambiguous writes.

## Safety boundary

- OAuth tokens are server-only and persisted through
  `lib/founder-os/provider-storage`.
- Read endpoints always use the connected account ID; callers cannot query an
  arbitrary account.
- Social writes execute only after provider-storage atomically claims an
  `APPROVED` action, its exact database-generated content hash, and its held
  outbox row.
- Instagram replies additionally require a verified, deduplicated inbound
  webhook event with an unexpired response window and a single-use claim.
- Provider/network ambiguity and success-receipt persistence failures become
  `UNKNOWN`. They require reconciliation and are never automatically retried.
- TikTok Direct Post requires `TIKTOK_DIRECT_POST_ENABLED=true` in addition to
  the `video.publish` grant. Keep the flag unset until TikTok audit approval.
  Draft upload remains available through the `video.upload` scope.

## Required server configuration

- `META_APP_ID`
- `META_APP_SECRET`
- `META_REDIRECT_URI`
- `META_GRAPH_API_VERSION` — explicitly pin the reviewed API version
- `META_WEBHOOK_VERIFY_TOKEN`
- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `TIKTOK_REDIRECT_URI`
- `PROVIDER_ALLOWED_MEDIA_HOSTS` — comma-separated verified media hosts
- `TIKTOK_DIRECT_POST_ENABLED` — default off; enable only after audit

Do not place access tokens or refresh tokens in environment configuration.
Those are encrypted by provider-storage after OAuth.

## OAuth web-flow boundary

The reviewed Meta Instagram Business Login and TikTok Login Kit for Web
documentation does not define PKCE authorization parameters for these web
flows. TikTok documents `code_verifier` as required for mobile and desktop
clients, not the web flow. The connectors therefore do not send undocumented
PKCE parameters or claim PKCE protection.

The enforced web boundary is a short-lived, single-use, server-stored hashed
`state`, a separate HttpOnly SameSite=Lax nonce cookie, and an authenticated
founder session on both start and callback. Provider storage retains its
encrypted PKCE artifacts for a future provider flow that officially supports
them; they are intentionally unused here.

## Official references reviewed

- [Meta official Instagram API workspace](https://www.postman.com/meta/instagram/overview)
- [Meta Instagram API with Instagram Login](https://www.postman.com/meta/instagram/folder/23987686-98bfade9-3736-4738-8b4a-f56d6534f6de)
- [Meta Instagram Insights](https://www.postman.com/meta/instagram/folder/23987686-f659d7d1-d74c-44e4-9192-9b1e8694c511)
- [TikTok Login Kit for Web](https://developers.tiktok.com/doc/login-kit-web)
- [TikTok user access-token management](https://developers.tiktok.com/doc/oauth-user-access-token-management)
- [TikTok creator info](https://developers.tiktok.com/doc/content-posting-api-reference-query-creator-info)
- [TikTok Direct Post](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)
- [TikTok draft upload](https://developers.tiktok.com/doc/content-posting-api-reference-upload-video)
- [TikTok post status](https://developers.tiktok.com/doc/content-posting-api-reference-get-video-status)
- [TikTok Display API](https://developers.tiktok.com/doc/display-api-overview)
