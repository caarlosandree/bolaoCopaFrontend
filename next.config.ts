import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1323",
        pathname: "/uploads/**",
      },
    ],
  },
}

export default nextConfig
