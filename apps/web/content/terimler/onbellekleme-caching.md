---
slug: "onbellekleme-caching"
baslik: "Önbellekleme (Caching)"
kategori: "Sunucu/Hosting"
ozet: "Sık istenen verinin, üretildiği yerden daha hızlı bir katmanda geçici olarak tutulması."
isler:
  - "Performans iyileştirme"
  - "Yavaşlık şikayeti"
  - "Mimari tasarım"
kaynaklar: []
---

## Ne amaçla kullanılır

Veritabanı ve sunucu yükünü azaltmak, yanıt süresini düşürmek için kullanılır. Bunun bedeli, içeriğin bir süre eski kalmasını kabul etmektir; bu süre yanlış ayarlanırsa kullanıcı güncel olmayan veriyi görür. İşin zor kısmı önbelleği üretmek değil, ne zaman geçersiz kılınacağına karar vermektir.

## Örnek

Ürün fiyatı güncellenip ilgili önbellek temizlenmezse, siteye gelen müşteri bir süre eski fiyatı görmeye devam eder.
