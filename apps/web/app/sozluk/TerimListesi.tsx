"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TerimOzeti } from "@/lib/sorular";

export type { TerimOzeti };

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
      <div className="arama-kutu">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="terim-arama"
          className="arama"
          type="search"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Terim, tanım veya iş ara — ör. “DNS”, “yedek”, “arıza”"
          autoComplete="off"
        />
      </div>

      <div className="cipler" role="group" aria-label="Kategori filtresi">
        <button
          className="cip"
          type="button"
          aria-pressed={kategori === null}
          onClick={() => setKategori(null)}
        >
          Tümü
          <span className="cip-adet">{terimler.length}</span>
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
            <span className="cip-adet">{k.adet}</span>
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
        <div className="dizin panel">
          {sonuclar.map((t) => (
            <Link key={t.slug} className="dizin-satir" href={`/sozluk/${t.slug}`}>
              <span className="dizin-ad">{t.baslik}</span>
              <span className="dizin-ozet">
                {t.ozet}
                {t.isler.length > 0 && (
                  <span className="dizin-isler">{t.isler.join(" · ")}</span>
                )}
              </span>
              <span className="dizin-kat">{t.kategori}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
