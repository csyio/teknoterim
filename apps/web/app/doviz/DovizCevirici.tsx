"use client";

import { useEffect, useMemo, useState } from "react";
import { tutarAyristir } from "@/lib/tutar";

/**
 * Döviz çevirici.
 *
 * - Kurlar kendi sunucumuzdaki `/api/kur` ucundan gelir; o uç TCMB'nin
 *   günlük bültenini çeker (bkz. app/api/kur/route.ts). Tarayıcı hiçbir
 *   üçüncü tarafa bağlanmaz.
 * - Kurlar localStorage'a yazılır; `onbellekSaat` dolmadan tekrar istek
 *   yapılmaz. Ağ yoksa eski kurla çalışmaya devam eder ve bunu belirtir.
 * - Sunucu çıktısı her zaman aynıdır (kur yok, varsayılan tutar); gerçek
 *   veri hidrasyondan sonra gelir. Böylece hidrasyon uyuşmazlığı olmaz.
 * - Görünüm `ds/bilesenler/doviz.css` içindedir.
 */

type Kurlar = Record<string, number>;

interface Onbellek {
  kurlar: Kurlar;
  guncelleme: number; // bültenin yayım zamanı (ms)
  alindi: number; // bizim çektiğimiz zaman (ms)
}

/** TCMB bülteninde yer alan para birimleri (XDR hariç). */
const PARA_BIRIMLERI: { kod: string; ad: string }[] = [
  { kod: "TRY", ad: "Türk lirası" },
  { kod: "USD", ad: "ABD doları" },
  { kod: "EUR", ad: "Euro" },
  { kod: "GBP", ad: "İngiliz sterlini" },
  { kod: "CHF", ad: "İsviçre frangı" },
  { kod: "JPY", ad: "Japon yeni" },
  { kod: "CNY", ad: "Çin yuanı" },
  { kod: "RUB", ad: "Rus rublesi" },
  { kod: "SAR", ad: "Suudi riyali" },
  { kod: "AED", ad: "BAE dirhemi" },
  { kod: "QAR", ad: "Katar riyali" },
  { kod: "KWD", ad: "Kuveyt dinarı" },
  { kod: "AZN", ad: "Azerbaycan manatı" },
  { kod: "KZT", ad: "Kazak tengesi" },
  { kod: "CAD", ad: "Kanada doları" },
  { kod: "AUD", ad: "Avustralya doları" },
  { kod: "SEK", ad: "İsveç kronu" },
  { kod: "NOK", ad: "Norveç kronu" },
  { kod: "DKK", ad: "Danimarka kronu" },
  { kod: "RON", ad: "Rumen leyi" },
  { kod: "KRW", ad: "Güney Kore wonu" },
  { kod: "PKR", ad: "Pakistan rupisi" },
];

const KUR_ADRESI = "/api/kur";
const DEPO_ANAHTARI = "teknoterim-kurlar";

function paraBicimle(deger: number, kod: string): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: kod,
      // En az basamak sıfır: KWD gibi 3 basamaklı birimlerde varsayılan
      // en az (3) bizim en çok değerimizden (2) büyük olup hata vermesin.
      minimumFractionDigits: 0,
      maximumFractionDigits: deger < 1 ? 6 : 2,
    }).format(deger);
  } catch {
    return `${deger.toFixed(2)} ${kod}`;
  }
}

function kurBicimle(deger: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: deger < 0.01 ? 6 : 4,
  }).format(deger);
}

function onbellekOku(): Onbellek | null {
  try {
    const ham = localStorage.getItem(DEPO_ANAHTARI);
    if (!ham) return null;
    const veri = JSON.parse(ham) as Onbellek;
    if (
      !veri ||
      typeof veri.kurlar !== "object" ||
      veri.kurlar === null ||
      !Number.isFinite(veri.guncelleme) ||
      !Number.isFinite(veri.alindi)
    ) {
      return null; // bozuk kayıt bileşeni çökertmesin, yeniden çekilsin
    }
    return veri;
  } catch {
    return null;
  }
}

function onbellekYaz(veri: Onbellek) {
  try {
    localStorage.setItem(DEPO_ANAHTARI, JSON.stringify(veri));
  } catch {
    /* gizli sekme ya da dolu depo; sorun değil */
  }
}

async function kurlariGetir(adres: string): Promise<Onbellek> {
  const denetleyici = new AbortController();
  const sayac = setTimeout(() => denetleyici.abort(), 10_000);
  try {
    const yanit = await fetch(adres, { signal: denetleyici.signal });
    if (!yanit.ok) throw new Error("kur servisi şu an yanıt vermiyor");
    const veri = (await yanit.json()) as {
      rates?: Kurlar;
      time_last_update_unix?: number;
    };
    if (!veri.rates || typeof veri.rates.USD !== "number") {
      throw new Error("kur verisi beklenen biçimde değil");
    }
    return {
      kurlar: veri.rates,
      guncelleme: (veri.time_last_update_unix ?? Date.now() / 1000) * 1000,
      alindi: Date.now(),
    };
  } finally {
    clearTimeout(sayac);
  }
}

export interface DovizCeviriciProps {
  /** Kur JSON adresi. Varsayılan: kendi `/api/kur` ucumuz. */
  kaynak?: string;
  /** Kurlar kaç saat önbellekte kalsın. TCMB günde bir yayımlar; 1 saat yeter. */
  onbellekSaat?: number;
  ilkKaynak?: string;
  ilkHedef?: string;
  ilkTutar?: number;
}

