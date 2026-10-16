/**
 * Tutar ayrıştırıcısının testleri.
 *
 *   npm test
 *
 * Türkçe yazımda virgül ondalık, nokta binliktir; ama kullanıcılar "1.5"
 * de yazar. Yanlış ayrıştırma bin kat yanlış sonuç demektir.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { tutarAyristir } from "./tutar.ts";

test("Türkçe biçim: nokta binlik, virgül ondalık", () => {
  assert.equal(tutarAyristir("1.234,56"), 1234.56);
  assert.equal(tutarAyristir("2,5"), 2.5);
  assert.equal(tutarAyristir("1.500"), 1500);
  assert.equal(tutarAyristir("1.000.000"), 1000000);
});

test("İngilizce biçim ve sade sayılar", () => {
  assert.equal(tutarAyristir("1,234.56"), 1234.56);
  assert.equal(tutarAyristir("1.5"), 1.5);
  assert.equal(tutarAyristir("1 234"), 1234);
  assert.equal(tutarAyristir("42"), 42);
  assert.equal(tutarAyristir("0"), 0);
});

test("binlik olamayacak noktalı sayılar ondalıktır", () => {
  assert.equal(tutarAyristir("0.125"), 0.125);
  assert.equal(tutarAyristir("0.500"), 0.5);
  assert.equal(tutarAyristir(".500"), 0.5);
  assert.equal(tutarAyristir("1234.567"), 1234.567);
  assert.equal(tutarAyristir("12.000.000"), 12000000);
});

test("bozuk gruplama ve yalnız ayırıcı geçersizdir", () => {
  assert.equal(tutarAyristir("1.2.3"), null);
  assert.equal(tutarAyristir(".."), null);
  assert.equal(tutarAyristir("..."), null);
  assert.equal(tutarAyristir(","), null);
  assert.equal(tutarAyristir("12.34,5.6"), null);
  assert.equal(tutarAyristir("1.23,45"), null);
});

test("geçersiz girdi null döner", () => {
  assert.equal(tutarAyristir(""), null);
  assert.equal(tutarAyristir("abc"), null);
  assert.equal(tutarAyristir("-5"), null);
  assert.equal(tutarAyristir("1,2,3"), null);
  assert.equal(tutarAyristir("1e5"), null);
});
