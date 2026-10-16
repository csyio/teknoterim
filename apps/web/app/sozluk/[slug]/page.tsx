import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { markdown } from "@/lib/md";
import { SITE } from "@/lib/site";
import { terimBul, tumTerimler } from "@/lib/terms";
import { OgrenmeDugmesi } from "./OgrenmeDugmesi";

/**
 * Tanımlı slug dışındaki adresler `notFound()` ile karşılanıyor.
 *
 * Burada klasik çözüm `export const dynamicParams = false` olurdu, ama
 * `cacheComponents` açıkken bu ayar derlemeyi kırıyor (Next 16 kısıtı).
 * Kısmi prerender'da kabuk 200 ile gönderildiği için bilinmeyen adres
 * "yumuşak 404" üretiyor; Next bunun yerine yanıta
 * `<meta name="robots" content="noindex">` ekliyor, yani arama motorları
 * bu sayfayı indekslemiyor. Aşağıdaki `notFound()` bu yüzden doğru çağrı.
 */
export function generateStaticParams() {
  return tumTerimler().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(
  props: PageProps<"/sozluk/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const terim = terimBul(slug);
  if (!terim) return {};

  return {
    // Arama niyeti "X nedir" biçiminde; başlığı ona göre kuruyoruz.
    title: `${terim.baslik} nedir?`,
    description: terim.ozet,
    alternates: { canonical: `/sozluk/${terim.slug}` },
    openGraph: {
      type: "article",
      title: `${terim.baslik} nedir?`,
      description: terim.ozet,
      url: `/sozluk/${terim.slug}`,
    },
  };
}

/**
 * Sayfa iki katmanlı: kabuk (`TerimSayfasi`) URL'ye bakmadan hemen çizilir,
 * terim içeriği (`TerimIcerigi`) `params`'ı bekler ve `<Suspense>` içinde
 * gelir. Böylece sözlükten bir terime geçiş anında başlar: önce iskelet,
 * sonra içerik. 153 terimin hepsi derlemede zaten üretildiği için içerik
 * gecikmesi fark edilmeyecek kadar kısadır.
 */
export default function TerimSayfasi(props: PageProps<"/sozluk/[slug]">) {
  return (
    <div className="kabuk">
      <Suspense fallback={<TerimIskeleti />}>
        <TerimIcerigi params={props.params} />
      </Suspense>
    </div>
  );
}

function TerimIskeleti() {
  return (
    <div className="terim-detay" aria-busy="true" aria-label="Terim yükleniyor">
      <div className="iskelet iskelet-yol" />
      <div className="iskelet iskelet-baslik" />
      <div className="iskelet iskelet-satir" />
      <div className="iskelet iskelet-satir kisa" />
      <div className="iskelet iskelet-panel" />
    </div>
  );
}

async function TerimIcerigi({ params }: { params: PageProps<"/sozluk/[slug]">["params"] }) {
  const { slug } = await params;
  const terim = terimBul(slug);
  if (!terim) notFound();

  const yapisalVeri = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: terim.baslik,
    description: terim.ozet,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: `${SITE.ad} sözlüğü`,
      url: `${SITE.url}/sozluk`,
    },
    url: `${SITE.url}/sozluk/${terim.slug}`,
  };

  return (
    <>
      <article className="terim-detay">
        <nav className="yol" aria-label="Konum">
          <Link href="/sozluk">Sözlük</Link>
          <span aria-hidden="true">/</span>
          <span>{terim.kategori}</span>
        </nav>

        <header className="terim-ust">
          <h1>{terim.baslik}</h1>
          <span className="kat">{terim.kategori}</span>
        </header>

        {/* "Nedir" katmanı: sayfanın girişi. Başlığı yalnızca ekran okuyucuya
            görünür; görsel olarak tanımın kendisi yeterince belirgin. */}
        <section className="terim-tanim" aria-labelledby="nedir">
          <h2 id="nedir" className="gizli">
            Nedir
          </h2>
          <p>{terim.ozet}</p>
        </section>

        <OgrenmeDugmesi slug={terim.slug} />

        <div className="katmanlar panel">
          <section className="katman">
            <h2 className="katman-baslik">Ne amaçla kullanılır</h2>
            <div
              className="katman-govde"
              dangerouslySetInnerHTML={{ __html: markdown(terim.amac) }}
            />
          </section>

          {terim.isler.length > 0 && (
            <section className="katman">
              <h2 className="katman-baslik">Hangi işte karşınıza çıkar</h2>
              <div className="rozetler">
                {terim.isler.map((i) => (
                  <span key={i} className="rozet">
                    {i}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="katman isaret">
            <h2 className="katman-baslik">Örnek</h2>
            <div
              className="katman-govde"
              dangerouslySetInnerHTML={{ __html: markdown(terim.ornek) }}
            />
          </section>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(yapisalVeri) }}
      />
    </>
  );
}
