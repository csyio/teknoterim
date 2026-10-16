/** Site geneli sabitler. Alan adı değişirse tek yerden güncellenir. */
export const SITE = {
  ad: "Tekno Terim",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://teknoterim.com.tr",
  aciklama:
    "MSP, hosting, alan adı/DNS ve ağ güvenliği terimlerini Türkçe öğreten sözlük. Sade, hızlı, reklamsız.",
} as const;
