/**
 * Gündem bölümünün saf yardımcıları.
 *
 * Buradaki fonksiyonlar ağa ve veritabanına dokunmaz; aynı kurallar hem
 * toplayıcıda (araclar/gundem.ts) hem sitede hem de testlerde kullanılır.
 *
 * İçerik kuralları (ürün kararı):
 *   - Haber metni asla kopyalanmaz. Sitede yalnızca başlık, editörün
 *     onayladığı özgün Türkçe özet ve kaynak bağlantısı durur.
 *   - Özetteki tek bağlantı türü sözlüğe giden iç bağlantıdır
 *     (`[metin](/sozluk/slug)`). Başka hiçbir bağlantı ya da biçim
 *     yorumlanmaz; metin olduğu gibi (kaçışlanarak) gösterilir.
 */

import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";

import { gunMetni } from "./olcum.ts";

// ------------------------------------------------------------------ ayarlar

export type GundemAyarlari = {
  /** Bu puanın (1–5) altındaki haberler taslağa dönüşmez. */
  esik: number;
  /** Bir günde (Türkiye saatiyle) yazılabilecek en fazla taslak. */
  gunlukTavan: number;
};

function tamSayi(deger: string | undefined, varsayilan: number, en: number, enFazla: number): number {
  const sayi = Number(deger);
  if (!deger || !Number.isInteger(sayi)) return varsayilan;
  return Math.min(enFazla, Math.max(en, sayi));
}

/** Ortam değişkenlerinden ayarlar; geçersiz değer sessizce varsayılana döner. */
export function ayarlariOku(env: Record<string, string | undefined>): GundemAyarlari {
  return {
    esik: tamSayi(env.GUNDEM_ESIK, 4, 1, 5),
    gunlukTavan: tamSayi(env.GUNDEM_GUNLUK_TAVAN, 20, 0, 50),
  };
}

/** Bugün için kalan taslak hakkı. */
export function kalanTaslakHakki(bugunYazilan: number, tavan: number): number {
  return Math.max(0, tavan - bugunYazilan);
}

export { gunMetni };

// ----------------------------------------------------------- bağlantı kimliği

/** İzleme parametreleri: aynı haberin farklı adreslerle iki kez alınmasını önler. */
const IZLEME = /^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$|ref$|_hs)/i;

/**
 * Haber adresini karşılaştırılabilir biçime getirir. Yalnızca http(s)
 * kabul edilir ve http, https'e yükseltilir (okura şifresiz bağlantı
 * verilmez); geçersizse `null`.
 */
export function baglantiNormallestir(adres: string): string | null {
  let url: URL;
  try {
    url = new URL(adres.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  url.protocol = "https:";
  url.hash = "";
  for (const ad of [...url.searchParams.keys()]) {
    if (IZLEME.test(ad)) url.searchParams.delete(ad);
  }
  url.hostname = url.hostname.toLowerCase();
  return url.toString();
}

/** Veritabanındaki tekillik anahtarı: normalleştirilmiş adresin özeti. */
export function haberKimligi(normalAdres: string): string {
  return createHash("sha256").update(normalAdres).digest("hex").slice(0, 32);
}

// ---------------------------------------------------------- metin temizleme

const VARLIKLAR: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…",
  ndash: "–", mdash: "—", middot: "·", copy: "©", reg: "®", trade: "™",
};

function varlikCoz(metin: string): string {
  return metin.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (tam, ad: string) => {
    if (ad[0] === "#") {
      const kod = ad[1] === "x" || ad[1] === "X" ? parseInt(ad.slice(2), 16) : parseInt(ad.slice(1), 10);
      return Number.isFinite(kod) && kod > 0 && kod <= 0x10ffff ? String.fromCodePoint(kod) : "";
    }
    return VARLIKLAR[ad.toLowerCase()] ?? tam;
  });
}

