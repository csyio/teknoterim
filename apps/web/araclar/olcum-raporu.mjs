#!/usr/bin/env node
/**
 * Ölçüm raporu — terminalden okunur.
 *
 *   npm run olcum                     (yerelde, 7 gün)
 *   npm run olcum -- 30               (yerelde, 30 gün)
 *   node araclar/olcum-raporu.mjs data/analytics.db 30
 *
 * Sunucuda:
 *   cd /opt/teknoterim && node araclar/olcum-raporu.mjs
 *
 * Neden kendi kendine yeten bir dosya: sunucuya yalnızca derlenmiş çıktı
 * kopyalanır, TypeScript kaynakları orada bulunmaz. Bu yüzden sorgular burada
 * ham SQL olarak durur ve `lib/` içinden hiçbir şey içe aktarılmaz. Gün
 * hesabı, `lib/olcum.ts` ile aynı kuralı (sabit UTC+3) uygular.
 *
 * DİKKAT — tekil ziyaretçi sayısı günlüktür: ziyaretçi anahtarı her gün
 * değiştiği için günler arası birleştirilemez. Toplam "tekil ziyaretçi"
 * diye bir sayı yoktur; bu yüzden gün gün gösterilir.
 */

import { existsSync } from "node:fs";

import Database from "better-sqlite3";

const TR_OFFSET_MS = 3 * 60 * 60 * 1000;

function gunMetni(an) {
  const d = new Date(an + TR_OFFSET_MS);
  const yil = d.getUTCFullYear();
  const ay = String(d.getUTCMonth() + 1).padStart(2, "0");
  const gun = String(d.getUTCDate()).padStart(2, "0");
  return `${yil}-${ay}-${gun}`;
}

const dbYolu = process.argv[2] ?? process.env.TEKNOTERIM_OLCUM_DB ?? "data/analytics.db";
const gunSayisi = Number.parseInt(process.argv[3] ?? "7", 10);

if (!Number.isFinite(gunSayisi) || gunSayisi < 1) {
  console.error("Gün sayısı pozitif bir tam sayı olmalı.");
  process.exit(2);
}

if (!existsSync(dbYolu)) {
  console.log(`Ölçüm veritabanı bulunamadı: ${dbYolu}`);
  console.log("Henüz ölçüm toplanmamış olabilir. Uygulama ilk istekte dosyayı oluşturur.");
  process.exit(0);
}

const baslangic = gunMetni(Date.now() - (gunSayisi - 1) * 24 * 60 * 60 * 1000);
const db = new Database(dbYolu, { readonly: true, fileMustExist: true });

const baslik = (s) => `\n\u001b[1m${s}\u001b[0m`;
const say = (n) => String(n).padStart(6);

const toplam = db
  .prepare("SELECT COUNT(*) AS n FROM olay WHERE gun >= ?")
  .get(baslangic).n;
const tumZamanlar = db.prepare("SELECT COUNT(*) AS n FROM olay").get().n;

console.log(baslik(`Ölçüm raporu — son ${gunSayisi} gün (${baslangic} → bugün)`));
console.log(`  Görüntüleme: ${toplam}   |   Tüm zamanlar: ${tumZamanlar}`);

if (toplam === 0) {
  console.log("\nBu aralıkta kayıt yok.");
  db.close();
  process.exit(0);
}

console.log(baslik("Günlük"));
console.log("  gün          görüntüleme  tekil ziyaretçi");
for (const s of db
  .prepare(
    `SELECT gun, COUNT(*) AS goruntuleme, COUNT(DISTINCT konuk) AS tekil
     FROM olay WHERE gun >= ? GROUP BY gun ORDER BY gun`
  )
  .all(baslangic)) {
  console.log(`  ${s.gun}   ${say(s.goruntuleme)}       ${say(s.tekil)}`);
}

console.log(baslik("En çok görüntülenen sayfalar"));
for (const s of db
  .prepare(
    `SELECT yol, COUNT(*) AS n FROM olay
     WHERE gun >= ? GROUP BY yol ORDER BY n DESC, yol LIMIT 15`
  )
  .all(baslangic)) {
  console.log(`  ${say(s.n)}  ${s.yol}`);
}

console.log(baslik("Kaynaklar"));
for (const s of db
  .prepare(
    `SELECT COALESCE(kaynak, '(doğrudan / iç gezinme)') AS kaynak, COUNT(*) AS n
     FROM olay WHERE gun >= ? GROUP BY kaynak ORDER BY n DESC, kaynak LIMIT 10`
  )
  .all(baslangic)) {
  console.log(`  ${say(s.n)}  ${s.kaynak}`);
}

console.log(
  "\nNot: tekil ziyaretçi günlüktür — anahtar her gün değişir, günler arası toplanamaz."
);

db.close();
