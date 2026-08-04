import { NextRequest } from 'next/server';
import { authorizeCustomGptAction } from '@/lib/founder-os/gpt-action-auth';
import {
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import { customGptProspectInputSchema } from '@/lib/founder-os/leads/action-validation';
import { createCustomGptProspect } from '@/lib/founder-os/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
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
        const parsed = customGptProspectInputSchema.safeParse(
            await request.json()
        );
        if (!parsed.success) {
            return founderOsJson(
                {
                    success: false,
                    code: 'INVALID_CUSTOM_GPT_PROSPECT',
                    error: 'Prospect handoff is invalid.',
                    issues: parsed.error.issues.map((issue) => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                    })),
                    requestId,
                },
                { status: 400 }
            );
        }
        const result = await createCustomGptProspect(parsed.data, requestId);
        return founderOsJson(
            { success: true, result, requestId },
            { status: result.created ? 201 : 200 }
        );
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
