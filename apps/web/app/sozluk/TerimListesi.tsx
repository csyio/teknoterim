"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type TerimOzeti = {
  slug: string;
  baslik: string;
  kategori: string;
  ozet: string;
  isler: string[];
};

/** Türkçe harfleri sadeleştirir ki "oltalama" araması "Oltalama"yı da bulsun. */
function sade(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşü]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[c] ?? c)
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
}

export function TerimListesi({
  terimler,
  kategoriler,
}: {
  terimler: TerimOzeti[];
  kategoriler: { ad: string; adet: number }[];
}) {
  const [arama, setArama] = useState("");
  const [kategori, setKategori] = useState<string | null>(null);

  const sonuclar = useMemo(() => {
    const q = sade(arama.trim());
    return terimler.filter((t) => {
      if (kategori && t.kategori !== kategori) return false;
      if (!q) return true;
      const havuz = [t.baslik, t.ozet, t.kategori, ...t.isler].join(" ");
      return sade(havuz).includes(q);
    });
  }, [arama, kategori, terimler]);

  return (
    <>
      <label className="gizli" htmlFor="terim-arama">
        Terim ara
      </label>
      <input
        id="terim-arama"
        className="arama"
        type="search"
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        placeholder="Terim, tanım veya iş ara — ör. “DNS”, “yedek”, “arıza”"
        autoComplete="off"
      />

      <div className="cipher" role="group" aria-label="Kategori filtresi">
        <button
          className="cip"
          type="button"
          aria-pressed={kategori === null}
          onClick={() => setKategori(null)}
        >
          Tümü
        </button>
        {kategoriler.map((k) => (
          <button
            key={k.ad}
            className="cip"
            type="button"
            aria-pressed={kategori === k.ad}
            onClick={() => setKategori(kategori === k.ad ? null : k.ad)}
          >
            {k.ad}
          </button>
        ))}
      </div>

      <p className="sayac" role="status">
        {sonuclar.length} / {terimler.length} terim
      </p>

      {sonuclar.length === 0 ? (
        <p className="bos">
          Aramanızla eşleşen terim yok. Farklı bir kelime deneyin ya da kategoriyi
          kaldırın.
        </p>
      ) : (
        <div className="kartlar">
          {sonuclar.map((t) => (
            <Link key={t.slug} className="kart" href={`/sozluk/${t.slug}`}>
              <div className="kart-ust">
                <h2>{t.baslik}</h2>
                <span className="kat">{t.kategori}</span>
              </div>
              <p className="ozet">{t.ozet}</p>
              {t.isler.length > 0 && (
                <div className="rozetler">
                  {t.isler.map((i) => (
                    <span key={i} className="rozet">
                      {i}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
