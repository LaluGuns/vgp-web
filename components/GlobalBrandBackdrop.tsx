import Image from 'next/image';

/**
 * Root-site brand watermark. The Flow product itself lives in the separate
 * flowstate app/subdomain, so this component intentionally belongs only to
 * the VGP root shell.
 */
export function GlobalBrandBackdrop() {
    return (
        <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[15] h-[760px] overflow-hidden mix-blend-screen sm:h-[900px]"
            aria-hidden="true"
        >
            <div
                className="absolute left-1/2 top-[-80px] h-[760px] w-[min(1350px,120vw)] -translate-x-1/2 opacity-[0.2] blur-[0.55px] saturate-[0.82] sm:top-[-120px] sm:h-[920px]"
                style={{
                    maskImage: 'linear-gradient(to bottom, black 0%, black 66%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 66%, transparent 100%)',
                }}
            >
                <Image
                    src="/images/vgp-brand-hero-v2.png"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1280px) 1350px, 120vw"
                    className="object-contain object-center"
                />
            </div>

            <div
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-[#02070c]/45 to-[#02070c]"
                aria-hidden="true"
            />
        </div>
    );
}
