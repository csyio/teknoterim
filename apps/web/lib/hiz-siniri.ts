/**
 * Bellek içi hız sınırı (sabit pencere).
 *
 * Ölçüm ucu (`/api/olcum`) herkese açık ve her isteği veritabanına bir satır
 * olarak yazıyor. Sınır olmazsa tek bir betik diski doldurabilir. Bu yüzden
 * iki katman var:
 *
 *   - anahtar başına (IP): bir insan dakikada birkaç sayfa gezer; sınırın
 *     üstü bottur ve kaydedilmez,
 *   - genel: çok sayıda IP'den gelen dağıtık sele karşı toplam tavan.
 *
 * Bellekte tutulur, çünkü uygulama tek süreçtir (bkz. infra/teknoterim.service);
 * yeniden başlatmada sayaçların sıfırlanması kabul edilebilir. IP'ler yalnızca
 * pencere süresince bellekte durur, diske yazılmaz.
 *
 * Saf ve saat dışarıdan verilebilir: testler gerçek zamanı beklemez.
 */

export type HizSiniriAyarlari = {
  /** Pencere uzunluğu (ms). */
  pencereMs: number;
  /** Bir anahtarın pencere başına en fazla isteği. */
  anahtarBasina: number;
  /** Tüm anahtarların toplamı için pencere başına tavan. */
  toplam: number;
  /** Bellekte en fazla kaç anahtar tutulsun; aşılırsa eski pencereler atılır. */
  enFazlaAnahtar?: number;
};

export type HizSiniri = {
  /** İsteğe izin verilirse true döner ve sayacı artırır. */
  izinVer: (anahtar: string, an?: number) => boolean;
};

export function hizSiniriKur(ayar: HizSiniriAyarlari): HizSiniri {
  const enFazlaAnahtar = ayar.enFazlaAnahtar ?? 50_000;
  let pencereBasi = 0;
  let toplam = 0;
  let sayaclar = new Map<string, number>();

  return {
    izinVer(anahtar, an = Date.now()) {
      // Pencere dolunca her şey sıfırlanır: eski IP'ler bellekte kalmaz.
      if (an - pencereBasi >= ayar.pencereMs) {
        pencereBasi = an;
        toplam = 0;
        sayaclar = new Map();
      }

      if (toplam >= ayar.toplam) return false;

      const sayi = sayaclar.get(anahtar) ?? 0;
      if (sayi >= ayar.anahtarBasina) return false;

      // Çok sayıda farklı anahtarla belleği şişirme girişimi: yeni anahtar
      // kabul edilmez (toplam tavan zaten bu durumda devrededir).
      if (sayi === 0 && sayaclar.size >= enFazlaAnahtar) return false;

      sayaclar.set(anahtar, sayi + 1);
      toplam++;
      return true;
    },
  };
}
