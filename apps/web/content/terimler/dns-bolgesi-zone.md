---
slug: "dns-bolgesi-zone"
baslik: "DNS Bölgesi (Zone)"
kategori: "Domain/DNS"
ozet: "Belirli bir alan adına ve alt alanlarına ait tüm DNS kayıtlarını kapsayan yönetim alanı."
isler:
  - "DNS ayarı"
  - "İlk kurulum"
  - "Sağlayıcı değişimi"
kaynaklar: []
---

## Ne amaçla kullanılır

Kayıtları alan adı bazında gruplayıp yönetmek için kullanılır. Aynı sunucu birden fazla bölgenin yetkilisi olabilir ve her bölgenin kendi SOA kaydı vardır. Alan adının kendisi ile kontrol ettiği bölgenin sınırları karıştırılırsa yetki devri yanlış kurulur ve kayıtlar hiç yayınlanmaz.

## Örnek

Bir alt alan adını ayrı sağlayıcıya devretmek, alt bölgeyi NS kayıtlarıyla yetkilendirmekle olur; ana bölgeye A kaydı yazmak tek başına yetmez.
