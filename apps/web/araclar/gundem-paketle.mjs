/**
 * Gündem toplayıcısını tek dosyaya paketler: araclar/gundem.ts → araclar/gundem.mjs
 *
 *   npm run gundem:paketle
 *
 * Neden paket: sunucuya yalnızca Next'in `standalone` çıktısı gider; orada
 * TypeScript kaynağı, sözlük içeriği (content/) ve toplayıcının kendi
 * bağımlılıkları (Anthropic SDK, XML ayrıştırıcı) yoktur. esbuild hepsini tek
 * dosyaya koyar. `better-sqlite3` yerel bir eklenti olduğu için pakete girmez;
 * standalone çıktısındaki node_modules'tan yüklenir (site de onu kullanıyor).
 *
 * Sözlük terimleri (slug + başlık) paketleme anında okunup gömülür.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

import { tumTerimler } from "../lib/terms.ts";

const burasi = path.dirname(fileURLToPath(import.meta.url));

const terimler = tumTerimler().map((t) => ({ slug: t.slug, baslik: t.baslik }));

await build({
  entryPoints: [path.join(burasi, "gundem.ts")],
  outfile: path.join(burasi, "gundem.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  external: ["better-sqlite3"],
  define: { __GUNDEM_TERIMLER__: JSON.stringify(terimler) },
  // Paketlenen CJS modülleri `require` bekleyebilir; ESM çıktıda sağlanır.
  banner: {
    js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);",
  },
  legalComments: "none",
  logLevel: "warning",
});

console.log(`araclar/gundem.mjs hazır (${terimler.length} sözlük terimi gömüldü).`);
