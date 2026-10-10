import { articles } from '@/lib/blog-data';
import HomeClient from './HomeClient';

/**
 * The home page. Its body is a client component (HomeClient.tsx); the
 * lesson count for the hero link is read here, on the server, so the
 * browser never downloads the lessons to count them.
 */
export default function HomePage() {
    return <HomeClient lessonCount={articles.length} />;
}
