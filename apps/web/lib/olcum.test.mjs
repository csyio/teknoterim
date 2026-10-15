/**
 * Ölçüm toplayıcısının saf mantığının testleri.
 *
 *   npm test
 *
 * Buradaki testlerin çoğu birer güvenlik iddiasıdır: istemciden gelen veri
 * doğrulanmadan kaydedilmemeli ve yönlendiren adresin tamamı saklanmamalı.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  EN_BUYUK_GOVDE,
  govdeDogrula,
  gunMetni,
  icGezinmeMi,
  kaynakAlani,
  konukAnahtari,
  yolAyikla,
  yolGecerliMi,
} from "./olcum.ts";

const SITE = "https://rootline.com.tr";

test("gün Türkiye saatine göre hesaplanır", () => {
  // 2026-10-15 00:30 TR = 2026-10-14 21:30 UTC → hâlâ 15'i
  assert.equal(gunMetni(Date.UTC(2026, 9, 14, 21, 30)), "2026-10-15");
  // 2026-10-14 23:30 TR = 2026-10-14 20:30 UTC → 14'ü
  assert.equal(gunMetni(Date.UTC(2026, 9, 14, 20, 30)), "2026-10-14");
  // Gün başı tam sınır: 2026-01-01 00:00 TR
  assert.equal(gunMetni(Date.UTC(2025, 11, 31, 21, 0)), "2026-01-01");
});

test("yol sadeleştirmesi sorgu ve çapayı atar", () => {
  assert.equal(yolAyikla("/sozluk?k=dns"), "/sozluk");
  assert.equal(yolAyikla("/sozluk/dns#ornek"), "/sozluk/dns");
  assert.equal(yolAyikla("/sozluk/dns?k=dns#ornek"), "/sozluk/dns");
  assert.equal(yolAyikla("/sozluk"), "/sozluk");
  assert.equal(yolAyikla("/"), "/");
});

test("yol doğrulaması yalnızca site içi adresleri kabul eder", () => {
  assert.equal(yolGecerliMi("/"), true);
  assert.equal(yolGecerliMi("/sozluk/dns"), true);
  assert.equal(yolGecerliMi("/sozluk?k=dns"), true, "sorgu dizesi kabul edilir, sonra ayıklanır");

  assert.equal(yolGecerliMi(undefined), false);
  assert.equal(yolGecerliMi(42), false);
  assert.equal(yolGecerliMi(""), false);
  assert.equal(yolGecerliMi("sozluk"), false, "göreli yol kabul edilmez");
  assert.equal(yolGecerliMi("//example.com/x"), false, "protokol-göreli adres dış sitedir");
  assert.equal(yolGecerliMi("https://example.com"), false);
  assert.equal(yolGecerliMi("/a b"), false);
  assert.equal(yolGecerliMi('/<script>x</script>'), false);
  assert.equal(yolGecerliMi("/" + "a".repeat(400)), false, "aşırı uzun yol");
});

test("kendi alan adımız kaynak sayılmaz", () => {
  assert.equal(icGezinmeMi("rootline.com.tr", SITE), true);
  assert.equal(icGezinmeMi("www.rootline.com.tr", SITE), true);
  assert.equal(icGezinmeMi("google.com", SITE), false);
  assert.equal(
    icGezinmeMi("rootline.com.tr.example.com", SITE),
    false,
    "alan adı benzerliği yeterli değil: son ek kontrolü şart"
  );
});

test("kaynak yalnızca alan adı olarak saklanır", () => {
  assert.equal(kaynakAlani("", SITE), null);
  assert.equal(kaynakAlani("bozuk-adres", SITE), null);
  assert.equal(kaynakAlani("https://rootline.com.tr/sozluk", SITE), null, "iç gezinme");
  assert.equal(kaynakAlani("javascript:alert(1)", SITE), null);

  // Arama sorgusu kişisel veri taşıyabilir; saklanan yalnızca alan adıdır.
  assert.equal(
    kaynakAlani("https://www.google.com/search?q=kisisel+veri", SITE),
    "www.google.com"
  );
});

test("istemci gövdesi doğrulanır", () => {
  assert.deepEqual(govdeDogrula({ yol: "/sozluk/dns", kaynak: "" }, SITE), {
    yol: "/sozluk/dns",
    kaynak: null,
  });
  assert.deepEqual(
    govdeDogrula({ yol: "/sozluk?k=dns", kaynak: "https://x.com/a" }, SITE),
    { yol: "/sozluk", kaynak: "x.com" }
  );

  assert.equal(govdeDogrula(null, SITE), null);
  assert.equal(govdeDogrula("metin", SITE), null);
  assert.equal(govdeDogrula({}, SITE), null);
  assert.equal(govdeDogrula({ yol: 1 }, SITE), null);
  assert.equal(govdeDogrula({ yol: "https://kotu.example" }, SITE), null);
  assert.equal(govdeDogrula({ yol: "//kotu.example" }, SITE), null);
  assert.deepEqual(
    govdeDogrula({ yol: "/sozluk", kaynak: { d: 1 } }, SITE),
    { yol: "/sozluk", kaynak: null },
    "bozuk kaynak görüntülemeyi düşürmez, yalnızca yok sayılır"
  );
});

test("gövde sınırı makul", () => {
  assert.equal(EN_BUYUK_GOVDE, 2000);
});

test("ziyaretçi anahtarı gün, tuz ve tarayıcıya bağlı", () => {
  const a = konukAnahtari("tuz", "2026-10-15", "1.2.3.4", "UA");
  assert.equal(a.length, 16);
  assert.equal(a, konukAnahtari("tuz", "2026-10-15", "1.2.3.4", "UA"), "aynı girdi → aynı anahtar");

  assert.notEqual(a, konukAnahtari("tuz", "2026-10-16", "1.2.3.4", "UA"), "gün değişince");
  assert.notEqual(a, konukAnahtari("baska", "2026-10-15", "1.2.3.4", "UA"), "tuz değişince (her kurulumda farklı)");
  assert.notEqual(a, konukAnahtari("tuz", "2026-10-15", "5.6.7.8", "UA"), "ziyaretçi değişince");
  assert.notEqual(a, konukAnahtari("tuz", "2026-10-15", "1.2.3.4", "UA2"), "tarayıcı değişince");
});
