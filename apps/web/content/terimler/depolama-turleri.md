---
slug: "depolama-turleri"
baslik: "Depolama Türleri (Blok / Dosya / Nesne)"
kategori: "Sunucu/Hosting"
ozet: "Depolamanın sunucuya sunulma biçimleri: blok disk gibi, dosya paylaşım gibi, nesne ise adreslenebilir kaynak gibi davranır."
isler:
  - "Depolama seçimi"
  - "Altyapı tasarımı"
  - "Kapasite planlama"
kaynaklar: []
---

## Ne amaçla kullanılır

Doğru depolamayı seçmek için kullanılır. Blok, veritabanı gibi düşük gecikme isteyen işler içindir; dosya, birden fazla sunucunun aynı klasörü paylaşması gerektiğinde; nesne ise büyük hacimli ve seyrek değişen veriler için uygundur. Tür, işin yüküne göre değil alışkanlığa göre seçildiğinde performans beklenmedik biçimde düşer.

## Örnek

Bir veritabanını ağ üzerinden dosya paylaşımı üzerine kurmak teknik olarak çalışır, ama kilitlenme davranışı yüzünden performansı kullanılamaz hâle getirir.
