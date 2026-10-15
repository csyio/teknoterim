---
slug: "dnssec"
baslik: "DNSSEC"
kategori: "Domain/DNS"
ozet: "DNS yanıtlarını dijital imzayla doğrulayan, sahte DNS cevabı üretilmesini engelleyen güvenlik uzantısı."
isler:
  - "Alan adı güvenliği"
  - "Sertifika doğrulama"
  - "Uyum gereksinimi"
kaynaklar: []
---

## Ne amaçla kullanılır

Saldırganın DNS cevabını değiştirip ziyaretçiyi sahte bir sunucuya yönlendirmesini engellemek için kullanılır. Sertifika otoriteleri de artık alan adı doğrulamasında DNSSEC kontrolü yapmak zorunda, bu yüzden önemi arttı.

## Örnek

DNSSEC açık bir alan adında sahte DNS cevabı üretilse bile tarayıcı kabul etmez.
