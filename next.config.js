/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compress: true,
    poweredByHeader: false,
    images: {
        domains: [],
        formats: ['image/webp', 'image/avif'],
    },
    experimental: {
        optimizeCss: false,
    },
    // Reduce JS bundle size
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
};

module.exports = nextConfig;
