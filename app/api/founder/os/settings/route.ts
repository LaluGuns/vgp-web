import { NextRequest } from 'next/server';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import { saveFounderOsSettings } from '@/lib/founder-os/service';
import { founderSettingsInputSchema } from '@/lib/founder-os/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(request: NextRequest) {
    const unauthorized = await authorizeFounderOsRequest(request, true);
    if (unauthorized) return unauthorized;

    const requestId = getFounderOsRequestId(request);
    try {
        const parsed = founderSettingsInputSchema.safeParse(await request.json());
        if (!parsed.success) {
            return founderOsJson(
                {
                    success: false,
                    error: parsed.error.issues[0]?.message ?? 'Invalid settings.',
                    requestId,
                },
                { status: 400 }
            );
        }

        const settings = await saveFounderOsSettings(parsed.data, requestId);
        return founderOsJson({ success: true, settings, requestId });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
