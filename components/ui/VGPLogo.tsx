'use client';

interface VGPLogoProps {
    className?: string;
    color?: string;
    hoverColor?: string;
}

export const VGPLogo = ({
    className = '',
    color = 'url(#vgpGradient)',
    hoverColor
}: VGPLogoProps) => {
    return (
        <svg
            viewBox="0 0 1000 1000"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="vgpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity="1" />
                    <stop offset="50%" stopColor="#7B68EE" stopOpacity="1" />
                    <stop offset="100%" stopColor="#E900FF" stopOpacity="1" />
                </linearGradient>

                {hoverColor && (
                    <linearGradient id="vgpGradientHover" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={hoverColor} stopOpacity="1" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                    </linearGradient>
                )}
            </defs>

            {/* TG Gun Logo - Exact shape from original */}
            <g fill={color} className="transition-all duration-500 group-hover:fill-[url(#vgpGradientHover)]">
                {/* Main T-shaped gun body */}
                <path d="M 100 150 L 900 150 L 900 280 L 580 280 L 580 850 L 420 850 L 420 280 L 100 280 Z" />

                {/* G-shaped magazine/trigger area */}
                <path d="M 200 400 Q 180 380 180 350 L 180 320 Q 180 300 200 300 L 800 300 Q 820 300 820 320 L 820 700 Q 820 750 780 780 L 520 780 L 520 650 L 720 650 L 720 450 L 280 450 L 280 650 Q 280 680 300 700 L 420 700 L 420 820 L 220 820 Q 180 820 180 780 L 180 350 Z" />

                {/* Gun barrel extension */}
                <rect x="900" y="180" width="80" height="70" rx="8" />

                {/* Grip detail */}
                <ellipse cx="500" cy="650" rx="40" ry="50" opacity="0.4" />
            </g>
        </svg>
    );
};
