import { createHash } from 'node:crypto';
import type { FounderMarket } from '../contracts.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
import { describeOffer, offerForSegment } from './offer-policy.ts';
import type {
    LeadOffer,
    OutreachDraftPlan,
    OutreachDraftStep,
    ScoredLeadCandidate,
} from './types.ts';

interface DraftText {
    subject: string | null;
    body: string;
    backTranslation: string | null;
}

const STOP_CONDITIONS = [
    'reply-received',
    'bounce',
    'opt-out',
    'suppressed',
    'founder-stopped',
] as const;

function beatLinks(candidate: ScoredLeadCandidate): string {
    return candidate.matchedBeats
        .slice(0, 3)
        .map((beat) => `${beat.title}: ${beat.publicUrl}`)
        .join('\n');
}

function englishOfferLine(offer: LeadOffer): string {
    if (offer.kind === 'canonical-basic-mp3') {
        return `The owner-confirmed Basic MP3 license is $15 for music recording, up to 2,000 copies, 5,000 online audio streams, and one music video.`;
    }
    return 'Because this is a sync use case, I would scope a custom inquiry first; no price or usage rights are assumed before written confirmation.';
}

function japaneseOfferLine(offer: LeadOffer): string {
    if (offer.kind === 'canonical-basic-mp3') {
        return 'オーナー確認済みのBasic MP3ライセンスは15米ドルで、音楽録音、最大2,000部、オンライン音声ストリーム5,000回、ミュージックビデオ1本までが対象です。';
    }
    return 'これは同期利用にあたるため、まずカスタム問い合わせで用途を確認します。書面で確認する前に価格や利用権を確約することはありません。';
}

function germanOfferLine(offer: LeadOffer): string {
    if (offer.kind === 'canonical-basic-mp3') {
        return 'Die vom Inhaber bestätigte Basic-MP3-Lizenz kostet 15 US-Dollar und gilt für Musikaufnahmen mit bis zu 2.000 Kopien, 5.000 Online-Audiostreams und einem Musikvideo.';
    }
    return 'Da es sich um eine Sync-Nutzung handelt, würde ich zuerst den Umfang über eine individuelle Anfrage klären; Preis und Nutzungsrechte werden erst nach schriftlicher Bestätigung zugesagt.';
}

function englishDrafts(
    candidate: ScoredLeadCandidate,
    offer: LeadOffer,
): [DraftText, DraftText, DraftText] {
    const name = candidate.prospect.displayName;
    const signal =
        candidate.prospect.signals[0] ??
        'your recent public work and its fit with the VGP catalog';
    const links = beatLinks(candidate);
    const offerLine = englishOfferLine(offer);

    const firstBody = [
        `Hi ${name},`,
        '',
        `I came across ${signal}. I matched that direction against the verified VGP catalog and shortlisted these tracks:`,
        links,
        '',
        offerLine,
        '',
        'If the direction is relevant, reply and I can narrow the shortlist around the actual project.',
        '',
        '— Virzy Guns',
    ].join('\n');

    const secondBody = [
        `Hi ${name},`,
        '',
        'Quick follow-up in case the first note arrived at a busy time. I can also prepare a tighter alternate shortlist around the exact vocal, trailer, or video direction.',
        '',
        offerLine,
        '',
        'If it is not a current need, no problem.',
        '',
        '— Virzy Guns',
    ].join('\n');

    const thirdBody = [
        `Hi ${name},`,
        '',
        'Closing the loop on the VGP beat shortlist. I will not keep following up if the timing or direction is not relevant.',
        '',
        'If a future project needs a cyberpunk, phonk, trap, or synthwave direction, you can reply to reopen the conversation.',
        '',
        '— Virzy Guns',
    ].join('\n');

    return [
        {
            subject: `Beat shortlist for ${name}`,
            body: firstBody,
            backTranslation: null,
        },
        {
            subject: `Re: Beat shortlist for ${name}`,
            body: secondBody,
            backTranslation: null,
        },
        {
            subject: `Closing the loop — VGP beat shortlist`,
            body: thirdBody,
            backTranslation: null,
        },
    ];
}

