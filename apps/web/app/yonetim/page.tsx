import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { bekleyenTaslaklar, sonCalisma, yayindakiler, type Haber } from "@/lib/gundem-db";
import { KAYNAKLAR } from "@/lib/gundem-kaynaklar";
import { oturumVarMi, yonetimAcikMi } from "@/lib/yonetim";
import { OzetMetni } from "../gundem/OzetMetni";
import { AtDugmesi } from "./AtDugmesi";
import { DuzeltFormu } from "./DuzeltFormu";
import { GirisFormu } from "./GirisFormu";
import { cikisYap, yayinlaEylem } from "./eylemler";

/**
 * Gündem onayı: tek yöneticili, gizli sayfa. Gezinmede, site haritasında ve
 * robots.txt'te yoktur (robots.txt herkese açıktır, adresi ilan ederdi);
 * dizine eklenmeyi `noindex` engeller. Gizlilik güvenlik değildir — asıl
 * koruma girişte ve her eylemin kendi yetki denetiminde.
 */
export const metadata: Metadata = {
  title: "Yönetim",
  robots: { index: false, follow: false },
};

// Oturuma bağlı sayfa: anında gezinme denetimi bu sayfa için anlamsız.
export const instant = false;

const KAYNAK_ADI = new Map(KAYNAKLAR.map((k) => [k.kimlik, k.ad]));

const zamanBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

function TaslakKarti({ h }: { h: Haber }) {
  const kaynak = KAYNAK_ADI.get(h.kaynak) ?? h.kaynak;
  const sahte = h.sahte === 1;
  // Sahte taslağın şablon metni düzeltme alanına gelmez: editör boş alana
  // kendi özetini yazar, şablon yanlışlıkla yayına çıkamaz.
  const duzeltOzet = sahte ? "" : (h.taslakOzet ?? "");
  const duzeltBaslik = sahte ? h.baslik : (h.taslakBaslik ?? "");
  return (
    <article className="yonetim-kart panel" aria-labelledby={`taslak-${h.id}`}>
      <p className="yonetim-kunye">
        <span className="yonetim-puan" title="Önem puanı (1–5)">
          {h.puan ?? "–"}/5
        </span>
        <span>{kaynak}</span>
        {h.taslakAni && <time dateTime={new Date(h.taslakAni).toISOString()}>{zamanBicimi.format(h.taslakAni)}</time>}
        {sahte && <span className="etiket yonetim-sahte">Sahte taslak</span>}
      </p>
      <h2 id={`taslak-${h.id}`}>{h.taslakBaslik}</h2>
      <OzetMetni ozet={h.taslakOzet ?? ""} />
      {h.uyari && <p className="yonetim-uyari">{h.uyari}</p>}
      <dl className="yonetim-ayrinti">
        <dt>Kaynak başlığı</dt>
        <dd>
          <a href={h.baglanti} rel="noopener noreferrer nofollow" target="_blank">
            {h.baslik}
          </a>
        </dd>
        {h.puanGerekce && (
          <>
            <dt>Neden seçildi</dt>
            <dd>{h.puanGerekce}</dd>
          </>
        )}
      </dl>
      <div className="yonetim-dugmeler">
        <form action={yayinlaEylem}>
          <input type="hidden" name="id" value={h.id} />
          <button
            className="dugme"
            disabled={sahte}
            title={sahte ? "Sahte taslak önce Düzelt ile yeniden yazılmalı" : undefined}
          >
            Yayınla
          </button>
        </form>
        <DuzeltFormu id={h.id} baslik={duzeltBaslik} ozet={duzeltOzet} yayinda={false} />
        <AtDugmesi id={h.id} etiket="At" soru="Bu taslak atılsın mı? Geri alınamaz." />
      </div>
    </article>
  );
}

async function Yonetim() {
  // Oturumun süresi şimdiki zamanla karşılaştırılır: bu bölüm her zaman
  // istek anında çizilir, ön-render'a (ya da ön getirmeye) girmez.
  await connection();
  if (!(await oturumVarMi())) return <GirisFormu kapali={!yonetimAcikMi()} />;

  const taslaklar = bekleyenTaslaklar();
  const yayinda = yayindakiler(30);
  const son = sonCalisma();
  const sahteVar = taslaklar.some((t) => t.sahte === 1);

  return (
    <>
      <div className="yonetim-ust">
        <div>
          <h1>Gündem onayı</h1>
          <p className="yonetim-durum">
            {son
              ? `Son toplama ${zamanBicimi.format(son.an)}: ${son.toplanan} yeni haber, ${son.taslak} taslak${son.hata ? `, ${son.hata} hata` : ""}.`
              : "Toplayıcı henüz hiç çalışmadı."}
          </p>
        </div>
        <form action={cikisYap}>
          <button className="baglanti-dugme">Çıkış</button>
        </form>
      </div>

      {sahteVar && (
        <p className="yonetim-uyari" role="status">
          API anahtarı tanımlı değil: taslaklar sahte (Claude çağrılmadı). Sahte bir taslağı
          yayınlamak için önce Düzelt ile kendi metninizi yazın.
        </p>
      )}

      <section className="yonetim-bolum" aria-labelledby="bekleyen">
        <h2 id="bekleyen" className="yonetim-bolum-baslik">
          Bekleyen taslaklar <span className="cip-adet">{taslaklar.length}</span>
        </h2>
        {taslaklar.length === 0 ? (
          <p className="bos">Onay bekleyen taslak yok.</p>
        ) : (
          <div className="yonetim-liste">
            {taslaklar.map((h) => (
              <TaslakKarti key={h.id} h={h} />
            ))}
          </div>
        )}
      </section>

      <section className="yonetim-bolum" aria-labelledby="yayinda">
        <h2 id="yayinda" className="yonetim-bolum-baslik">
          Yayında <span className="cip-adet">{yayinda.length}</span>
        </h2>
        {yayinda.length === 0 ? (
          <p className="bos">Yayında haber yok.</p>
        ) : (
          <ul className="yonetim-yayinda panel">
            {yayinda.map((h) => (
              <li key={h.id}>
                <span className="yonetim-yayinda-baslik">{h.baslik}</span>
                <div className="yonetim-dugmeler">
                  <DuzeltFormu id={h.id} baslik={h.baslik} ozet={h.ozet} yayinda />
                  <AtDugmesi id={h.id} etiket="Kaldır" soru="Bu haber yayından kaldırılsın mı?" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function YonetimSayfasi() {
  return (
    <div className="kabuk yonetim">
      <Suspense fallback={<p className="yonetim-durum">Yükleniyor…</p>}>
        <Yonetim />
      </Suspense>
    </div>
  );
}
