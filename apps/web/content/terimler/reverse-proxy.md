---
slug: "reverse-proxy"
baslik: "Reverse Proxy"
kategori: "Sunucu/Hosting"
ozet: "İstemci ile sunucu arasında duran, gelen istekleri karşılayıp arkadaki sunuculara ileten ara katman."
isler:
  - "Mimari tasarım"
  - "SSL sonlandırma"
  - "Performans iyileştirme"
kaynaklar: []
---

## Ne amaçla kullanılır

Arkadaki sunucuları doğrudan internete açmadan; SSL sonlandırma, önbellekleme, yük dağıtımı ve saldırı filtreleme işlerini tek noktada toplamak için kullanılır. Nginx'in en yaygın kullanım biçimlerinden biridir.

## Örnek

Nginx reverse proxy olarak SSL'i sonlandırıp isteği arkadaki uygulama sunucusuna iletir.
