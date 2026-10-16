"use server";

/**
 * Yönetim sayfasının Server Action'ları.
 *
 * Her eylem herkese açık bir POST ucudur (Next yalnızca Origin denetimi
 * yapar): bu yüzden her biri önce oturumu doğrular, sonra girdiyi.
 * Yayın listesini etkileyen her değişiklik "gundem" önbellek etiketini
 * tazeler; /gundem bir sonraki istekte güncel listeyi okur.
 */

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { ozetParcala } from "@/lib/gundem";
import { at, duzelt, yayinla } from "@/lib/gundem-db";
import { terimSluglari } from "@/lib/terms";
import { cikis, girisDene, yetkiIste } from "@/lib/yonetim";

export type FormDurumu = { hata: string | null; tamam?: string };

const GIRIS_MESAJI: Record<string, string> = {
  yanlis: "Şifre yanlış.",
  sinir: "Çok fazla deneme. 15 dakika sonra tekrar deneyin.",
  kapali: "Yönetim kapalı: sunucuda şifre özeti tanımlı değil.",
};

export async function girisYap(_: FormDurumu, form: FormData): Promise<FormDurumu> {
  const sifre = form.get("sifre");
  if (typeof sifre !== "string" || !sifre) return { hata: "Şifreyi yazın." };
  const sonuc = await girisDene(sifre);
  if (sonuc !== "tamam") return { hata: GIRIS_MESAJI[sonuc] };
  redirect("/yonetim");
}

export async function cikisYap(): Promise<void> {
  await cikis();
  redirect("/yonetim");
}

function kimlikOku(form: FormData): number {
  const id = Number(form.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Geçersiz kayıt");
  return id;
}

export async function yayinlaEylem(form: FormData): Promise<void> {
  await yetkiIste();
  if (yayinla(kimlikOku(form))) updateTag("gundem");
}

export async function atEylem(form: FormData): Promise<void> {
  await yetkiIste();
  if (at(kimlikOku(form))) updateTag("gundem");
}

const EN_KISA_OZET = 40;
const EN_UZUN_OZET = 3000;

export async function duzeltEylem(_: FormDurumu, form: FormData): Promise<FormDurumu> {
  await yetkiIste();
  const id = kimlikOku(form);
  const baslik = String(form.get("baslik") ?? "").replace(/\s+/g, " ").trim();
  const ozet = String(form.get("ozet") ?? "").replace(/\r\n?/g, "\n").trim();

  if (baslik.length < 10 || baslik.length > 160) return { hata: "Başlık 10–160 karakter olmalı." };
  if (ozet.length < EN_KISA_OZET || ozet.length > EN_UZUN_OZET) {
    return { hata: `Özet ${EN_KISA_OZET}–${EN_UZUN_OZET} karakter olmalı.` };
  }
  if (/\[sahte\]|claude tarafından yazılmadı/i.test(baslik + ozet)) {
    return { hata: "Sahte taslağın metni duruyor; özeti kendiniz yazın." };
  }

  // Sözlük bağlantısı biçiminde ama sözlükte olmayan terim: büyük olasılıkla
  // yazım hatası; sessizce düz metne çevirmek yerine editöre söylenir.
  const sluglar = terimSluglari();
  const bilinmeyen = ozetParcala(ozet)
    .flat()
    .filter((p) => p.slug && !sluglar.has(p.slug))
    .map((p) => p.slug);
  if (bilinmeyen.length) return { hata: `Sözlükte olmayan terim: ${[...new Set(bilinmeyen)].join(", ")}` };

  if (!duzelt(id, baslik, ozet)) return { hata: "Bu kayıt artık düzeltilemiyor (atılmış olabilir)." };
  const yayinlandi = form.get("sonra") === "yayinla" && yayinla(id);
  updateTag("gundem");
  return { hata: null, tamam: yayinlandi ? "Kaydedildi ve yayınlandı." : "Kaydedildi." };
}
