---
slug: "siem"
baslik: "SIEM"
kategori: "Ağ/Güvenlik"
ozet: "Security Information and Event Management. Farklı sistemlerin loglarını toplayıp kurallarla şüpheli olay çıkaran platform."
isler:
  - "Log analizi"
  - "Güvenlik raporlaması"
  - "Alarm takibi"
kaynaklar: []
---

## Ne amaçla kullanılır

Logları tek yerde toplamak ve normal davranıştan sapanı bulmak için kullanılır. Kurulumdan sonra asıl iş kural yazımıdır: üretilen her alarm, birinin bakması gereken bir iştir. Log kaynağı eksik bırakılırsa kurallar kör çalışır ve olay yalnızca sonradan, elde kalan kayıtlardan anlaşılır.

## Örnek

Yirmi başarısız girişten sonra gelen tek başarılı giriş tek başına zararsız görünür; bu ikisi birlikte değerlendirildiğinde alarm üretilir.
