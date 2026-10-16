---
slug: "ters-dns-ptr"
baslik: "PTR Kaydı (Ters DNS)"
kategori: "Domain/DNS"
ozet: "Bir IP adresinin hangi alan adına ait olduğunu gösteren DNS kaydı; çözümleme normalin tersi yönünde çalışır."
isler:
  - "E-posta kurulumu"
  - "Spam sorunu"
  - "Arıza teşhisi"
kaynaklar: []
---

## Ne amaçla kullanılır

Alan adından IP'ye değil, IP'den alan adına bakmayı sağlar. Alıcı posta sunucuları, gönderen IP'nin gerçekten o alan adına ait olduğunu doğrulamak için bu kayda bakar. Kayıt, IP bloğunu yöneten sağlayıcı tarafından tanımlanır; alan adı panelinden yazılamaz ve bu yüzden genelde gözden kaçar.

## Örnek

Kendi sunucusundan posta gönderen bir firmanın iletileri spam'e düşüyorsa, SPF ve DKIM doğru olsa bile ters DNS kaydı eksik olabilir.
