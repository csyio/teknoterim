# Tekno Terim — web uygulaması

Next.js 16 (App Router, TypeScript) ile yazılmıştır. İçerik `content/terimler/`
altındaki Markdown dosyalarından okunur ve derleme zamanında statik sayfalara
dönüştürülür.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # üretim derlemesi
npm test         # birim testleri (Node'un yerleşik test koşucusu)
npm run lint
```

Node 22 gerekir (bkz. `.nvmrc`).

> **Not (yerel kurulum).** `better-sqlite3` yerel bir eklenti derler. npm 11 ve
> üzeri kurulum betiklerini varsayılan olarak çalıştırmaz; bu yüzden ilk
> kurulumda eklenti derlenmemiş olabilir. `npm install-scripts approve
> better-sqlite3` komutu bunu açar (onay `package.json` içinde saklanır).
> CI'da (Node 22 / npm 10) böyle bir adım gerekmez.

## Katmanlar

| Dizin | İş |
|---|---|
| `content/terimler/` | Sözlük içeriği — kaynak doğruluk burada, git'te yaşar |
| `lib/terms.ts` | İçerik yükleyici ve şema doğrulaması |
| `lib/srs.ts`, `lib/sorular.ts`, `lib/ilerleme.ts` | Öğrenme katmanı (aralıklı tekrar, sorular, ilerleme) |
| `lib/olcum.ts`, `lib/olcum-db.ts` | Ölçüm toplayıcısı (aşağıya bakın) |
| `app/api/olcum/` | Ölçüm uç noktası (`POST`, her zaman 204 döner) |
| `lib/gundem*.ts` | Gündem: kaynaklar, besleme ayrıştırma, Claude adımları, veritabanı, tek çalışma (aşağıya bakın) |
| `app/gundem/`, `app/yonetim/` | Yayın akışı ve tek yöneticili onay sayfası |
| `lib/yonetim*.ts`, `lib/hiz-siniri.ts` | Yönetim girişi (scrypt şifre özeti, oturum çerezi, hız sınırı) |
| `ds/` | Görünüm paketi: tokenlar, taban, bileşenler — [ds/OKUBENI.md](ds/OKUBENI.md) |
| `public/fonts/` | Kendi sunucumuzda barındırılan yazı tipleri — [OKUBENI.md](public/fonts/OKUBENI.md) |
| `app/globals.css` | Bilinçli olarak boş; yalnızca `ds/index.css`'i içe alır |
| `araclar/` | Sunucuda da çalışan küçük araçlar (ölçüm raporu, gündem toplayıcısı, şifre özeti) |

## Ölçüm

Kendi yazdığımız, üçüncü taraf kullanmayan bir toplayıcıdır. Kuralları ürün
kararı olarak `lib/olcum.ts` başında yazılıdır; özeti:

- **IP adresi saklanmaz.** Yalnızca günlük dönen bir anahtar üretmek için anlık
  olarak kullanılır. Tuz her gün değiştiği için anahtarlar günler arasında
  birleştirilemez; "bu kişi geçen hafta da gelmişti" bilgisi üretilemez.
- Çerez, `localStorage`, kalıcı tarayıcı kimliği yok. Tarayıcıda hiçbir şey
  saklanmaz.
- Yönlendiren adresin **tamamı değil, yalnızca alan adı** saklanır (arama
  sorguları kişisel veri taşıyabilir).
- "İzlemeyi bırak" (DNT) ve Global Privacy Control tercihlerine uyulur.
- Veri `data/analytics.db` (SQLite, WAL) içinde durur; `data/` dağıtımda
  korunur ve depoya girmez.

Rapor:

```bash
npm run olcum              # son 7 gün
npm run olcum -- 30        # son 30 gün
```

Sunucuda: `cd /opt/teknoterim && node araclar/olcum-raporu.mjs`.

Rapor aracı bilinçli olarak kendi kendine yeten bir dosyadır: sunucuya yalnızca
derlenmiş çıktı kopyalanır, TypeScript kaynakları orada bulunmaz.

**Tekil ziyaretçi sayısı günlüktür.** Anahtar her gün değiştiği için günler
arası toplanamaz; rapor bu yüzden gün gün gösterir.

## Gündem

Akış: **topla → ayıkla → taslak → onay → yayın.**

1. **Topla** (`lib/gundem-is.ts`): `lib/gundem-kaynaklar.ts`'teki RSS/Atom
   beslemeleri okunur. Son 72 saatin haberleri, adresin özetiyle tekrarsız
   olarak `gundem_haber` tablosuna yazılır (ölçümle aynı SQLite dosyası).
2. **Ayıkla** (`lib/gundem-claude.ts`): Claude başlık + kısa açıklamaya 1–5
   önem puanı verir; `GUNDEM_ESIK` (varsayılan 4) altı elenir. Son günlerde
   seçilen başlıklar da verilir ki aynı olay iki kez seçilmesin.
3. **Taslak:** eşiği geçenler için kaynak sayfa okunur, Claude özgün Türkçe
   özet yazar; sözlükteki terimler `[metin](/sozluk/slug)` olarak bağlanır.
   Günde en fazla `GUNDEM_GUNLUK_TAVAN` (varsayılan 20) taslak. Kaynakla 8
   kelimelik aynen örtüşme bulunursa editöre uyarı gösterilir.
4. **Onay:** `/yonetim` — Yayınla / Düzelt / At. Telefona göre tasarlandı.
5. **Yayın:** `/gundem` — en yeni en üstte; her haberde kaynak bağlantısı ve
   "yapay zekâ taslağı, editör onaylı" notu.

Özet hiçbir zaman HTML/Markdown olarak basılmaz: yalnızca sözlük bağlantısı
yorumlanır (`app/gundem/OzetMetni.tsx`).

**API anahtarı yoksa** (`ANTHROPIC_API_KEY` boş) toplayıcı **sahte kipte**
çalışır: Claude çağrılmaz, taslaklar `[SAHTE]` işaretli olur ve editör kendi
metnini yazmadan yayınlanamaz. Model: `claude-opus-5-5`.

```bash
npm run gundem             # paketler ve bir kez çalıştırır (yerelde sahte kip)
npm run sifre-ozeti        # yönetim şifresinin özetini üretir (şifre ekrana yazılmaz)
```

Yerelde `/yonetim`'i denemek için özeti ortam değişkeni olarak verin:
`YONETIM_SIFRE_OZETI='scrypt:…' npm run dev`. Sunucu kurulumu (sır dosyaları,
zamanlayıcı): [infra/README.md](../../infra/README.md#gündem).

Toplayıcı sunucuda Next'ten ayrı bir süreçtir: `araclar/gundem.ts`,
`npm run gundem:paketle` ile bağımlılıkları ve sözlük terimleriyle birlikte
tek bir `araclar/gundem.mjs` dosyasına paketlenir (CI bunu yapar).

Projenin tamamı ve içerik kuralları için depo kökündeki
[README](../../README.md), sunucu ve dağıtım için
[infra/README.md](../../infra/README.md).
