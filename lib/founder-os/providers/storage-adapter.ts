import {
    getProviderConnectionSummary,
    loadProviderCredentialsForServer,
    recordProviderJobOutcome,
} from '@/lib/founder-os/provider-storage';
import type { ProviderExecutionStore } from './executor';
import { combineCredentials } from './runtime';

export const providerExecutionStore: ProviderExecutionStore = {
    async loadCredentials(connectionId) {
        const summary = await getProviderConnectionSummary(connectionId);
        if (!summary || summary.status !== 'connected') {
            throw new Error('Provider connection is not active.');
        }
        const decrypted = await loadProviderCredentialsForServer(connectionId);
        return combineCredentials(summary, decrypted);
    },

    async recordOutcome(input) {
        if (input.status === 'SUCCEEDED') {
            if (!input.providerReference) {
                throw new Error('Successful provider result requires a reference.');
            }
            await recordProviderJobOutcome({
                jobId: input.jobId,
                status: 'SUCCEEDED',
                remoteReference: input.providerReference,
                outcome: input.outcome ?? {},
                requestId: input.requestId,
            });
            return;
        }
        await recordProviderJobOutcome({
            jobId: input.jobId,
            status: input.status,
            failureReason: input.failureReason ?? 'Provider execution failed.',
            outcome: input.outcome ?? {},
            requestId: input.requestId,
        });
    },
};
