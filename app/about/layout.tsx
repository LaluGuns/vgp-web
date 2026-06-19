import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Virzy Guns | VGP Founder',
    description: 'Virzy Guns is the founder and creative director of Virzy Guns Production, VGP Studio, HealingWave Lab, and CADENZ.',
    keywords: ['Virzy Guns', 'top 10% songwriter', 'top 25% producer', 'music producer', 'beatmaker', 'audio engineer', 'functional audio', 'about VGP'],
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
