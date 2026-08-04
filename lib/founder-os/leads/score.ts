import type {
    ContactPermission,
    Prospect,
    ProspectScoreBreakdown,
    ProspectSegment,
} from '../contracts.ts';
import type {
    IngestedLeadCandidate,
    QualificationTier,
    ScoredLeadCandidate,
    SignalStrength,
} from './types.ts';

const AUDIENCE_POINTS: Record<SignalStrength, number> = {
    high: 20,
    medium: 14,
    low: 7,
    none: 0,
};

const STYLE_POINTS: Record<SignalStrength, number> = {
    high: 30,
    medium: 21,
    low: 10,
    none: 0,
};

const PURCHASE_POINTS: Record<SignalStrength, number> = {
    high: 20,
    medium: 14,
    low: 7,
    none: 0,
};

const CONTACT_POINTS: Record<ContactPermission, number> = {
    'verified-opt-in': 20,
    'public-business-email': 16,
    'manual-only': 5,
    blocked: 0,
};

const SEGMENT_PRIORITY: Record<ProspectSegment, 0 | 1 | 2> = {
    rapper: 0,
    'game-developer': 1,
    'content-creator': 2,
};

function freshnessPoints(freshness: IngestedLeadCandidate['freshness']): number {
    if (freshness === 'fresh') return 10;
    if (freshness === 'stale') return 3;
    return 0;
}

function tierForScore(score: number, threshold: number): QualificationTier {
    if (score >= threshold) return 'qualified';
    if (score >= 50) return 'near-match';
    return 'excluded';
}

export function scoreLeadCandidate(
    candidate: IngestedLeadCandidate,
    scoreThreshold = 70,
): ScoredLeadCandidate {
    if (!Number.isInteger(scoreThreshold) || scoreThreshold < 50 || scoreThreshold > 90) {
        throw new RangeError('scoreThreshold must be an integer between 50 and 90.');
    }

    const { input } = candidate;
    const scoreBreakdown: ProspectScoreBreakdown = {
        audienceFit: AUDIENCE_POINTS[input.qualificationSignals.audienceFit.strength],
        styleFit: STYLE_POINTS[input.qualificationSignals.styleFit.strength],
        purchaseIntent: PURCHASE_POINTS[input.qualificationSignals.purchaseIntent.strength],
        contactability: CONTACT_POINTS[input.contact.permission],
        freshness: freshnessPoints(candidate.freshness),
    };

    const score = Object.values(scoreBreakdown).reduce((total, points) => total + points, 0);
    const signals = Object.values(input.qualificationSignals).flatMap((signal) =>
        signal.strength !== 'none' && signal.note ? [signal.note] : [],
    );
    const gaps = [...candidate.ingestionGaps];

    if (input.qualificationSignals.audienceFit.strength === 'none') {
        gaps.push('Audience fit is unsupported.');
    } else if (input.qualificationSignals.audienceFit.strength === 'low') {
        gaps.push('Audience fit has only weak evidence.');
    }
    if (input.qualificationSignals.styleFit.strength === 'none') {
        gaps.push('Style fit is unsupported.');
    } else if (input.qualificationSignals.styleFit.strength === 'low') {
        gaps.push('Style fit has only weak evidence.');
    }
    if (input.qualificationSignals.purchaseIntent.strength === 'none') {
        gaps.push('No current purchase-intent or active-project signal is supported.');
    } else if (input.qualificationSignals.purchaseIntent.strength === 'low') {
        gaps.push('Purchase intent has only weak evidence.');
    }
    if (input.contact.permission === 'manual-only') {
        gaps.push('Email outreach is not eligible; social copy can only be a manual founder handoff.');
    } else if (input.contact.permission === 'blocked') {
        gaps.push('Outreach is blocked regardless of fit score.');
    }
    if (input.segment !== 'rapper') {
        gaps.push('Usage rights and price require a custom sync inquiry.');
    }

    let tier = tierForScore(score, scoreThreshold);
    if (input.contact.permission === 'blocked') {
        tier = 'excluded';
    } else if (candidate.matchedBeats.length === 0 && tier === 'qualified') {
        tier = 'near-match';
        gaps.push('A verified beat match is required before qualification.');
    }

    const prospect: Prospect = {
        id: input.id,
        displayName: input.displayName,
        handle: input.handle,
        segment: input.segment,
        market: input.market,
        platform: input.platform,
        profileUrl: input.profileUrl,
        businessEmail: input.contact.businessEmail,
        contactPermission: input.contact.permission,
        score,
        scoreBreakdown,
        matchedBeatIds: candidate.matchedBeats.map((beat) => beat.beatId),
        signals,
        gaps: [...new Set(gaps)],
        evidence: candidate.evidence,
        lastObservedAt: candidate.lastObservedAt,
    };

    return {
        prospect,
        tier,
        priorityRank: SEGMENT_PRIORITY[input.segment],
        scoreBreakdown,
        matchedBeats: candidate.matchedBeats,
        evidenceFreshness: candidate.freshness,
    };
}

export function prioritizeLeadCandidates(
    candidates: readonly ScoredLeadCandidate[],
): ScoredLeadCandidate[] {
    const tierRank: Record<QualificationTier, number> = {
        qualified: 0,
        'near-match': 1,
        excluded: 2,
    };

    return [...candidates].sort((left, right) => {
        const byTier = tierRank[left.tier] - tierRank[right.tier];
        if (byTier !== 0) return byTier;
        const bySegment = left.priorityRank - right.priorityRank;
        if (bySegment !== 0) return bySegment;
        const byScore = right.prospect.score - left.prospect.score;
        if (byScore !== 0) return byScore;
        return left.prospect.id.localeCompare(right.prospect.id);
    });
}
