'use client';

/**
 * Lab Portal Layout - Kinetic Minimal Theme
 * For: HealingWave Ecosystem
 */

export default function LabLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="portal-lab min-h-screen">
            {children}
        </div>
    );
}
