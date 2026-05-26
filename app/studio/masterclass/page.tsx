import type { Metadata } from 'next';
import MasterclassClient from './MasterclassClient';

export const metadata: Metadata = {
    title: 'Masterclass — Music Production Courses',
    description: 'Learn music production from Virzy Guns. Courses on fundamentals, AI workflow, sound design, and mixing & mastering. 100% Art. 100% Science.',
};

export default function MasterclassPage() {
    return <MasterclassClient />;
}
