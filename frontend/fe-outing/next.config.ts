import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chillpainai.com",
        pathname: "/storage/scoop/**",
      },
      {
        protocol: "https",
        hostname: "www.chillpainai.com",
        pathname: "/src/wewakeup/scoop/images/**",
      },
    ],
  },
};

export default nextConfig;
