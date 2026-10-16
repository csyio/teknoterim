---
slug: "konteyner-container"
baslik: "Konteyner (Container)"
kategori: "Sunucu/Hosting"
ozet: "Uygulamanın, çalışması için gereken her şeyle birlikte paketlendiği ve işletim sistemini ana makineyle paylaşan çalışma birimi."
isler:
  - "Mimari tasarım"
  - "Test ortamı"
  - "Geliştirici talebi"
kaynaklar: []
---

## Ne amaçla kullanılır

Uygulamayı çalıştığı ortamdan bağımsız taşımak için kullanılır. Sanal makineden farkı, kendi işletim sistemini taşımaması ve bu yüzden saniyeler içinde başlamasıdır. Karşılığında konteyner içindeki veri kalıcı değildir; kalıcı veri ayrı bir birimde tutulmazsa konteyner yeniden oluşturulduğunda kaybolur.

## Örnek

Konteyner yeniden başlatıldığında içindeki veritabanı dosyası sıfırlanır; bu bir arıza değil, tasarımın beklenen sonucudur.
