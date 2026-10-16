/**
 * Ölçüm toplayıcısının uç noktası.
 *
 *   POST /api/olcum   { "yol": "/sozluk/dns", "kaynak": "https://..." }
 *
 * Her zaman 204 döner — gövde yok, hata mesajı yok. Ölçüm bir yan hizmettir:
 * başarısız olması durumunda kullanıcıya söylenecek bir şey yoktur ve
 * istemciye "neden kaydedilmedi" bilgisi vermek gereksizdir.
 */

import { EN_BUYUK_GOVDE, govdeDogrula } from "@/lib/olcum";
import { olayYaz } from "@/lib/olcum-db";
import { hizSiniriKur } from "@/lib/hiz-siniri";
import { SITE } from "@/lib/site";

/**
 * Bir insan dakikada birkaç sayfa gezer; 30 bunun çok üstüdür. Toplam tavan,
 * çok sayıda IP'den gelen sele karşı diski korur. Sınırı aşan istek de 204
 * alır: istemciye "neden kaydedilmedi" bilgisi verilmez (yukarıdaki ilke).
 */
/*
 * Bilinen sınır: ziyaretçi anahtarı IP + tarayıcı bilgisinden üretildiği
 * için tek IP, her istekte farklı tarayıcı bilgisi göndererek "tekil
 * ziyaretçi" sayısını şişirebilir (dakikada en fazla 30). Kişiyi tanımadan
 * bunu tamamen önlemenin yolu yok; ölçüm kaba bir eğilim göstergesidir.
 */
const sinir = hizSiniriKur({ pencereMs: 60_000, anahtarBasina: 30, toplam: 1200 });

function bosYanit(): Response {
  return new Response(null, { status: 204 });
}

/**
 * İstemci IP'si.
 *
 * Uygulama yalnızca 127.0.0.1 dinler ve önünde Caddy vardır; başlık Caddy
 * tarafından yazılır. Doğrudan internete açık bir kurulumda bu başlığa
 * güvenilmemelidir — bu yüzden bağlama adresi ayrıca kilitlidir (bkz. infra).
 *
 * Listenin **son** elemanı alınır: bir vekil adresi listeye sona ekler, yani
 * en sağdaki değer bizim Caddy'mizin gördüğü bağlantıdır. En soldaki değer
 * istemcinin kendi gönderdiği başlıktan gelebilir ve sahtelenebilir.
 */
function istemciIp(istek: Request): string {
  const son = istek.headers.get("x-forwarded-for")?.split(",").pop()?.trim();
  if (son) return son;
  return istek.headers.get("x-real-ip")?.trim() || "0.0.0.0";
}

/**
 * Gövdeyi en fazla `sinir` bayt okur; fazlası gelirse okumayı keser ve
 * `null` döner. `istek.text()` gövdenin tamamını önce belleğe alırdı: büyük
 * gövdeli isteklerle süreç bellek tavanına (MemoryMax) itilebilirdi.
 */
async function sinirliOku(istek: Request, sinir: number): Promise<string | null> {
  const bildirilen = Number(istek.headers.get("content-length"));
  if (Number.isFinite(bildirilen) && bildirilen > sinir) return null;
  if (!istek.body) return null;

  const okuyucu = istek.body.getReader();
  const parcalar: Uint8Array[] = [];
  let toplam = 0;
  for (;;) {
    const { done, value } = await okuyucu.read();
    if (done) break;
    toplam += value.byteLength;
    if (toplam > sinir) {
      await okuyucu.cancel();
      return null;
    }
    parcalar.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(parcalar));
}

export async function POST(istek: Request): Promise<Response> {
  try {
    const ip = istemciIp(istek);
    if (!sinir.izinVer(ip)) return bosYanit();

    const ham = await sinirliOku(istek, EN_BUYUK_GOVDE);
    if (!ham) return bosYanit();

    const govde = govdeDogrula(JSON.parse(ham) as unknown, SITE.url);
    if (!govde) return bosYanit();

    olayYaz({
      yol: govde.yol,
      kaynak: govde.kaynak,
      ip,
      tarayici: (istek.headers.get("user-agent") ?? "").slice(0, 200),
    });
  } catch (hata) {
    console.error("[olcum] kayıt başarısız:", hata);
  }
  return bosYanit();
}
