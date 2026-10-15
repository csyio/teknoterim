<p align="center">
  <img src="docs/marka/hero.svg" alt="rootline — MSP, hosting ve sunucu dünyasının terimleri" width="100%">
</p>

<p align="center">
  <b>Türkçe</b> · <a href="README.en.md">English</a>
</p>

# rootline

**rootline**, MSP/MSSP, hosting, alan adı/DNS ve ağ güvenliği alanlarının
terimlerini öğreten Türkçe bir uygulamadır.

Bu sektörde çalışan biri için terimler dağınık kaynaklara yayılmıştır. rootline
bunları sade, hızlı ve reklamsız tek bir yerde toplar — kurulum yok, hesap yok.

> **Durum:** yeniden geliştirme sürecinde. Sözlük çalışıyor; gündem ve araçlar
> sırada.

## Terimler nasıl anlatılır

Her terim dört katmanda yazılır. Bu, projenin en önemli kuralıdır:

| Katman | Soru |
|---|---|
| **Nedir** | Tek cümlelik, süslü olmayan tanım. |
| **Ne amaçla kullanılır** | Sektörde hangi ihtiyacı karşılar. |
| **Hangi işte karşınıza çıkar** | Günlük işte hangi durumlarda gerekir. |
| **Örnek** | Somut, gerçekçi bir senaryo. |

Yanlış öğretilen bir terim, hiç öğretilmemiş olmaktan kötüdür. Bir terim
eksikse ya da hatalıysa bu bir **hata**, tercih değil.

## Depo yapısı

```
apps/web/           Next.js uygulaması
  content/terimler/ Terim içeriği (kaynağı budur)
  app/ lib/         Sayfalar ve veri yükleyici
infra/              Sunucu kurulumu, systemd, Caddy, dağıtım
scripts/            İçerik göç araçları
docs/marka/         Marka görselleri
```

İçerik **koddan ayrıdır**: terim eklemek için uygulama koduna dokunmak
gerekmez. Her terim tek bir dosyadır, yani her terim ayrı bir değişiklik
olarak gözden geçirilebilir.

## Terim eklemek

`apps/web/content/terimler/` altına yeni bir `.md` dosyası ekleyin. Dosya adı
terimin URL'sidir (ör. `dnssec.md` → `/sozluk/dnssec`).

```md
---
slug: "ornek-terim"
baslik: "Örnek Terim"
kategori: "Domain/DNS"
ozet: "Tek cümlelik tanım."
isler:
  - "Arıza teşhisi"
  - "İlk kurulum"
kaynaklar: []
---

## Ne amaçla kullanılır

Sektörde hangi ihtiyacı karşıladığını yazın.

## Örnek

Somut bir senaryo yazın.
```

Kurallar:

- `slug` dosya adıyla **birebir** aynı olmalı; derleme aksi hâlde hata verir.
- `kategori` mevcut kategorilerden biri olmalı: `MSP/MSSP`,
  `Sunucu/Hosting`, `Domain/DNS`, `Ağ/Güvenlik`, `Müşteri/İş`.
- Zorunlu alanlar boş bırakılırsa derleme, hangi dosyada neyin eksik olduğunu
  söyleyerek durur. Sessizce bozuk sayfa üretilmez.

## Geliştirme

Node 22 gerekir (`.nvmrc`).

```bash
cd apps/web
npm install
npm run dev      # http://localhost:3000
npm run build    # üretim derlemesi
```

## Yayınlama

Sunucu kurulumu ve dağıtım: [infra/README.md](infra/README.md).

Derleme GitHub Actions'ta yapılır, çıktı sunucuya kopyalanır ve servis yeniden
başlatılır. Sunucuda derleme yapılmaz.

## Katkı

Sözlüğün değeri içeriğinin doğruluğundadır; en değerli katkı buradadır.

- **Bir terim yanlış anlatılmış** → issue açın. Bu, alınabilecek en değerli
  geri bildirimdir.
- **Eksik bir terim var** → terim önerisi şablonunu kullanın.
- **Kod katkısı** → pull request açabilirsiniz.

Erişilebilirlik sorunları öncelikli ele alınır: klavye tuzağı, ekran
okuyucuda okunmayan alan veya yetersiz kontrast gördüyseniz bildirin.

## Lisans

Telif hakkı © 2026 Can Soykan Yılmaz. Ayrıntılar: [LICENSE](LICENSE).
