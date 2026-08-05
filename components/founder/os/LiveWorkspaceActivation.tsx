'use client';

import { CircleAlert, DatabaseZap, LoaderCircle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Surface } from './FounderOsPrimitives';
import {
    isLiveWorkspaceConfirmation,
    LIVE_WORKSPACE_CONFIRMATION,
    liveWorkspaceActivationError,
} from './LiveWorkspaceActivationModel';

type ActivationState =
    | { status: 'idle'; message: null }
    | { status: 'saving'; message: null }
    | { status: 'error'; message: string }
    | { status: 'success'; message: string };

export function LiveWorkspaceActivation() {
    const [confirmation, setConfirmation] = useState('');
    const [activationState, setActivationState] = useState<ActivationState>({
        status: 'idle',
        message: null,
    });
    const confirmed = isLiveWorkspaceConfirmation(confirmation);

    const activateLiveWorkspace = async () => {
        if (!confirmed || activationState.status === 'saving') return;

        setActivationState({ status: 'saving', message: null });
        try {
            const response = await fetch('/api/founder/os/workspace/live', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    confirmation: LIVE_WORKSPACE_CONFIRMATION,
                }),
            });
            let payload: unknown = null;
            try {
                payload = await response.json();
            } catch {
                // HTTP status remains authoritative if the response body is empty.
            }

            const succeeded =
                response.ok &&
                typeof payload === 'object' &&
                payload !== null &&
                (payload as Record<string, unknown>).success === true;
            if (!succeeded) {
                throw new Error(
                    liveWorkspaceActivationError(
                        payload,
                        `Live workspace activation failed with HTTP ${response.status}.`,
                    ),
                );
            }

            setActivationState({
                status: 'success',
                message: 'Live workspace activated. Refreshing the canonical snapshot…',
            });
            window.location.reload();
        } catch (error) {
            setActivationState({
                status: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Live workspace activation failed.',
            });
        }
    };

    return (
        <Surface className="overflow-hidden border-rose-300/20">
            <div className="border-b border-rose-300/10 bg-rose-300/[0.045] px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-300/[0.08] text-rose-100">
                        <DatabaseZap className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-rose-200/70">
                            Irreversible workspace transition
                        </p>
                        <h3 className="mt-1.5 text-base font-semibold">
                            Activate live workspace
                        </h3>
                        <p className="mt-2 max-w-3xl text-xs leading-5 text-white/45">
                            This deletes only rows marked as synthetic Founder OS demo data, then
                            enables real GPT-created drafts and official provider records as the
                            canonical workspace. Real records are not part of the demo-row deletion.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
                <div className="flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.055] p-4 text-amber-100">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <div>
                        <p className="text-xs font-semibold">No automatic undo</p>
                        <p className="mt-1 text-[11px] leading-5 text-white/50">
                            Activation cannot be reversed automatically. The server will refuse the
                            request unless the private database is provisioned and still in demo mode.
                        </p>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="activate-live-workspace-confirmation"
                        className="text-xs font-semibold text-white/65"
                    >
                        Type{' '}
                        <code className="rounded bg-white/[0.06] px-1.5 py-1 font-mono text-[11px] text-rose-100">
                            {LIVE_WORKSPACE_CONFIRMATION}
                        </code>{' '}
                        to continue
                    </label>
                    <input
                        id="activate-live-workspace-confirmation"
                        value={confirmation}
                        onChange={(event) => {
                            setConfirmation(event.target.value);
                            if (activationState.status === 'error') {
                                setActivationState({ status: 'idle', message: null });
                            }
                        }}
                        disabled={
                            activationState.status === 'saving' ||
                            activationState.status === 'success'
                        }
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        aria-describedby="activate-live-workspace-help"
                        className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 font-mono text-xs text-white/75 outline-none transition placeholder:text-white/20 focus:border-rose-300/30 focus:ring-2 focus:ring-rose-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={LIVE_WORKSPACE_CONFIRMATION}
                    />
                    <p
                        id="activate-live-workspace-help"
                        className="mt-2 text-[11px] leading-5 text-white/32"
                    >
                        Matching is exact and case-sensitive. This confirmation does not bypass
                        server authentication or workspace-state validation.
                    </p>
                </div>

                {activationState.message ? (
                    <p
                        role={activationState.status === 'error' ? 'alert' : 'status'}
                        className={`flex gap-2 rounded-xl border p-3 text-xs leading-5 ${
                            activationState.status === 'error'
                                ? 'border-rose-300/20 bg-rose-300/[0.06] text-rose-100'
                                : 'border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100'
                        }`}
                    >
                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{activationState.message}</span>
                    </p>
                ) : null}

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => void activateLiveWorkspace()}
                        disabled={
                            !confirmed ||
                            activationState.status === 'saving' ||
                            activationState.status === 'success'
                        }
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-300/25 bg-rose-300/[0.09] px-4 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        {activationState.status === 'saving' ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <DatabaseZap className="h-4 w-4" aria-hidden="true" />
                        )}
                        {activationState.status === 'saving'
                            ? 'Activating live workspace…'
                            : 'Activate live workspace'}
                    </button>
                </div>
            </div>
        </Surface>
    );
}
