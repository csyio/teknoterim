---
slug: "yetkili-ve-ozyinelemeli-dns"
baslik: "Yetkili ve Özyinelemeli DNS"
kategori: "Domain/DNS"
ozet: "DNS sunucusunun iki rolü: bir bölgenin gerçek kaydını tutmak ve başka sunuculara sorarak cevabı bulmak."
isler:
  - "Arıza teşhisi"
  - "DNS ayarı"
  - "Mimari tasarım"
kaynaklar: []
---

## Ne amaçla kullanılır

Sorun giderirken nereye bakılacağını ayırt etmek için bilinir. Yetkili sunucu, bir alan adının kesin kaynağıdır; özyinelemeli sunucu ise kullanıcı adına soruları çözer ve cevabı önbelleğe alır. Kaydı değiştirdikten sonra hâlâ eski sonucu görüyorsanız sorun yetkili sunucuda değil, aradaki önbellektedir.

## Örnek

Bir alan adı bazı ağlarda yeni sunucuya, bazılarında eskisine gidiyorsa kayıt değil önbellek süresi farklıdır; ölçüm yetkili sunucuya doğrudan sorularak yapılır.
