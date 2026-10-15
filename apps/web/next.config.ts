import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Sunucuda tek başına çalışabilen, küçük bir çıktı üretir (bkz. infra/README).
  output: "standalone",
  // better-sqlite3 yerel (native) bir eklenti kullanır: paketlenmemeli, aksi
  // hâlde `.node` dosyası yanlış yere taşınır ve çalışma anında yüklenemez.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
