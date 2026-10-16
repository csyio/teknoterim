"use client";

/**
 * Tema düğmesi.
 *
 * Bileşen bilerek durum tutmaz: hangi simgenin görüneceğine CSS karar verir
 * (`data-tema` özniteliği ve `prefers-color-scheme`), böylece sunucudan gelen
 * HTML ile istemcideki çıktı her zaman aynı olur — hidrasyon uyuşmazlığı ya
 * da tema sıçraması mümkün değildir.
 *
 * Kullanıcı hiç seçim yapmadıysa tema sistemden gelir; düğmeye basınca o an
 * görünen temanın tersi kalıcı olarak seçilir.
 */
export function TemaDugmesi() {
  function degistir() {
    const kok = document.documentElement;
    const secili = kok.getAttribute("data-tema");
    const koyuMu = secili
      ? secili === "koyu"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const yeni = koyuMu ? "acik" : "koyu";
    kok.setAttribute("data-tema", yeni);
    try {
      localStorage.setItem("teknoterim-tema", yeni);
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
      <svg
        className="tema-gunes"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        className="tema-ay"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
