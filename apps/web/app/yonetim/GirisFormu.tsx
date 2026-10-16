"use client";

import { useActionState } from "react";

import { girisYap, type FormDurumu } from "./eylemler";

const BASLANGIC: FormDurumu = { hata: null };

export function GirisFormu({ kapali }: { kapali: boolean }) {
  const [durum, eylem, bekliyor] = useActionState(girisYap, BASLANGIC);

  return (
    <form action={eylem} className="yonetim-giris panel">
      <h1>Yönetim</h1>
      {kapali ? (
        <p className="yonetim-uyari" role="status">
          Yönetim kapalı: sunucuda şifre özeti (YONETIM_SIFRE_OZETI) tanımlı değil.
        </p>
      ) : (
        <>
          <label className="yonetim-etiket" htmlFor="sifre">
            Şifre
          </label>
          <input
            id="sifre"
            name="sifre"
            type="password"
            className="yonetim-girdi"
            autoComplete="current-password"
            required
            maxLength={1024}
          />
          <button className="dugme" disabled={bekliyor}>
            {bekliyor ? "Kontrol ediliyor…" : "Giriş"}
          </button>
          <p className="yonetim-hata" aria-live="polite">
            {durum.hata}
          </p>
        </>
      )}
    </form>
  );
}
