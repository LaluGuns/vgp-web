import type { ApprovalStatus } from './contracts';
import { FounderOsError } from './errors';

const STANDARD_TRANSITIONS: Readonly<Record<ApprovalStatus, readonly ApprovalStatus[]>> = {
    DRAFT: ['READY_FOR_APPROVAL'],
    READY_FOR_APPROVAL: ['APPROVED'],
    APPROVED: ['EXECUTING'],
    EXECUTING: ['SUCCEEDED', 'FAILED', 'UNKNOWN'],
    SUCCEEDED: [],
    FAILED: [],
    UNKNOWN: [],
};

export interface ApprovalTransitionOptions {
    contentChanged?: boolean;
}

export function isApprovalTransitionAllowed(
    from: ApprovalStatus,
    to: ApprovalStatus,
    options: ApprovalTransitionOptions = {}
): boolean {
    if (
        options.contentChanged
        && to === 'DRAFT'
        && (from === 'READY_FOR_APPROVAL' || from === 'APPROVED')
    ) {
        return true;
    }

    return STANDARD_TRANSITIONS[from].includes(to);
}

export function assertApprovalTransition(
    from: ApprovalStatus,
    to: ApprovalStatus,
    options: ApprovalTransitionOptions = {}
): void {
    if (isApprovalTransitionAllowed(from, to, options)) return;

    throw new FounderOsError(
        'FOUNDER_OS_INVALID_TRANSITION',
        `Approval cannot transition from ${from} to ${to}.`,
        409,
        { from, to }
    );
}

export function makeApprovalOutboxKey(approvalId: string, contentHash: string): string {
    return `founder-os:approval-authorized:${approvalId}:${contentHash}`;
}

export function isExecutionTerminalStatus(
    status: ApprovalStatus
): status is Extract<ApprovalStatus, 'SUCCEEDED' | 'FAILED' | 'UNKNOWN'> {
    return status === 'SUCCEEDED' || status === 'FAILED' || status === 'UNKNOWN';
}
