import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/himo",
  assetPrefix: "/himo",
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
