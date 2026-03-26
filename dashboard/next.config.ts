import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // 'pathname' can be left as '/**' to allow all images from your Cloudinary account
        pathname: '/**', 
      },
    ],
  },
};

export default nextConfig;