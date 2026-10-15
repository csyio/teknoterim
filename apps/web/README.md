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
| `araclar/` | Sunucuda da çalışan küçük araçlar (rapor) |

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

Projenin tamamı ve içerik kuralları için depo kökündeki
[README](../../README.md), sunucu ve dağıtım için
[infra/README.md](../../infra/README.md).
