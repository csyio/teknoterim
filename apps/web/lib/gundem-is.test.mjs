/**
 * Gündem akışının uçtan uca testi: sahte ağ + sahte yazar + geçici veritabanı.
 *
 *   npm test
 *
 * Gerçek ağa ve Claude'a gidilmez. Sınanan iddialar: aynı haber iki kez
 * alınmaz, eşik ve günlük tavan uygulanır, sahte taslak yayınlanamaz,
 * editör düzeltince yayınlanabilir.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Veritabanı ilk kullanımda açılır; dizini ondan önce ayarla.
const dizin = mkdtempSync(path.join(tmpdir(), "gundem-test-"));
process.env.TEKNOTERIM_VERI = dizin;
test.after(() => rmSync(dizin, { recursive: true, force: true }));

const { gundemCalistir, sinirliGetir } = await import("./gundem-is.ts");
const db = await import("./gundem-db.ts");
const { yazarKur } = await import("./gundem-claude.ts");

const AN = Date.UTC(2026, 9, 16, 9, 0); // 12:00 TR

function rss(ogeler) {
  return `<rss><channel>${ogeler
    .map(
      (o) =>
        `<item><title>${o.baslik}</title><link>${o.baglanti}</link><description>${o.aciklama ?? ""}</description><pubDate>${new Date(o.an ?? AN - 3600_000).toUTCString()}</pubDate></item>`
    )
    .join("")}</channel></rss>`;
}

/** Adrese göre yanıt veren sahte fetch. */
function sahteAg(tablo) {
  return async (url) => {
    const adres = String(url);
    const govde = tablo[adres];
    if (govde === undefined) return new Response("yok", { status: 404 });
    if (govde instanceof Response) return govde;
    return new Response(govde, { status: 200 });
  };
}

const KAYNAK = { kimlik: "deneme", ad: "Deneme", besleme: "https://besleme.example/rss", konu: "guvenlik" };
const TERIMLER = [{ slug: "dns", baslik: "DNS" }];

test("uçtan uca: topla → ayıkla → sahte taslak → düzelt → yayınla", async () => {
  const yazar = yazarKur({}); // anahtar yok → sahte
  assert.equal(yazar.sahte, true);

  const besleme = rss([
    { baslik: "DNS resolver outage hits Europe", baglanti: "https://haber.example/1?utm_source=rss" },
    { baslik: "Company opens new office", baglanti: "https://haber.example/2" },
    { baslik: "Old exploit story", baglanti: "https://haber.example/3", an: AN - 10 * 24 * 3600_000 },
  ]);
  const getir = sahteAg({
    "https://besleme.example/rss": besleme,
    "https://haber.example/1": "<article><p>Uzun haber metni.</p></article>",
  });

  const s1 = await gundemCalistir({
    kaynaklar: [KAYNAK], terimler: TERIMLER, yazar, getir, an: AN,
    ayarlar: { esik: 4, gunlukTavan: 20 },
  });
  assert.equal(s1.toplanan, 2, "10 günlük haber alınmaz");
  assert.equal(s1.puanlanan, 2);
  assert.equal(s1.taslak, 1, "yalnızca eşiği geçen haber taslak olur");
  assert.equal(s1.sahte, true);

  // Aynı besleme tekrar okunursa yeni haber yok.
  const s2 = await gundemCalistir({
    kaynaklar: [KAYNAK], terimler: TERIMLER, yazar, getir, an: AN + 3600_000,
    ayarlar: { esik: 4, gunlukTavan: 20 },
  });
  assert.equal(s2.toplanan, 0);

  const [taslak] = db.bekleyenTaslaklar();
  assert.equal(taslak.sahte, 1);
  assert.match(taslak.taslakBaslik, /^\[SAHTE\]/);
  assert.match(taslak.taslakOzet, /\[DNS\]\(\/sozluk\/dns\)/, "sözlük terimi bağlanır");
  assert.equal(taslak.baglanti, "https://haber.example/1", "izleme parametresi atılır");

  assert.equal(db.yayinla(taslak.id), false, "sahte taslak yayınlanamaz");
  assert.equal(db.yayindakiler().length, 0);

  assert.equal(db.duzelt(taslak.id, "DNS kesintisi", "Editörün kendi metni."), true);
  assert.equal(db.yayinla(taslak.id), true);
  assert.equal(db.yayinla(taslak.id), false, "iki kez yayınlanmaz");

  const [yayinda] = db.yayindakiler();
  assert.equal(yayinda.baslik, "DNS kesintisi");
  assert.equal(yayinda.ozet, "Editörün kendi metni.");
  assert.equal(yayinda.editorYazisi, true, "sahte taslaktan editörün yazdığı metin yapay zekâ taslağı sayılmaz");

  assert.equal(db.at(taslak.id), true, "yayındaki haber kaldırılabilir");
  assert.equal(db.yayindakiler().length, 0);
});

