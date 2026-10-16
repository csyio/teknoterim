import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { yayindakiler } from "@/lib/gundem-db";
import { KAYNAKLAR } from "@/lib/gundem-kaynaklar";
import { OzetMetni } from "./OzetMetni";

export const metadata: Metadata = {
  title: "Gündem",
  description:
    "MSP, hosting, alan adı/DNS, ağ güvenliği ve yapay zekâ dünyasından az ama güvenilir haberler. Kaynak bağlantılı, Türkçe özet, editör onaylı.",
  alternates: { canonical: "/gundem" },
};

const KAYNAK_ADI = new Map(KAYNAKLAR.map((k) => [k.kimlik, k.ad]));

const tarihBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

/**
 * Yayındaki haberler. Liste yalnızca editör bir haberi yayınlayınca,
 * düzeltince ya da kaldırınca değişir; o eylemler "gundem" etiketini
 * tazeler (bkz. app/yonetim/eylemler.ts). Arada her ziyaret veritabanına
 * gitmez.
 */
async function yayinListesi() {
  "use cache";
  cacheTag("gundem");
  cacheLife("hours");
  return yayindakiler(60);
}

async function Akis() {
  // Liste derleme anında değil, istek anında okunur: derleme makinesinde
  // veritabanı yoktur ve boş bir liste sayfaya gömülmemeli.
  await connection();
  const haberler = await yayinListesi();

  if (haberler.length === 0) {
    return <p className="bos">Henüz yayımlanmış haber yok. İlk haberler editör onayından sonra burada.</p>;
  }

  return (
    <ol className="gundem-akis">
      {haberler.map((h) => {
        const kaynak = KAYNAK_ADI.get(h.kaynak) ?? h.kaynak;
        return (
          <li key={h.id} className="gundem-oge">
            <article>
              <p className="gundem-kunye">
                <time dateTime={new Date(h.an).toISOString()}>{tarihBicimi.format(h.an)}</time>
                <span aria-hidden="true">·</span>
                <span>{kaynak}</span>
              </p>
              <h2>{h.baslik}</h2>
              <OzetMetni ozet={h.ozet} />
              <p className="gundem-alt">
                <a href={h.baglanti} rel="noopener noreferrer nofollow" className="tamami">
                  Kaynakta oku: {kaynak}
                </a>
                <span className="gundem-not">
                  {h.editorYazisi ? "Editör yazısı" : "Yapay zekâ taslağı, editör onaylı"}
                </span>
              </p>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

function AkisIskeleti() {
  return (
    <div className="gundem-akis" aria-busy="true" aria-label="Haberler yükleniyor">
      {[0, 1, 2].map((i) => (
        <div key={i} className="gundem-oge gundem-iskelet" />
      ))}
    </div>
  );
}

export default function GundemSayfasi() {
  return (
    <div className="kabuk gundem-sayfa">
      <div className="baslik-alani">
        <h1>Gündem</h1>
        <p>
          Güvenlik, hosting, alan adı/DNS ve yapay zekâ dünyasından az ama güvenilir
          haberler. Yalnızca kendi RSS akışını yayımlayan güvenilir kaynaklar okunur;
          özetleri yapay zekâ taslak olarak yazar, editör okuyup onaylamadan hiçbiri
          yayına çıkmaz. Ayrıntı her zaman kaynağın kendisinde.
        </p>
      </div>
      <Suspense fallback={<AkisIskeleti />}>
        <Akis />
      </Suspense>
    </div>
  );
}
