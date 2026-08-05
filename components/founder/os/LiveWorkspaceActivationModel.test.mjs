import test from 'node:test';
import assert from 'node:assert/strict';
import {
    isLiveWorkspaceConfirmation,
    LIVE_WORKSPACE_CONFIRMATION,
    liveWorkspaceActivationError,
    shouldShowLiveWorkspaceActivation,
} from './LiveWorkspaceActivationModel.ts';

test('activation card appears only for a demo snapshot backed by live database mode', () => {
    assert.equal(shouldShowLiveWorkspaceActivation('demo', true), true);
    assert.equal(shouldShowLiveWorkspaceActivation('demo', false), false);
    assert.equal(shouldShowLiveWorkspaceActivation('live', true), false);
    assert.equal(shouldShowLiveWorkspaceActivation('live', false), false);
});

test('live workspace confirmation requires the exact case-sensitive phrase', () => {
    assert.equal(
        isLiveWorkspaceConfirmation(LIVE_WORKSPACE_CONFIRMATION),
        true,
    );
    assert.equal(
        isLiveWorkspaceConfirmation(` ${LIVE_WORKSPACE_CONFIRMATION}`),
        false,
    );
    assert.equal(
        isLiveWorkspaceConfirmation(LIVE_WORKSPACE_CONFIRMATION.toLowerCase()),
        false,
    );
    assert.equal(isLiveWorkspaceConfirmation(''), false);
});

test('activation error reads supported server error shapes', () => {
    assert.equal(
        liveWorkspaceActivationError(
            { error: 'Workspace is already live.' },
            'Fallback',
        ),
        'Workspace is already live.',
    );
    assert.equal(
        liveWorkspaceActivationError(
            { error: { message: 'Database is not provisioned.' } },
            'Fallback',
        ),
        'Database is not provisioned.',
    );
    assert.equal(
        liveWorkspaceActivationError({ message: 'Request rejected.' }, 'Fallback'),
        'Request rejected.',
    );
});

test('activation error fails closed to a caller-provided fallback', () => {
    assert.equal(liveWorkspaceActivationError(null, 'Fallback'), 'Fallback');
    assert.equal(
        liveWorkspaceActivationError({ error: { code: 'NO_MESSAGE' } }, 'Fallback'),
        'Fallback',
    );
});
