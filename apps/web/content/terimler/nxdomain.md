---
slug: "nxdomain"
baslik: "NXDOMAIN"
kategori: "Domain/DNS"
ozet: "Non-Existent Domain. Sorgulanan alan adının veya kaydın hiç var olmadığını bildiren DNS yanıt kodu."
isler:
  - "Arıza teşhisi"
  - "E-posta kurulumu"
  - "Log analizi"
kaynaklar: []
---

## Ne amaçla kullanılır

Kaydın hiç var olmaması ile yapılandırma hatasını birbirinden ayırmak için bilinir. NXDOMAIN, alan adının tanımlı olmadığını söyler; sunucu yanıt vermiyorsa ya da farklı bir hata dönüyorsa sorun yapılandırmadadır. E-posta tarafında da aynı işe yarar: var olmayan bir alan adından gelen posta reddedilir.

## Örnek

Yanlış yazılmış bir alan adına yapılan istekte dönen NXDOMAIN, sistemde hata gibi görünse de aslında doğru cevaptır.
