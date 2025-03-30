/** @type {import('next').NextConfig} */
const nextConfig = {
    reactComponentAnnotation: {
        enabled: process.env.NODE_ENV === 'development',
      },
};

export default nextConfig;
