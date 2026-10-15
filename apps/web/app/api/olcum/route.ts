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
import { SITE } from "@/lib/site";

function bosYanit(): Response {
  return new Response(null, { status: 204 });
}

/**
 * İstemci IP'si.
 *
 * Uygulama yalnızca 127.0.0.1 dinler ve önünde Caddy vardır; başlık Caddy
 * tarafından yazılır. Doğrudan internete açık bir kurulumda bu başlığa
 * güvenilmemelidir — bu yüzden bağlama adresi ayrıca kilitlidir (bkz. infra).
 */
function istemciIp(istek: Request): string {
  const yonlendirilmis = istek.headers.get("x-forwarded-for");
  if (yonlendirilmis) return yonlendirilmis.split(",")[0].trim();
  return istek.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function POST(istek: Request): Promise<Response> {
  try {
    const ham = await istek.text();
    if (ham.length === 0 || ham.length > EN_BUYUK_GOVDE) return bosYanit();

    const govde = govdeDogrula(JSON.parse(ham) as unknown, SITE.url);
    if (!govde) return bosYanit();

    olayYaz({
      yol: govde.yol,
      kaynak: govde.kaynak,
      ip: istemciIp(istek),
      tarayici: (istek.headers.get("user-agent") ?? "").slice(0, 200),
    });
  } catch (hata) {
    console.error("[olcum] kayıt başarısız:", hata);
  }
  return bosYanit();
}
