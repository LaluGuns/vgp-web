import {
    Activity,
    BookOpen,
    GraduationCap,
    Headphones,
    Library,
    Newspaper,
    UserRound,
} from 'lucide-react';

export const siteNav = [
    { name: 'Studio', href: '/studio' },
    { name: 'HealingWave Lab', href: '/lab/healingwave' },
    { name: 'CADENZ', href: '/cadenz' },
    { name: 'Masterclass', href: '/studio/masterclass' },
    { name: 'Books', href: '/book' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
];

export const studioNav = [
    { name: 'Studio Overview', href: '/studio' },
    { name: 'Beat Store', href: '/studio/beats' },
    { name: 'Masterclass', href: '/studio/masterclass' },
    { name: 'Books', href: '/book' },
];

export const ecosystemCards = [
    {
        title: 'VGP Studio',
        eyebrow: 'Beats and Services',
        href: '/studio/beats',
        cta: 'Explore Studio',
        Icon: Headphones,
        description:
            'Premium beats, custom production, mixing, mastering, and sound design by Virzy Guns.',
    },
    {
        title: 'HealingWave Lab',
        eyebrow: 'Functional Audio',
        href: '/lab/healingwave',
        cta: 'Enter The Lab',
        Icon: Activity,
        description:
            'Functional audio for focus, recovery, running cadence, cycling cadence, and calm listening.',
    },
    {
        title: 'CADENZ',
        eyebrow: 'First HealingWave Product',
        href: '/cadenz',
        cta: 'Preview CADENZ',
        Icon: Activity,
        description:
            'A cadence music app with original VGP music for runners and cyclists, coming soon.',
    },
    {
        title: 'Masterclass',
        eyebrow: 'Producer Education',
        href: '/studio/masterclass',
        cta: 'Start Learning',
        Icon: GraduationCap,
        description:
            'Practical education for producers who want cleaner sound, sharper decisions, and stronger releases.',
    },
    {
        title: 'Books',
        eyebrow: 'Producer Library',
        href: '/book',
        cta: 'Browse Books',
        Icon: Library,
        description:
            'Music production guides, workbooks, and audio resources for producers who want cleaner decisions.',
    },
    {
        title: 'Blog',
        eyebrow: 'Editorial Hub',
        href: '/blog',
        cta: 'Read Articles',
        Icon: Newspaper,
        description:
            'Founder notes, tutorials, and practical breakdowns from the VGP catalog.',
    },
    {
        title: 'About',
        eyebrow: 'Founder and Mission',
        href: '/about',
        cta: 'Our Story',
        Icon: UserRound,
        description:
            'Meet Virzy Guns, the founder shaping the studio, lab, products, and learning system behind VGP.',
    },
];

export const cadenzHighlights = [
    'CADENZ by HealingWave Lab',
    'First HealingWave Product',
    'Cadence music for running and cycling',
    'VGP original music',
    'Coming soon',
];

export const healingWaveModules = [
    {
        name: 'HealingWave Focus',
        platform: 'Web Application',
        description:
            'A browser-based functional audio environment for deep work, focus sessions, and study listening.',
        features: ['Focus timers', 'Custom presets', 'Session modes', 'Study listening'],
        note: 'Designed for quiet, repeatable listening sessions with fewer distractions.',
    },
    {
        name: 'CADENZ',
        availability: 'Coming soon',
        platform: 'Running and Cycling',
        description:
            'Tempo-matched cadence music with original VGP music for runners and cyclists.',
        features: ['Cadence targets', 'BPM based music', 'Motion flow', 'Training rhythm'],
        note: 'Built to keep cadence targets clear while the music carries the session.',
    },
    {
        name: 'HealingWave Gym',
        platform: 'Strength Training',
        description:
            'A concept for workout-focused audio sessions that organize intensity, rhythm, and recovery cues into one listening system.',
        features: ['Workout modes', 'Tempo sets', 'Session logs', 'Sound presets'],
        note: 'Explores how intensity, rhythm, and recovery can shape a focused workout session.',
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
