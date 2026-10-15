---
slug: "mx-kaydi"
baslik: "MX Kaydı"
kategori: "Domain/DNS"
ozet: "Mail Exchange. Bir alan adına gelen e-postanın hangi posta sunucusuna teslim edileceğini belirten DNS kaydı."
isler:
  - "E-posta kurulumu"
  - "Site taşıma"
  - "Arıza teşhisi"
kaynaklar: []
---

## Ne amaçla kullanılır

E-posta trafiğini web trafiğinden ayırmak için kullanılır. Kayıtlar öncelik değeriyle birden fazla yazılabilir; bir sunucu yanıt vermezse diğeri devralır. Web sitesinin yeri değişse bile MX kaydı ayrı yönetildiği için e-posta bundan etkilenmez — taşımalarda en sık yapılan hata tam da bu ayrımı gözetmemektir.

## Örnek

Site yeni sunucuya taşınırken yalnızca A kaydı değiştirilmelidir; MX kaydına da dokunulursa site sorunsuz açılır ama gelen e-postalar kaybolur.
