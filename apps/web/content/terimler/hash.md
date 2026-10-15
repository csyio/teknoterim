---
slug: "hash"
baslik: "Hash"
kategori: "Ağ/Güvenlik"
ozet: "Bir veriyi sabit uzunlukta bir özete dönüştüren, geri döndürülemeyen işlev."
isler:
  - "Uyum gereksinimi"
  - "Yedekleme tasarımı"
  - "Hesap güvenliği"
kaynaklar: []
---

## Ne amaçla kullanılır

Verinin değişip değişmediğini anlamak ve şifreleri geri döndürülemez biçimde saklamak için kullanılır. Verideki en küçük değişiklik özeti bütünüyle değiştirir, bu yüzden yedek ve dosya bütünlüğü doğrulamasında işe yarar. Şifreler özet olarak saklandığında veritabanı sızdığında bile doğrudan okunamaz.

## Örnek

İndirilen yedek dosyasının özeti sunucudaki özetle eşleşmiyorsa dosya eksik ya da bozuk demektir.
