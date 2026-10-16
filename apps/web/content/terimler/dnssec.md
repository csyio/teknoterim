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

Bir bankanın alan adında DNSSEC açık. Saldırgan, şirket ağındaki DNS çözümleyiciye bankanın adresi yerine kendi sunucusunun IP'sini gönderen sahte bir cevap sokmaya çalışıyor (DNS zehirleme). Cevap bankanın imzasını taşımadığı için doğrulama yapan çözümleyici onu reddeder; kullanıcı sahte siteye değil, bir bağlantı hatasına düşer. Doğrulamayı tarayıcı değil, çözümleyici yapar: şirketin DNS sunucusunda DNSSEC doğrulaması kapalıysa bu koruma çalışmaz.
