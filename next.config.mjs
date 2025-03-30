/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Required for Vercel deployments
    experimental: {
      missingSuspenseWithCSRBailout: false, // Disables strict not-found checks
    },
    // Optional but recommended for App Router:
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true
};

export default nextConfig;
