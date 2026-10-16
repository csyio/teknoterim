/**
 * Gündem toplayıcısı — komut satırı girişi.
 *
 *   npm run gundem            (yerelde: paketler ve bir kez çalıştırır)
 *   node araclar/gundem.mjs   (sunucuda: systemd zamanlayıcısı saatte bir)
 *
 * Bu dosya doğrudan çalıştırılmaz; `gundem-paketle.mjs` onu bağımlılıklarıyla
 * birlikte tek bir `gundem.mjs` dosyasına paketler. Sunucuda TypeScript
 * kaynağı ve sözlük içeriği yoktur: sözlük terimleri paketleme anında
 * `__GUNDEM_TERIMLER__` olarak gömülür.
 *
 * Ortam değişkenleri (sunucuda /etc/teknoterim/gundem.env):
 *   ANTHROPIC_API_KEY     yoksa sahte kip (taslaklar [SAHTE] işaretli)
 *   GUNDEM_ESIK           1–5, varsayılan 4
 *   GUNDEM_GUNLUK_TAVAN   varsayılan 20
 *   GUNDEM_SAHTE=1        anahtar olsa bile sahte kip
 *   TEKNOTERIM_VERI       veritabanı dizini (varsayılan ./data)
 */

import { yazarKur, type SozlukTerimi } from "../lib/gundem-claude.ts";
import { gundemCalistir } from "../lib/gundem-is.ts";
import { KAYNAKLAR } from "../lib/gundem-kaynaklar.ts";
import { ayarlariOku } from "../lib/gundem.ts";

declare const __GUNDEM_TERIMLER__: SozlukTerimi[];

async function ana(): Promise<number> {
  const ayarlar = ayarlariOku(process.env);
  console.log(`[gundem] başlıyor — eşik ${ayarlar.esik}, günlük tavan ${ayarlar.gunlukTavan}`);
  const sonuc = await gundemCalistir({
    kaynaklar: KAYNAKLAR,
    terimler: __GUNDEM_TERIMLER__,
    yazar: yazarKur(process.env),
    ayarlar,
    gunluk: (m) => console.log(`[gundem] ${m}`),
  });
  // Hiçbir kaynak okunamadıysa systemd'ye başarısızlık bildir (journal'da görünsün).
  return sonuc.hata >= KAYNAKLAR.length ? 1 : 0;
}

ana().then(
  (kod) => process.exit(kod),
  (hata) => {
    console.error("[gundem] beklenmeyen hata:", hata);
    process.exit(1);
  }
);
