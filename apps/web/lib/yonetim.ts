/**
 * Yönetim oturumu (tek yönetici).
 *
 * Çerez:
 *   - `__Host-` ön eki: yalnızca HTTPS'te, yalnızca bu alan adında ve `/`
 *     yolunda geçerli; alt alan adından ezilemez.
 *   - HttpOnly: sayfadaki betikler okuyamaz.
 *   - SameSite=Lax: başka siteden gelen POST isteğine eklenmez. (Strict
 *     seçilmedi: telefonda bir bağlantıdan /yonetim'e gelince oturum
 *     görünmeyip giriş formu çıkıyordu.) Server Action'lar ayrıca Next'in
 *     Origin denetiminden geçer.
 *
 * Oturum veritabanında tutulur: "Çıkış" gerçekten oturumu bitirir ve
 * şifre değişince eski oturumlar `yonetim_oturum` tablosu boşaltılarak
 * kapatılabilir.
 */

import { cookies, headers } from "next/headers";

import { hizSiniriKur } from "./hiz-siniri";
import { istemciIp } from "./istemci-ip";
import { oturumEkle, oturumGecerli, oturumSil } from "./gundem-db";
import {
  belirtecBicimiGecerli,
  belirtecOzeti,
  belirtecUret,
  sifreDogrula,
} from "./yonetim-sifre";

const CEREZ = "__Host-tt-yonetim";
const SURE_SN = 7 * 24 * 60 * 60;

/**
 * Giriş denemesi sınırı: IP başına 15 dakikada 5, toplamda 30. Şifre
 * denemesini yavaşlatır; toplam tavan scrypt'in işlemciyi meşgul etmesine
 * de üst sınır koyar.
 */
const girisSiniri = hizSiniriKur({ pencereMs: 15 * 60_000, anahtarBasina: 5, toplam: 30 });

export function yonetimAcikMi(): boolean {
  return !!process.env.YONETIM_SIFRE_OZETI?.trim();
}

export async function oturumVarMi(): Promise<boolean> {
  const belirtec = (await cookies()).get(CEREZ)?.value;
  if (!belirtec || !belirtecBicimiGecerli(belirtec)) return false;
  return oturumGecerli(belirtecOzeti(belirtec));
}

/** Her Server Action'ın ilk satırı: arayüzde gizli olmak yetki değildir. */
export async function yetkiIste(): Promise<void> {
  if (!(await oturumVarMi())) throw new Error("Yetkisiz istek");
}

export type GirisSonucu = "tamam" | "yanlis" | "sinir" | "kapali";

export async function girisDene(sifre: string): Promise<GirisSonucu> {
  if (!yonetimAcikMi()) return "kapali";
  const ip = istemciIp(await headers());
  if (!girisSiniri.izinVer(ip)) return "sinir";
  if (!(await sifreDogrula(sifre, process.env.YONETIM_SIFRE_OZETI))) return "yanlis";

  const belirtec = belirtecUret();
  oturumEkle(belirtecOzeti(belirtec), Date.now() + SURE_SN * 1000);
  (await cookies()).set(CEREZ, belirtec, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SURE_SN,
  });
  return "tamam";
}

export async function cikis(): Promise<void> {
  const depo = await cookies();
  const belirtec = depo.get(CEREZ)?.value;
  if (belirtec && belirtecBicimiGecerli(belirtec)) oturumSil(belirtecOzeti(belirtec));
  // `__Host-` çerezi yalnızca aynı özniteliklerle (Secure, Path=/) ezilebilir;
  // bu yüzden silme, süresi dolmuş bir çerez yazarak yapılır.
  depo.set(CEREZ, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}
