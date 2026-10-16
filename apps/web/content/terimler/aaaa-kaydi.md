---
slug: "aaaa-kaydi"
baslik: "AAAA Kaydı"
kategori: "Domain/DNS"
ozet: "Bir alan adını IPv6 adresine bağlayan DNS kaydı; A kaydının IPv6 karşılığıdır."
isler:
  - "Site taşıma"
  - "İlk kurulum"
  - "Arıza teşhisi"
kaynaklar: []
---

## Ne amaçla kullanılır

Alan adının IPv4'ün yanında IPv6 üzerinden de erişilebilir olmasını sağlar. Uyumlu istemciler bağlantıyı doğrudan IPv6 üzerinden kurar; kayıt yoksa site IPv4 ile çalışmaya devam eder ve erişim kesilmez. Asıl risk, taşıma sırasında bu kaydın eski sunucuyu göstermeye devam etmesidir.

## Örnek

Site taşındıktan sonra A kaydı güncellenip AAAA kaydı unutulursa, IPv6 kullanan ziyaretçiler eski sunucuya gider; bazılarında açılıp bazılarında açılmaması bu yüzden olur.
