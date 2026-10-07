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
    // The CADENZ landing page lives at cadenz.virzyguns.com, a one-page static
    // site. /cadenz/privacy, /cadenz/terms, /cadenz/delete-account and
    // /cadenz/running-music have no counterpart there, so they stay here.
    async redirects() {
        return [
            { source: '/cadenz', destination: 'https://cadenz.virzyguns.com', permanent: true },
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
