'use client';

interface RobotHostProps {
    activeIndex: number;
    activeColor: string;
    carouselDragX: unknown;
}

export function RobotHost({ activeColor }: RobotHostProps) {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-black z-0">
            <video
                src="/videos/robot.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
            />

            {/* Premium Apple Y3K Gradient Overlays */}
            {/* 1. Vignette & Edge Darkening */}
            <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)" />

            {/* 2. Heavy bottom gradient for seamless transition and dock readability */}
            <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-black via-black/80 to-transparent" />

            {/* 3. Top gradient for header navbar readability */}
            <div className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-black/90 via-black/40 to-transparent" />

            {/* Dynamic Active Portal Color Bloom */}
            <div
                className="absolute inset-0 transition-colors duration-1000 mix-blend-color opacity-20"
                style={{ backgroundColor: activeColor }}
            />
            <div
                className="absolute inset-x-0 bottom-0 h-[60vh] mix-blend-screen opacity-15 blur-[100px] transition-colors duration-1000"
                style={{ backgroundColor: activeColor }}
            />
        </div>
    );
}
