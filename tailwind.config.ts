import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Core Brand Palette - Y3K Sovereign Minimalism
                background: '#000000',
                obsidian: '#000000',
                graphite: '#050505',
                carbon: '#0E0E10',
                titanium: '#1A1C20',
                surface: '#0E0E10',

                // Accent System - Sub Zero Cyan
                primary: '#00E5FF',
                secondary: '#00B8CC',
                cyan: {
                    DEFAULT: '#00E5FF',
                    soft: '#00B8CC',
                    glow: 'rgba(0, 229, 255, 0.35)',
                    subtle: 'rgba(0, 229, 255, 0.15)',
                },

                // Typography Colors
                'cool-grey': '#BFC3C9',
                'dim-grey': '#7A8088',
            },
            fontFamily: {
                sans: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            letterSpacing: {
                'apple': '-0.04em',
                'ultra-tight': '-0.05em',
                'hero': '-0.06em',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(0, 229, 255, 0.35)',
                'glow-subtle': '0 0 15px rgba(0, 229, 255, 0.15)',
                'apple': '0 2px 4px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3), 0 24px 48px rgba(0, 0, 0, 0.2)',
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(180deg, #000000 0%, #050505 60%, #0E0E10 100%)',
                'radial-glow': 'radial-gradient(ellipse 50% 30% at 50% 50%, rgba(0, 229, 255, 0.04) 0%, transparent 70%)',
            },
            animation: {
                'gradient': 'gradient-shift 20s ease infinite',
                'scan': 'scan 4s ease-in-out infinite',
            },
            keyframes: {
                'gradient-shift': {
                    '0%': { backgroundPosition: '0% 0%' },
                    '50%': { backgroundPosition: '0% 100%' },
                    '100%': { backgroundPosition: '0% 0%' },
                },
                'scan': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(400%)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
