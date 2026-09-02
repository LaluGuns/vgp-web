import {
    Activity,
    BookOpen,
    GraduationCap,
    Headphones,
    Library,
    Newspaper,
    Timer,
    UserRound,
} from 'lucide-react';

export interface NavChild {
    name: string;
    href: string;
    description?: string;
    status?: 'Available' | 'Coming Soon' | 'Free' | 'Paid';
    external?: boolean;
}

export interface NavGroup {
    key: 'studio' | 'apps' | 'learn' | 'about';
    name: string;
    href: string;
    children: NavChild[];
    activePrefixes?: string[];
}

export const FLOW_APP_URL = 'https://flow.virzyguns.com';

export const mainNavGroups: NavGroup[] = [
    {
        key: 'studio',
        name: 'Studio',
        href: '/studio',
        children: [
            { name: 'Studio Overview', href: '/studio', description: 'Custom production, mixing, and mastering' },
            { name: 'Beat Store', href: '/studio/beats', description: 'Browse and license beats across trap, drill, phonk, synthwave, R&B, club, pop, and more', status: 'Available' },
            { name: 'Licensing Info', href: '/studio/beats/licensing', description: 'Clear terms for non-exclusive & exclusive rights' },
        ],
    },
    {
        key: 'apps',
        name: 'Apps',
        href: FLOW_APP_URL,
        activePrefixes: ['/flow', '/cadenz', '/lab', '/games'],
        children: [
            { name: 'Games', href: '/games', description: 'Music, rhythm, and arcade games you can play in the browser', status: 'Available' },
            { name: 'Flow', href: FLOW_APP_URL, description: 'Deep-work focus timer with original VGP audio', status: 'Available', external: true },
            { name: 'CADENZ', href: '/cadenz', description: 'Cadence music app for runners and cyclists', status: 'Coming Soon' },
            { name: 'HealingWave Lab', href: '/lab/healingwave', description: 'Parent functional audio research studio' },
        ],
    },
    {
        key: 'learn',
        name: 'Learn',
        href: '/learn',
        children: [
            { name: 'Learn Hub', href: '/learn', description: 'Overview of articles, books, and courses' },
            { name: 'Articles', href: '/blog', description: 'Free production notes, 808 physics, and licensing guides', status: 'Free' },
            { name: 'Books', href: '/book', description: 'Structured PDF producer manuals and guides', status: 'Coming Soon' },
            { name: 'Courses', href: '/studio/masterclass', description: 'Producer masterclasses and workflow modules', status: 'Coming Soon' },
        ],
    },
    {
        key: 'about',
        name: 'About',
        href: '/about',
        children: [
            { name: 'Virzy Guns & Mission', href: '/about', description: 'The founder story and production system' },
        ],
    },
];

export const siteNav = mainNavGroups.map(({ name, href }) => ({ name, href }));

export const studioNav = mainNavGroups
    .find((group) => group.key === 'studio')
    ?.children.map(({ name, href }) => ({ name, href })) ?? [];

export const ecosystemCards = [
    {
        title: 'VGP Studio',
        eyebrow: 'Beats and Services',
        href: '/studio/beats',
        cta: 'Browse Beats',
        Icon: Headphones,
        description:
            'Premium beats, custom production, mixing, mastering, and sound design by Virzy Guns.',
        status: 'Available',
    },
    {
        title: 'Flow App',
        eyebrow: 'Deep Work Focus',
        href: FLOW_APP_URL,
        cta: 'Open Flow',
        Icon: Timer,
        description:
            'A focus timer with original VGP music, ambient sound, and session stats for long work blocks.',
        status: 'Available',
        external: true,
    },
    {
        title: 'CADENZ',
        eyebrow: 'Movement Audio App',
        href: '/cadenz',
        cta: 'Preview CADENZ',
        Icon: Activity,
        description:
            'A cadence music app with original VGP music for runners and cyclists.',
        status: 'Coming Soon',
    },
    {
        title: 'HealingWave Lab',
        eyebrow: 'Functional Audio Studio',
        href: '/lab/healingwave',
        cta: 'Explore Lab',
        Icon: Activity,
        description:
            'Parent research studio developing functional audio for focus, cadence, and recovery.',
        status: 'Research',
    },
    {
        title: 'Learn Hub',
        eyebrow: 'Producer Education',
        href: '/learn',
        cta: 'Explore Learn Hub',
        Icon: GraduationCap,
        description:
            'Central hub for free articles, producer guidebooks, and upcoming video masterclasses.',
        status: 'Available',
    },
    {
        title: 'Articles',
        eyebrow: 'Editorial Library',
        href: '/blog',
        cta: 'Read Articles',
        Icon: Newspaper,
        description:
            'Free tutorials on trap drums, 808 physics, mixing decisions, and beat licensing.',
        status: 'Free',
    },
    {
        title: 'Books',
        eyebrow: 'Producer Library',
        href: '/book',
        cta: 'View Books',
        Icon: Library,
        description:
            'Music production manuals and workbooks for producers who want cleaner decisions.',
        status: 'Available',
    },
    {
        title: 'About VGP',
        eyebrow: 'Founder & Mission',
        href: '/about',
        cta: 'Read Our Story',
        Icon: UserRound,
        description:
            'Meet Virzy Guns, the founder shaping the studio, lab, products, and learning system.',
        status: 'Founder',
    },
];

export const cadenzHighlights = [
    'CADENZ by HealingWave Lab',
    'Cadence music for running and cycling',
    'VGP original music',
    'Coming soon',
];

export const healingWaveModules = [
    {
        name: 'Flow',
        availability: 'Available now',
        platform: 'Web Application',
        description:
            'A browser-based functional audio focus timer for deep work, focus sessions, and study listening.',
        features: ['Focus timers', 'Custom presets', 'Session stats', 'Study listening'],
        note: 'Designed for quiet, repeatable listening sessions with minimal distraction.',
        href: FLOW_APP_URL,
        external: true,
    },
    {
        name: 'CADENZ',
        availability: 'Coming soon',
        platform: 'Running and Cycling',
        description:
            'Tempo-matched cadence music with original VGP music for runners and cyclists.',
        features: ['Cadence targets', 'BPM based music', 'Motion flow', 'Training rhythm'],
        note: 'Built to keep cadence targets clear while the music carries the session.',
        href: '/cadenz',
    },
    {
        name: 'HealingWave Gym',
        availability: 'Research concept',
        platform: 'Strength Training',
        description:
            'An exploratory concept for workout audio sessions organizing intensity, rhythm, and recovery cues.',
        features: ['Workout modes', 'Tempo sets', 'Session logs', 'Sound presets'],
        note: 'Exploration on how intensity and recovery can shape a workout session.',
        href: '/lab/healingwave',
    },
];

export const founderStatement =
    'Virzy Guns founded VGP to connect music, technology, movement, and education under one deliberate creative system. Art leads; science makes the decisions sharper.';

export const founderBio =
    'Virzy Guns is the founder and creative director of Virzy Guns Production. He builds the bridge between songs, premium beats, functional audio, CADENZ, books, and producer education; his songwriting and production credentials support the work without defining its limits.';

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
