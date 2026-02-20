import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About the Founder',
    description: 'Virzy Guns is a professional music producer, beatmaker, and Founder of VGP. Discover the science behind our functional audio and premium instrumentals.',
    keywords: ['Virzy Guns', 'music producer', 'beatmaker', 'audio engineer', 'functional audio', 'about VGP'],
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
