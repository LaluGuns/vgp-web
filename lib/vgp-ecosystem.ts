export interface NavChild {
    name: string;
    href: string;
    description?: string;
    status?: 'Available' | 'Coming Soon' | 'Free' | 'Paid';
    external?: boolean;
}

export interface NavGroup {
    key: 'story' | 'healingwave' | 'studio' | 'learn';
    name: string;
    href: string;
    /** A group with no children renders as a plain link. */
    children: NavChild[];
    /** Paths that light the group up, matched as prefixes. */
    activePrefixes?: string[];
    /** Paths that light the group up only on an exact match. */
    activeExact?: string[];
}

export const FLOW_APP_URL = 'https://flow.virzyguns.com';
export const CADENZ_APP_URL = 'https://cadenz.virzyguns.com';
export const CADENZ_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.cadenz.app';
export const HEALINGWAVE_PATH = '/healingwave';

/** Year Virzy Guns Production was founded. */
export const VGP_FOUNDED = 2020;

export const mainNavGroups: NavGroup[] = [
    {
        key: 'story',
        name: 'Story',
        href: '/about',
        children: [],
        activeExact: ['/about'],
    },
    {
        key: 'healingwave',
        name: 'HealingWave',
        href: HEALINGWAVE_PATH,
        activePrefixes: [HEALINGWAVE_PATH, '/flow'],
        children: [
            { name: 'The mission', href: HEALINGWAVE_PATH, description: 'Why HealingWave exists and what it is building' },
            { name: 'CADENZ', href: CADENZ_APP_URL, description: 'Music that keeps your running or cycling cadence', status: 'Available', external: true },
            { name: 'Flow', href: FLOW_APP_URL, description: 'A focus timer scored with original VGP music', status: 'Available', external: true },
        ],
    },
    {
        key: 'studio',
        name: 'Studio',
        href: '/studio',
        activePrefixes: ['/studio/beats', '/ja-JP/studio/beats', '/de-DE/studio/beats'],
        activeExact: ['/studio'],
        children: [
            { name: 'Beat Store', href: '/studio/beats', description: 'License beats in trap, drill, phonk, synthwave, R&B, club and pop' },
            { name: 'Services', href: '/studio', description: 'Custom production, mixing and mastering' },
            { name: 'Licensing', href: '/studio/beats/licensing', description: 'What each license lets you do' },
        ],
    },
    {
        key: 'learn',
        name: 'Learn',
        href: '/learn',
        activePrefixes: ['/learn', '/blog', '/book', '/studio/masterclass'],
        children: [
            { name: 'Lessons', href: '/blog', description: 'Learning paths from songwriting and sound design to mixing, audio science and licensing', status: 'Free' },
            { name: 'Glossary', href: '/learn/glossary', description: 'The terms used in the lessons, in plain words', status: 'Free' },
            { name: 'Trap Edition guide', href: '/book', description: 'An 80+ page PDF for producers', status: 'Coming Soon' },
            { name: 'Masterclasses', href: '/studio/masterclass', description: 'Video lessons on the production workflow', status: 'Coming Soon' },
        ],
    },
];

/** Smaller projects. Linked from the footer only. */
export const moreProjects: NavChild[] = [
    { name: 'Games', href: '/games' },
    { name: 'MyCamScan', href: '/mycamscan', status: 'Available' },
];

export const healingWaveModules = [
    {
        name: 'CADENZ',
        availability: 'On Google Play',
        platform: 'Running and cycling',
        description:
            'Pick a tempo from 130 to 180 BPM and CADENZ plays original VGP music on that beat, or follows your cadence on AUTO.',
        features: ['130 to 180 BPM', 'AUTO and LOCK modes', 'Running and cycling'],
        href: CADENZ_APP_URL,
        external: true,
    },
    {
        name: 'Flow',
        availability: 'Available now',
        platform: 'Web app',
        description:
            'A focus timer for long work blocks. Original VGP tracks and ambient sound, with an honest count of the sessions you finish.',
        features: ['Focus timer', 'Custom presets', 'Session stats'],
        href: FLOW_APP_URL,
        external: true,
    },
    {
        name: 'HealingWave Gym',
        availability: 'Research concept',
        platform: 'Strength training',
        description:
            'An early idea for workout audio that paces intensity, rest and recovery. Nothing to download yet.',
        features: ['Workout modes', 'Tempo sets', 'Recovery cues'],
        href: HEALINGWAVE_PATH,
    },
];

export const catalogCredentials = [
    {
        value: 'Top 10%',
        label: 'Songwriter',
        href: 'https://credits.muso.ai/profile/05214129-1310-4abc-a856-dc6bc450bf50',
    },
    {
        value: 'Top 25%',
        label: 'Producer',
        href: 'https://credits.muso.ai/profile/05214129-1310-4abc-a856-dc6bc450bf50',
    },
    {
        value: '550',
        label: 'Primary artist credits',
        href: 'https://credits.muso.ai/profile/05214129-1310-4abc-a856-dc6bc450bf50',
    },
    {
        value: '526',
        label: 'Producer credits',
        href: 'https://credits.muso.ai/profile/05214129-1310-4abc-a856-dc6bc450bf50',
    },
] as const;
