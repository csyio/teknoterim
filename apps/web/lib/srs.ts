/**
 * Aralıklı tekrar (spaced repetition) mantığı — tamamen saf fonksiyonlar.
 *
 * Leitner kutu modeli kullanılır: doğru cevap terimi bir üst kutuya taşır,
 * yanlış cevap sıfırlar. Kutular sabit aralıklara karşılık gelir. Model
 * bilinçli olarak basit: kullanıcı "neden bu terim yarın tekrar önüme
 * çıkacak?" sorusunun cevabını anlayabilmeli.
 */

/** Kutu → sonraki tekrar (gün). 0 = ilk gün. */
export const ARALIKLAR_GUN = [0, 1, 3, 7, 16, 35] as const;
export const EN_BUYUK_KUTU = ARALIKLAR_GUN.length - 1;

export type Durum = {
  /** 0..5 arası Leitner kutusu. */
  kutu: number;
  /** Sonraki tekrar tarihi, "YYYY-AA-GG". Boşsa terim henüz çalışılmadı. */
  sonraki: string;
  dogru: number;
  yanlis: number;
  /** Kullanıcı "bu terimi biliyorum" dediyse tekrar sırasından çıkar. */
  ogrenildi: boolean;
};

export const YENI_DURUM: Durum = {
  kutu: 0,
  sonraki: "",
  dogru: 0,
  yanlis: 0,
  ogrenildi: false,
};

/** Yerel saatle "YYYY-AA-GG". Saat dilimi kaymalarına yol açmamak için elle biçimlenir. */
export function gunMetni(t: Date = new Date()): string {
  const y = t.getFullYear();
  const a = String(t.getMonth() + 1).padStart(2, "0");
  const g = String(t.getDate()).padStart(2, "0");
  return `${y}-${a}-${g}`;
}

/**
 * İstemcide bugünün tarihi. Sunucu render'ında hesaplanmaz: `new Date()`
 * ön derleme sırasında "değişken değer" sayılır ve derlemeyi durdurur.
 * Sunucuda zaten boş ilerleme ile çalışıldığı için bu değer orada gereksizdir.
 */
export function bugun(): string {
  if (typeof window === "undefined") return "";
  return gunMetni();
}

export function gunEkle(gun: string, eklenecek: number): string {
  const [y, a, g] = gun.split("-").map(Number);
  const t = new Date(y, a - 1, g + eklenecek);
  return gunMetni(t);
}

/** Metin karşılaştırması yeterli: "YYYY-AA-GG" sözlük sırasıyla da kronolojiktir. */export function vadesiGeldi(durum: Durum | undefined, bugun = gunMetni()): boolean {
  if (!durum) return true; // hiç çalışılmamış terim her zaman sırada
  if (durum.ogrenildi) return false;
  if (!durum.sonraki) return true;
  return durum.sonraki <= bugun;
}

export function cevapla(durum: Durum, dogruMu: boolean, bugun = gunMetni()): Durum {
  const kutu = dogruMu ? Math.min(durum.kutu + 1, EN_BUYUK_KUTU) : 0;
  return {
    ...durum,
    kutu,
    sonraki: gunEkle(bugun, ARALIKLAR_GUN[kutu]),
    dogru: durum.dogru + (dogruMu ? 1 : 0),
    yanlis: durum.yanlis + (dogruMu ? 0 : 1),
  };
}

/** Kullanıcı terimi "biliyorum" olarak işaretler ya da işareti kaldırır. */
export function ogrenildiAyarla(durum: Durum, deger: boolean, bugun = gunMetni()): Durum {
  return deger
    ? { ...durum, ogrenildi: true, kutu: EN_BUYUK_KUTU, sonraki: gunEkle(bugun, ARALIKLAR_GUN[EN_BUYUK_KUTU]) }
    : { ...durum, ogrenildi: false, kutu: 0, sonraki: bugun };
}

export type Ozet = {
  toplam: number;
  ogrenilen: number;
  sirada: number;
  yeni: number;
};

export function ozetle(sluglar: string[], ilerleme: Record<string, Durum>, bugun = gunMetni()): Ozet {
  let ogrenilen = 0;
  let sirada = 0;
  let yeni = 0;

  for (const slug of sluglar) {
    const durum = ilerleme[slug];
    if (durum?.ogrenildi) ogrenilen++;
    else if (!durum || !durum.sonraki) yeni++;
    else if (vadesiGeldi(durum, bugun)) sirada++;
  }

  return { toplam: sluglar.length, ogrenilen, sirada, yeni };
}
