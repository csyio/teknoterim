---
slug: "nat"
baslik: "NAT"
kategori: "Ağ/Güvenlik"
ozet: "Network Address Translation. Özel ağdaki adreslerin dışarıya tek bir genel adres üzerinden çıkmasını sağlayan çeviri."
isler:
  - "Altyapı tasarımı"
  - "Erişim kuralı"
  - "İlk kurulum"
kaynaklar: []
---

## Ne amaçla kullanılır

Genel adres sıkıntısını aşmak ve iç ağdaki cihazları dışarıdan doğrudan görünmez kılmak için kullanılır. Yüzlerce cihaz tek adresle çıkabilir. Ancak dışarıdan içeriye bağlantı kendiliğinden kurulamaz; sunucu yayınlamak için port yönlendirme gerekir. Sağladığı şey güvenlik değil görünmezliktir; cihaz yine de dışarıya istek yapabilir.

## Örnek

Ofisteki her bilgisayar aynı genel adresle internete çıktığı için, dışarıdaki bir hizmet hepsini tek adres olarak görür.
