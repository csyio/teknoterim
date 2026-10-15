---
slug: "sifreleme-encryption"
baslik: "Şifreleme (Encryption)"
kategori: "Ağ/Güvenlik"
ozet: "Verinin, anahtarı olmayan tarafça okunamayacak biçime dönüştürülmesi."
isler:
  - "Uyum gereksinimi"
  - "Yedekleme tasarımı"
  - "Güvenlik teklifi"
kaynaklar: []
---

## Ne amaçla kullanılır

Veri ele geçirildiğinde içeriğini korumak için kullanılır: diskte dururken, ağda akarken veya yedekte beklerken. Sağladığı koruma tamamen anahtarın kimde olduğuna bağlıdır; anahtar, şifrelenen veriyle aynı yerde ve aynı yedekte tutulursa şifreleme yalnızca görüntüde kalır. Silinen verinin geri getirilemez olması da aynı katmana dayanır.

## Örnek

Şifrelenmiş bir sunucu diski çalınsa içeriği okunamaz; ama şifre çözme anahtarı aynı yedeğin içindeyse bu koruma ortadan kalkar.
