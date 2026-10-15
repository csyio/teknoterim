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
        className="cip"
        type="button"
        aria-pressed={durum.ogrenildi}
        onClick={() => durumYaz(slug, ogrenildiAyarla(durum, !durum.ogrenildi))}
      >
        {durum.ogrenildi ? "✓ Öğrendim" : "Öğrendim olarak işaretle"}
      </button>

      {calisildi && (
        <span className="mono">
          {durum.dogru} doğru · {durum.yanlis} yanlış
        </span>
      )}

      <Link className="tamami" href="/calis">
        Çalış →
      </Link>
    </div>
  );
}
