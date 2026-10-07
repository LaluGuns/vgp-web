import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { EditorialButton, TextLink } from '@/components/editorial/EditorialPrimitives';
import { FLOW_APP_URL } from '@/lib/vgp-ecosystem';

const facts = ['Music by Virzy Guns', 'Free tier, no account', 'Stats count measured minutes only'];

const features = [
    {
        title: 'Pomodoro or longer blocks',
        body: 'Run the classic pomodoro rhythm or longer deep-work blocks. Start a session and let the timer handle the discipline.',
    },
    {
        title: 'Four visual themes',
        body: 'Glass, Studio, Terminal and Editorial. Pick the room you want to work in, from soft translucency to a bare command line.',
    },
    {
        title: 'Honest stats',
        body: 'Flow reports measured minutes only. It never guesses whether you were really focused and never shames you for switching tabs. If the timer ran, it counts.',
    },
    {
        title: 'Eleven languages',
        body: 'The whole interface is translated, so it reads naturally wherever you work from.',
    },
    {
        title: 'Nothing in the way',
        body: 'Open the site, press play, work. The free tier needs no account, no email and no onboarding tour.',
    },
];

const plans = [
    {
        name: 'Flow Free',
        price: '$0',
        note: 'Everything you need for a real session.',
        items: ['Focus music and pomodoro timer', 'No account or email', 'Session stats, measured minutes only', 'Core visual theme'],
        action: { label: 'Start free', primary: false },
    },
    {
        name: 'Flow Pro',
        price: '$9.99 a month',
        note: 'Or $59.99 a year, which works out to two months free.',
        items: ['The full in-house catalog', 'All four visual themes', 'Longer session history and stats', 'Pays for new music being produced'],
        action: { label: 'Go Pro in Flow', primary: true },
    },
];

export default function FlowClient() {
    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <section className="px-4 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:items-center">
                        <div className="lg:col-span-6">
                            <h1 className="max-w-[12ch] font-display text-[clamp(2.75rem,6.5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.04em]">
                                Deep work, scored properly.
                            </h1>
                            <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                                Flow pairs a pomodoro timer with focus music produced in-house by Virzy Guns. Open it,
                                press play and let the session run. You do not need an account to start.
                            </p>
                            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <EditorialButton href={FLOW_APP_URL} withArrow>
                                    Open Flow
                                </EditorialButton>
                                <TextLink href="/blog/i-built-flow-deep-work-music-and-a-pomodoro-timer">
                                    Read the launch note
                                </TextLink>
                            </div>
                        </div>
                        <div className="lg:col-span-6">
                            <div className="flex aspect-[16/10] items-center justify-center rounded-[6px] border border-white/10 bg-[#0a0e12] px-[16%]">
                                <Image
                                    src="/branding/flowstate-logo.png"
                                    alt="Flow logo"
                                    width={768}
                                    height={270}
                                    priority
                                    sizes="(min-width: 1024px) 34vw, 68vw"
                                    className="h-auto w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <ul className="mx-auto mt-14 grid max-w-7xl gap-px overflow-hidden border-y border-white/10 sm:grid-cols-3">
                        {facts.map((fact) => (
                            <li key={fact} className="py-5 text-sm font-medium text-white/75 sm:pr-6">
                                {fact}
                            </li>
                        ))}
                    </ul>
                </section>

                <section aria-labelledby="music-heading" className="px-4 py-20 sm:px-6 lg:py-28">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <h2 id="music-heading" className="font-display text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">
                                The music is the product. The timer keeps it honest.
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-white/75">
                                Every track in Flow is written, mixed and mastered by Virzy Guns for long work sessions.
                                No AI filler and no stock library loops.
                            </p>
                        </div>
                        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-7">
                            {features.map((feature) => (
                                <div key={feature.title} className="border-t border-white/10 pt-5">
                                    <dt className="text-lg font-semibold text-white">{feature.title}</dt>
                                    <dd className="mt-2 text-base leading-7 text-white/65">{feature.body}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                <section aria-labelledby="pricing-heading" className="border-t border-white/10 px-4 py-20 sm:px-6 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <h2 id="pricing-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                            Free to focus. Pro for the full catalog.
                        </h2>
                        <div className="mt-10 grid gap-4 lg:grid-cols-2">
                            {plans.map((plan) => (
                                <div key={plan.name} className="flex flex-col rounded-[6px] border border-white/10 bg-[#0a0e12] p-6 sm:p-8">
                                    <h3 className="text-base font-semibold text-white">{plan.name}</h3>
                                    <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">{plan.price}</p>
                                    <p className="mt-2 text-sm leading-6 text-white/60">{plan.note}</p>
                                    <ul className="mt-6 grid flex-1 gap-2.5 border-t border-white/10 pt-6 text-base leading-7 text-white/75">
                                        {plan.items.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                    <div className="mt-8">
                                        {plan.action.primary ? (
                                            <EditorialButton href={FLOW_APP_URL}>{plan.action.label}</EditorialButton>
                                        ) : (
                                            <TextLink href={FLOW_APP_URL}>{plan.action.label}</TextLink>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section aria-labelledby="why-heading" className="border-t border-white/10 px-4 pb-24 pt-20 sm:px-6 lg:pb-32">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <h2 id="why-heading" className="font-display text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl lg:col-span-5">
                            I make music for a living. This is the music I work to.
                        </h2>
                        <figure className="lg:col-span-6 lg:col-start-7">
                            <blockquote className="text-lg leading-8 text-white/75">
                                <p>
                                    Every focus app I tried treated the music as an afterthought: stock loops, generic lo-fi or
                                    an AI playlist with no author behind it. I already produce records, so I built the tool I
                                    wanted. A timer that respects the session, and a catalog I wrote myself, tuned to stay under
                                    the work instead of on top of it. The stats are honest because I do not believe a hidden
                                    browser tab means you stopped thinking.
                                </p>
                            </blockquote>
                            <figcaption className="mt-5 text-sm text-white/55">Virzy Guns, founder</figcaption>
                            <div className="mt-8">
                                <EditorialButton href={FLOW_APP_URL} withArrow>
                                    Open Flow
                                </EditorialButton>
                            </div>
                        </figure>
                    </div>
                </section>
            </article>
        </PageTransition>
    );
}
