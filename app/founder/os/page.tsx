import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FounderOsClient } from '@/components/founder/os/FounderOsClient';
import { checkFounderSession } from '@/lib/auth';
import { getAllBeats } from '@/lib/catalog';
import { isFounderOsError } from '@/lib/founder-os/errors';
import { founderOsService } from '@/lib/founder-os/service';
import {
    DEMO_BEAT_DIRECTORY,
    DEMO_FOUNDER_OS_SNAPSHOT,
    DEMO_INTELLIGENCE_SIGNALS,
} from './demo-data';
import {
    buildLiveBeatDirectory,
    buildLiveIntelligenceSignals,
} from './live-view-model';

export const metadata: Metadata = {
    title: 'Founder OS',
    description: 'Private VGP founder operating system for evidence, agents, and approvals.',
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
};

/**
 * The page is intentionally a Server Component.
 *
 * Production replacement:
 * 1. Load the canonical FounderDashboardSnapshot from the authenticated data service.
 * 2. Pass only JSON-serializable values to FounderOsClient.
 * 3. Keep all provider credentials and external-action execution on the server.
 */
export default async function FounderOsPage() {
    if (!(await checkFounderSession())) {
        redirect('/founder');
    }

    const liveDatabaseEnabled = process.env.FOUNDER_OS_ENABLE_DATABASE === 'true';
    let snapshot = DEMO_FOUNDER_OS_SNAPSHOT;
    if (liveDatabaseEnabled) {
        try {
            snapshot = await founderOsService.getSnapshot();
        } catch (error) {
            if (
                !isFounderOsError(error)
                || error.code !== 'FOUNDER_OS_NOT_PROVISIONED'
            ) {
                throw error;
            }
        }
    }

    const liveCatalog = snapshot.mode === 'live' ? getAllBeats() : [];
    const beatDirectory =
        snapshot.mode === 'live'
            ? buildLiveBeatDirectory(
                  snapshot.prospects.flatMap((prospect) => prospect.matchedBeatIds),
                  liveCatalog,
              )
            : DEMO_BEAT_DIRECTORY;
    const intelligenceSignals =
        snapshot.mode === 'live'
            ? buildLiveIntelligenceSignals(
                  liveCatalog.length,
                  snapshot.prospects.length,
              )
            : DEMO_INTELLIGENCE_SIGNALS;

    return (
        <FounderOsClient
            snapshot={snapshot}
            beatDirectory={beatDirectory}
            intelligenceSignals={intelligenceSignals}
            liveDatabaseEnabled={liveDatabaseEnabled}
        />
    );
}
