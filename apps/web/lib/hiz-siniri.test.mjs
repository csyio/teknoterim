/**
 * Hız sınırının testleri.
 *
 *   npm test
 */

import test from "node:test";
import assert from "node:assert/strict";

import { hizSiniriKur } from "./hiz-siniri.ts";

test("anahtar başına sınır aşılınca istek reddedilir", () => {
  const s = hizSiniriKur({ pencereMs: 60_000, anahtarBasina: 3, toplam: 100 });
  assert.equal(s.izinVer("1.1.1.1", 0), true);
  assert.equal(s.izinVer("1.1.1.1", 1), true);
  assert.equal(s.izinVer("1.1.1.1", 2), true);
  assert.equal(s.izinVer("1.1.1.1", 3), false);
  // Başka bir ziyaretçi etkilenmez.
  assert.equal(s.izinVer("2.2.2.2", 4), true);
});

test("pencere dolunca sayaç sıfırlanır", () => {
  const s = hizSiniriKur({ pencereMs: 1000, anahtarBasina: 1, toplam: 100 });
  assert.equal(s.izinVer("a", 0), true);
  assert.equal(s.izinVer("a", 500), false);
  assert.equal(s.izinVer("a", 1000), true);
});

test("toplam tavan dağıtık seli durdurur", () => {
  const s = hizSiniriKur({ pencereMs: 60_000, anahtarBasina: 10, toplam: 5 });
  for (let i = 0; i < 5; i++) assert.equal(s.izinVer(`ip-${i}`, i), true);
  assert.equal(s.izinVer("ip-yeni", 10), false);
});

test("anahtar sayısı tavanı belleği korur", () => {
  const s = hizSiniriKur({
    pencereMs: 60_000,
    anahtarBasina: 10,
    toplam: 1000,
    enFazlaAnahtar: 2,
  });
  assert.equal(s.izinVer("a", 0), true);
  assert.equal(s.izinVer("b", 0), true);
  assert.equal(s.izinVer("c", 0), false);
  // Var olan anahtar çalışmaya devam eder.
  assert.equal(s.izinVer("a", 1), true);
});
