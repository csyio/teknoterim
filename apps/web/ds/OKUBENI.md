# Görünüm paketi

`apps/web/ds/` — Tekno Terim'in arayüz kararlarının tamamı. Uygulama
`app/globals.css` üzerinden bu paketi içe alır; `globals.css` bilinçli olarak
boştur, stil içermez.

## Dil

Adı **Grafit** (2026-10-16'da üç yön arasından seçildi). Tek cümleyle:
**sakin, modern bir ürün arayüzü; nötr grafit yüzeyler ve tek bir mor vurgu.**

- **Biçim yumuşak ama abartısız.** Yarıçaplar 6/8/12px, hap biçimi yalnızca
  etiket ve süzgeçte. Yapıyı 1px çizgiler ve hafif yüzey farkları kurar; açık
  temada çok hafif bir gölge vardır, koyu temada yoktur.
- **Panel:** dizin, ana sayfa bölümleri, terim katmanları ve alıştırma kartı
  aynı kabı paylaşır (`.panel`). Satırlar panel içinde çizgiyle ayrılır.
- **Tek vurgu rengi** (mor) ve onu seyrek kullanma disiplini. Doğru/yanlış için
  ayrı `--basari*` ve `--hata*` tokenları var; mor bu işlere karışmaz.
- **Yazı:** tek aile Geist (metin ve başlık), künye ve sayılar Geist Mono.
  Serif yok.
- **Büyük harfe çevirme yok.** `text-transform: uppercase` Türkçede İngilizce
  kelimeleri bozuyordu ("DOMAİN"); etiketler olduğu gibi yazılır.
- **Terim sayfası:** başlık ve kategori → "Nedir" büyük giriş paragrafı →
  Öğrendim/Çalış → tek panelde "Ne amaçla", "Hangi işte", "Örnek" (ayrı
  zeminde).

## Dosya haritası

```
ds/
  index.css                 tek giriş noktası; @import sırası burada
  tokenlar.css              renk, boşluk, yazı ölçeği, yarıçap, hareket, katman
  yazitipi.css              @font-face bildirimleri
  taban.css                 sıfırlama, öğe varsayılanları, odak, yardımcılar
  duzen.css                 kabuk, panel, giriş, bölüm listesi, bölüm başlığı
  bilesenler/
    ust-bar.css             başlık, marka, gezinme, tema düğmesi
    dugme.css               birincil ve ikincil düğme
    etiket.css              kategori, rozet, çip
    form.css                arama alanı
    dizin.css               terim dizini (satırlar) ve süzgeç sayacı
    icerik.css              terim sayfası ve Markdown gövdesi
    oturum.css              çalışma oturumu
    doviz.css               döviz çevirici
    durum.css               boş durumlar ve 404
    alt-bar.css             alt bilgi
  yazdirma.css              kâğıt için son söz
  erisim.css                hareket ve kontrast tercihleri (en son okunur)
```

Okuma sırası `index.css` içindedir ve anlamlıdır: **kararlar → öğeler → düzen →
bileşenler → ortam katmanları.** Sonraki dosya öncekini ezebilir; `erisim.css`
her zaman en sonda okunur ki hareket tercihi bileşenlerin kararını geçersiz
kılabilsin.

## Tokenlar

Bileşenler ham değer yazmaz; yalnızca `tokenlar.css` içindeki değişkenleri
kullanır. Bir rengi değiştirmek için gereken tek yer orasıdır.

| Aile | Örnek | İş |
|---|---|---|
| Yüzey | `--zemin`, `--yuzey`, `--yuzey2`, `--yuzey3` | katmanlı zeminler |
| Metin | `--parlak`, `--metin`, `--soluk`, `--soluk2` | parlaklık sırası; hepsi 4.5:1 kontrastı geçer |
| Vurgu | `--vurgu`, `--vurgu-parlak`, `--vurgu-metin`, `--vurgu-yazi`, `--vurgu-zemin`, `--vurgu-kenar` | marka rengi; `--vurgu-metin` dolu düğmenin yazısı, `--vurgu-yazi` zemin üstündeki mor yazı |
| Durum | `--basari*`, `--hata*` | doğru / yanlış cevap |
| Yazı ailesi | `--metin-font`, `--baslik-font`, `--mono` | Geist ve Geist Mono |
| Boşluk | `--b-1` … `--b-11` | 4px tabanlı ölçek |
| Yazı boyutu | `--yazi-2xs` … `--yazi-4xl` | başlıklar `clamp()` ile akışkan |
| Yarıçap | `--r-sm`, `--r`, `--r-lg`, `--r-tam` | 6 / 8 / 12px, hap |
| Ölçü | `--genislik`, `--genislik-icerik`, `--genislik-form`, `--olcu` | okunabilir satır uzunluğu |

**Boşluk ara değer uydurulmaz.** `13px` gibi bir değer gerekiyorsa ölçekten en
yakını seçilir; ölçeğe değer eklemek gerekirse gerekçesi yazılır.

## Tema

Varsayılan olarak **sistem tercihine uyar** (`prefers-color-scheme`). Kullanıcı
düğmeyle seçim yaparsa `<html data-tema="acik|koyu">` sistemi ezer; seçim
`teknoterim-tema` anahtarıyla saklanır ve `layout.tsx` içindeki küçük betik
onu ilk boyamadan önce uygular.

Bir rengi iki temada da tanımlamak için `tokenlar.css` içinde üç yere yazılır:
`:root` (açık), `@media (prefers-color-scheme: dark)` içindeki
`:root:not([data-tema="acik"])` ve `:root[data-tema="koyu"]`. Başka hiçbir
dosyada renk için tema koşulu bulunmaz (tema düğmesinin simgesi tek istisna).

## Bileşen yazma kuralları

1. Bir bileşen yalnızca `bilesenler/<ad>.css` içinde tanımlanır ve `index.css`
   içine eklenir. Bileşenler birbirinin dosyasına yazmaz.
2. Sınıf adları Türkçedir ve **şablonlarla sözleşmedir**: `.kabuk`, `.dizin`,
   `.dugme`, `.cip`, `.katman-govde`. Yeniden adlandırmak istiyorsanız şablonu
   da güncelleyin.
3. Durum bilgisi sınıf adıyla değil ARIA ile taşınır: seçili çip
   `aria-pressed="true"`, etkin sayfa bağlantısı `aria-current="page"`. Görünüm
   ve erişilebilirlik aynı kaynaktan okur.
4. Renk tek başına anlam taşımaz: doğru/yanlış şıklar hem renk hem metinle
   belirtilir (`geri-bildirim`).

## Erişilebilirlik sözleşmesi

- **Odak:** tek bir `:focus-visible` halkası tüm etkileşimli öğeleri kapsar.
  Halka `--odak` renginden gelir. Arama alanı tek istisnadır: odakta kenarlığı
  vurguya döner ve yumuşak bir hale çıkar.
- **Hareket:** `prefers-reduced-motion: reduce` altında geçişler ve animasyonlar
  fiilen kapanır.
- **Kontrast:** `forced-colors: active` altında kenarlıklar sistem rengine
  bırakılır ve yalnızca renkle taşınan anlam korunur.
- **Klavye:** "İçeriğe geç" bağlantısı (`.atla`) sayfanın ilk odağıdır.

## Yazdırma

Bir sözlük maddesi kâğıtta okunabilir olmalı. `yazdirma.css` tokenların tamamını
açık değerlere çevirir (kâğıt her zaman beyazdır), gezinme ve etkileşimli
denetimleri gizler, katmanları tek kolona indirir ve sayfa ortasında
bölünmelerini engeller.

Denemek için tarayıcıda bir terim sayfası açıp yazdırma önizlemesine bakın:
`/sozluk/dnssec`.

## Yeni bir bileşen eklemek

1. `ds/bilesenler/<ad>.css` oluşturun.
2. `ds/index.css` içine, ait olduğu yere ekleyin.
3. Şablonda sınıfı kullanın.
4. `npm test && npm run lint && npm run build` — üçü de geçmeli.

Yeni bir renk, boşluk ya da ölçü gerekiyorsa önce `tokenlar.css`'te tanımlayın.
