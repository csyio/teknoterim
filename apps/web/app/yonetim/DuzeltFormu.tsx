"use client";

import { useActionState, useState } from "react";

import { duzeltEylem, type FormDurumu } from "./eylemler";

const BASLANGIC: FormDurumu = { hata: null };

/**
 * "Düzelt": başlık ve özeti editörün metniyle değiştirir. Açılır kapanır
 * (`<details>`) ki telefonda kart kısa kalsın. Sözlük bağlantısı biçimi
 * aynı: [görünen metin](/sozluk/slug).
 *
 * Alanlar kontrollüdür: React 19 eylemden sonra kontrolsüz alanları
 * varsayılan değerine sıfırlar; doğrulama hatasında editörün yazdığı metin
 * kaybolmasın.
 */
export function DuzeltFormu({
  id,
  baslik,
  ozet,
  yayinda,
}: {
  id: number;
  baslik: string;
  ozet: string;
  yayinda: boolean;
}) {
  const [durum, eylem, bekliyor] = useActionState(duzeltEylem, BASLANGIC);
  const [yeniBaslik, setYeniBaslik] = useState(baslik);
  const [yeniOzet, setYeniOzet] = useState(ozet);

  return (
    <details className="yonetim-duzelt">
      <summary className="baglanti-dugme">Düzelt</summary>
      <form action={eylem} className="yonetim-form">
        <input type="hidden" name="id" value={id} />
        <label className="yonetim-etiket" htmlFor={`baslik-${id}`}>
          Başlık
        </label>
        <input
          id={`baslik-${id}`}
          name="baslik"
          className="yonetim-girdi"
          value={yeniBaslik}
          onChange={(e) => setYeniBaslik(e.target.value)}
          maxLength={160}
          required
        />
        <label className="yonetim-etiket" htmlFor={`ozet-${id}`}>
          Özet <span className="yonetim-ipucu">Paragraf arası boş satır. Sözlük bağlantısı: [DNS](/sozluk/dns)</span>
        </label>
        <textarea
          id={`ozet-${id}`}
          name="ozet"
          className="yonetim-girdi yonetim-metin"
          value={yeniOzet}
          onChange={(e) => setYeniOzet(e.target.value)}
          rows={9}
          maxLength={3000}
          required
        />
        <div className="yonetim-dugmeler">
          <button className="baglanti-dugme" name="sonra" value="kaydet" disabled={bekliyor}>
            Kaydet
          </button>
          {!yayinda && (
            <button className="dugme" name="sonra" value="yayinla" disabled={bekliyor}>
              Kaydet ve yayınla
            </button>
          )}
        </div>
        <p className={durum.hata ? "yonetim-hata" : "yonetim-tamam"} aria-live="polite">
          {durum.hata ?? durum.tamam}
        </p>
      </form>
    </details>
  );
}
