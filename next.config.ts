import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Allow images from any URL to support multiple storage providers
    // (local storage, Cloudinary, S3, etc.)
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
