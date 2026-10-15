---
slug: "redis-memcached"
baslik: "Redis / Memcached"
kategori: "Sunucu/Hosting"
ozet: "Veriyi bellekte tutan anahtar-değer depoları; çoğunlukla önbellek ve oturum saklama için kullanılır."
isler:
  - "Performans iyileştirme"
  - "Yüksek trafik çözümü"
  - "Mimari tasarım"
kaynaklar: []
---

## Ne amaçla kullanılır

Veritabanı sorgularını azaltmak ve oturumları birden fazla sunucu arasında paylaşmak için kullanılır. Bellekte çalıştıkları için çok hızlıdırlar. Ancak kalıcı depolama değildirler; yeniden başlatıldığında içerik kaybolabilir ve bu yüzden tek doğruluk kaynağı olarak kullanılmamalıdırlar.

## Örnek

Oturumları bu katmanda tutan bir site ikinci sunucu eklendiğinde kullanıcıyı çıkış yaptırmaz; oturum tek sunucunun belleğinde tutulsaydı yaptırırdı.