test("günlük tavan aynı gün içinde aşılmaz", async () => {
  const ogeler = Array.from({ length: 5 }, (_, i) => ({
    baslik: `Critical exploit number ${i}`,
    baglanti: `https://tavan.example/${i}`,
  }));
  const kaynak = { ...KAYNAK, kimlik: "tavan", besleme: "https://tavan.example/rss" };
  const getir = sahteAg({ "https://tavan.example/rss": rss(ogeler) });
  const yazar = yazarKur({ GUNDEM_SAHTE: "1", ANTHROPIC_API_KEY: "kullanilmaz" });
  const ayarlar = { esik: 4, gunlukTavan: 3 };
  const onceki = db.bugunkuTaslakSayisi("2026-10-16");

  const s = await gundemCalistir({ kaynaklar: [kaynak], terimler: TERIMLER, yazar, getir, an: AN, ayarlar });
  assert.equal(s.taslak, Math.max(0, 3 - onceki));
  assert.equal(db.bugunkuTaslakSayisi("2026-10-16"), 3);

  const s2 = await gundemCalistir({ kaynaklar: [kaynak], terimler: TERIMLER, yazar, getir, an: AN + 60_000, ayarlar });
  assert.equal(s2.taslak, 0, "tavan doldu");
});

test("ayıklamada reddedilen haber paketten ayıklanır, diğerleri puanlanır", async () => {
  const { ReddedildiHatasi } = await import("./gundem-claude.ts");
  const ogeler = ["Patch A", "Exploit details B", "Patch C", "Patch D"].map((baslik, i) => ({
    baslik,
    baglanti: `https://red.example/${i}`,
  }));
  const kaynak = { ...KAYNAK, kimlik: "red", besleme: "https://red.example/rss" };
  const getir = sahteAg({ "https://red.example/rss": rss(ogeler) });
  let cagri = 0;
  const yazar = {
    sahte: false,
    async puanla(haberler) {
      cagri++;
      if (haberler.some((h) => h.baslik.startsWith("Exploit"))) throw new ReddedildiHatasi("red");
      // Bir haberi yanıtta "unutur".
      return haberler.filter((h) => h.baslik !== "Patch D").map((h) => ({ id: h.id, puan: 2, gerekce: "rutin" }));
    },
    async taslakYaz() {
      return null;
    },
  };
  const s = await gundemCalistir({
    kaynaklar: [kaynak], terimler: TERIMLER, yazar, getir, an: AN,
    ayarlar: { esik: 4, gunlukTavan: 0 },
  });
  assert.equal(s.puanlanan, 2, "A ve C puanlandı");
  assert.equal(s.hata, 0);
  assert.ok(cagri <= 5, "paket ikiye bölünerek aranır");
  assert.equal(db.puanlanacaklar(100).filter((h) => h.kaynak === "red").length, 0, "hiçbiri bir sonraki saate kalmaz");
});

test("bir kaynağın hatası diğerlerini durdurmaz", async () => {
  const bozuk = { ...KAYNAK, kimlik: "bozuk", besleme: "https://bozuk.example/rss" };
  const saglam = { ...KAYNAK, kimlik: "saglam", besleme: "https://saglam.example/rss" };
  const getir = sahteAg({
    "https://saglam.example/rss": rss([{ baslik: "Patch released", baglanti: "https://saglam.example/1" }]),
  });
  const s = await gundemCalistir({
    kaynaklar: [bozuk, saglam], terimler: TERIMLER, yazar: yazarKur({}), getir, an: AN,
    ayarlar: { esik: 5, gunlukTavan: 0 },
  });
  assert.equal(s.hata, 1);
  assert.equal(s.toplanan, 1);
});

test("getirici iç adreslere ve https dışına gitmez", async () => {
  const getir = sahteAg({});
  await assert.rejects(sinirliGetir(getir, "https://127.0.0.1/x", 100), /iç adres/);
  await assert.rejects(sinirliGetir(getir, "https://localhost:8767/x", 100), /iç adres/);
  await assert.rejects(sinirliGetir(getir, "file:///etc/passwd", 100), /yalnızca https/);

  const yonlendiren = async (url) =>
    String(url).startsWith("https://dis.example")
      ? new Response(null, { status: 302, headers: { location: "http://169.254.169.254/meta" } })
      : new Response("gizli");
  await assert.rejects(sinirliGetir(yonlendiren, "https://dis.example/a", 100), /iç adres/);
});

test("getirici büyük yanıtı yarıda keser", async () => {
  const getir = async () => new Response("x".repeat(5000));
  await assert.rejects(sinirliGetir(getir, "https://buyuk.example/", 1000), /çok büyük/);
  assert.equal(await sinirliGetir(getir, "https://buyuk.example/", 10_000), "x".repeat(5000));
});