function japaneseDrafts(
    candidate: ScoredLeadCandidate,
    offer: LeadOffer,
): [DraftText, DraftText, DraftText] {
    const english = englishDrafts(candidate, offer);
    const name = candidate.prospect.displayName;
    const signal =
        candidate.prospect.signals[0] ??
        '最近公開された作品とVGPカタログとの方向性の一致';
    const links = beatLinks(candidate);
    const offerLine = japaneseOfferLine(offer);

    return [
        {
            subject: `${name}さん向けビート候補`,
            body: [
                `${name}さん、こんにちは。`,
                '',
                `${signal}を拝見し、確認済みのVGPカタログから方向性が近い楽曲を選びました。`,
                links,
                '',
                offerLine,
                '',
                '方向性が合いそうでしたら、実際のプロジェクトに合わせて候補をさらに絞り込みます。',
                '',
                'Virzy Guns',
            ].join('\n'),
            backTranslation: english[0].body,
        },
        {
            subject: `Re: ${name}さん向けビート候補`,
            body: [
                `${name}さん、こんにちは。`,
                '',
                '前回のご連絡について、念のため一度だけフォローアップします。ボーカル、トレーラー、動画など、実際の方向性に合わせた別の候補も用意できます。',
                '',
                offerLine,
                '',
                '現在必要でなければ、もちろん問題ありません。',
                '',
                'Virzy Guns',
            ].join('\n'),
            backTranslation: english[1].body,
        },
        {
            subject: 'VGPビート候補についての最終連絡',
            body: [
                `${name}さん、こんにちは。`,
                '',
                'VGPビート候補について、これで最後のご連絡にします。今のタイミングや方向性に合わない場合、これ以上フォローアップすることはありません。',
                '',
                '今後、サイバーパンク、フォンク、トラップ、シンセウェーブ系の楽曲が必要になりましたら、いつでもご返信ください。',
                '',
                'Virzy Guns',
            ].join('\n'),
            backTranslation: english[2].body,
        },
    ];
}

function germanDrafts(
    candidate: ScoredLeadCandidate,
    offer: LeadOffer,
): [DraftText, DraftText, DraftText] {
    const english = englishDrafts(candidate, offer);
    const name = candidate.prospect.displayName;
    const signal =
        candidate.prospect.signals[0] ??
        'deine aktuellen öffentlichen Arbeiten und deren Nähe zum VGP-Katalog';
    const links = beatLinks(candidate);
    const offerLine = germanOfferLine(offer);

    return [
        {
            subject: `Beat-Auswahl für ${name}`,
            body: [
                `Hallo ${name},`,
                '',
                `ich bin auf ${signal} gestoßen und habe die Richtung mit dem verifizierten VGP-Katalog abgeglichen. Diese Tracks passen am besten:`,
                links,
                '',
                offerLine,
                '',
                'Wenn die Richtung interessant ist, kann ich die Auswahl anhand des konkreten Projekts weiter eingrenzen.',
                '',
                '— Virzy Guns',
            ].join('\n'),
            backTranslation: english[0].body,
        },
        {
            subject: `Re: Beat-Auswahl für ${name}`,
            body: [
                `Hallo ${name},`,
                '',
                'Kurze Nachfrage, falls meine erste Nachricht zu einem ungünstigen Zeitpunkt kam. Gern stelle ich eine noch passendere Alternative für den konkreten Vocal-, Trailer- oder Videoeinsatz zusammen.',
                '',
                offerLine,
                '',
                'Falls aktuell kein Bedarf besteht, ist das natürlich kein Problem.',
                '',
                '— Virzy Guns',
            ].join('\n'),
            backTranslation: english[1].body,
        },
        {
            subject: 'Letzte Nachricht zur VGP-Beat-Auswahl',
            body: [
                `Hallo ${name},`,
                '',
                'Ich schließe meine Anfrage zur VGP-Beat-Auswahl hiermit ab und werde nicht weiter nachfassen, wenn Zeitpunkt oder Richtung nicht passen.',
                '',
                'Wenn ein späteres Projekt Cyberpunk-, Phonk-, Trap- oder Synthwave-Musik braucht, kannst du die Unterhaltung jederzeit wieder aufnehmen.',
                '',
                '— Virzy Guns',
            ].join('\n'),
            backTranslation: english[2].body,
        },
    ];
}

