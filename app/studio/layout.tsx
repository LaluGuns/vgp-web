'use client';

/**
 * Studio Portal Layout - Dark Obsidian Theme
 * For: Beats, Masterclass, Digital Arsenal
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
