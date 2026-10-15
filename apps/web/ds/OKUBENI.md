# Görünüm paketi

`apps/web/ds/` — Tekno Terim'in arayüz kararlarının tamamı. Uygulama
`app/globals.css` üzerinden bu paketi içe alır; `globals.css` bilinçli olarak
boştur, stil içermez.

## Dil

Tek cümleyle: **çizgilerle bölünmüş teknik belge.**

- **Biçim keskin.** Yarıçaplar 2–4px, gölge yok. Yapıyı kenarlıklar ve yatay
  çizgiler kurar; "yüzen kart" estetiği bilinçli olarak bırakıldı.
- **Tek vurgu rengi** (iyon mavisi) ve onu seyrek kullanma disiplini. Yeşil
  "fosfor" kimliği terk edildi, tokenlar `--vurgu*` adını taşıyor.
- **Yazı rolleri:** başlıklar sans (Inter), künye ve etiketler mono (JetBrains
  Mono), serif (Newsreader) yalnızca **örnek** katmanında ve büyük sayılarda
  kalır — kitaptan alınmış bir alıntı gibi okunsun diye.
- **Dizin, kart değil.** Terimler çizgiyle ayrılmış satırlar hâlinde tek bir
  listede durur (`.dizin` → `.dizin-satir`); 153 terim böyle taranabilir kalır.
- **Terim sayfası bir belge sayfası:** solda mono katman etiketi, sağda gövde.

## Dosya haritası

```
ds/
  index.css                 tek giriş noktası; @import sırası burada
  tokenlar.css              renk, boşluk, yazı ölçeği, yarıçap, hareket, katman
  yazitipi.css              @font-face bildirimleri
  taban.css                 sıfırlama, öğe varsayılanları, odak, yardımcılar
  duzen.css                 kabuk, giriş, bölüm listesi, bölüm başlığı
  bilesenler/
    ust-bar.css             başlık, marka, gezinme, tema düğmesi
    dugme.css               birincil ve ikincil düğme
    etiket.css              kategori, rozet, çip
    form.css                arama alanı
    dizin.css               terim dizini (satırlar) ve süzgeç sayacı
    icerik.css              terim sayfası ve Markdown gövdesi
    oturum.css              çalışma oturumu
    durum.css               boş durumlar
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
| Metin | `--parlak`, `--metin`, `--soluk`, `--soluk2` | parlaklık sırası |
| Vurgu | `--vurgu`, `--vurgu-parlak`, `--vurgu-metin`, `--vurgu-zemin`, `--vurgu-kenar` | marka rengi; `--vurgu-metin` dolu düğmenin yazı rengi |
| Durum | `--kehribar`, `--mercan`, `--gok` | uyarı / hata / bilgi |
| Yazı ailesi | `--baslik-font`, `--metin-font`, `--mono`, `--serif` | rol başına bir aile |
| Boşluk | `--b-1` … `--b-11` | 4px tabanlı ölçek |
| Yazı boyutu | `--yazi-2xs` … `--yazi-4xl` | başlıklar `clamp()` ile akışkan |
| Yarıçap | `--r-sm`, `--r`, `--r-lg` | keskin: 2 / 3 / 4px |
| Ölçü | `--genislik`, `--genislik-metin`, `--olcu` | okunabilir satır uzunluğu |

**Boşluk ara değer uydurulmaz.** `13px` gibi bir değer gerekiyorsa ölçekten en
yakını seçilir; ölçeğe değer eklemek gerekirse gerekçesi yazılır.

## Tema

Varsayılan tema koyudur. Açık tema `:root[data-tema="acik"]` ile açılır; karar
JavaScript'te tutulmaz, `layout.tsx` içindeki küçük bir betik tercihi ilk
boyamadan önce uygular. Tema anahtarı: `teknoterim-tema`.

Bir rengi iki temada da çalışacak şekilde tanımlamak için `tokenlar.css` içinde
hem `:root` hem `:root[data-tema="acik"]` bloğuna yazılır; başka hiçbir dosyada
tema koşulu bulunmaz.

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
  Halka `--odak` renginden gelir. Arama alanı tek istisnadır: odakta dış halka
  çıkmaz, alanın kendi kenarlığı vurguya döner (sayfa zıplamasın diye).
- **Hareket:** `prefers-reduced-motion: reduce` altında geçişler ve animasyonlar
  fiilen kapanır.
- **Kontrast:** `forced-colors: active` altında kenarlıklar sistem rengine
  bırakılır ve yalnızca renkle taşınan anlam korunur.
- **Klavye:** "İçeriğe geç" bağlantısı (`.atla`) sayfanın ilk odağıdır.

## Yazdırma

Bir sözlük maddesi kâğıtta okunabilir olmalı. `yazdirma.css` tokenların tamamını
açık değerlere çevirir (kâğıt beyazdır, ekran koyu), gezinme ve etkileşimli
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
