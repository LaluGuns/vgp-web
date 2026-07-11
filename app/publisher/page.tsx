'use client';

/**
 * Halaman Profil Penerbit — PT Kreasi Virzy Nusantara
 * Memenuhi persyaratan ISBN Perpustakaan Nasional:
 * 1. Profil penerbit
 * 2. Menu/etalase publikasi
 */

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { BookOpen, Mail, MapPin, Building2, ArrowRight } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    CinematicBackdrop,
    EditorialButton,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import {
    revealUp,
    staggerParent,
    staggerChild,
    staggerGrid,
    staggerGridChild,
} from '@/lib/motion-presets';
import { publisherInfo, publisherBooks } from '@/lib/publisher-data';

export default function PublisherPage() {
    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                {/* ── Hero ── */}
                <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28">
                    <CinematicBackdrop />

                    <m.div
                        className="relative z-10 mx-auto max-w-5xl"
                        variants={staggerParent}
                        initial="hidden"
                        animate="visible"
                    >
                        <m.p
                            variants={staggerChild}
                            className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/60"
                        >
                            Profil Penerbit
                        </m.p>
                        <m.h1
                            variants={staggerChild}
                            className="font-display text-4xl font-semibold leading-[1.04] text-white sm:text-5xl md:text-6xl lg:text-7xl"
                        >
                            {publisherInfo.name.split(' ').slice(0, 2).join(' ')}
                            <br />
                            <span className="bg-gradient-to-r from-white/40 via-sky-200/80 to-white/40 bg-clip-text text-transparent">
                                {publisherInfo.name.split(' ').slice(2).join(' ')}
                            </span>
                        </m.h1>
                        <m.p
                            variants={staggerChild}
                            className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg"
                        >
                            {publisherInfo.description}
                        </m.p>
                        <m.div variants={staggerChild} className="mt-8 flex flex-wrap gap-3">
                            <EditorialButton href="#publikasi">Lihat Publikasi</EditorialButton>
                            <EditorialButton
                                href={`mailto:${publisherInfo.contact.email}`}
                                variant="ghost"
                            >
                                Hubungi Kami
                            </EditorialButton>
                        </m.div>
                    </m.div>
                </section>

                {/* ── Profil Penerbit ── */}
                <SectionShell className="border-y border-white/[0.08] bg-white/[0.012]">
                    <m.div
                        variants={staggerParent}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <m.p
                            variants={staggerChild}
                            className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/55"
                        >
                            Tentang Penerbit
                        </m.p>
                        <m.h2
                            variants={staggerChild}
                            className="mb-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
                        >
                            Informasi Penerbit
                        </m.h2>
                        <m.p
                            variants={staggerChild}
                            className="mb-10 max-w-2xl text-sm leading-7 text-white/55"
                        >
                            {publisherInfo.mission}
                        </m.p>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Penerbit */}
                            <m.div variants={staggerChild} className="liquid-glass rounded-lg p-5 transition hover:border-sky-200/25 hover:bg-white/[0.045]">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                    <Building2 className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Penerbit</p>
                                <p className="text-sm font-medium leading-6 text-white/80">{publisherInfo.name}</p>
                            </m.div>

                            {/* Lokasi */}
                            <m.div variants={staggerChild} className="liquid-glass rounded-lg p-5 transition hover:border-sky-200/25 hover:bg-white/[0.045]">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                    <MapPin className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Lokasi</p>
                                <p className="text-sm font-medium leading-6 text-white/80">{publisherInfo.contact.location}</p>
                            </m.div>

                            {/* Kontak */}
                            <m.div variants={staggerChild} className="liquid-glass rounded-lg p-5 transition hover:border-sky-200/25 hover:bg-white/[0.045]">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                    <Mail className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Kontak</p>
                                <a href={`mailto:${publisherInfo.contact.email}`} className="block text-sm font-medium leading-6 text-white/80 transition hover:text-sky-100">
                                    {publisherInfo.contact.email}
                                </a>
                                <a href={`https://wa.me/${publisherInfo.contact.whatsapp}`} className="block text-sm font-medium leading-6 text-white/80 transition hover:text-sky-100">
                                    WA: {publisherInfo.contact.whatsappDisplay}
                                </a>
                            </m.div>

                            {/* Bidang */}
                            <m.div variants={staggerChild} className="liquid-glass rounded-lg p-5 transition hover:border-sky-200/25 hover:bg-white/[0.045]">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Bidang</p>
                                <p className="text-sm font-medium leading-6 text-white/80">
                                    {publisherInfo.fields.map((field, i) => (
                                        <span key={field}>
                                            {field}{i < publisherInfo.fields.length - 1 && <><br /></>}
                                        </span>
                                    ))}
                                </p>
                            </m.div>
                        </div>
                    </m.div>
                </SectionShell>

                {/* ── Etalase Publikasi ── */}
                <SectionShell id="publikasi">
                    <m.div
                        variants={staggerParent}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <m.p
                            variants={staggerChild}
                            className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/55"
                        >
                            Etalase Publikasi
                        </m.p>
                        <m.h2
                            variants={staggerChild}
                            className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
                        >
                            Buku Terbitan Kami
                        </m.h2>
                        <m.p
                            variants={staggerChild}
                            className="mb-12 max-w-2xl text-sm leading-7 text-white/55"
                        >
                            Semua buku diterbitkan oleh {publisherInfo.name} dalam format ebook
                            digital (PDF) yang dapat dibaca di berbagai perangkat.
                        </m.p>
                    </m.div>

                    <m.div
                        className="grid gap-8 lg:grid-cols-2"
                        variants={staggerGrid}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {publisherBooks.map((book) => {
                            const isExternal = book.href.startsWith('http');

                            return (
                                <m.div
                                    key={book.slug}
                                    variants={staggerGridChild}
                                    className="liquid-glass-strong group overflow-hidden rounded-lg transition hover:border-sky-200/30 hover:shadow-[0_26px_90px_rgba(2,132,199,0.1)]"
                                >
                                    <div className="grid gap-0 sm:grid-cols-[auto_1fr]">
                                        {/* Cover */}
                                        <div className="relative aspect-[3/4] w-full sm:w-48 md:w-56">
                                            <Image
                                                src={book.coverImage}
                                                alt={`Cover ${book.title}`}
                                                fill
                                                sizes="(min-width: 640px) 224px, 100vw"
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#030405]/60 sm:block hidden" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex flex-col p-5 sm:p-6">
                                            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/60">
                                                <span>{book.year} · {book.format}</span>
                                                {book.status === 'coming-soon' && (
                                                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300">
                                                        Coming Soon
                                                    </span>
                                                )}
                                            </p>
                                            <h3 className="mb-2 text-xl font-semibold leading-tight text-white sm:text-2xl">
                                                {book.title}
                                            </h3>
                                            <p className="mb-1 text-sm font-medium text-white/60">
                                                Penulis: <span className="text-white/80">{book.author}</span>
                                            </p>
                                            <p className="mb-4 flex-1 text-sm leading-7 text-white/55">
                                                {book.description}
                                            </p>

                                            {/* Stats */}
                                            <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.08] pt-4">
                                                <div>
                                                    <p className="text-lg font-bold text-white">{book.pages}</p>
                                                    <p className="text-xs text-white/45">Halaman</p>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-white">{book.chapters}</p>
                                                    <p className="text-xs text-white/45">Bab</p>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-white">{book.language}</p>
                                                    <p className="text-xs text-white/45">Bahasa</p>
                                                </div>
                                                {book.price && (
                                                    <div>
                                                        <p className="text-lg font-bold text-sky-200">{book.price}</p>
                                                        <p className="text-xs text-white/45">Harga</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* CTA */}
                                            {isExternal ? (
                                                <a
                                                    href={book.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-sky-100/80 transition group-hover:text-white"
                                                >
                                                    Lihat Detail
                                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                                </a>
                                            ) : (
                                                <Link
                                                    href={book.href}
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-sky-100/80 transition group-hover:text-white"
                                                >
                                                    Lihat Detail
                                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </m.div>
                            );
                        })}
                    </m.div>
                </SectionShell>

                {/* ── Footer Info Penerbit ── */}
                <SectionShell className="border-t border-white/[0.08] bg-white/[0.012] pb-8">
                    <m.div
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/45">
                            Penerbit
                        </p>
                        <p className="text-lg font-semibold text-white/80">{publisherInfo.name}</p>
                        <p className="mt-1 text-sm text-white/45">
                            {publisherInfo.contact.location} ·{' '}
                            <a
                                href={`mailto:${publisherInfo.contact.email}`}
                                className="text-sky-200/60 transition hover:text-sky-100"
                            >
                                {publisherInfo.contact.email}
                            </a>
                        </p>
                        <p className="mt-4 text-xs text-white/35">
                            &copy; {new Date().getFullYear()} {publisherInfo.name}. Semua hak dilindungi undang-undang.
                        </p>
                    </m.div>
                </SectionShell>

                {/* Schema.org structured data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: publisherInfo.name,
                            url: publisherInfo.website + '/publisher',
                            email: publisherInfo.contact.email,
                            address: {
                                '@type': 'PostalAddress',
                                addressLocality: 'Lombok',
                                addressCountry: 'ID',
                            },
                            description: publisherInfo.description,
                            foundingDate: '2026',
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(
                            publisherBooks.map((book) => ({
                                '@context': 'https://schema.org',
                                '@type': 'Book',
                                name: book.title,
                                author: {
                                    '@type': 'Person',
                                    name: book.author,
                                },
                                publisher: {
                                    '@type': 'Organization',
                                    name: publisherInfo.name,
                                },
                                bookFormat: 'https://schema.org/EBook',
                                numberOfPages: book.pages,
                                inLanguage: 'id',
                                datePublished: String(book.year),
                                description: book.description,
                                image: publisherInfo.website + book.coverImage,
                                ...(book.price && {
                                    offers: {
                                        '@type': 'Offer',
                                        price: book.price.replace(/[^\d]/g, ''),
                                        priceCurrency: 'IDR',
                                        availability: 'https://schema.org/InStock',
                                    },
                                }),
                            }))
                        ),
                    }}
                />
            </article>
        </PageTransition>
    );
}
