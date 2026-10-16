---
slug: "caa-kaydi"
baslik: "CAA Kaydı"
kategori: "Domain/DNS"
ozet: "Certification Authority Authorization. Bir alan adına sertifika çıkarabilecek otoriteleri sınırlayan DNS kaydı."
isler:
  - "Alan adı güvenliği"
  - "Sertifika doğrulama"
  - "Uyum gereksinimi"
kaynaklar: []
---

## Ne amaçla kullanılır

Yetkisiz bir sertifika otoritesinin alan adına sertifika çıkarmasını engellemek için kullanılır. Kayıt yoksa her otorite sertifika çıkarabilir; bu yüzden CAA, sessiz çalışan bir korumadır. Sertifika otoriteleri kaydı zorunlu olarak kontrol eder, ancak DNS'in kendisi değiştirilebilirse CAA da kaldırılabilir — tek başına yeterli bir savunma değildir.

## Örnek

Sertifikalarını tek bir otoriteden alan bir kurum CAA kaydı yazmazsa, başka bir otoritenin aynı alan adına çıkardığı geçerli sertifika engellenmez.
