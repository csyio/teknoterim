---
slug: "txt-kaydi"
baslik: "TXT Kaydı"
kategori: "Domain/DNS"
ozet: "Bir alan adına serbest metin taşıyan DNS kaydı; doğrulama, e-posta güvenliği ve yapılandırma bilgisi için kullanılır."
isler:
  - "Sahiplik doğrulama"
  - "E-posta güvenliği"
  - "İlk kurulum"
kaynaklar: []
---

## Ne amaçla kullanılır

Alan adı sahipliğini kanıtlamak, e-posta politikalarını yayınlamak ve çeşitli servisleri doğrulamak için kullanılır. SPF, DKIM ve DMARC kayıtlarının tamamı TXT olarak yazılır. Uzun kayıtlar bazı panellerde birden fazla parçaya bölünür; birleştirme kuralı bilinmezse kayıt geçersiz sayılır ve sebebi panelde görünmez.

## Örnek

Google Workspace kurulumunda alan adı sahipliği bir TXT kaydıyla doğrulanır; kayıt yanlış yazılırsa kurulum hiç başlamaz.
