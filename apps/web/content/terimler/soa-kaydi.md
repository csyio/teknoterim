---
slug: "soa-kaydi"
baslik: "SOA Kaydı"
kategori: "Domain/DNS"
ozet: "Start of Authority. Bir DNS bölgesinin yetkili sunucusunu ve seri numarası gibi temel bilgilerini taşıyan kayıt."
isler:
  - "DNS ayarı"
  - "Arıza teşhisi"
  - "Sağlayıcı değişimi"
kaynaklar: []
---

## Ne amaçla kullanılır

Bir bölgenin hangi sunucu tarafından yönetildiğini ve değişikliklerin sırasını tanımlar. Seri numarası artırılmadan yapılan değişiklikler ikincil sunuculara yayılmaz; yayılma sorunlarının kökünde genelde bu vardır. Kayıt elle düzenlenmez, panel kendisi yönetir — bu yüzden varlığı ancak bir şey ters gittiğinde fark edilir.

## Örnek

Birincil/ikincil sunuculu bir DNS yapısında değişiklik ikincil sunucuya yansımıyorsa, ilk bakılacak yer SOA seri numarasıdır.
