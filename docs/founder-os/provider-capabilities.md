# Provider capability gates

Founder OS treats an installed SDK, a configured token, an authorized account,
and a verified capability as four different states. A provider can only move to
`connected` after the exact account, scopes, review status, and test-account
behavior have been verified.

## Meta / Instagram

Official reference:
[Instagram API collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api)

| Capability | V1 status | Gate before enablement |
| --- | --- | --- |
| Owned professional-account insights | Not connected | Professional account, authorized scopes, API response validation, and missing-data handling |
| Comment discovery and reply | Not connected | Eligible owned media, authorized scopes, inbound-context check, founder approval, and idempotency |
| Inbound conversation reply | Not connected | Eligible conversation, user-initiated context, authorized scope, founder approval, and provider policy review |
| Cold Instagram DM | Prohibited | No enablement path in V1 |
| Publish owned media | Not connected | Supported media/account, authorized scope, founder approval, status reconciliation, and test-account proof |

Missing insight rows must be shown as unavailable, not converted into zero. The
system must never infer access to a consumer account or an account it does not
own.

## TikTok

Official references:
[draft upload](https://developers.tiktok.com/doc/content-posting-api-reference-upload-video),
[direct post](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post?enter_method=left_navigation&from_seo_redirect=1),
and [post status](https://developers.tiktok.com/doc/content-posting-api-reference-get-video-status?enter_method=left_navigation).

| Capability | V1 status | Gate before enablement |
| --- | --- | --- |
| Owned-account performance | Not connected | Authorized analytics scope, metric validation, and freshness metadata |
| Draft upload | Not connected | `video.upload`, creator authorization, founder approval, and test-account proof |
| Direct post | Not connected | `video.publish`, creator-info check, explicit consent UI, app review/audit status, founder approval, and post-status reconciliation |
| Post status | Not connected | Published post identifier, poll/webhook reconciliation, and terminal unknown handling |
| Cold TikTok DM | Prohibited | No enablement path in V1 |

Direct Post and draft upload are separate capabilities. Enabling one must not
silently enable the other.

## Content intelligence

The agent may generate hypotheses from:

- owned analytics after authorization;
- official API data with source and observation time;
- founder-reviewed public evidence with a URL and observation time; and
- the local beat catalog.

The agent may rank hypotheses and recommend experiments, but it cannot promise
FYP placement, reach, sales, or platform approval. Scraping, login-wall bypass,
CAPTCHA bypass, and guessed data are prohibited.

## Safe execution sequence

1. Collect evidence and record source, account, and freshness.
2. Draft the exact action payload.
3. Compute the immutable content hash.
4. Obtain founder approval for that hash.
5. Re-check provider capability and recipient/context permission.
6. Execute once with an idempotency key.
7. Reconcile the provider result.
8. If acceptance is ambiguous, mark `UNKNOWN` and require manual reconciliation.

No provider write capability is enabled by the local V1 implementation.
