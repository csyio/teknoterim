import Link from "next/link";

import { ozetParcala } from "@/lib/gundem";
import { terimSluglari } from "@/lib/terms";

/**
 * Haber özetini paragraflar hâlinde basar.
 *
 * HTML ya da Markdown olarak yorumlanmaz: yalnızca `[metin](/sozluk/slug)`
 * sözlük bağlantısına dönüşür (sözlükte olmayan slug düz metin kalır), geri
 * kalan her şey React'in kaçışladığı düz metindir. Böylece taslağa (ya da
 * düzeltilmiş metne) giren hiçbir şey sayfaya betik veya dış bağlantı
 * sokamaz.
 */
export function OzetMetni({ ozet }: { ozet: string }) {
  return (
    <div className="gundem-ozet">
      {ozetParcala(ozet, terimSluglari()).map((paragraf, i) => (
        <p key={i}>
          {paragraf.map((parca, j) =>
            parca.slug ? (
              <Link key={j} href={`/sozluk/${parca.slug}`}>
                {parca.metin}
              </Link>
            ) : (
              parca.metin
            )
          )}
        </p>
      ))}
    </div>
  );
}