/**
 * HTML parçasını düz metne çevirir: etiketler atılır, boşluklar tekleşir.
 * Bazı beslemeler HTML'i bir kez daha kaçışlar (`&lt;img …&gt;`); bu yüzden
 * önce varlıklar çözülür, sonra etiketler atılır. Çıktı yalnızca düz metin
 * olarak kullanılır (React kaçışlar), HTML olarak basılmaz.
 */
export function metniTemizle(html: string): string {
  return varlikCoz(
    varlikCoz(html)
      .replace(/<!\[CDATA\[|\]\]>/g, "")
      .replace(/<(script|style|noscript|svg|iframe)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]*>/g, " ")
  )
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/ *\n[\s]*/g, "\n")
    .trim();
}

/** Makale sayfasından okunacak metni çıkarır (Claude'a verilir, sitede gösterilmez). */
export function makaleMetni(html: string, enFazla = 12_000): string {
  const govde =
    html.match(/<article[\s\S]*?<\/article>/i)?.[0] ??
    html.match(/<main[\s\S]*?<\/main>/i)?.[0] ??
    html.match(/<body[\s\S]*<\/body>/i)?.[0] ??
    html;
  const temiz = metniTemizle(
    govde.replace(/<(nav|header|footer|aside|form)[\s\S]*?<\/\1>/gi, " ")
  );
  return temiz.slice(0, enFazla);
}

// ------------------------------------------------------- besleme ayrıştırma

export type BeslemeOgesi = {
  baslik: string;
  baglanti: string;
  /** Beslemedeki kısa açıklama, düz metin. Yalnızca ayıklamada kullanılır. */
  aciklama: string;
  /** Yayın anı (Unix ms) ya da bilinmiyorsa null. */
  yayinAni: number | null;
};

const ayristirici = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Beslemelerdeki HTML açıklamaları metin olarak kalsın, ağaca dönüşmesin.
  stopNodes: ["*.description", "*.summary", "*.content", "*.content:encoded"],
  isArray: (ad) => ad === "item" || ad === "entry" || ad === "link",
  processEntities: true,
  htmlEntities: false,
  trimValues: true,
});

function metinAl(deger: unknown): string {
  if (deger == null) return "";
  if (typeof deger === "string") return deger;
  if (typeof deger === "number") return String(deger);
  if (Array.isArray(deger)) return metinAl(deger[0]);
  if (typeof deger === "object" && "#text" in deger) return metinAl((deger as { "#text": unknown })["#text"]);
  return "";
}

function anAl(deger: unknown): number | null {
  const metin = metinAl(deger);
  if (!metin) return null;
  const an = Date.parse(metin);
  return Number.isFinite(an) ? an : null;
}

/** RSS 2.0 `<link>` metindir; Atom `<link href rel>` özniteliklidir. */
function baglantiAl(linkler: unknown): string {
  if (!Array.isArray(linkler)) return metinAl(linkler);
  for (const l of linkler) {
    if (typeof l === "string" && l.trim()) return l;
    if (l && typeof l === "object") {
      const o = l as Record<string, unknown>;
      const rel = typeof o["@_rel"] === "string" ? o["@_rel"] : "alternate";
      if (rel === "alternate" && typeof o["@_href"] === "string") return o["@_href"];
      if (typeof o["#text"] === "string" && o["#text"].trim()) return o["#text"];
    }
  }
  return "";
}

const EN_UZUN_BASLIK = 300;
const EN_UZUN_ACIKLAMA = 600;

/**
 * RSS 2.0 ya da Atom beslemesini öğelere ayırır. Bozuk ya da tanınmayan
 * besleme boş liste döner; tek bir kaynağın hatası toplamayı durdurmaz.
 */
