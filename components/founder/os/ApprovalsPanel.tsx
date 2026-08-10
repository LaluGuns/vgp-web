'use client';

import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    CheckCircle2,
    CircleAlert,
    FileCheck2,
    Fingerprint,
    LockKeyhole,
    Mail,
    MessageCircle,
    Send,
    X,
} from 'lucide-react';
import type { ApprovalAction } from '@/lib/founder-os/contracts';
import {
    ApprovalStatusPill,
    SafetyNotice,
    SectionHeading,
    Surface,
} from './FounderOsPrimitives';

interface ApprovalContentReview {
    approval: ApprovalAction;
    prospectId: string | null;
    payload: Record<string, unknown>;
    isDemo: boolean;
}

function formatPayloadValue(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value === null) return 'null';
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value, null, 2);
}

function ExactPayloadReview({ detail }: { detail: ApprovalContentReview }) {
    const entries = Object.entries(detail.payload);
    return (
        <Surface className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">Exact database payload</p>
                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100">
                    Hash verified
                </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/40">
                This is the immutable revision the executor will claim. It is visible only to the
                authenticated founder and is never returned by the Codex Bridge.
            </p>
            <dl className="mt-4 space-y-3">
                {entries.map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-white/[0.06] bg-black/25 p-3">
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                            {key.replaceAll('_', ' ')}
                        </dt>
                        <dd className="mt-2 whitespace-pre-wrap break-words font-mono text-xs leading-5 text-white/70">
                            {formatPayloadValue(value)}
                        </dd>
                    </div>
                ))}
                {entries.length === 0 ? (
                    <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-xs text-amber-100">
                        Empty payload. Do not approve or execute this revision.
                    </div>
                ) : null}
            </dl>
            <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                <div>
                    <dt className="text-white/35">Data source</dt>
                    <dd className="mt-1 text-white/65">Founder OS private approval ledger</dd>
                </div>
                <div>
                    <dt className="text-white/35">Linked prospect</dt>
                    <dd className="mt-1 break-all text-white/65">{detail.prospectId ?? 'Not linked'}</dd>
                </div>
                <div>
                    <dt className="text-white/35">Confidence</dt>
                    <dd className="mt-1 text-white/65">Exact content-hash match, not an inferred summary</dd>
                </div>
                <div>
                    <dt className="text-white/35">Recommended action</dt>
                    <dd className="mt-1 text-white/65">Review every field before changing lifecycle state.</dd>
                </div>
            </dl>
        </Surface>
    );
}

function actionIcon(action: ApprovalAction) {
    if (action.actionType === 'outreach-send') {
        return <Mail className="h-4 w-4" aria-hidden="true" />;
    }
    if (action.actionType === 'social-reply') {
        return <MessageCircle className="h-4 w-4" aria-hidden="true" />;
    }
    if (action.actionType === 'social-publish') {
        return <Send className="h-4 w-4" aria-hidden="true" />;
    }
    return <FileCheck2 className="h-4 w-4" aria-hidden="true" />;
}

