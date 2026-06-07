import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  basePath: isGithubPages ? "/design" : undefined,
  assetPrefix: isGithubPages ? "/design/" : undefined,
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: isGithubPages ? "true" : "false"
  },
  images: {
    unoptimized: true
  },
  output: isGithubPages ? "export" : undefined,
  trailingSlash: isGithubPages
};

export default nextConfig;