function draftsForMarket(
    market: FounderMarket,
    candidate: ScoredLeadCandidate,
    offer: LeadOffer,
): [DraftText, DraftText, DraftText] {
    if (market === 'ja-JP') return japaneseDrafts(candidate, offer);
    if (market === 'de-DE') return germanDrafts(candidate, offer);
    return englishDrafts(candidate, offer);
}

function contentHash(step: {
    prospectId: string;
    order: 1 | 2 | 3;
    channel: 'email' | 'instagram' | 'tiktok';
    subject: string | null;
    body: string;
    offer: LeadOffer;
}): string {
    const digest = createHash('sha256')
        .update(
            JSON.stringify({
                prospectId: step.prospectId,
                order: step.order,
                channel: step.channel,
                subject: step.subject,
                body: step.body,
                offer: step.offer,
            }),
        )
        .digest('hex');
    return `sha256:${digest}`;
}

function noOutreachPlan(
    candidate: ScoredLeadCandidate,
    offer: LeadOffer,
    gaps: string[],
): OutreachDraftPlan {
    return {
        prospectId: candidate.prospect.id,
        channel: null,
        recipient: null,
        deliveryMode: null,
        individuallyApproved: false,
        offer,
        steps: [],
        stopConditions: STOP_CONDITIONS,
        gaps: [...new Set([...candidate.prospect.gaps, ...gaps])],
    };
}

export function buildOutreachDraftPlan(
    candidate: ScoredLeadCandidate,
): OutreachDraftPlan {
    const prospect = candidate.prospect;
    const offer = offerForSegment(prospect.segment);

    if (candidate.tier !== 'qualified') {
        return noOutreachPlan(candidate, offer, [
            'Only qualified candidates may receive a three-step outreach draft plan.',
        ]);
    }

    const emailEligible =
        (prospect.contactPermission === 'public-business-email' ||
            prospect.contactPermission === 'verified-opt-in') &&
        Boolean(prospect.businessEmail);
    const manualSocialEligible =
        prospect.contactPermission === 'manual-only' &&
        (prospect.platform === 'instagram' || prospect.platform === 'tiktok') &&
        Boolean(prospect.profileUrl || prospect.handle);

    if (!emailEligible && !manualSocialEligible) {
        return noOutreachPlan(candidate, offer, [
            prospect.contactPermission === 'blocked'
                ? 'Outreach is blocked by contact policy.'
                : 'No eligible source-backed email or manual social handoff is available.',
        ]);
    }

    const channel = emailEligible
        ? 'email'
        : prospect.platform === 'instagram'
            ? 'instagram'
            : 'tiktok';
    const recipient = emailEligible
        ? prospect.businessEmail
        : prospect.profileUrl || prospect.handle;
    const deliveryMode = emailEligible
        ? 'email-after-individual-approval'
        : 'manual-social-handoff';
    const drafts = draftsForMarket(prospect.market, candidate, offer);
    const delays = [0, 5, 7] as const;

    const steps = drafts.map((draft, index): OutreachDraftStep => {
        const order = (index + 1) as 1 | 2 | 3;
        const subject = channel === 'email' ? draft.subject : null;
        const body = draft.body;
        return {
            id: `${prospect.id}:outreach:${order}`,
            prospectId: prospect.id,
            order,
            channel,
            subject,
            body,
            status: 'DRAFT',
            scheduledFor: null,
            contentHash: contentHash({
                prospectId: prospect.id,
                order,
                channel,
                subject,
                body,
                offer,
            }),
            language: prospect.market,
            backTranslation: draft.backTranslation,
            approvalRequired: true,
            canExecute: false,
            deliveryMode,
            suggestedDelayBusinessDays: delays[index],
        };
    });

    const planGaps = [...prospect.gaps];
    if (manualSocialEligible) {
        planGaps.push(
            'Instagram and TikTok drafts are manual handoffs only; the Lead Scout cannot initiate or schedule a cold social DM.',
        );
    }
    if (candidate.matchedBeats.length > 3) {
        planGaps.push('Only the first three verified beat matches are included in outreach copy.');
    }

    return {
        prospectId: prospect.id,
        channel,
        recipient,
        deliveryMode,
        individuallyApproved: false,
        offer,
        steps,
        stopConditions: STOP_CONDITIONS,
        gaps: [...new Set(planGaps)],
    };
}

export { describeOffer };
