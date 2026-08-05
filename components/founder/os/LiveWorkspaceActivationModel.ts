export const LIVE_WORKSPACE_CONFIRMATION = 'ACTIVATE_LIVE_WORKSPACE' as const;

export function shouldShowLiveWorkspaceActivation(
    snapshotMode: 'demo' | 'live',
    liveDatabaseEnabled: boolean,
): boolean {
    return snapshotMode === 'demo' && liveDatabaseEnabled;
}

export function isLiveWorkspaceConfirmation(value: string): boolean {
    return value === LIVE_WORKSPACE_CONFIRMATION;
}

export function liveWorkspaceActivationError(
    payload: unknown,
    fallback: string,
): string {
    if (typeof payload !== 'object' || payload === null) return fallback;
    const record = payload as Record<string, unknown>;
    if (typeof record.error === 'string' && record.error.trim()) {
        return record.error.trim().slice(0, 280);
    }
    if (typeof record.message === 'string' && record.message.trim()) {
        return record.message.trim().slice(0, 280);
    }
    if (
        typeof record.error === 'object' &&
        record.error !== null &&
        typeof (record.error as Record<string, unknown>).message === 'string'
    ) {
        return ((record.error as Record<string, unknown>).message as string)
            .trim()
            .slice(0, 280) || fallback;
    }
    return fallback;
}
