"use client";

/**
 * Tema düğmesi.
 *
 * Bileşen bilerek durum tutmaz: hangi simgenin görüneceğine CSS karar verir
 * (`data-tema` özniteliği), böylece sunucudan gelen HTML ile istemcideki
 * çıktı her zaman aynı olur — hidrasyon uyuşmazlığı ya da tema sıçraması
 * mümkün değildir.
 */
export function TemaDugmesi() {
  function degistir() {
    const kok = document.documentElement;
    const yeni = kok.getAttribute("data-tema") === "acik" ? "koyu" : "acik";
    kok.setAttribute("data-tema", yeni);
    try {
      localStorage.setItem("rootline-tema", yeni);
    } catch {
      /* gizli sekmede yazılamayabilir; sorun değil */
    }
  }

  return (
    <button
      className="tema-btn"
      type="button"
      onClick={degistir}
      title="Temayı değiştir"
      aria-label="Temayı değiştir"
    >
      <span className="tema-gunes" aria-hidden="true">
        ☀
      </span>
      <span className="tema-ay" aria-hidden="true">
        ☾
      </span>
    </button>
  );
}
