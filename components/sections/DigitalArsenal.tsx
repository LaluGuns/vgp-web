'use client';

/**
 * Producer Library Section - PDF Guides Store
 */

import { m } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { staggerParent, staggerChild } from '@/lib/motion-presets';

const products = [
    {
        id: 1,
        title: 'VGP Music Production Guide Vol. 1',
        description: 'The foundational blueprint for professional music production.',
        price: '$29',
        tag: 'BESTSELLER',
        icon: '01',
    },
    {
        id: 2,
        title: 'Modern Producer Workflow',
        description: 'Build faster sessions, cleaner decisions, and repeatable production systems.',
        price: '$39',
        tag: 'NEW',
        icon: '02',
    },
    {
        id: 3,
        title: 'Sonic Architecture: Sound Design Protocol',
        description: 'Deep-dive into synthesis and sound design.',
        price: '$49',
        tag: 'ADVANCED',
        icon: '03',
    },
];

export function DigitalArsenal() {
    return (
        <section id="arsenal" className="relative py-32 px-6 bg-surface">
            <div className="max-w-6xl mx-auto">
                <SectionHeader
                    label="PRODUCER LIBRARY"
                    title="Premium Knowledge Base"
                    description="Curated guides for sharper production decisions."
                />

                <m.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerParent}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    {products.map((product) => (
                        <m.div key={product.id} variants={staggerChild}>
                            <GlassCard className="h-full flex flex-col" padding="none" glow="cyan">
                                <div className="relative h-40 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center rounded-t-2xl">
                                    {product.tag && (
                                        <span className="absolute top-4 left-4 mono-label bg-primary text-background px-3 py-1 rounded-full text-xs font-semibold">
                                            {product.tag}
                                        </span>
                                    )}
                                    <span className="text-4xl font-semibold text-sky-100/65">{product.icon}</span>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-semibold mb-2 tracking-tight">{product.title}</h3>
                                    <p className="text-white/50 text-sm mb-6 flex-1">{product.description}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <span className="text-primary font-bold text-2xl">{product.price}</span>
                                        <GlowButton variant="primary" size="sm">
                                            View Details
                                        </GlowButton>
                                    </div>
                                </div>
                            </GlassCard>
                        </m.div>
                    ))}
                </m.div>
            </div>
        </section>
    );
}
