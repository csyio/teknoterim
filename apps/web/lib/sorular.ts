/**
 * Soru üretici.
 *
 * Sorular elde yazılmaz; terim içeriğinden türetilir. Böylece 500 terime
 * çıktığımızda da quiz kendiliğinden büyür — bakımı gereken ikinci bir
 * içerik kümesi oluşmaz.
 */

export type TerimOzeti = {
  slug: string;
  baslik: string;
  kategori: string;
  ozet: string;
  isler: string[];
};

export type SoruTuru = "tanimdan-terim" | "terimden-tanim";

export type Soru = {
  slug: string;
  tur: SoruTuru;
  /** Sorulan metin. */
  soru: string;
  dogru: string;
  secenekler: string[];
};

/* --------------------------- belirlenimci rastgelelik --------------------------- */
/* Aynı terim + aynı deneme her zaman aynı soruyu üretir: sunucu ve istemci
   çıktısı ile ekran görüntüleri tutarlı kalır, ama denemeler arasında değişir. */

function tohum(metin: string): number {
  let h = 2166136261;
  for (let i = 0; i < metin.length; i++) {
    h ^= metin.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rastgeleUret(tohumDeger: number): () => number {
  let t = tohumDeger;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function karistir<T>(dizi: T[], rng: () => number): T[] {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

/** Doğru cevabın yanına 3 çeldirici seçer; önce aynı kategoriden tercih eder. */
function celdiriciler(
  terim: TerimOzeti,
  havuz: TerimOzeti[],
  deger: (t: TerimOzeti) => string,
  adet: number,
  rng: () => number
): string[] {
  const dogruDeger = deger(terim);
  const uygun = havuz.filter((t) => t.slug !== terim.slug && deger(t) !== dogruDeger);

  const ayniKategori = uygun.filter((t) => t.kategori === terim.kategori);
  const digerleri = uygun.filter((t) => t.kategori !== terim.kategori);

  const secilen: string[] = [];
  const ekle = (kaynak: TerimOzeti[]) => {
    for (const t of karistir(kaynak, rng)) {
      if (secilen.length >= adet) return;
      const d = deger(t);
      if (!secilen.includes(d) && d !== dogruDeger) secilen.push(d);
    }
  };

  ekle(ayniKategori); // önce zor/benzer olanlar
  ekle(digerleri);    // yetmezse havuzdan tamamla
  return secilen;
}

/**
 * Bir terim için soru üretir.
 *
 * @param deneme Aynı terim kaçıncı kez soruluyor (soruyu çeşitlendirir).
 */
export function soruUret(terim: TerimOzeti, havuz: TerimOzeti[], deneme = 0): Soru {
  const rng = rastgeleUret(tohum(`${terim.slug}#${deneme}`));
  const tur: SoruTuru = rng() < 0.5 ? "tanimdan-terim" : "terimden-tanim";

  if (tur === "tanimdan-terim") {
    const dogru = terim.baslik;
    return {
      slug: terim.slug,
      tur,
      soru: terim.ozet,
      dogru,
      secenekler: karistir([dogru, ...celdiriciler(terim, havuz, (t) => t.baslik, 3, rng)], rng),
    };
  }

  const dogru = terim.ozet;
  return {
    slug: terim.slug,
    tur,
    soru: terim.baslik,
    dogru,
    secenekler: karistir([dogru, ...celdiriciler(terim, havuz, (t) => t.ozet, 3, rng)], rng),
  };
}
