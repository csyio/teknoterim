import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** Tek bir sözlük terimi ve dört katmanlı anlatımı. */
export type Terim = {
  slug: string;
  baslik: string;
  kategori: string;
  /** Tek cümlelik tanım ("nedir"). */
  ozet: string;
  /** Terimin sahada karşımıza çıktığı işler. */
  isler: string[];
  kaynaklar: string[];
  /** "Ne amaçla kullanılır" katmanı. */
  amac: string;
  /** "Örnek" katmanı. */
  ornek: string;
};

/**
 * İçerik koddan ayrı durur (content/terimler): terim eklemek ya da düzeltmek
 * için uygulama koduna dokunmak gerekmez. Yol sabittir; böylece derleme
 * aracı yalnızca bu klasörü izler ve dağıtım çıktısı küçük kalır.
 */
const ICERIK_DIZINI = path.join(process.cwd(), "content", "terimler");

const ZORUNLU = ["baslik", "kategori", "ozet"] as const;

function metin(deger: unknown): string {
  return typeof deger === "string" ? deger.trim() : "";
}

function liste(deger: unknown): string[] {
  if (!Array.isArray(deger)) return [];
  return deger.map((x) => metin(x)).filter(Boolean);
}

/** "## Başlık" bölümlerini etiketlerine göre ayırır. */
function bolumler(govde: string): Record<string, string> {
  const sonuc: Record<string, string> = {};
  const parcalar = govde.split(/^##\s+/m).slice(1);
  for (const parca of parcalar) {
    const satirSonu = parca.indexOf("\n");
    if (satirSonu === -1) continue;
    const baslik = parca.slice(0, satirSonu).trim().toLocaleLowerCase("tr");
    const icerik = parca.slice(satirSonu + 1).trim();
    if (baslik.includes("amaçla")) sonuc.amac = icerik;
    else if (baslik.includes("örnek")) sonuc.ornek = icerik;
  }
  return sonuc;
}

function oku(dosyaYolu: string): Terim {
  const ham = fs.readFileSync(dosyaYolu, "utf8");
  const { data, content } = matter(ham);

  for (const alan of ZORUNLU) {
    if (!metin(data[alan])) {
      throw new Error(
        `İçerik hatası: ${path.basename(dosyaYolu)} → "${alan}" alanı boş veya eksik.`
      );
    }
  }

  const govde = bolumler(content);
  if (!govde.amac || !govde.ornek) {
    throw new Error(
      `İçerik hatası: ${path.basename(dosyaYolu)} → "## Ne amaçla kullanılır" ve "## Örnek" bölümleri zorunludur.`
    );
  }

  const dosyaSlug = path.basename(dosyaYolu, ".md");
  const slug = metin(data.slug) || dosyaSlug;
  if (slug !== dosyaSlug) {
    throw new Error(
      `İçerik hatası: ${path.basename(dosyaYolu)} → frontmatter slug ("${slug}") dosya adıyla ("${dosyaSlug}") uyuşmuyor.`
    );
  }

  return {
    slug,
    baslik: metin(data.baslik),
    kategori: metin(data.kategori),
    ozet: metin(data.ozet),
    isler: liste(data.isler),
    kaynaklar: liste(data.kaynaklar),
    amac: govde.amac,
    ornek: govde.ornek,
  };
}

let onbellek: Terim[] | null = null;

/** Türkçe sıralamaya uygun, başlığa göre dizilmiş tüm terimler. */
export function tumTerimler(): Terim[] {
  if (onbellek) return onbellek;

  if (!fs.existsSync(ICERIK_DIZINI)) {
    throw new Error(`İçerik dizini bulunamadı: ${ICERIK_DIZINI}`);
  }

  onbellek = fs
    .readdirSync(ICERIK_DIZINI)
    .filter((d) => d.endsWith(".md"))
    .map((d) => oku(path.join(ICERIK_DIZINI, d)))
    .sort((a, b) => a.baslik.localeCompare(b.baslik, "tr"));

  return onbellek;
}

let slugKumesi: ReadonlySet<string> | null = null;

/** Sözlükteki tüm slug'lar (gündem özetindeki bağlantıları denetlemek için). */
export function terimSluglari(): ReadonlySet<string> {
  slugKumesi ??= new Set(tumTerimler().map((t) => t.slug));
  return slugKumesi;
}

export function terimBul(slug: string): Terim | undefined {
  return tumTerimler().find((t) => t.slug === slug);
}

/** Kullanılan kategoriler ve terim sayıları. */
export function kategoriler(): { ad: string; adet: number }[] {
  const sayac = new Map<string, number>();
  for (const t of tumTerimler()) {
    sayac.set(t.kategori, (sayac.get(t.kategori) ?? 0) + 1);
  }
  return [...sayac.entries()]
    .map(([ad, adet]) => ({ ad, adet }))
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
}
