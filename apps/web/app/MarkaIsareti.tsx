/**
 * Marka işareti: mor yuvarlak rozet içinde küçük harf "t" ve nokta
 * (2026-10-16'da altı öneri arasından seçildi, "Küçük t").
 *
 * Aynı çizim favicon olarak `app/icon.svg` içinde de durur; işareti
 * değiştirirken ikisini birlikte güncelleyin. Renkleri sabittir, temayla
 * değişmez.
 */
export function MarkaIsareti() {
  return (
    <svg className="marka-isaret" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="16" fill="#5B47D6" />
      <path
        d="M13.5 7.5v12.2c0 2.6 1.4 3.8 3.8 3.8h1.6"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path d="M9.5 12.5h9" stroke="#FFFFFF" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="23" cy="22" r="2.2" fill="#FFFFFF" />
    </svg>
  );
}