export function beslemeAyristir(xml: string): BeslemeOgesi[] {
  let agac: Record<string, unknown>;
  try {
    agac = ayristirici.parse(xml) as Record<string, unknown>;
  } catch {
    return [];
  }

  const rss = agac.rss as { channel?: { item?: unknown[] } } | undefined;
  const atom = agac.feed as { entry?: unknown[] } | undefined;
  const hamlar = rss?.channel?.item ?? atom?.entry ?? [];

  const sonuc: BeslemeOgesi[] = [];
  for (const ham of hamlar) {
    if (!ham || typeof ham !== "object") continue;
    const o = ham as Record<string, unknown>;
    const baslik = metniTemizle(metinAl(o.title)).replace(/\s+/g, " ").slice(0, EN_UZUN_BASLIK);
    const baglanti = baglantiAl(o.link) || (o.guid && /^https?:/.test(metinAl(o.guid)) ? metinAl(o.guid) : "");
    if (!baslik || !baglanti) continue;
    const aciklama = metniTemizle(metinAl(o.description ?? o.summary ?? o.content ?? o["content:encoded"]))
      .replace(/\s+/g, " ")
      .slice(0, EN_UZUN_ACIKLAMA);
    sonuc.push({
      baslik,
      baglanti: baglanti.trim(),
      aciklama,
      yayinAni: anAl(o.pubDate ?? o.published ?? o.updated ?? o["dc:date"]),
    });
  }
  return sonuc;
}

// ------------------------------------------------------- özet ve bağlantılar

export type Parca = { metin: string; slug?: string };
export type Paragraf = Parca[];

const SOZLUK_BAGLANTISI = /\[([^\][\n]{1,80})\]\(\/sozluk\/([a-z0-9-]{1,80})\)/g;

/**
 * Özet metnini paragraflara ve parçalara ayırır. Yalnızca
 * `[metin](/sozluk/slug)` bağlantıya dönüşür; `sluglar` verilirse sözlükte
 * olmayan slug düz metin olarak kalır. Geri kalan her şey düz metindir.
 */
export function ozetParcala(ozet: string, sluglar?: ReadonlySet<string>): Paragraf[] {
  return ozet
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map((paragraf) => {
      const parcalar: Parca[] = [];
      let son = 0;
      for (const e of paragraf.matchAll(SOZLUK_BAGLANTISI)) {
        const [tam, metin, slug] = e;
        const bas = e.index ?? 0;
        if (bas > son) parcalar.push({ metin: paragraf.slice(son, bas) });
        parcalar.push(sluglar && !sluglar.has(slug) ? { metin } : { metin, slug });
        son = bas + tam.length;
      }
      if (son < paragraf.length) parcalar.push({ metin: paragraf.slice(son) });
      return parcalar;
    });
}

/** Parçalanmış özeti tekrar metne çevirir (bilinmeyen bağlantıları ayıklamak için). */
export function ozetYaz(paragraflar: Paragraf[]): string {
  return paragraflar
    .map((p) => p.map((x) => (x.slug ? `[${x.metin}](/sozluk/${x.slug})` : x.metin)).join(""))
    .join("\n\n");
}

/** Özette kullanılan sözlük terimleri (tekrarsız). */
export function kullanilanTerimler(ozet: string): string[] {
  const kume = new Set<string>();
  for (const p of ozetParcala(ozet)) for (const x of p) if (x.slug) kume.add(x.slug);
  return [...kume];
}

// --------------------------------------------------------- kopya denetimi

function kelimeler(metin: string): string[] {
  return metin
    .toLocaleLowerCase("tr")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/**
 * Özet, kaynak metinden art arda `n` kelimeyi aynen içeriyor mu?
 * Bulunursa ilk örtüşen parçayı, yoksa `null` döner. Kaynak İngilizce,
 * özet Türkçe olduğu için normalde hiç çakışma olmaz; bulunması "çeviri
 * kokan" ya da alıntılanmış bir taslağın işaretidir ve editöre gösterilir.
 */
export function kopyaParcasi(ozet: string, kaynak: string, n = 8): string | null {
  const k = kelimeler(kaynak);
  if (k.length < n) return null;
  const kume = new Set<string>();
  for (let i = 0; i + n <= k.length; i++) kume.add(k.slice(i, i + n).join(" "));
  const o = kelimeler(ozet);
  for (let i = 0; i + n <= o.length; i++) {
    const parca = o.slice(i, i + n).join(" ");
    if (kume.has(parca)) return parca;
  }
  return null;
}
