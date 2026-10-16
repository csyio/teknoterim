/**
 * TCMB kur ayrıştırıcısının testleri.
 *
 *   npm test
 *
 * Yanlış kur, kur olmamasından kötüdür: ayrıştırıcı emin olmadığı veride
 * `null` döndürmeli.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { tcmbAyristir } from "./kur.ts";

const ORNEK = `<?xml version="1.0" encoding="UTF-8"?>
<Tarih_Date Tarih="16.10.2026" Date="10/16/2026"  Bulten_No="2026/196" >
  <Currency CrossOrder="0" Kod="USD" CurrencyCode="USD">
    <Unit>1</Unit>
    <ForexBuying>49.3573</ForexBuying>
    <ForexSelling>50.0000</ForexSelling>
  </Currency>
  <Currency CrossOrder="9" Kod="EUR" CurrencyCode="EUR">
    <Unit>1</Unit>
    <ForexSelling>55.0000</ForexSelling>
  </Currency>
  <Currency CrossOrder="12" Kod="JPY" CurrencyCode="JPY">
    <Unit>100</Unit>
    <ForexSelling>33.0000</ForexSelling>
  </Currency>
  <Currency CrossOrder="20" Kod="XDR" CurrencyCode="XDR">
    <Unit>1</Unit>
    <ForexBuying>67.0</ForexBuying>
    <ForexSelling></ForexSelling>
  </Currency>
</Tarih_Date>`;

test("USD tabanlı kurlar TL satış kurlarından türetilir", () => {
  const sonuc = tcmbAyristir(ORNEK);
  assert.ok(sonuc);
  assert.equal(sonuc.kaynak, "TCMB");
  assert.equal(sonuc.rates.USD, 1);
  assert.equal(sonuc.rates.TRY, 50);
  // 1 USD = 50 TL, 1 EUR = 55 TL → 1 USD = 50/55 EUR
  assert.ok(Math.abs(sonuc.rates.EUR - 50 / 55) < 1e-12);
});

test("birim 1'den büyükse kur birime bölünür (100 JPY)", () => {
  const sonuc = tcmbAyristir(ORNEK);
  // 1 JPY = 0.33 TL → 1 USD = 50 / 0.33 JPY
  assert.ok(Math.abs(sonuc.rates.JPY - 50 / 0.33) < 1e-9);
});

test("satış kuru boş olan para birimi atlanır", () => {
  assert.equal(tcmbAyristir(ORNEK).rates.XDR, undefined);
});

test("bülten zamanı yayım günü 15:30 TR'dir", () => {
  assert.equal(
    tcmbAyristir(ORNEK).time_last_update_unix,
    Date.UTC(2026, 9, 16, 12, 30) / 1000
  );
});

test("tarih ya da USD yoksa veri üretilmez", () => {
  assert.equal(tcmbAyristir("<html>bakım</html>"), null);
  assert.equal(
    tcmbAyristir(ORNEK.replace(/<Currency CrossOrder="0"[\s\S]*?<\/Currency>/, "")),
    null
  );
});
