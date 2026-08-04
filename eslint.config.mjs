import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
    ...nextVitals,
    {
        ignores: [
            '.next/**',
            'cloudflare/vgp-founder-agent/**',
            'flowstate/**',
            'scratch/**',
            'node_modules/**',
            'out/**',
            'next-env.d.ts',
        ],
    },
];

export default eslintConfig;
