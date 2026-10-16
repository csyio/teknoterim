"use client";

import { useSyncExternalStore } from "react";
import type { Durum } from "./srs";
import { YENI_DURUM } from "./srs";

/**
 * Kullanıcı ilerlemesi — yalnızca tarayıcıda saklanır.
 *
 * Tasarım kararı: ilerleme sunucuya gönderilmez. Hesap açmak gerekmez,
 * "öğrendim" işaretleri cihazdan çıkmaz. Hesap katmanı (Faz 3) geldiğinde
 * buradaki veri kullanıcının isteğiyle taşınacak.
 *
 * localStorage bir "dış kaynak" olduğu için React'e `useSyncExternalStore`
 * ile bağlanır: sunucu anlık görüntüsü her zaman boştur, istemci anlık
 * görüntüsü diskten okunur. Böylece hem hidrasyon uyuşmazlığı hem de
 * efekt içinde durum güncelleme tuzağı oluşmaz.
 */

export type Ilerleme = Record<string, Durum>;

const ANAHTAR = "teknoterim-ilerleme";
const OLAY = "teknoterim-ilerleme-degisti";

/** Sunucuda ve ilk hidrasyonda kullanılan sabit boş nesne. */
const BOS: Ilerleme = Object.freeze({}) as Ilerleme;

let onbellek: Ilerleme = BOS;
let onbellekMetin = "\u0000"; // ilk okumada kesinlikle ayrıştırma yapılsın

function oku(): Ilerleme {
  let metin = "";
  try {
    metin = window.localStorage.getItem(ANAHTAR) ?? "";
  } catch {
    return BOS; // gizli sekmede erişim engellenmiş olabilir
  }

  if (metin === onbellekMetin) return onbellek;
  onbellekMetin = metin;

  try {
    const veri: unknown = metin ? JSON.parse(metin) : null;
    onbellek = veri && typeof veri === "object" ? (veri as Ilerleme) : BOS;
  } catch {
    onbellek = BOS; // bozuk kayıt ilerlemeyi kilitlemesin
  }
  return onbellek;
}

function abone(geriCagri: () => void): () => void {
  window.addEventListener(OLAY, geriCagri);
  window.addEventListener("storage", geriCagri); // diğer sekmelerdeki değişiklik
  return () => {
    window.removeEventListener(OLAY, geriCagri);
    window.removeEventListener("storage", geriCagri);
  };
}

function sunucuGoruntu(): Ilerleme {
  return BOS;
}

export function useIlerleme(): Ilerleme {
  return useSyncExternalStore(abone, oku, sunucuGoruntu);
}

export function durumGetir(ilerleme: Ilerleme, slug: string): Durum {
  return ilerleme[slug] ?? YENI_DURUM;
}

/** Tek bir terimin durumunu yazar ve aboneleri haberdar eder. */
export function durumYaz(slug: string, durum: Durum): void {
  yaz({ ...oku(), [slug]: durum });
}

export function yaz(yeni: Ilerleme): void {
  const metin = JSON.stringify(yeni);
  onbellek = yeni;
  onbellekMetin = metin;
  try {
    window.localStorage.setItem(ANAHTAR, metin);
  } catch {
    /* kota dolu ya da erişim yok; ilerleme bu oturumda bellekte kalır */
  }
  window.dispatchEvent(new Event(OLAY));
}
