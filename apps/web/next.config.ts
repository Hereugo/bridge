import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@bridge/shared"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
