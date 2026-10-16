/**
 * TCMB kur bülteninin saf ayrıştırıcısı.
 *
 * Kaynak: https://www.tcmb.gov.tr/kurlar/today.xml — Merkez Bankası'nın her iş
 * günü 15:30'da yayımladığı gösterge niteliğindeki kurlar. Hafta sonu ve
 * tatillerde son iş gününün bülteni döner.
 *
 * Kurlar tarayıcıya doğrudan TCMB'den değil kendi sunucumuzdan verilir
 * (`/api/kur`): ziyaretçinin bilgisi üçüncü tarafa gitmez (bkz. olcum.ts'teki
 * gizlilik kuralları).
 *
 * Çıktı biçimi bilinçli olarak yaygın kur servislerininkiyle aynıdır
 * (`{ rates, time_last_update_unix }`, USD tabanlı): çevirici bileşeni hangi
 * kaynaktan beslendiğini bilmek zorunda kalmaz.
 */

export type KurYaniti = {
  /** Kaynak etiketi; arayüzde gösterilir. */
  kaynak: "TCMB";
  /** 1 USD'nin her para birimindeki karşılığı. */
  rates: Record<string, number>;
  /** Bültenin yayım anı (Unix saniye). */
  time_last_update_unix: number;
};

/** TCMB bülteni 15:30 TR'de (12:30 UTC) yayımlanır; Türkiye yaz saati uygulamıyor. */
const YAYIM_SAATI_UTC = 12;
const YAYIM_DAKIKASI = 30;

function sayi(metin: string | undefined): number | null {
  if (!metin) return null;
  const n = Number(metin.trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

function etiket(blok: string, ad: string): string | undefined {
  return new RegExp(`<${ad}>([^<]*)</${ad}>`).exec(blok)?.[1];
}

/**
 * Bülteni ayrıştırır. Beklenen biçimde değilse `null` döner; yarım veri
 * üretmek yerine hiç veri vermemek daha güvenlidir (yanlış kur, kur
 * olmamasından kötüdür).
 *
 * Döviz satış kuru (`ForexSelling`) kullanılır. `Unit` 1'den büyük olabilir
 * (ör. 100 JPY); kur birime bölünür.
 */
export function tcmbAyristir(xml: string): KurYaniti | null {
  const tarih = /<Tarih_Date[^>]*\sTarih="(\d{2})\.(\d{2})\.(\d{4})"/.exec(xml);
  if (!tarih) return null;
  const [, gun, ay, yil] = tarih;
  const an = Date.UTC(Number(yil), Number(ay) - 1, Number(gun), YAYIM_SAATI_UTC, YAYIM_DAKIKASI);

  // Kod → 1 birimin TL karşılığı.
  const tl: Record<string, number> = {};
  for (const eslesme of xml.matchAll(/<Currency[^>]*\sKod="([A-Z]{3})"[^>]*>([\s\S]*?)<\/Currency>/g)) {
    const [, kod, blok] = eslesme;
    const birim = sayi(etiket(blok, "Unit"));
    const satis = sayi(etiket(blok, "ForexSelling"));
    if (birim === null || satis === null) continue;
    tl[kod] = satis / birim;
  }

  const usdTl = tl.USD;
  if (!usdTl) return null;

  const rates: Record<string, number> = { USD: 1, TRY: usdTl };
  for (const [kod, deger] of Object.entries(tl)) {
    if (kod !== "USD") rates[kod] = usdTl / deger;
  }

  return { kaynak: "TCMB", rates, time_last_update_unix: Math.floor(an / 1000) };
}
