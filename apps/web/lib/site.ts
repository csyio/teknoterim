/** Site geneli sabitler. Alan adı değişirse tek yerden güncellenir. */
export const SITE = {
  ad: "rootline",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://rootline.com.tr",
  aciklama:
    "MSP, hosting, alan adı/DNS ve ağ güvenliği terimlerini Türkçe öğreten sözlük. Sade, hızlı, reklamsız.",
} as const;
