import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    turbopack: {
        rules: {
            '*.css': {
                loaders: ['@tailwindcss/turbopack'],
                as: '*.css',
            },
        },
    },

    async rewrites() {
        const apiOrigin = process.env.API_PROXY_TARGET;

        if (!apiOrigin) {
            return [];
        }

        return [
            {
                source: '/api/:path*',
                destination: `${apiOrigin.replace(/\/$/, '')}/:path*`,
            },
        ];
    },
};

export default nextConfig;
