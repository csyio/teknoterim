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

const HARFLER = ["A", "B", "C", "D", "E", "F"];

function DogruSimgesi() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

function YanlisSimgesi() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </svg>
  );
}

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

    // Sırada terim yoksa boş oturum açılmaz; başlangıç ekranı "tekrar edilecek
    // terim yok" der. Aksi hâlde 0/0'lık bir "oturum tamam" ekranına kilitlenir.
    if (secili.length === 0) {
      setKuyruk(null);
      return;
    }

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
  }

  function ilerle() {
    // Deneme sayacı soru geçilirken artar, cevap anında değil: soru bu
    // sayaçtan üretildiği için cevapta artarsa şıklar seçimin altında
    // yeniden karışır ve seçilen yanlış şık işaretlenemez.
    if (aktifTerim) {
      const slug = aktifTerim.slug;
      setDenemeler((d) => ({ ...d, [slug]: (d[slug] ?? 0) + 1 }));
    }
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
          {bekleyenler.length > 0 && (
            <button className="dugme" type="button" onClick={basla}>
              Yeni oturum
            </button>
          )}
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
        {/* Ekran okuyucu bildirimi: canlı bölge baştan DOM'da durur, yalnızca
            içeriği değişir. Sonradan eklenen bir canlı bölgeyi bazı ekran
            okuyucular hiç okumaz. */}
        <p className="gizli" aria-live="polite">
          {secilen === null
            ? ""
            : secilen === soru.dogru
              ? "Doğru."
              : `Yanlış. Doğru cevap: ${soru.dogru}`}
        </p>

        <div className="oturum-ust">
          <span className="mono">
            {sira + 1} / {kuyruk.length}
          </span>
          <span className="mono">
            kutu {Math.min(durum.kutu + 1, EN_BUYUK_KUTU + 1)}/{EN_BUYUK_KUTU + 1}
          </span>
        </div>
        <div className="ilerleme-cubuk" aria-hidden="true">
          <span style={{ width: `${((sira + (secilen !== null ? 1 : 0)) / kuyruk.length) * 100}%` }} />
        </div>

        <div className="soru-kart panel">
          <p className="soru-tur">{TUR_ETIKETI[soru.tur]}</p>
          <h2 className="soru-metni">{soru.soru}</h2>
          <span className="kat">{aktifTerim.kategori}</span>

          <div className="secenekler">
            {soru.secenekler.map((s, i) => {
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
                  <span className="secenek-harf" aria-hidden="true">
                    {HARFLER[i]}
                  </span>
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        </div>

        {secilen !== null && (
          <div className="aciklama panel">
            <p className={secilen === soru.dogru ? "geri-bildirim dogru" : "geri-bildirim yanlis"}>
              {secilen === soru.dogru ? <DogruSimgesi /> : <YanlisSimgesi />}
              {secilen === soru.dogru ? "Doğru." : `Yanlış. Doğru cevap: ${soru.dogru}`}
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
      <div className="sayac-kutusu panel">
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
