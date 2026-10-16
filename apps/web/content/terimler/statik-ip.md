---
slug: "statik-ip"
baslik: "Statik IP"
kategori: "Sunucu/Hosting"
ozet: "Zamanla değişmeyen, sabit kalan ve kendisine bağlanan tarafça kalıcı olarak tanımlanabilen IP adresi."
isler:
  - "Servis entegrasyonu"
  - "İlk kurulum"
  - "Erişim kuralı"
kaynaklar: []
---

## Ne amaçla kullanılır

Dış sistemlerin sunucuyu kalıcı olarak tanımasını sağlamak için kullanılır. Güvenlik duvarı izin listeleri, ödeme kuruluşu entegrasyonları ve e-posta gönderimi sabit bir adres gerektirir; karşı taraf, adresi kendi tarafına önceden tanımlar. Dinamik adresler değiştiği için bu tür entegrasyonlarda kullanılamaz.

## Örnek

Ödeme kuruluşu bildirimleri sunucuya yalnızca tanımlı IP'den kabul eder; adres değişirse ödeme onayları sessizce gelmemeye başlar.
