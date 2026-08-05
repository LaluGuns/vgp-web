import { NextRequest, NextResponse } from 'next/server';
import {
    listProviderConnectionSummaries,
    recordWebhookOnce,
    registerInboundEvent,
} from '@/lib/founder-os/provider-storage';
import {
    constantTimeTextEqual,
    parseMetaInboundEvents,
    verifyMetaWebhookSignature,
} from '@/lib/founder-os/providers/meta-webhook';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const MAX_WEBHOOK_BYTES = 1024 * 1024;

function plainResponse(body: string, status: number): NextResponse {
    return new NextResponse(body, {
        status,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'private, no-store, max-age=0',
        },
    });
}

export async function GET(request: NextRequest) {
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
    const mode = request.nextUrl.searchParams.get('hub.mode');
    const suppliedToken = request.nextUrl.searchParams.get('hub.verify_token');
    const challenge = request.nextUrl.searchParams.get('hub.challenge');
    if (
        !verifyToken
        || !suppliedToken
        || mode !== 'subscribe'
        || challenge === null
        || !constantTimeTextEqual(suppliedToken, verifyToken)
    ) {
        return plainResponse('Forbidden', 403);
    }
    return plainResponse(challenge, 200);
}

export async function POST(request: NextRequest) {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) return plainResponse('Unavailable', 503);
    const declaredLength = Number(request.headers.get('content-length') ?? 0);
    if (declaredLength > MAX_WEBHOOK_BYTES) {
        return plainResponse('Payload too large', 413);
    }
    const rawBody = new Uint8Array(await request.arrayBuffer());
    if (rawBody.byteLength > MAX_WEBHOOK_BYTES) {
        return plainResponse('Payload too large', 413);
    }
    if (
        !verifyMetaWebhookSignature(
            rawBody,
            request.headers.get('x-hub-signature-256'),
            appSecret
        )
    ) {
        return plainResponse('Forbidden', 403);
    }

    let parsedBody: unknown;
    try {
        parsedBody = JSON.parse(new TextDecoder().decode(rawBody));
    } catch {
        return plainResponse('Invalid JSON', 400);
    }
    const inboundEvents = parseMetaInboundEvents(parsedBody);
    if (inboundEvents.length === 0) return plainResponse('EVENT_RECEIVED', 200);
    try {
        const connections = await listProviderConnectionSummaries('meta');
        const verifiedAt = new Date().toISOString();

        for (const inbound of inboundEvents) {
            const connection = connections.find(
                (candidate) =>
                    candidate.status === 'connected'
                    && candidate.providerAccountId === inbound.providerAccountId
            );
            const recorded = await recordWebhookOnce({
                provider: 'meta',
                providerEventId: inbound.providerEventId,
                eventType: 'messages',
                rawBody,
                signatureVerifiedAt: verifiedAt,
                connectionId: connection?.id ?? null,
            });
            if (recorded.duplicate || !connection) continue;
            await registerInboundEvent({
                webhookEventId: recorded.id,
                connectionId: connection.id,
                provider: 'meta',
                providerEventId: inbound.providerEventId,
                recipientScopedId: inbound.recipientScopedId,
                inboundAt: inbound.inboundAt,
            });
        }
    } catch {
        return plainResponse('Unavailable', 503);
    }

    return plainResponse('EVENT_RECEIVED', 200);
}
