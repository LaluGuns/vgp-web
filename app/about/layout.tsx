import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Virzy Guns',
    description: 'Virzy Guns is ranked top 10% songwriter and top 25% producer, plus beatmaker and founder of VGP.',
    keywords: ['Virzy Guns', 'top 10% songwriter', 'top 25% producer', 'music producer', 'beatmaker', 'audio engineer', 'functional audio', 'about VGP'],
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
