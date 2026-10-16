/**
 * Yönetim girişinin saf kriptografi yardımcıları.
 *
 * Şifrenin kendisi hiçbir yerde saklanmaz. Sunucuda yalnızca scrypt özeti
 * durur (`YONETIM_SIFRE_OZETI`, /etc/teknoterim/web.env). Özeti üretmek için:
 *
 *   npm run sifre-ozeti
 *
 * Biçim:  scrypt:<N>:<r>:<p>:<tuz base64url>:<özet base64url>
 * (`$` yerine `:` kullanıldı: systemd ortam dosyalarında ve kabukta kaçış
 * gerektirmez.)
 *
 * Oturum belirteci rastgele 32 bayttır; çerezde belirtecin kendisi,
 * veritabanında yalnızca SHA-256 özeti durur. Veritabanı sızsa bile oturum
 * çalınamaz.
 */

import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const N = 1 << 15;
const R = 8;
const P = 1;
const UZUNLUK = 32;

function scryptAsync(sifre: string, tuz: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((coz, reddet) => {
    // maxmem: 128·N·r bayt gerekir; varsayılan tavan (32 MB) tam sınırda kalıyor.
    scrypt(sifre, tuz, UZUNLUK, { N: n, r, p, maxmem: 256 * n * r }, (hata, anahtar) =>
      hata ? reddet(hata) : coz(anahtar)
    );
  });
}

export async function sifreOzetiUret(sifre: string): Promise<string> {
  const tuz = randomBytes(16);
  const ozet = await scryptAsync(sifre, tuz, N, R, P);
  return `scrypt:${N}:${R}:${P}:${tuz.toString("base64url")}:${ozet.toString("base64url")}`;
}

/**
 * Şifre özetle eşleşiyor mu? Bozuk ya da makul olmayan parametreli özet
 * (ör. aşırı büyük N ile bellek tüketme denemesi) her zaman `false` döner.
 */
export async function sifreDogrula(sifre: string, ozetMetni: string | undefined): Promise<boolean> {
  if (!ozetMetni || sifre.length === 0 || sifre.length > 1024) return false;
  const parca = ozetMetni.trim().split(":");
  if (parca.length !== 6 || parca[0] !== "scrypt") return false;
  const [n, r, p] = parca.slice(1, 4).map(Number);
  if (!Number.isInteger(n) || n < 1 << 14 || n > 1 << 17 || (n & (n - 1)) !== 0) return false;
  if (!Number.isInteger(r) || r < 1 || r > 16 || !Number.isInteger(p) || p < 1 || p > 4) return false;

  const tuz = Buffer.from(parca[4], "base64url");
  const beklenen = Buffer.from(parca[5], "base64url");
  if (tuz.length < 16 || beklenen.length !== UZUNLUK) return false;

  const gelen = await scryptAsync(sifre, tuz, n, r, p);
  return timingSafeEqual(gelen, beklenen);
}

/** Çereze yazılan oturum belirteci (43 karakter base64url). */
export function belirtecUret(): string {
  return randomBytes(32).toString("base64url");
}

export function belirtecBicimiGecerli(belirtec: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(belirtec);
}

/** Veritabanında saklanan biçim. */
export function belirtecOzeti(belirtec: string): string {
  return createHash("sha256").update(belirtec).digest("hex");
}
