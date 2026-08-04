import { createHash } from 'node:crypto';
import nodemailer from 'nodemailer';
import { NextRequest } from 'next/server';
import { FounderOsError } from '@/lib/founder-os/errors';
import {
    authorizeFounderOsRequest,
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '@/lib/founder-os/http';
import {
    beginFounderEmailExecution,
    recordFounderApprovalExecutionOutcome,
} from '@/lib/founder-os/service';
import {
    executionStartInputSchema,
    founderEmailAddressSchema,
} from '@/lib/founder-os/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function safeErrorCode(error: unknown): string {
    const raw =
        typeof error === 'object'
        && error !== null
        && 'code' in error
            ? String((error as { code?: unknown }).code)
            : 'UNCLASSIFIED';
    return raw
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '_')
        .slice(0, 64) || 'UNCLASSIFIED';
}

function smtpConfiguration() {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT ?? '465');
    if (
        !host
        || !user
        || !pass
        || !founderEmailAddressSchema.safeParse(user).success
        || !Number.isInteger(port)
        || port < 1
        || port > 65_535
    ) {
        throw new FounderOsError(
            'FOUNDER_OS_NOT_PROVISIONED',
            'SMTP configuration is incomplete or invalid.',
            503
        );
    }
    return { host, user, pass, port };
}

export async function POST(request: NextRequest) {
    const unauthorized = await authorizeFounderOsRequest(request, true);
    if (unauthorized) return unauthorized;
    const requestId = getFounderOsRequestId(request);

    try {
        const body: unknown = await request.json();
        const parsed = executionStartInputSchema.safeParse({
            ...(typeof body === 'object' && body !== null ? body : {}),
            requestId,
        });
        if (!parsed.success) {
            return founderOsJson(
                {
                    success: false,
                    code: 'INVALID_EMAIL_EXECUTION_REQUEST',
                    error: 'Approval ID and exact content hash are required.',
                    requestId,
                },
                { status: 400 }
            );
        }

        const smtp = smtpConfiguration();
        const transporter = nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: smtp.port === 465,
            auth: { user: smtp.user, pass: smtp.pass },
            connectionTimeout: 15_000,
            greetingTimeout: 15_000,
            socketTimeout: 30_000,
        });

        // Verify auth/connectivity before claiming the immutable outbox row.
        // Failure here cannot produce a recipient delivery.
        await transporter.verify();
        const claim = await beginFounderEmailExecution(parsed.data);
        const messageId = [
            'founder-os-',
            createHash('sha256')
                .update(
                    `${claim.approval.action.id}:${claim.approval.action.contentHash}`,
                    'utf8'
                )
                .digest('hex')
                .slice(0, 32),
            '@virzyguns.com',
        ].join('');

        let dispatchStarted = false;
        try {
            dispatchStarted = true;
            const receipt = await transporter.sendMail({
                from: `"Virzy Guns Production" <${smtp.user}>`,
                to: claim.recipientEmail,
                subject: claim.payload.subject,
                text: claim.payload.body,
                messageId: `<${messageId}>`,
                headers: {
                    'X-VGP-Approval-ID': claim.approval.action.id,
                    'X-VGP-Content-Hash': claim.approval.action.contentHash,
                },
            });
            const providerReference = receipt.messageId || `<${messageId}>`;
            const approval = await recordFounderApprovalExecutionOutcome({
                approvalId: claim.approval.action.id,
                status: 'SUCCEEDED',
                providerReference,
                requestId,
            });
            return founderOsJson({
                success: true,
                status: approval.status,
                approval,
                providerReference,
                requestId,
            });
        } catch (error) {
            const code = safeErrorCode(error);
            if (dispatchStarted) {
                try {
                    const approval = await recordFounderApprovalExecutionOutcome({
                        approvalId: claim.approval.action.id,
                        status: 'UNKNOWN',
                        failureReason:
                            `SMTP outcome unknown (${code}); manual reconciliation required`,
                        requestId,
                    });
                    return founderOsJson(
                        {
                            success: false,
                            status: approval.status,
                            approval,
                            error:
                                'Email outcome is unknown. Do not resend; reconcile it manually.',
                            requestId,
                        },
                        { status: 502 }
                    );
                } catch (persistenceError) {
                    console.error('Founder email outcome persistence failed', {
                        requestId,
                        approvalId: claim.approval.action.id,
                        errorCode: safeErrorCode(persistenceError),
                    });
                }
            }
            throw error;
        }
    } catch (error) {
        return founderOsErrorResponse(error, requestId);
    }
}
