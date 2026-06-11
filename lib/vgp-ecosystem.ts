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
    { name: 'Beatstore', href: '/studio/beats' },
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
            'A cadence music app for runners and cyclists, now in pre-launch development.',
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
            'Meet Virzy Guns, ranked top 10% songwriter and top 25% producer behind VGP.',
    },
];

export const cadenzHighlights = [
    'CADENZ by HealingWave Lab',
    'First HealingWave Product',
    'Coming soon',
    'UI already built',
    'Backend in progress',
];

export const healingWaveModules = [
    {
        name: 'HealingWave Focus',
        status: 'IN DEVELOPMENT',
        platform: 'Web Application',
        description:
            'A browser-based functional audio environment for deep work, focus sessions, and study listening.',
        features: ['Focus timers', 'Custom presets', 'Session modes', 'Study listening'],
        progress: 75,
        eta: 'Q2 2026',
    },
    {
        name: 'CADENZ',
        status: 'COMING SOON',
        platform: 'Running and Cycling',
        description:
            'Tempo-matched cadence music for runners and cyclists. The interface is built, and backend work is in progress.',
        features: ['Cadence targets', 'BPM based music', 'Motion flow', 'Training rhythm'],
        progress: 65,
        eta: 'First release coming soon',
    },
    {
        name: 'HealingWave Gym',
        status: 'CONCEPT PHASE',
        platform: 'Strength Training',
        description:
            'A concept for workout-focused audio sessions that organize intensity, rhythm, and recovery cues into one listening system.',
        features: ['Workout modes', 'Tempo sets', 'Session logs', 'Sound presets'],
        progress: 15,
        eta: 'Exploration phase',
    },
];

export const founderStatement =
    'Virzy Guns treats sound as craft, signal, rhythm, and architecture. VGP brings that work into beats, songs, functional audio, books, and producer education.';

export const founderBio =
    'Virzy Guns is a ranked top 10% songwriter and top 25% producer, beatmaker, and founder of Virzy Guns Production. His work connects songs, premium beats, functional audio, CADENZ, books, and producer education under one studio system.';
