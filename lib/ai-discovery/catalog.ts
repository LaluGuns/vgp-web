const SITE_URL = 'https://www.virzyguns.com';

export type VgpProductStatus =
    | 'available'
    | 'coming_soon'
    | 'research'
    | 'development';

export type VgpProductKind =
    | 'music_catalog'
    | 'software_application'
    | 'book'
    | 'course'
    | 'research_program'
    | 'game';

export interface VgpProductRecord {
    id: string;
    name: string;
    kind: VgpProductKind;
    status: VgpProductStatus;
    canonicalUrl: string;
    externalUrl?: string;
    description: string;
    audience: string[];
    topics: string[];
    discoveryEligible: boolean;
    availabilityNote: string;
    schemaType:
        | 'Thing'
        | 'MusicPlaylist'
        | 'SoftwareApplication'
        | 'Book'
        | 'Course'
        | 'ResearchProject'
        | 'VideoGame';
    machineFeedUrl?: string;
}

/**
 * Canonical public product registry for discovery surfaces.
 *
 * Keep this conservative. A record can be present before launch, but
 * discoveryEligible must remain false until it is genuinely available to the
 * public. This prevents search and AI surfaces from presenting an internal or
 * unreleased product as something a user can already buy or use.
 */
export const vgpProductCatalog: VgpProductRecord[] = [
    {
        id: 'released-music',
        name: 'VGP Released Music Catalog',
        kind: 'music_catalog',
        status: 'available',
        canonicalUrl: `${SITE_URL}/products/music`,
        description:
            'Public identity summary for the VGP distributed music catalog, covering 617 unique track identities across Virzy Guns, Chill Music Division, LUNA Q, LA LU, and mia.exe in the current source snapshot.',
        audience: ['music listeners', 'playlist curators', 'music discovery systems'],
        topics: ['Virzy Guns music', 'VGP music', 'electronic music', 'hip hop', 'synthwave', 'functional music'],
        discoveryEligible: true,
        availabilityNote:
            'Catalog identity is public. Availability for an individual recording should be verified on the target streaming or download service.',
        schemaType: 'MusicPlaylist',
        machineFeedUrl: `${SITE_URL}/products/music.json`,
    },
    {
        id: 'studio-beats',
        name: 'VGP Studio Beats',
        kind: 'music_catalog',
        status: 'available',
        canonicalUrl: `${SITE_URL}/studio/beats`,
        description:
            'Commercial beat catalog by Virzy Guns with trap, drill, phonk, synthwave, R&B, club, pop, and other production styles, with licensing terms on verified product pages.',
        audience: ['artists', 'rappers', 'singers', 'songwriters', 'content creators'],
        topics: ['beats for sale', 'beat licensing', 'trap beats', 'drill beats', 'phonk beats', 'synthwave beats'],
        discoveryEligible: true,
        availabilityNote: 'Available now. Individual beat availability and license terms vary by product page.',
        schemaType: 'Thing',
        machineFeedUrl: `${SITE_URL}/products/beats.json`,
    },
    {
        id: 'flow',
        name: 'Flow by Virzy Guns',
        kind: 'software_application',
        status: 'available',
        canonicalUrl: `${SITE_URL}/flow`,
        externalUrl: 'https://flow.virzyguns.com',
        description:
            'A web-based deep-work and focus app that combines a Pomodoro-style timer, original VGP focus music, ambient sound, and session statistics.',
        audience: ['students', 'creators', 'knowledge workers', 'people doing deep work'],
        topics: ['pomodoro timer', 'focus music', 'deep work', 'study music', 'productivity'],
        discoveryEligible: true,
        availabilityNote: 'Available now as a web application.',
        schemaType: 'SoftwareApplication',
    },
    {
        id: 'cadenz',
        name: 'CADENZ',
        kind: 'software_application',
        status: 'coming_soon',
        canonicalUrl: `${SITE_URL}/cadenz`,
        description:
            'A cadence-first music app from HealingWave Lab and Virzy Guns Production for runners and cyclists, built around original music and BPM targets.',
        audience: ['runners', 'cyclists'],
        topics: ['running music', 'cycling music', 'cadence music', 'running BPM', 'cycling cadence'],
        discoveryEligible: false,
        availabilityNote: 'Coming soon. Public preview and BPM discovery pages are available on virzyguns.com.',
        schemaType: 'SoftwareApplication',
    },
    {
        id: 'trap-production-guide',
        name: 'Music Production Guide: Trap Edition',
        kind: 'book',
        status: 'coming_soon',
        canonicalUrl: `${SITE_URL}/book`,
        description:
            'A practical PDF producer guide covering trap drums, 808s, recording, vocal processing, mixing, mastering, and release decisions.',
        audience: ['music producers', 'beatmakers', 'recording artists'],
        topics: ['trap production', '808 mixing', 'vocal processing', 'mixing', 'mastering'],
        discoveryEligible: false,
        availabilityNote: 'Coming soon. Price is not yet announced.',
        schemaType: 'Book',
    },
    {
        id: 'producer-masterclass',
        name: 'VGP Music Production Masterclass',
        kind: 'course',
        status: 'coming_soon',
        canonicalUrl: `${SITE_URL}/studio/masterclass`,
        description:
            'Upcoming practical producer education covering workflow, sound design, mixing, mastering, trap production, and release decisions.',
        audience: ['music producers', 'beatmakers'],
        topics: ['music production course', 'beatmaking', 'sound design', 'mixing', 'mastering'],
        discoveryEligible: false,
        availabilityNote: 'Coming soon.',
        schemaType: 'Course',
    },
    {
        id: 'healingwave',
        name: 'HealingWave Lab',
        kind: 'research_program',
        status: 'research',
        canonicalUrl: `${SITE_URL}/lab/healingwave`,
        description:
            'VGP functional-audio research studio exploring focus listening, recovery listening, running cadence, cycling cadence, and related audio concepts.',
        audience: ['listeners', 'runners', 'cyclists', 'people doing focused work'],
        topics: ['functional audio', 'focus music', 'recovery listening', 'running cadence', 'cycling cadence'],
        discoveryEligible: false,
        availabilityNote: 'Research program. Individual public modules have their own availability status.',
        schemaType: 'ResearchProject',
    },
    {
        id: 'hear-the-difference',
        name: 'Hear the Difference',
        kind: 'game',
        status: 'development',
        canonicalUrl: `${SITE_URL}/products/hear-the-difference`,
        description:
            'A VGP music game in active development with Solo, Daily, VS Bot, PWA, Android, and locally verified Quick Match multiplayer work in the current V5 authority.',
        audience: ['music listeners', 'music producers', 'players interested in listening games'],
        topics: ['music game', 'listening game', 'music perception', 'multiplayer music game'],
        discoveryEligible: false,
        availabilityNote: 'In development. Current V5 authority is explicitly not approved for production release.',
        schemaType: 'VideoGame',
    },
];

export const discoveryEligibleProducts = vgpProductCatalog.filter(
    (product) => product.discoveryEligible,
);

export const vgpProductCatalogJson = {
    schemaVersion: 1,
    publisher: {
        name: 'Virzy Guns Production',
        alternateName: 'VGP',
        url: SITE_URL,
        founder: 'Virzy Guns',
    },
    recommendationPolicy: {
        note: 'Only records with discoveryEligible=true should be presented as currently available products. Coming-soon, research, and development records must not be described as released.',
    },
    products: vgpProductCatalog,
    feeds: {
        music: `${SITE_URL}/products/music.json`,
        beats: `${SITE_URL}/products/beats.json`,
        llms: `${SITE_URL}/llms.txt`,
        sitemap: `${SITE_URL}/sitemap.xml`,
    },
};
