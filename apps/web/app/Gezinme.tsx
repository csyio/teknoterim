"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BAGLANTILAR = [
  { yol: "/sozluk", ad: "Sözlük" },
  { yol: "/calis", ad: "Çalış" },
] as const;

/**
 * Ana gezinme.
 *
 * Bulunulan sayfa `aria-current="page"` ile işaretlenir: hem ekran okuyucu
 * hem de görünüm (dolu zemin + parlak yazı) aynı öznitelikten okur, ikinci
 * bir "seçili" durumu tutulmaz.
 */
export function Gezinme() {
  const yol = usePathname();

  return (
    <nav className="gezinme" aria-label="Ana gezinme">
      {BAGLANTILAR.map((b) => {
        const burada = yol === b.yol || yol.startsWith(`${b.yol}/`);
        return (
          <Link key={b.yol} href={b.yol} aria-current={burada ? "page" : undefined}>
            {b.ad}
          </Link>
        );
      })}
    </nav>
  );
}
