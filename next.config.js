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
    allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

module.exports = nextConfig;