function ApprovalReviewDialog({
    approval,
    onClose,
    live,
    onTransitioned,
}: {
    approval: ApprovalAction;
    onClose: () => void;
    live: boolean;
    onTransitioned: (approval: ApprovalAction) => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = `approval-${approval.id}`;
    const [transitionState, setTransitionState] = useState<{
        status: 'idle' | 'saving' | 'error';
        target: 'READY_FOR_APPROVAL' | 'APPROVED' | null;
        message: string | null;
    }>({ status: 'idle', target: null, message: null });
    const [executionState, setExecutionState] = useState<{
        status: 'idle' | 'executing' | 'error';
        message: string | null;
    }>({ status: 'idle', message: null });
    const [contentReview, setContentReview] = useState<{
        status: 'idle' | 'loading' | 'ready' | 'error';
        detail: ApprovalContentReview | null;
        message: string | null;
    }>(() => live
        ? { status: 'loading', detail: null, message: null }
        : { status: 'idle', detail: null, message: null });

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        dialog.showModal();
        return () => {
            if (dialog.open) dialog.close();
        };
    }, []);

    useEffect(() => {
        if (!live) return;
        const controller = new AbortController();
        void fetch(
            `/api/founder/os/approvals/${encodeURIComponent(approval.id)}/content`,
            { cache: 'no-store', signal: controller.signal },
        )
            .then(async (response) => {
                const result = (await response.json().catch(() => null)) as {
                    success?: boolean;
                    approval?: ApprovalAction;
                    prospectId?: string | null;
                    payload?: Record<string, unknown>;
                    isDemo?: boolean;
                    error?: string;
                } | null;
                if (!response.ok || !result?.success || !result.approval || !result.payload) {
                    throw new Error(result?.error || 'Exact approval payload could not be loaded.');
                }
                if (result.approval.contentHash !== approval.contentHash) {
                    throw new Error('This approval changed after the list loaded. Close and refresh before review.');
                }
                setContentReview({
                    status: 'ready',
                    detail: {
                        approval: result.approval,
                        prospectId: result.prospectId ?? null,
                        payload: result.payload,
                        isDemo: result.isDemo ?? false,
                    },
                    message: null,
                });
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                setContentReview({
                    status: 'error',
                    detail: null,
                    message: error instanceof Error ? error.message : 'Exact approval payload could not be loaded.',
                });
            });
        return () => controller.abort();
    }, [approval.contentHash, approval.id, live]);

    const exactPayloadVerified =
        contentReview.status === 'ready'
        && contentReview.detail?.approval.contentHash === approval.contentHash
        && Object.keys(contentReview.detail.payload).length > 0;

    const transitionExactRevision = async (
        targetStatus: 'READY_FOR_APPROVAL' | 'APPROVED',
    ) => {
        const allowed =
            (approval.status === 'DRAFT' && targetStatus === 'READY_FOR_APPROVAL') ||
            (approval.status === 'READY_FOR_APPROVAL' && targetStatus === 'APPROVED');
        if (!live || !allowed || !exactPayloadVerified) return;

        setTransitionState({ status: 'saving', target: targetStatus, message: null });
        try {
            const response = await fetch(
                `/api/founder/os/approvals/${encodeURIComponent(approval.id)}/transition`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        targetStatus,
                        expectedContentHash: approval.contentHash,
                    }),
                },
            );
            const result = (await response.json()) as {
                success?: boolean;
                approval?: ApprovalAction;
                error?: string;
            };
            if (!response.ok || !result.success || !result.approval) {
                throw new Error(
                    result.error ||
                        (targetStatus === 'READY_FOR_APPROVAL'
                            ? 'Draft could not be staged for approval.'
                            : 'Approval could not be recorded.'),
                );
            }
            onTransitioned(result.approval);
            onClose();
        } catch (error) {
            setTransitionState({
                status: 'error',
                target: targetStatus,
                message:
                    error instanceof Error
                        ? error.message
                        : targetStatus === 'READY_FOR_APPROVAL'
                            ? 'Draft could not be staged for approval.'
                            : 'Approval could not be recorded.',
            });
        }
    };

    const executeExactRevision = async () => {
        if (!live || approval.status !== 'APPROVED' || !exactPayloadVerified) return;

        const isEmail =
            approval.actionType === 'outreach-send' && approval.channel === 'email';
        const isProviderPublish =
            approval.actionType === 'social-publish' &&
            (approval.channel === 'instagram' || approval.channel === 'tiktok');
        if (!isEmail && !isProviderPublish) return;

        const endpoint = isEmail
            ? '/api/founder/os/email/actions/execute'
            : `/api/founder/os/providers/${
                approval.channel === 'instagram' ? 'meta' : 'tiktok'
            }/actions/execute`;

        setExecutionState({ status: 'executing', message: null });
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    approvalId: approval.id,
                    expectedContentHash: approval.contentHash,
                    ...(isProviderPublish ? { jobType: 'content_publish' } : {}),
                }),
            });
            const result = (await response.json().catch(() => null)) as {
                success?: boolean;
                status?: ApprovalAction['status'];
                approval?: ApprovalAction;
                providerReference?: string | null;
                error?: string;
            } | null;

            if (result?.approval) {
                onTransitioned(result.approval);
                if (result.approval.status === 'SUCCEEDED') {
                    onClose();
                    return;
                }
            } else if (
                result?.status &&
                ['SUCCEEDED', 'FAILED', 'UNKNOWN'].includes(result.status)
            ) {
                onTransitioned({
                    ...approval,
                    status: result.status,
                    providerReference:
                        result.providerReference ?? approval.providerReference,
                    failureReason:
                        result.status === 'SUCCEEDED'
                            ? null
                            : result.error ?? 'Provider outcome requires review.',
                    executedAt:
                        result.status === 'SUCCEEDED'
                            ? new Date().toISOString()
                            : approval.executedAt,
                    updatedAt: new Date().toISOString(),
                });
                if (result.status === 'SUCCEEDED') {
                    onClose();
                    return;
                }
            }

            if (!response.ok || !result?.success) {
                throw new Error(
                    result?.error ||
                        'Execution did not complete. Inspect the recorded status before retrying.',
                );
            }
        } catch (error) {
            setExecutionState({
                status: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Execution did not complete. Inspect the recorded status before retrying.',
            });
        }
    };

    const executableEmail =
        approval.actionType === 'outreach-send' && approval.channel === 'email';
    const executableProviderPublish =
        approval.actionType === 'social-publish' &&
        (approval.channel === 'instagram' || approval.channel === 'tiktok');
    const hasExplicitExecutor = executableEmail || executableProviderPublish;

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            className="m-0 ml-auto h-dvh max-h-none w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#030b11] p-0 text-white shadow-[-32px_0_100px_rgba(0,0,0,0.65)] backdrop:bg-black/75 backdrop:backdrop-blur-sm"
        >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/[0.08] bg-[#030b11]/95 px-5 py-5 backdrop-blur-xl sm:px-7">
                <div>
                    <ApprovalStatusPill status={approval.status} />
                    <h2 id={titleId} className="mt-3 text-xl font-semibold tracking-[-0.03em]">
                        {approval.targetLabel}
                    </h2>
                    <p className="mt-1 text-xs capitalize text-white/40">
                        {approval.actionType.replaceAll('-', ' ')} · {approval.channel}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                    aria-label="Close approval review"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="space-y-5 px-5 py-6 sm:px-7">
                <Surface className="p-5">
                    <p className="text-xs font-medium text-white/40">Exact payload summary</p>
                    <p className="mt-3 text-sm leading-6 text-white/70">{approval.payloadSummary}</p>
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-black/25 p-3">
                        <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-sky-200" aria-hidden="true" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/35">
                                Content hash
                            </p>
                            <p className="mt-1 break-all font-mono text-[10px] text-white/55">
                                {approval.contentHash}
                            </p>
                        </div>
                    </div>
                </Surface>

                {live ? (
                    contentReview.status === 'ready' && contentReview.detail ? (
                        <ExactPayloadReview detail={contentReview.detail} />
                    ) : (
                        <SafetyNotice title="Exact payload review required" tone="warning">
                            {contentReview.status === 'loading'
                                ? 'Loading the private approval payload and verifying its content hash.'
                                : contentReview.message
                                    ?? 'The exact payload is unavailable. Close this review and retry; approval and execution stay disabled.'}
                        </SafetyNotice>
                    )
                ) : null}

                <Surface className="p-5">
                    <p className="text-sm font-semibold">Execution checklist</p>
                    <ul className="mt-4 space-y-3">
                        {[
                            'Target and contact permission must be revalidated.',
                            'Content hash must match the reviewed revision.',
                            'Offer and links must pass deterministic policy checks.',
                            'A new revision invalidates this approval.',
                            'Provider success must be reconciled before completion.',
                        ].map((item) => (
                            <li key={item} className="flex gap-3 text-xs leading-5 text-white/55">
                                <CheckCircle2
                                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200"
                                    aria-hidden="true"
                                />
                                {item}
                            </li>
                        ))}
                    </ul>
                </Surface>

                {approval.channel === 'instagram' || approval.channel === 'tiktok' ? (
                    <SafetyNotice title="Social delivery restriction" tone="warning">
                        Cold social DMs are blocked. Eligible execution is limited to approved posts and
                        verified inbound Instagram replies. TikTok Upload to Draft is preferred; Direct
                        Post remains separately audit-gated, and TikTok replies are not enabled by account
                        connection alone.
                    </SafetyNotice>
                ) : (
                    <SafetyNotice title="Approval does not mean blind execution" tone="safe">
                        Email still requires recipient revalidation, suppression checks, idempotency, and a
                        provider result before it can become succeeded.
                    </SafetyNotice>
                )}

                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-white/45" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-semibold text-white/75">
                                {live && approval.status === 'DRAFT'
                                    ? 'Stage exact revision for review'
                                    : live && approval.status === 'READY_FOR_APPROVAL'
                                        ? 'Exact-revision approval'
                                        : live && approval.status === 'APPROVED'
                                            ? 'External execution boundary'
                                            : live
                                                ? 'Execution result'
                                        : 'Demo execution lock'}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-white/40">
                                {live && approval.status === 'DRAFT'
                                    ? 'Staging binds this content hash to READY FOR APPROVAL. It does not approve, authorize execution, send, or publish.'
                                    : live && approval.status === 'READY_FOR_APPROVAL'
                                        ? 'Approval records this exact content hash and creates a held outbox item. It does not send or publish.'
                                        : live && approval.status === 'APPROVED'
                                            ? hasExplicitExecutor
                                                ? 'This separate click performs the approved external action. Verify the target and payload again before continuing.'
                                                : approval.actionType === 'social-reply'
                                                    ? 'Replies execute only from a verified, unexpired inbound event. This generic queue cannot bypass that claim.'
                                                    : 'This action has no enabled executor.'
                                            : live
                                                ? 'This revision is no longer executable. Review the recorded provider result and reconcile UNKNOWN outcomes manually.'
                                    : 'This demo cannot approve, reject, send, or publish. Provision the private database to enable audited approval transitions.'}
                            </p>
                            {transitionState.message ? (
                                <p className="mt-2 text-xs text-rose-200">
                                    {transitionState.message}
                                </p>
                            ) : null}
                            {executionState.message ? (
                                <p className="mt-2 text-xs text-rose-200">
                                    {executionState.message}
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            disabled
                            className="min-h-11 cursor-not-allowed rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm font-medium text-white/25"
                        >
                            Reject revision
                        </button>
                        {approval.status === 'DRAFT' ? (
                            <button
                                type="button"
                            disabled={!live || !exactPayloadVerified || transitionState.status === 'saving'}
                                onClick={() => void transitionExactRevision('READY_FOR_APPROVAL')}
                                className="min-h-11 rounded-xl border border-amber-300/20 bg-amber-300/[0.08] px-4 text-sm font-medium text-amber-100 transition hover:bg-amber-300/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                {transitionState.status === 'saving' &&
                                transitionState.target === 'READY_FOR_APPROVAL'
                                    ? 'Staging...'
                                    : 'Stage for approval'}
                            </button>
                        ) : approval.status === 'READY_FOR_APPROVAL' ? (
                            <button
                                type="button"
                                disabled={
                                    !live
                                    || !exactPayloadVerified
                                    || approval.status !== 'READY_FOR_APPROVAL'
                                    || transitionState.status === 'saving'
                                }
                                onClick={() => void transitionExactRevision('APPROVED')}
                                className="min-h-11 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.08] px-4 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                {transitionState.status === 'saving' &&
                                transitionState.target === 'APPROVED'
                                    ? 'Approving...'
                                    : 'Approve exact revision'}
                            </button>
                        ) : approval.status === 'APPROVED' && hasExplicitExecutor ? (
                            <button
                                type="button"
                                disabled={!live || !exactPayloadVerified || executionState.status === 'executing'}
                                onClick={() => void executeExactRevision()}
                                className="min-h-11 rounded-xl border border-rose-300/25 bg-rose-300/[0.09] px-4 text-sm font-medium text-rose-100 transition hover:bg-rose-300/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                {executionState.status === 'executing'
                                    ? 'Executing...'
                                    : executableEmail
                                        ? 'Send approved email'
                                        : 'Execute approved provider action'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="min-h-11 cursor-not-allowed rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm font-medium text-white/25"
                            >
                                {approval.actionType === 'social-reply'
                                    ? 'Verified inbound workflow required'
                                    : 'No executable action'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </dialog>
    );
}

export function ApprovalsPanel({
    approvals,
    live,
    filter,
}: {
    approvals: ApprovalAction[];
    live: boolean;
    filter?: 'drafts' | 'queue';
}) {
    const [approvalRows, setApprovalRows] = useState(approvals);
    const visibleRows = filter === 'drafts'
        ? approvalRows.filter((approval) => approval.status === 'DRAFT')
        : filter === 'queue'
            ? approvalRows.filter((approval) => approval.status === 'READY_FOR_APPROVAL')
            : approvalRows;
    const [selectedApproval, setSelectedApproval] = useState<ApprovalAction | null>(null);
    const readyCount = approvalRows.filter(
        (approval) => approval.status === 'READY_FOR_APPROVAL',
    ).length;

    const updateApproval = (updated: ApprovalAction) => {
        setApprovalRows((current) =>
            current.map((approval) =>
                approval.id === updated.id ? updated : approval,
            ),
        );
    };

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow={filter === 'drafts' ? 'Draft workspace' : 'Human execution boundary'}
                title={filter === 'drafts' ? 'Drafts are visible, but not executable.' : filter === 'queue' ? 'Only exact revisions enter the approval queue.' : 'Review the exact revision before anything leaves VGP.'}
                description={filter === 'drafts' ? 'A draft has no authority to send, reply, or publish. Stage a specific revision before founder review.' : 'Approval is bound to the target, content hash, links, channel, and offer. Editing any one of them requires a fresh review.'}
                action={
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-2 text-xs text-amber-100">
                        <CircleAlert className="h-4 w-4" aria-hidden="true" />
                        {readyCount} waiting
                    </span>
                }
            />

            <div className="grid gap-3 sm:grid-cols-3">
                <Surface className="p-4">
                    <p className="text-xs text-white/40">Ready for review</p>
                    <p className="mt-2 text-2xl font-semibold">{readyCount}</p>
                    <p className="mt-1 text-[11px] text-white/35">No bulk approval</p>
                </Surface>
                <Surface className="p-4">
                    <p className="text-xs text-white/40">Draft only</p>
                    <p className="mt-2 text-2xl font-semibold">
                        {approvalRows.filter((approval) => approval.status === 'DRAFT').length}
                    </p>
                    <p className="mt-1 text-[11px] text-white/35">Not executable</p>
                </Surface>
                <Surface className="p-4">
                    <p className="text-xs text-white/40">Unknown provider state</p>
                    <p className="mt-2 text-2xl font-semibold">
                        {approvalRows.filter((approval) => approval.status === 'UNKNOWN').length}
                    </p>
                    <p className="mt-1 text-[11px] text-white/35">Requires reconciliation</p>
                </Surface>
            </div>

            <Surface className="overflow-hidden">
                <div className="border-b border-white/[0.07] px-5 py-4">
                    <p className="text-sm font-semibold">{filter === 'drafts' ? 'Draft inventory' : filter === 'queue' ? 'Approval queue' : 'Approval history'}</p>
                    <p className="mt-1 text-xs text-white/35">
                        Every item is reviewed independently; a sequence never grants future-step approval.
                    </p>
                </div>
                <div className="divide-y divide-white/[0.06]">
                    {visibleRows.map((approval) => (
                        <article
                            key={approval.id}
                            className="grid gap-4 px-5 py-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center"
                        >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/55">
                                {actionIcon(approval)}
                            </span>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="truncate text-sm font-semibold">{approval.targetLabel}</h3>
                                    <ApprovalStatusPill status={approval.status} />
                                </div>
                                <p className="mt-2 text-xs leading-5 text-white/45">
                                    {approval.payloadSummary}
                                </p>
                                <p className="mt-2 truncate font-mono text-[9px] uppercase tracking-[0.1em] text-white/25">
                                    {approval.contentHash}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedApproval(approval)}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-medium text-white/70 transition hover:border-sky-300/20 hover:bg-sky-300/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                            >
                                Review payload
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </article>
                    ))}
                    {visibleRows.length === 0 ? (
                        <p className="px-5 py-8 text-sm text-white/40">No records match this operational view. This is not evidence that an action has executed.</p>
                    ) : null}
                </div>
            </Surface>

            {selectedApproval ? (
                <ApprovalReviewDialog
                    approval={selectedApproval}
                    onClose={() => setSelectedApproval(null)}
                    live={live}
                    onTransitioned={updateApproval}
                />
            ) : null}
        </div>
    );
}
