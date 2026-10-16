/**
 * Döviz kurları uç noktası.
 *
 *   GET /api/kur  →  { kaynak: "TCMB", rates: { TRY: 49.4, EUR: 0.86, ... }, time_last_update_unix }
 *
 * Kurlar TCMB'den sunucuda çekilir ve bellekte tutulur; tarayıcı TCMB'ye ya
 * da başka bir üçüncü tarafa hiç bağlanmaz. TCMB günde bir kez (15:30)
 * yayımladığı için yarım saatlik önbellek fazlasıyla yeter ve TCMB'ye
 * ziyaretçi sayısından bağımsız olarak en fazla saatte iki istek gider.
 *
 * TCMB'ye ulaşılamazsa elimizdeki son geçerli bülten verilir (eski kur
 * yanıtın zamanından anlaşılır). Hiç veri yoksa 503 döner; çevirici bunu
 * "kurlar alınamadı" olarak gösterir.
 */

import { connection } from "next/server";
import { tcmbAyristir, type KurYaniti } from "@/lib/kur";

const TCMB_ADRESI = "https://www.tcmb.gov.tr/kurlar/today.xml";
const ONBELLEK_MS = 30 * 60 * 1000;
const ZAMAN_ASIMI_MS = 8000;
const YENIDEN_DENEME_MS = 60 * 1000;

let sonVeri: KurYaniti | null = null;
let sonDeneme = 0;
/** Aynı anda gelen istekler TCMB'ye tek istek olarak gider. */
let suankiIstek: Promise<void> | null = null;

async function tazele(): Promise<void> {
  sonDeneme = Date.now();
  const denetleyici = new AbortController();
  const sayac = setTimeout(() => denetleyici.abort(), ZAMAN_ASIMI_MS);
  try {
    const yanit = await fetch(TCMB_ADRESI, {
      signal: denetleyici.signal,
      cache: "no-store",
    });
    if (!yanit.ok) throw new Error(`TCMB ${yanit.status} döndürdü`);
    const veri = tcmbAyristir(await yanit.text());
    if (!veri) throw new Error("TCMB bülteni beklenen biçimde değil");
    sonVeri = veri;
  } catch (hata) {
    console.error("[kur] tazelenemedi:", hata);
    // Başarısız denemeden sonra yarım saat beklemeyelim: bir dakika sonra
    // yeniden dene. (TCMB'yi boğmamak için her isteğe değil.)
    sonDeneme = Date.now() - ONBELLEK_MS + YENIDEN_DENEME_MS;
  } finally {
    clearTimeout(sayac);
  }
}

export async function GET(): Promise<Response> {
  // Önbelleğe alınmış bir derleme çıktısı değil, her istekte güncel bellek.
  await connection();

  // Süren bir tazeleme varsa onu bekle: soğuk başlangıçta aynı anda gelen
  // ikinci istek, ilki TCMB'den yanıt beklerken 503 almasın.
  if (suankiIstek || Date.now() - sonDeneme > ONBELLEK_MS) {
    suankiIstek ??= tazele().finally(() => {
      suankiIstek = null;
    });
    await suankiIstek;
  }

  if (!sonVeri) {
    return Response.json({ hata: "Kurlar şu an alınamıyor" }, { status: 503 });
  }

  return Response.json(sonVeri, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
