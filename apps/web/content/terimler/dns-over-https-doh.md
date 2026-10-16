---
slug: "dns-over-https-doh"
baslik: "DNS-over-HTTPS (DoH)"
kategori: "Domain/DNS"
ozet: "DNS sorgularının şifreli HTTPS üzerinden yapıldığı taşıma yöntemi."
isler:
  - "Uyum gereksinimi"
  - "Erişim kuralı"
  - "Altyapı danışmanlığı"
kaynaklar: []
---

## Ne amaçla kullanılır

DNS sorgularının ağ üzerinde okunmasını ve değiştirilmesini zorlaştırmak için kullanılır. Ortak ağlarda gizliliği artırır; TLS üzerinden çalışan geleneksel DNS'in (DoT) kardeşidir. Ancak şifreli olduğu için kurum ağındaki DNS filtresini devre dışı bırakır — bu yüzden çoğu kurumda bilinçli olarak sınırlandırılır.

## Örnek

Kurum ağında zararlı alan adlarını engelleyen bir DNS filtresi, tarayıcı DoH'ye geçtiği anda tamamen devre dışı kalır.
