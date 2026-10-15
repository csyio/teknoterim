"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { durumGetir, durumYaz, useIlerleme } from "@/lib/ilerleme";
import { soruUret, type Soru, type TerimOzeti } from "@/lib/sorular";
import {
  bugun,
  cevapla,
  EN_BUYUK_KUTU,
  ogrenildiAyarla,
  ozetle,
  vadesiGeldi,
} from "@/lib/srs";

const TUR_ETIKETI = {
  "tanimdan-terim": "Bu tanım hangi terime ait?",
  "terimden-tanim": "Bu terimin tanımı hangisi?",
} as const;

const OTURUM_UZUNLUGU = 10;

export function Calisma({ terimler }: { terimler: TerimOzeti[] }) {
  const ilerleme = useIlerleme();
  const bugunMetni = bugun();

  const [kuyruk, setKuyruk] = useState<string[] | null>(null);
  const [sira, setSira] = useState(0);
  const [secilen, setSecilen] = useState<string | null>(null);
  const [dogruSayisi, setDogruSayisi] = useState(0);
  const [denemeler, setDenemeler] = useState<Record<string, number>>({});

  const ozet = useMemo(
    () => ozetle(terimler.map((t) => t.slug), ilerleme, bugunMetni),
    [terimler, ilerleme, bugunMetni]
  );

  const bekleyenler = useMemo(
    () => terimler.filter((t) => vadesiGeldi(ilerleme[t.slug], bugunMetni)),
    [terimler, ilerleme, bugunMetni]
  );

  const aktifSlug = kuyruk?.[sira];
  const aktifTerim = terimler.find((t) => t.slug === aktifSlug);

  const soru: Soru | null = useMemo(
    () => (aktifTerim ? soruUret(aktifTerim, terimler, denemeler[aktifTerim.slug] ?? 0) : null),
    [aktifTerim, terimler, denemeler]
  );

  function basla() {
    // Yeni terimler önce gelsin, sonra vadesi geçenler; görünür bir sıra
    // kurmak motivasyonu artırır.
    const yeni = bekleyenler.filter((t) => !ilerleme[t.slug]);
    const tekrar = bekleyenler.filter((t) => ilerleme[t.slug]);
    const secili = [...yeni, ...tekrar].slice(0, OTURUM_UZUNLUGU).map((t) => t.slug);

    setKuyruk(secili);
    setSira(0);
    setSecilen(null);
    setDogruSayisi(0);
  }

  function sec(secenek: string) {
    if (secilen !== null || !aktifTerim || !soru) return;
    setSecilen(secenek);
    const dogruMu = secenek === soru.dogru;
    if (dogruMu) setDogruSayisi((s) => s + 1);
    durumYaz(aktifTerim.slug, cevapla(durumGetir(ilerleme, aktifTerim.slug), dogruMu));
    setDenemeler((d) => ({ ...d, [aktifTerim.slug]: (d[aktifTerim.slug] ?? 0) + 1 }));
  }

  function ilerle() {
    setSecilen(null);
    setSira((s) => s + 1);
  }

  function biliyorum() {
    if (!aktifTerim) return;
    durumYaz(aktifTerim.slug, ogrenildiAyarla(durumGetir(ilerleme, aktifTerim.slug), true));
    ilerle();
  }

  /* ---------------------------------- oturum bitti --------------------------------- */

  if (kuyruk !== null && sira >= kuyruk.length) {
    return (
      <div className="oturum-son">
        <h2>Oturum tamam</h2>
        <p className="buyuk-sayi">
          {dogruSayisi} / {kuyruk.length} doğru
        </p>
        <p className="soluk-metin">
          Bu {kuyruk.length} terim, cevaplarınıza göre ileri bir tarihe planlandı. Yanlış
          cevapladıklarınız sıranın başına döner; bir sonraki oturumda yeniden karşınıza
          çıkar.
        </p>
        <div className="dugme-sirasi">
          <button className="dugme" type="button" onClick={basla}>
            Yeni oturum
          </button>
          <Link className="baglanti-dugme" href="/sozluk">
            Sözlüğe dön
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------------ soru akışı --------------------------------- */

  if (kuyruk !== null && aktifTerim && soru) {
    const durum = durumGetir(ilerleme, aktifTerim.slug);
    return (
      <div className="oturum">
        <div className="oturum-ust">
          <span className="mono">
            {sira + 1} / {kuyruk.length}
          </span>
          <span className="mono">
            Kutu {Math.min(durum.kutu + 1, EN_BUYUK_KUTU + 1)}/{EN_BUYUK_KUTU + 1}
          </span>
        </div>

        <p className="soru-tur">{TUR_ETIKETI[soru.tur]}</p>
        <h2 className="soru-metni">{soru.soru}</h2>
        <span className="kat">{aktifTerim.kategori}</span>

        <div className="secenekler">
          {soru.secenekler.map((s) => {
            const durumSinif =
              secilen === null
                ? ""
                : s === soru.dogru
                  ? " dogru"
                  : s === secilen
                    ? " yanlis"
                    : " solgun";
            return (
              <button
                key={s}
                className={`secenek${durumSinif}`}
                type="button"
                disabled={secilen !== null}
                onClick={() => sec(s)}
              >
                {s}
              </button>
            );
          })}
        </div>

        {secilen !== null && (
          <div className="aciklama" aria-live="polite">
            <p className={secilen === soru.dogru ? "geri-bildirim dogru" : "geri-bildirim yanlis"}>
              {secilen === soru.dogru ? "Doğru." : `Yanlış — doğru cevap: ${soru.dogru}`}
            </p>
            <h3>
              <Link href={`/sozluk/${aktifTerim.slug}`}>{aktifTerim.baslik}</Link>
            </h3>
            <p>{aktifTerim.ozet}</p>
            {aktifTerim.isler.length > 0 && (
              <div className="rozetler">
                {aktifTerim.isler.map((i) => (
                  <span key={i} className="rozet">
                    {i}
                  </span>
                ))}
              </div>
            )}
            <Link className="tamami" href={`/sozluk/${aktifTerim.slug}`}>
              Terimin tamamını gör →
            </Link>

            <div className="dugme-sirasi">
              <button className="dugme" type="button" onClick={ilerle}>
                Devam
              </button>
              <button className="baglanti-dugme" type="button" onClick={biliyorum}>
                Bunu biliyorum, tekrar sorma
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ------------------------------------- başlangıç --------------------------------- */

  return (
    <div className="calisma-giris">
      <div className="sayac-kutusu">
        <div className="sayac-oge">
          <span className="sayac-sayi">{ozet.yeni}</span>
          <span className="mono">yeni</span>
        </div>
        <div className="sayac-oge">
          <span className="sayac-sayi">{ozet.sirada}</span>
          <span className="mono">tekrar sırası</span>
        </div>
        <div className="sayac-oge">
          <span className="sayac-sayi">{ozet.ogrenilen}</span>
          <span className="mono">öğrendim</span>
        </div>
      </div>

      <p className="soluk-metin">
        Her oturum en fazla {OTURUM_UZUNLUGU} terim içerir. Doğru cevapladığınız terimler
        giderek seyrekleşir; yanlış cevapladıklarınız sıranın başına döner. İlerlemeniz
        yalnızca bu tarayıcıda saklanır.
      </p>

      {bekleyenler.length === 0 ? (
        <p className="bos">
          Şu an tekrar edilecek terim yok. Yeni terim eklendikçe ya da tekrar zamanı
          geldikçe burada görünecek.
        </p>
      ) : (
        <div className="dugme-sirasi">
          <button className="dugme" type="button" onClick={basla}>
            Çalışmaya başla <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
