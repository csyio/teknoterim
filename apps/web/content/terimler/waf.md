---
slug: "waf"
baslik: "WAF"
kategori: "Ağ/Güvenlik"
ozet: "Web Application Firewall. Web uygulamasına gelen istekleri içerik düzeyinde inceleyip zararlı olanları engelleyen güvenlik katmanı."
isler:
  - "Web sitesi koruması"
  - "Acil açık kapatma"
  - "Uyum gereksinimi"
kaynaklar: []
---

## Ne amaçla kullanılır

Klasik firewall'ın göremediği uygulama seviyesi saldırıları (SQL enjeksiyonu, XSS) durdurmak için kullanılır. Yazılımdaki bir açık hemen kapatılamıyorsa WAF kuralı geçici koruma sağlar; bu yüzden 'sanal yama' da denir.

## Örnek

Eski bir eklentideki açık kapatılana kadar WAF kuralıyla saldırı engellenir.
