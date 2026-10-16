---
slug: "yuksek-erisilebilirlik-ha"
baslik: "Yüksek Erişilebilirlik (HA)"
kategori: "Sunucu/Hosting"
ozet: "High Availability. Bir bileşen arızalandığında hizmetin kesintisiz sürmesini sağlayan mimari özellik."
isler:
  - "Mimari tasarım"
  - "Yüksek erişilebilirlik"
  - "Teklif spesifikasyonu"
kaynaklar: []
---

## Ne amaçla kullanılır

Tek arıza noktasını ortadan kaldırmak için kullanılır. Yedekli güç, yedekli ağ ve en az iki sunucu gerektirir; arıza anında trafik otomatik olarak diğerine kayar. Yedekleme ile karıştırılmamalıdır: yüksek erişilebilirlik hizmeti ayakta tutar, silinen veriyi geri getirmez.

## Örnek

Otomatik geçiş (failover) kurulmadan iki sunucu bulundurmak yüksek erişilebilirlik sağlamaz; biri çöktüğünde hizmet elle taşınana kadar durur.
