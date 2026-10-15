/**
 * Aralıklı tekrar mantığının testleri.
 *
 *   npm test
 *
 * Bağımlılık yok: Node'un yerleşik test koşucusu kullanılır. `srs.ts` saf
 * fonksiyonlardan oluşur ve tipler Node tarafından yüklenirken ayıklanır.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  ARALIKLAR_GUN,
  YENI_DURUM,
  cevapla,
  gunEkle,
  gunMetni,
  ogrenildiAyarla,
  ozetle,
  vadesiGeldi,
} from "./srs.ts";

const BUGUN = "2026-10-15";

test("tarih biçimleme ve gün aritmetiği", () => {
  assert.equal(gunMetni(new Date(2026, 9, 15)), "2026-10-15");
  assert.equal(gunMetni(new Date(2026, 0, 5)), "2026-01-05", "tek haneli ay/gün sıfırla doldurulur");
  assert.equal(gunEkle("2026-10-30", 3), "2026-11-02", "ay geçişi");
  assert.equal(gunEkle("2026-12-31", 1), "2027-01-01", "yıl geçişi");
  assert.equal(gunEkle("2026-11-01", -1), "2026-10-31", "geri gitme");
});

test("doğru cevap kutuyu yükseltir ve aralığı uzatır", () => {
  let d = cevapla(YENI_DURUM, true, BUGUN);
  assert.deepEqual([d.kutu, d.sonraki], [1, "2026-10-16"]);

  d = cevapla(d, true, "2026-10-16");
  assert.deepEqual([d.kutu, d.sonraki], [2, "2026-10-19"]);

  d = cevapla(d, true, "2026-10-19");
  assert.deepEqual([d.kutu, d.sonraki], [3, "2026-10-26"]);
});

test("yanlış cevap kutuyu sıfırlar ve terimi hemen sıraya döndürür", () => {
  const ilerlemis = cevapla(cevapla(YENI_DURUM, true, BUGUN), true, BUGUN);
  const sifirlanmis = cevapla(ilerlemis, false, BUGUN);

  assert.equal(sifirlanmis.kutu, 0);
  assert.equal(ARALIKLAR_GUN[0], 0, "kutu 0 aynı gün tekrar demektir");
  assert.equal(sifirlanmis.sonraki, BUGUN);
  assert.equal(sifirlanmis.yanlis, 1);
});

test("kutu üst sınırı aşılmaz", () => {
  let d = YENI_DURUM;
  for (let i = 0; i < 12; i++) d = cevapla(d, true, BUGUN);
  assert.equal(d.kutu, ARALIKLAR_GUN.length - 1);
});

test("doğru/yanlış sayaçları birikir", () => {
  let d = cevapla(YENI_DURUM, true, BUGUN);
  d = cevapla(d, false, BUGUN);
  d = cevapla(d, true, BUGUN);
  assert.equal(d.dogru, 2);
  assert.equal(d.yanlis, 1);
});

test("vade kontrolü", () => {
  assert.equal(vadesiGeldi(undefined, BUGUN), true, "hiç çalışılmamış terim sırada");

  const gelecek = cevapla(YENI_DURUM, true, BUGUN);
  assert.equal(vadesiGeldi(gelecek, BUGUN), false, "gelecek tarihli terim sırada değil");
  assert.equal(vadesiGeldi(gelecek, "2026-10-16"), true, "vadesi gelince sıraya girer");

  const ogrenilmis = ogrenildiAyarla(YENI_DURUM, true, BUGUN);
  assert.equal(vadesiGeldi(ogrenilmis, "2030-01-01"), false, "öğrenildi işareti sıradan çıkarır");
});

test("öğrenildi işareti kaldırılınca terim sıraya döner", () => {
  const isaretli = ogrenildiAyarla(YENI_DURUM, true, BUGUN);
  assert.equal(isaretli.ogrenildi, true);
  assert.equal(isaretli.kutu, ARALIKLAR_GUN.length - 1);

  const geri = ogrenildiAyarla(isaretli, false, BUGUN);
  assert.equal(geri.ogrenildi, false);
  assert.equal(geri.kutu, 0);
  assert.equal(vadesiGeldi(geri, BUGUN), true);
});

test("özet sayımı", () => {
  const ilerleme = {
    a: { kutu: 5, sonraki: "2027-01-01", dogru: 5, yanlis: 0, ogrenildi: true },
    b: { kutu: 1, sonraki: "2026-10-20", dogru: 1, yanlis: 0, ogrenildi: false },
    c: { kutu: 0, sonraki: "2026-10-10", dogru: 0, yanlis: 1, ogrenildi: false },
  };

  assert.deepEqual(ozetle(["a", "b", "c", "d"], ilerleme, BUGUN), {
    toplam: 4,
    ogrenilen: 1,
    sirada: 1, // c: vadesi geçmiş
    yeni: 1, // d: hiç çalışılmamış (b'nin vadesi gelmemiş, sayılmaz)
  });
});
