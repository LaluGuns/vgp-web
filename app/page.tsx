import type { Metadata } from 'next';
import { articles } from '@/lib/blog-data';
import HomeClient from './HomeClient';

// Under 160 characters, so search results show it whole (the root layout's
// longer description stays the default for pages without their own).
export const metadata: Metadata = {
    description:
        'Producer and founder of Virzy Guns Production, now building HealingWave: music that helps people focus, move and recover. Beats, studio work, free lessons.',
};

/**
 * The home page. Its body is a client component (HomeClient.tsx); the
 * lesson count for the hero link is read here, on the server, so the
 * browser never downloads the lessons to count them.
 */
export default function HomePage() {
    return <HomeClient lessonCount={articles.length} />;
}
