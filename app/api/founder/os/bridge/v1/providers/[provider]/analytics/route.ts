import { NextRequest } from 'next/server';
import { founderOsJson } from '@/lib/founder-os/http';
import { bridgeProviderIdSchema } from '@/lib/founder-os/bridge/contracts';
import { handleFounderOsBridgeRequest } from '@/lib/founder-os/bridge/http';
import { getFounderOsBridgeProviderAnalytics } from '@/lib/founder-os/bridge/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    return handleFounderOsBridgeRequest(
        request,
        { operation: 'providers.analytics', scope: 'bridge:read', rateClass: 'read' },
        async ({ requestId }) => {
            const provider = bridgeProviderIdSchema.safeParse((await params).provider);
            if (!provider.success) {
                return founderOsJson(
                    { success: false, error: 'Unsupported provider.', requestId },
                    { status: 404 }
                );
            }
            const analytics = await getFounderOsBridgeProviderAnalytics(provider.data);
            if (!analytics) {
                return founderOsJson(
                    { success: false, error: 'Provider is not connected.', requestId },
                    { status: 409 }
                );
            }
            return founderOsJson({ success: true, analytics, requestId });
        }
    );
}
