"use client";

import { atEylem } from "./eylemler";

/**
 * "At" ya da "Kaldır". Geri alma düğmesi olmadığı için telefonda yanlışlıkla
 * dokunmaya karşı onay sorulur.
 */
export function AtDugmesi({ id, etiket, soru }: { id: number; etiket: string; soru: string }) {
  return (
    <form
      action={atEylem}
      onSubmit={(e) => {
        if (!window.confirm(soru)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="baglanti-dugme yonetim-at">{etiket}</button>
    </form>
  );
}
