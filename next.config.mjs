/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the public named import while avoiding unrelated ThreeUI gallery asset modules.
  modularizeImports: {
    '@designcodeio/threeui': { transform: '@designcodeio/threeui/components/{{member}}', skipDefaultConversion: true },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
