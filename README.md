# Tekno Terim

**Tekno Terim**, MSP/MSSP, sunucu/hosting, alan adı/DNS ve ağ güvenliği
alanlarının terimlerini Türkçe öğreten bir uygulamadır.

Bu sektörde çalışan biri için terimler, haberler ve araçlar dağınık kaynaklara
yayılmıştır. Tekno Terim bunları sade, hızlı ve reklamsız tek bir yerde toplar
— kurulum yok, hesap yok.

> **Durum:** yeniden geliştirme sürecinde. Sözlük, alıştırma, döviz çevirici ve
> gündem çalışıyor; görünüm paketi Grafit. Gündemin yapay zekâ adımı API anahtarı
> gelene kadar sahte (stub) kipte. Eski sürüm
> `rootline.cansoykanyilmaz.com` adresinde duruyor ve yeni sürüm hazır olunca
> oraya yönlendirilecek.

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

## Ne var içinde

| | |
| :-- | :-- |
| **`/sozluk`** | 153 terim. Aksan duyarsız arama ve kategori süzgeci. Her terim dört katmanda anlatılır. |
| **`/calis`** | Öğrendiklerini sınayan alıştırma. Sorular içerikten otomatik üretilir; yanlış cevap terimi geri getirir (aralıklı tekrar). İlerleme yalnızca tarayıcıda tutulur. |
| **`/doviz`** | Döviz çevirici. Kurlar TCMB'nin günlük bülteninden kendi sunucumuz (`/api/kur`) üzerinden alınır; tarayıcı üçüncü tarafa bağlanmaz. |
| **`/gundem`** | Az ama güvenilir haber akışı: güvenlik, hosting/bulut, alan adı/DNS, yapay zekâ. Yalnızca seçilmiş RSS kaynakları okunur, Claude önem puanı verip özgün Türkçe özet taslağı yazar, editör `/yonetim` sayfasından onaylamadan hiçbir şey yayına çıkmaz. Haber metni kopyalanmaz; her haberde kaynak bağlantısı var. |

Kategori dağılımı: Ağ/Güvenlik 42, Sunucu/Hosting 32, MSP/MSSP 29,
Domain/DNS 29, Müşteri/İş 21.

## Depo yapısı

```
apps/web/               Next.js uygulaması
  app/                  Sayfalar, API uçları, tasarım sistemi
  content/terimler/     Terim içeriği (kaynağı budur) — 153 .md dosyası
  lib/                  İçerik yükleyici, alıştırma, ilerleme, ölçüm, gündem
  araclar/              Sunucuda çalışan yardımcı betikler (ölçüm raporu, gündem toplayıcısı)
infra/                  Sunucu kurulumu, systemd, Caddy, dağıtım
scripts/                İçerik göç araçları
docs/                   İçerik planı ve marka çalışmaları
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

Node 22 gerekir (`.nvmrc`); `npm install` başka sürümde hata verir
(`apps/web/.npmrc` → `engine-strict`). Sunucu ve CI da Node 22 kullanır.

macOS'ta Homebrew ile, sistemdeki başka Node sürümüne dokunmadan:

```bash
brew install node@22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # yalnızca bu terminal için
node -v                                             # v22.x
```

```bash
cd apps/web
npm install
npm run dev      # http://localhost:3000
npm test         # birim testleri
npm run lint
npm run build    # üretim derlemesi
```

Ayrıntılar: [apps/web/README.md](apps/web/README.md).

## Yayınlama

Sunucu kurulumu ve dağıtım: [infra/README.md](infra/README.md).

Derleme GitHub Actions'ta yapılır, çıktı sunucuya kopyalanır ve servis yeniden
başlatılır. Sunucuda derleme yapılmaz.

## Katkı

Hem kod hem içerik katkısına açıktır: [CONTRIBUTING.md](CONTRIBUTING.md).

Sözlüğün değeri içeriğinin doğruluğundadır; en değerli katkı buradadır.

- **Bir terim yanlış anlatılmış** → issue açın. Bu, alınabilecek en değerli
  geri bildirimdir.
- **Eksik bir terim var** → terim önerisi şablonunu kullanın.
- **Kod katkısı** → pull request açabilirsiniz.

Erişilebilirlik sorunları öncelikli ele alınır: klavye tuzağı, ekran
okuyucuda okunmayan alan veya yetersiz kontrast gördüyseniz bildirin.

## Lisans

Telif hakkı © 2026 Can Soykan Yılmaz. Ayrıntılar: [LICENSE](LICENSE).
