---
slug: "dns-onbellek-zehirlenmesi"
baslik: "DNS Önbellek Zehirlenmesi"
kategori: "Domain/DNS"
ozet: "DNS yanıtlarının önbelleğe yanlış yazılmasıyla istemcinin farkında olmadan sahte bir adrese yönlendirilmesi."
isler:
  - "Saldırı müdahalesi"
  - "Altyapı tasarımı"
  - "Uyum gereksinimi"
kaynaklar: []
---

## Ne amaçla kullanılır

Trafiğin sessizce başka bir yere çekilebildiğini anlatır. Saldırgan, aradaki bir sunucunun önbelleğine kendi kaydını yazdırıp kullanıcıyı adres çubuğunda doğru site görünürken sahte bir sunucuya bağlar. DNSSEC ve şifreli DNS taşımaları bu saldırıyı hedef alan başlıca savunmalardır; ikisi de yoksa kullanıcı tarafında fark edilecek bir belirti oluşmaz.

## Örnek

Adres çubuğunda doğru alan adı yazdığı hâlde sahte bir giriş sayfası açılıyorsa, sorun kullanıcıda değil aradaki DNS yanıtında olabilir.