export function DovizCevirici({
  kaynak = KUR_ADRESI,
  onbellekSaat = 1,
  ilkKaynak = "USD",
  ilkHedef = "TRY",
  ilkTutar = 1,
}: DovizCeviriciProps) {
  const [tutarMetin, setTutarMetin] = useState(String(ilkTutar));
  const [kaynakKod, setKaynakKod] = useState(ilkKaynak);
  const [hedefKod, setHedefKod] = useState(ilkHedef);
  const [veri, setVeri] = useState<Onbellek | null>(null);
  const [durum, setDurum] = useState<"yukleniyor" | "hazir" | "hata">("yukleniyor");
  const [hata, setHata] = useState<string | null>(null);

  // Kur verisi gelmişse, serviste olmayan birimleri gizle.
  const liste = useMemo(
    () => (veri ? PARA_BIRIMLERI.filter((b) => b.kod in veri.kurlar) : PARA_BIRIMLERI),
    [veri]
  );

  // Önbellekten başla, gerekiyorsa tazele. (setState yalnız geri çağrılarda.)
  useEffect(() => {
    let iptal = false;
    const eski = onbellekOku();
    const taze = eski !== null && Date.now() - eski.alindi < onbellekSaat * 3_600_000;

    void Promise.resolve().then(() => {
      if (iptal || !eski) return;
      setVeri(eski);
      setDurum("hazir");
    });

    if (!taze) {
      kurlariGetir(kaynak).then(
        (yeni) => {
          if (iptal) return;
          onbellekYaz(yeni);
          setVeri(yeni);
          setDurum("hazir");
          setHata(null);
        },
        (e: unknown) => {
          if (iptal) return;
          setHata(e instanceof Error ? e.message : "kurlar alınamadı");
          setDurum(eski ? "hazir" : "hata");
        }
      );
    }

    return () => {
      iptal = true;
    };
  }, [kaynak, onbellekSaat]);

  const tutar = tutarAyristir(tutarMetin);
  const kur =
    veri && veri.kurlar[kaynakKod] && veri.kurlar[hedefKod]
      ? veri.kurlar[hedefKod] / veri.kurlar[kaynakKod]
      : null;
  const sonuc = tutar !== null && kur !== null ? tutar * kur : null;

  function degistir() {
    setKaynakKod(hedefKod);
    setHedefKod(kaynakKod);
  }

  const guncellemeMetni = veri
    ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(veri.guncelleme))
    : null;

  return (
    <section className="doviz panel" aria-label="Döviz çevirici">
      <div className="doviz-satir">
        <label className="doviz-alan">
          <span className="doviz-etiket">Tutar</span>
          <input
            className="doviz-girdi"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={tutarMetin}
            onChange={(e) => setTutarMetin(e.target.value)}
            aria-invalid={tutar === null}
            aria-describedby={tutar === null ? "doviz-tutar-hata" : undefined}
          />
        </label>

        <label className="doviz-alan">
          <span className="doviz-etiket">Kaynak</span>
          <select
            className="doviz-secim"
            value={kaynakKod}
            onChange={(e) => setKaynakKod(e.target.value)}
          >
            {liste.map((b) => (
              <option key={b.kod} value={b.kod}>
                {b.kod} · {b.ad}
              </option>
            ))}
          </select>
        </label>

        <button
          className="doviz-degistir"
          type="button"
          onClick={degistir}
          title="Birimleri yer değiştir"
          aria-label="Birimleri yer değiştir"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
          </svg>
        </button>

        <label className="doviz-alan">
          <span className="doviz-etiket">Hedef</span>
          <select
            className="doviz-secim"
            value={hedefKod}
            onChange={(e) => setHedefKod(e.target.value)}
          >
            {liste.map((b) => (
              <option key={b.kod} value={b.kod}>
                {b.kod} · {b.ad}
              </option>
            ))}
          </select>
        </label>
      </div>

      <output className="doviz-sonuc" aria-live="polite">
        {durum === "yukleniyor" && <span className="doviz-soluk">Kurlar yükleniyor…</span>}
        {durum === "hata" && (
          <span className="doviz-hata">Kurlar alınamadı{hata ? `: ${hata}` : ""}.</span>
        )}
        {durum === "hazir" && tutar === null && (
          <span className="doviz-hata" id="doviz-tutar-hata">
            Geçerli bir tutar girin.
          </span>
        )}
        {durum === "hazir" && sonuc !== null && (
          <>
            <span className="doviz-buyuk">{paraBicimle(sonuc, hedefKod)}</span>
            <span className="doviz-kucuk">
              {paraBicimle(tutar!, kaynakKod)} · 1 {kaynakKod} = {kurBicimle(kur!)} {hedefKod}
            </span>
          </>
        )}
        {durum === "hazir" && tutar !== null && kur === null && (
          <span className="doviz-hata">Bu birim çifti için kur yok.</span>
        )}
      </output>

      {veri && (
        <p className="doviz-alt">
          TCMB döviz satış kuru, {guncellemeMetni} bülteni. Gösterge niteliğindedir.
          {hata && <span className="doviz-hata"> Kur tazelenemedi, son alınan kur gösteriliyor.</span>}
        </p>
      )}
    </section>
  );
}
