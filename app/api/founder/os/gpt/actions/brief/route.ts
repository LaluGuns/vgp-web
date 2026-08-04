import { NextRequest } from 'next/server';
import { authorizeCustomGptAction } from '@/lib/founder-os/gpt-action-auth';
import {
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import { getCustomGptBrief } from '@/lib/founder-os/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const requestId = getFounderOsRequestId(request);
    const auth = authorizeCustomGptAction(request.headers);
    if (!auth.ok) {
        return founderOsJson(
            {
                success: false,
                code: auth.code,
                error: auth.code === 'NOT_CONFIGURED'
                    ? 'Custom GPT Actions are not configured.'
                    : 'Unauthorized.',
                requestId,
            },
            {
                status: auth.status,
                headers: auth.status === 401
                    ? { 'WWW-Authenticate': 'Bearer realm="Founder OS Custom GPT"' }
                    : undefined,
            }
        );
    }

    if (process.env.FOUNDER_OS_ENABLE_DATABASE !== 'true') {
        return founderOsJson(
            {
                success: false,
                code: 'FOUNDER_OS_DATABASE_DISABLED',
                error: 'Founder OS database access is disabled.',
                requestId,
            },
            { status: 503 }
        );
    }

    try {
        const brief = await getCustomGptBrief();
        return founderOsJson({ success: true, brief, requestId });
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
