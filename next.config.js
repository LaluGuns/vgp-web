/** @type {import('next').NextConfig} */
const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
    },
];

const nextConfig = {
    reactStrictMode: true,
    compress: true,
    poweredByHeader: false,
    images: {
        formats: ['image/webp', 'image/avif'],
    },
    experimental: {
        optimizeCss: false,
    },
    // Reduce JS bundle size
    compiler: {
        // Strip logging from production builds, but keep console.error so real failures stay visible.
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
    },
    allowedDevOrigins: ['127.0.0.1', 'localhost'],
    // CADENZ lives at cadenz.virzyguns.com. Only the app-store legal pages
    // (/cadenz/privacy, /cadenz/terms, /cadenz/delete-account) stay here.
    async redirects() {
        return [
            { source: '/cadenz', destination: 'https://cadenz.virzyguns.com', permanent: true },
            { source: '/cadenz/running-music', destination: 'https://cadenz.virzyguns.com', permanent: true },
            { source: '/cadenz/running-music/:path*', destination: 'https://cadenz.virzyguns.com', permanent: true },
            { source: '/lab', destination: '/healingwave', permanent: true },
            { source: '/lab/healingwave', destination: '/healingwave', permanent: true },
        ];
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ];
    },
};

module.exports = nextConfig;
