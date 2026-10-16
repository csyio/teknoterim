---
slug: "hsts"
baslik: "HSTS"
kategori: "Ağ/Güvenlik"
ozet: "HTTP Strict Transport Security. Tarayıcıya, siteye yalnızca şifreli bağlantı üzerinden gitmesini söyleyen başlık."
isler:
  - "SSL sonlandırma"
  - "Web sitesi koruması"
  - "Güvenlik teklifi"
kaynaklar: []
---

## Ne amaçla kullanılır

İlk bağlantı anındaki yönlendirme boşluğunu kapatmak için kullanılır. Başlık olmadan adres çubuğuna yazılan şifresiz istek, yönlendirme gelene kadar açıkta gider ve dinlenebilir. Bir kez tanımlandığında tarayıcı kuralı hatırlar ve şifresiz bağlantıyı hiç denemez. Süre uzun verildiği için geri dönüş zordur; etkinleştirmeden önce tüm alt alan adlarının sertifikası hazır olmalıdır.

## Örnek

HSTS tanımlı bir sitede kullanıcı adres çubuğuna http:// yazsa bile tarayıcı isteği şifresiz göndermez.
