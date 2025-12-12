import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@offmarket/types", "@offmarket/utils"],
};

export default nextConfig;
