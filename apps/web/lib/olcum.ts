/**
 * Ölçüm toplayıcısının saf yardımcıları.
 *
 * Buradaki fonksiyonlar bilinçli olarak yan etkisiz ve veritabanından
 * bağımsızdır: aynı kurallar hem istek işleyicisinde hem testlerde kullanılır.
 * Diske ve SQLite'a dokunan kısım `olcum-db.ts` içindedir.
 *
 * Gizlilik kuralları (ürün kararı, pazarlama metni değil):
 *   - IP adresi **saklanmaz**. Yalnızca günlük dönen bir anahtar üretmek için
 *     anlık olarak kullanılır, sonra bellekten gider.
 *   - Çerez, localStorage veya kalıcı tarayıcı kimliği kullanılmaz.
 *   - Tuz her gün değiştiği için anahtarlar günler arasında birleştirilemez;
 *     yani "bu kişi geçen hafta da gelmişti" bilgisi üretilemez.
 *   - Üçüncü taraf isteği yoktur; veri kendi sunucumuzda durur.
 */

import { createHash } from "node:crypto";

/** Türkiye 2016'dan beri yaz saati uygulamıyor: sabit UTC+3. */
export const TR_OFFSET_MS = 3 * 60 * 60 * 1000;

/** İstek gövdesi için üst sınır (bayt). Bundan büyüğü hiç okunmaz. */
export const EN_BUYUK_GOVDE = 2000;

const EN_UZUN_YOL = 300;
const EN_UZUN_KAYNAK = 120;

/** Günü Türkiye saatine göre `YYYY-AA-GG` olarak döndürür. */
export function gunMetni(an: number): string {
  const d = new Date(an + TR_OFFSET_MS);
  const yil = d.getUTCFullYear();
  const ay = String(d.getUTCMonth() + 1).padStart(2, "0");
  const gun = String(d.getUTCDate()).padStart(2, "0");
  return `${yil}-${ay}-${gun}`;
}

/**
 * Günlük dönen ziyaretçi anahtarı. Aynı kişi yarın başka bir anahtar alır,
 * bu yüzden günler arası takip mümkün değildir — bu bir eksiklik değil, sınır.
 */
export function konukAnahtari(
  tuz: string,
  gun: string,
  ip: string,
  tarayici: string
): string {
  return createHash("sha256")
    .update(`${tuz}|${gun}|${ip}|${tarayici}`)
    .digest("hex")
    .slice(0, 16);
}

/** Sorgu dizesi ve çapa atılır: `/sozluk?k=dns` ile `/sozluk` aynı sayfa. */
export function yolAyikla(yol: string): string {
  const kesim = Math.min(
    ...[yol.indexOf("?"), yol.indexOf("#")]
      .filter((i) => i >= 0)
      .concat(yol.length)
  );
  return yol.slice(0, kesim);
}

/** Yol yalnızca site içi bir adres olmalı: `/` ile başlar, şema ve boşluk içermez. */
export function yolGecerliMi(yol: unknown): yol is string {
  if (typeof yol !== "string") return false;
  if (yol.length === 0 || yol.length > EN_UZUN_YOL) return false;
  if (!yol.startsWith("/")) return false;
  // `//example.com` protokol-göreli adrestir; dış site ölçümü tutmuyoruz.
  if (yol.startsWith("//")) return false;
  if (/[\s<>"'\\]/.test(yol)) return false;
  return true;
}

/** Verilen alan adı bizim sitemize mi ait? (Kendi iç gezinmemiz kaynak sayılmaz.) */
export function icGezinmeMi(alanAdi: string, siteUrl: string): boolean {
  let bizim: string;
  try {
    bizim = new URL(siteUrl).hostname;
  } catch {
    return false;
  }
  return alanAdi === bizim || alanAdi.endsWith(`.${bizim}`);
}

/**
 * Yönlendiren adresten yalnızca alan adını çıkarır.
 *
 * Tam adres saklanmaz; çünkü yönlendiren adresin tamamı bazen arama sorgusu
 * gibi kişisel veri taşır. Bize yalnızca "hangi kanaldan geldi" bilgisi yeter.
 */
export function kaynakAlani(referrer: string, siteUrl: string): string | null {
  if (!referrer) return null;
  let alanAdi: string;
  try {
    alanAdi = new URL(referrer).hostname;
  } catch {
    return null;
  }
  if (!alanAdi) return null;
  if (icGezinmeMi(alanAdi, siteUrl)) return null;
  return alanAdi.slice(0, EN_UZUN_KAYNAK);
}

export type OlayGirdisi = {
  yol: string;
  kaynak: string | null;
};

/**
 * Tarayıcıdan gelen gövdeyi doğrular ve normalleştirir.
 *
 * Burası güven sınırıdır: istemciden gelen hiçbir değere güvenilmez. Geçersiz
 * gövde `null` döner ve kayıt yapılmaz.
 */
export function govdeDogrula(govde: unknown, siteUrl: string): OlayGirdisi | null {
  if (typeof govde !== "object" || govde === null) return null;
  const ham = govde as { yol?: unknown; kaynak?: unknown };
  if (!yolGecerliMi(ham.yol)) return null;
  const yol = yolAyikla(ham.yol);
  if (!yolGecerliMi(yol)) return null;
  const kaynak =
    typeof ham.kaynak === "string" ? kaynakAlani(ham.kaynak, siteUrl) : null;
  return { yol, kaynak };
}
