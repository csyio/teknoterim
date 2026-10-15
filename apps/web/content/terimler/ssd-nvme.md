---
slug: "ssd-nvme"
baslik: "SSD / NVMe"
kategori: "Sunucu/Hosting"
ozet: "Disk türleri. SSD hareketli parça içermez; NVMe ise SSD'yi doğrudan veri yoluna bağlayan daha hızlı arayüzdür."
isler:
  - "Sunucu kurulumu"
  - "Teklif spesifikasyonu"
  - "Yavaşlık şikayeti"
kaynaklar: []
---

## Ne amaçla kullanılır

Disk gecikmesini düşürmek için kullanılır; veritabanı ve çok sayıda küçük dosyayla çalışan uygulamalar bundan en çok etkilenir. Manyetik diskler (HDD) ise büyük hacimli yedek ve arşiv için hâlâ en ucuz seçenektir. Seçim kapasiteye göre değil, beklenen giriş/çıkış yüküne göre yapılmalıdır.

## Örnek

Aynı 4 çekirdekli iki sunucudan biri HDD diğeri NVMe kullanıyorsa, veritabanı sorgularında aralarında on katı aşan fark oluşabilir.
