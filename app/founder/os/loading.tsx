export default function FounderOsLoading() {
    return (
        <div className="min-h-dvh bg-[#02070c] p-4 text-white sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[94rem] animate-pulse">
                <div className="h-16 rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }, (_, index) => (
                        <div
                            key={index}
                            className="h-36 rounded-[1.35rem] border border-white/[0.06] bg-white/[0.025]"
                        />
                    ))}
                </div>
                <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                    <div className="h-96 rounded-[1.6rem] border border-white/[0.06] bg-white/[0.025]" />
                    <div className="h-96 rounded-[1.6rem] border border-white/[0.06] bg-white/[0.025]" />
                </div>
                <p className="sr-only">Loading Founder OS</p>
            </div>
        </div>
    );
}
