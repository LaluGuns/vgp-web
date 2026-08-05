import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

const webhookSchema = z.object({
    object: z.literal('instagram'),
    entry: z.array(z.object({
        id: z.coerce.string().min(1),
        messaging: z.array(z.object({
            sender: z.object({ id: z.coerce.string().min(1) }),
            recipient: z.object({ id: z.coerce.string().min(1) }),
            timestamp: z.coerce.number().int().positive(),
            message: z.object({
                mid: z.string().min(1).max(1000),
                is_echo: z.boolean().optional(),
            }).passthrough().optional(),
        }).passthrough()).optional().default([]),
    }).passthrough()),
}).passthrough();

export interface MetaInboundEvent {
    providerAccountId: string;
    providerEventId: string;
    recipientScopedId: string;
    inboundAt: string;
}

export function verifyMetaWebhookSignature(
    rawBody: Uint8Array,
    signatureHeader: string | null,
    appSecret: string
): boolean {
    if (!signatureHeader?.startsWith('sha256=')) return false;
    const supplied = signatureHeader.slice('sha256='.length);
    if (!/^[0-9a-f]{64}$/i.test(supplied)) return false;
    const expected = createHmac('sha256', appSecret)
        .update(rawBody)
        .digest();
    const suppliedBuffer = Buffer.from(supplied, 'hex');
    return suppliedBuffer.length === expected.length
        && timingSafeEqual(suppliedBuffer, expected);
}

export function constantTimeTextEqual(left: string, right: string): boolean {
    const leftDigest = createHmac('sha256', 'vgp-webhook-compare')
        .update(left)
        .digest();
    const rightDigest = createHmac('sha256', 'vgp-webhook-compare')
        .update(right)
        .digest();
    return timingSafeEqual(leftDigest, rightDigest);
}

export function parseMetaInboundEvents(body: unknown): MetaInboundEvent[] {
    const parsed = webhookSchema.safeParse(body);
    if (!parsed.success) return [];
    const events: MetaInboundEvent[] = [];
    for (const entry of parsed.data.entry) {
        for (const messaging of entry.messaging) {
            if (
                !messaging.message
                || messaging.message.is_echo
                || messaging.recipient.id !== entry.id
            ) {
                continue;
            }
            const inboundAt = new Date(messaging.timestamp);
            if (Number.isNaN(inboundAt.getTime())) continue;
            events.push({
                providerAccountId: entry.id,
                providerEventId: messaging.message.mid,
                recipientScopedId: messaging.sender.id,
                inboundAt: inboundAt.toISOString(),
            });
        }
    }
    return events;
}
