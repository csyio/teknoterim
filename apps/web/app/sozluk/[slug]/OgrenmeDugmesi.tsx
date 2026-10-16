"use client";

import Link from "next/link";
import { durumGetir, durumYaz, useIlerleme } from "@/lib/ilerleme";
import { ogrenildiAyarla } from "@/lib/srs";

/**
 * Terim sayfasındaki öğrenme denetimi.
 *
 * Sunucu anlık görüntüsü boş olduğu için sayfa ilk olarak "işaretlenmemiş"
 * hâlde gelir; hidrasyondan hemen sonra tarayıcıdaki gerçek duruma döner.
 * Bu bilinçli bir tercih: terim sayfaları statik kalır (SEO), ilerleme ise
 * yalnızca tarayıcıda yaşar.
 */
export function OgrenmeDugmesi({ slug }: { slug: string }) {
  const ilerleme = useIlerleme();
  const durum = durumGetir(ilerleme, slug);
  const calisildi = durum.dogru + durum.yanlis > 0;

  return (
    <div className="ogrenme">
      <button
        className="dugme"
        type="button"
        aria-pressed={durum.ogrenildi}
        onClick={() => durumYaz(slug, ogrenildiAyarla(durum, !durum.ogrenildi))}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {durum.ogrenildi ? "Öğrenildi" : "Öğrendim"}
      </button>

      <Link className="baglanti-dugme" href="/calis">
        Çalış
      </Link>

      {calisildi && (
        <span className="mono">
          {durum.dogru} doğru · {durum.yanlis} yanlış
        </span>
      )}
    </div>
  );
}
