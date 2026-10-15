import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { markdown } from "@/lib/md";
import { SITE } from "@/lib/site";
import { terimBul, tumTerimler } from "@/lib/terms";
import { OgrenmeDugmesi } from "./OgrenmeDugmesi";

/** Terim sayfaları derleme zamanında üretilir (her terim kendi URL'si = SEO). */
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

export default async function TerimSayfasi(props: PageProps<"/sozluk/[slug]">) {
  const { slug } = await props.params;
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
    <div className="kabuk">
      <article className="terim-detay">
        <Link className="geri" href="/sozluk">
          ← Sözlük
        </Link>

        <h1>{terim.baslik}</h1>
        <span className="kat">{terim.kategori}</span>

        <OgrenmeDugmesi slug={terim.slug} />

        <div className="katman">
          <span className="katman-baslik">Nedir</span>
          <p>{terim.ozet}</p>
        </div>

        <div
          className="katman"
          dangerouslySetInnerHTML={{
            __html: `<span class="katman-baslik">Ne amaçla kullanılır</span>${markdown(terim.amac)}`,
          }}
        />

        {terim.isler.length > 0 && (
          <div className="katman">
            <span className="katman-baslik">Hangi işte karşınıza çıkar</span>
            <div className="rozetler">
              {terim.isler.map((i) => (
                <span key={i} className="rozet">
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        <div
          className="katman isaret"
          dangerouslySetInnerHTML={{
            __html: `<span class="katman-baslik">Örnek</span>${markdown(terim.ornek)}`,
          }}
        />
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(yapisalVeri) }}
      />
    </div>
  );
}
