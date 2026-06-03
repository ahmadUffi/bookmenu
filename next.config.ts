import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "35mb",
    },
    proxyClientMaxBodySize: "35mb",
  },
};

export default nextConfig;
