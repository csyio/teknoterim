#!/usr/bin/env node
/**
 * rootline — sözlük içeriği içe aktarma aracı
 *
 * Canlı rootline uygulamasının (/sozluk) HTML çıktısını okuyup her terimi
 * şemalı bir Markdown dosyasına dönüştürür. Tek seferlik bir göç aracıdır;
 * bir kez çalıştırılır, sonrasında içeriğin kaynağı repo içindeki dosyalardır.
 *
 * Kullanım:
 *   node scripts/import-sozluk.mjs <sozluk.html> [--out apps/web/content/terimler]
 *
 * Bağımlılık yoktur (regex ile ayrıştırır), çünkü kaynak HTML bizim
 * ürettiğimiz sabit şablondur.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
const outIdx = args.indexOf("--out");
const outDir = outIdx !== -1 ? args[outIdx + 1] : "apps/web/content/terimler";

if (!input) {
  console.error("Kullanım: node scripts/import-sozluk.mjs <sozluk.html> [--out content/terimler]");
  process.exit(1);
}

/* ---------------------------------- yardımcılar --------------------------------- */

const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&#39;": "'", "&#039;": "'", "&apos;": "'", "&nbsp;": " ",
  "&hellip;": "…", "&mdash;": "—", "&ndash;": "–", "&middot;": "·",
};

function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&[a-z]+;|&#\d+;/gi, (m) => ENTITIES[m] ?? m);
}

/** İç etiketleri temizler, dış boşlukları kırpar, satır içi boşlukları düzeltir. */
function text(html) {
  return decode(
    html
      .replace(/<(br|hr)\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

const TR_MAP = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o",
  ş: "s", Ş: "s", ü: "u", Ü: "u", â: "a", î: "i", û: "u",
};

/** Liste sıralamasında kullanılacak sade anahtar (ör. "Ağ/Güvenlik" -> "ag-guvenlik"). */
function slugify(s) {
  return s
    .replace(/[çÇğĞıİöÖşŞüÜâîû]/g, (c) => TR_MAP[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** YAML için güvenli çift tırnaklı dizge. */
function yamlStr(s) {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
}

/* ----------------------------------- ayrıştırma ---------------------------------- */

const html = readFileSync(input, "utf8");

const cards = html.split(/<article class="card[^"]*">/).slice(1);
if (cards.length === 0) {
  console.error("Hiç terim kartı bulunamadı. Kaynak HTML beklenen şablonda mı?");
  process.exit(1);
}

const terms = [];
const problems = [];

for (const raw of cards) {
  const card = raw.split("</article>")[0];

  const baslik = text((card.match(/<h2 class="term">([\s\S]*?)<\/h2>/) ?? [])[1] ?? "");
  const kategori = text((card.match(/<span class="cat">([\s\S]*?)<\/span>/) ?? [])[1] ?? "");
  const ozet = text((card.match(/<p class="def">([\s\S]*?)<\/p>/) ?? [])[1] ?? "");

  if (!baslik) {
    problems.push("Başlığı okunamayan kart atlandı.");
    continue;
  }

  // Etiketli anlatım katmanları: "ne amaçla", "örnek", ...
  const alanlar = {};
  const alanRe = /<div class="alan">\s*<span class="alan-baslik">([\s\S]*?)<\/span>\s*<p>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = alanRe.exec(card)) !== null) {
    const etiket = text(m[1]).toLowerCase();
    const govde = text(m[2]);
    if (etiket.includes("amaçla")) alanlar.amac = govde;
    else if (etiket.includes("örnek")) alanlar.ornek = govde;
    else alanlar[slugify(etiket).replace(/-/g, "_")] = govde;
  }

  // İş bağlamı rozetleri ("hangi işte karşına çıkar")
  const isler = [...card.matchAll(/<span class="pill">([\s\S]*?)<\/span>/g)]
    .map((x) => text(x[1]))
    .filter(Boolean);

  const slug = slugify(baslik);
  if (!ozet) problems.push(`${baslik}: özet (def) yok`);
  if (!alanlar.amac) problems.push(`${baslik}: "ne amaçla" katmanı yok`);
  if (!alanlar.ornek) problems.push(`${baslik}: "örnek" katmanı yok`);
  if (isler.length === 0) problems.push(`${baslik}: iş bağlamı rozeti yok`);

  terms.push({ slug, baslik, kategori, ozet, amac: alanlar.amac ?? "", isler, ornek: alanlar.ornek ?? "" });
}

/* ---------------------------------- çakışma kontrolü ----------------------------- */

const seen = new Map();
for (const t of terms) {
  if (seen.has(t.slug)) problems.push(`Slug çakışması: "${t.slug}" (${seen.get(t.slug)} ↔ ${t.baslik})`);
  seen.set(t.slug, t.baslik);
}

/* ------------------------------------- yazma ------------------------------------- */

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const t of terms) {
  const fm = [
    "---",
    `slug: ${yamlStr(t.slug)}`,
    `baslik: ${yamlStr(t.baslik)}`,
    `kategori: ${yamlStr(t.kategori)}`,
    `ozet: ${yamlStr(t.ozet)}`,
  ];
  if (t.isler.length) {
    fm.push("isler:");
    for (const i of t.isler) fm.push(`  - ${yamlStr(i)}`);
  } else {
    fm.push("isler: []");
  }
  fm.push("kaynaklar: []", "---", "");

  const body = `\n## Ne amaçla kullanılır\n\n${t.amac}\n\n## Örnek\n\n${t.ornek}\n`;

  writeFileSync(join(outDir, `${t.slug}.md`), fm.join("\n") + body, "utf8");
}

/* ------------------------------------- rapor ------------------------------------- */

const byCat = terms.reduce((a, t) => ((a[t.kategori] = (a[t.kategori] ?? 0) + 1), a), {});

console.log(`Yazılan terim : ${terms.length}`);
console.log(`Hedef dizin   : ${outDir}`);
console.log("Kategori dağılımı:");
for (const [k, v] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(20)} ${v}`);
}
if (problems.length) {
  console.log(`\nUYARILAR (${problems.length}):`);
  for (const p of problems) console.log(`  - ${p}`);
} else {
  console.log("\nUyarı yok — tüm kartlarda dört katman ve rozetler eksiksiz.");
}
