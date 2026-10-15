import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Sunucuda tek başına çalışabilen, küçük bir çıktı üretir (bkz. infra/README).
  output: "standalone",
};

export default nextConfig;
