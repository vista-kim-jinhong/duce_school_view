/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "duceproject.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
