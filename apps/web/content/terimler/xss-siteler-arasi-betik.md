---
slug: "xss-siteler-arasi-betik"
baslik: "XSS (Siteler Arası Betik)"
kategori: "Ağ/Güvenlik"
ozet: "Sitenin kendi içeriği gibi çalıştırdığı, ziyaretçinin tarayıcısında çalışan saldırgan betiği yerleştirme açığı."
isler:
  - "Saldırı müdahalesi"
  - "Geliştirici talebi"
  - "Web sitesi koruması"
kaynaklar: []
---

## Ne amaçla kullanılır

Sunucuyu değil kullanıcıyı hedefleyen saldırıları tanımlamak için kullanılır. Betik sitenin kendi alan adından geldiği için tarayıcı ona güvenir ve oturum çerezi, form içeriği, sayfadaki her şey okunabilir hâle gelir. Bu yüzden yalnızca sunucuyu sağlamlaştırmak yetmez; kullanıcı da korunmalıdır.

## Örnek

Yorum alanına bırakılan bir betik, sayfayı açan her ziyaretçinin oturum bilgisini saldırganın sunucusuna gönderebilir.
