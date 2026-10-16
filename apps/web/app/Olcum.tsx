"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ölçüm işaretçisi.
 *
 * Sayfa her değiştiğinde (istemci gezinmesi dâhil) sunucuya tek bir istek
 * gönderir. Çerez yazmaz, tarayıcıda hiçbir şey saklamaz, kullanıcıyı
 * tanımlamaz. Ayrıntılı gizlilik gerekçesi: `lib/olcum.ts`.
 *
 * "İzlemeyi bırak" (DNT) ve "Global Privacy Control" tercihlerine uyulur:
 * kullanıcı hayır dediyse hiç istek gönderilmez.
 */
export function Olcum() {
  const yol = usePathname();

  useEffect(() => {
    const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl;
    if (navigator.doNotTrack === "1" || gpc === true) return;

    const govde = JSON.stringify({ yol, kaynak: document.referrer });

    // sendBeacon sayfa kapanırken de gönderir; yoksa keepalive ile devam et.
    const blob = new Blob([govde], { type: "application/json" });
    if (navigator.sendBeacon?.(`/api/olcum`, blob)) return;

    void fetch("/api/olcum", {
      method: "POST",
      body: govde,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {
      // Ölçüm başarısız oldu; kullanıcıya gösterilecek bir şey yok.
    });
  }, [yol]);

  return null;
}
