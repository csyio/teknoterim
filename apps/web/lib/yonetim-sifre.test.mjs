/**
 * Yönetim girişi kriptografisinin testleri.
 *
 *   npm test
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  belirtecBicimiGecerli,
  belirtecOzeti,
  belirtecUret,
  sifreDogrula,
  sifreOzetiUret,
} from "./yonetim-sifre.ts";

test("doğru şifre kabul, yanlış şifre ret", async () => {
  const ozet = await sifreOzetiUret("uzun-ve-guclu-bir-sifre");
  assert.match(ozet, /^scrypt:32768:8:1:[\w-]+:[\w-]+$/);
  assert.equal(await sifreDogrula("uzun-ve-guclu-bir-sifre", ozet), true);
  assert.equal(await sifreDogrula("uzun-ve-guclu-bir-sifrE", ozet), false);
  assert.equal(await sifreDogrula("", ozet), false);
});

test("aynı şifre her seferinde farklı özet üretir (tuz)", async () => {
  assert.notEqual(await sifreOzetiUret("ayni-sifre-ayni"), await sifreOzetiUret("ayni-sifre-ayni"));
});

test("özet tanımsız ya da bozuksa giriş yok", async () => {
  assert.equal(await sifreDogrula("x", undefined), false);
  assert.equal(await sifreDogrula("x", ""), false);
  assert.equal(await sifreDogrula("x", "duz-metin-sifre"), false);
  assert.equal(await sifreDogrula("x", "scrypt:32768:8:1:kisa:kisa"), false);
});

test("bellek tüketecek parametreler reddedilir", async () => {
  const gecerli = await sifreOzetiUret("parametre-denemesi");
  const [, , r, p, tuz, oz] = gecerli.split(":");
  assert.equal(await sifreDogrula("parametre-denemesi", ["scrypt", 1 << 24, r, p, tuz, oz].join(":")), false);
  assert.equal(await sifreDogrula("parametre-denemesi", ["scrypt", 30000, r, p, tuz, oz].join(":")), false);
});

test("oturum belirteci 43 karakter, özeti belirteci içermez", () => {
  const b = belirtecUret();
  assert.equal(belirtecBicimiGecerli(b), true);
  assert.equal(belirtecBicimiGecerli(b + "x"), false);
  assert.equal(belirtecBicimiGecerli("../../etc"), false);
  assert.notEqual(belirtecUret(), b);
  assert.equal(belirtecOzeti(b).length, 64);
  assert.ok(!belirtecOzeti(b).includes(b));
});
