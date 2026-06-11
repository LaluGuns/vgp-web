'use client';

/**
 * Studio Portal Layout - Dark Obsidian Theme
 * For: Beats, Masterclass, and VGP Library
 */

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="portal-studio min-h-screen">
            {children}
        </div>
    );
}
