# Yazı tipleri

Bu dizindeki dosyalar Tekno Terim'in arayüzünde kullanılan yazı tipleridir.
Hepsi kendi sunucumuzdan verilir; sayfa hiçbir üçüncü tarafa (Google Fonts dâhil)
bağlanmaz.

| Takma ad | Gerçek ad | İş | Lisans |
|---|---|---|---|
| `Gazete` | Newsreader (16pt) | Başlıklar | OFL 1.1 |
| `Inter` | Inter | Gövde metni | OFL 1.1 |
| `Mono` | JetBrains Mono | Etiket ve sayılar | OFL 1.1 |

Lisans ve telif metni: [OFL.txt](OFL.txt).

## Dosya adları

`<aile>-<altküme>[-<ağırlık>].woff2`

- `latin` ve `latin-ext`, Google Fonts'un alt küme bölünmesidir. Türkçeye özel
  harfler (ç, ğ, ı, İ, ö, ş, ü) `latin-ext` içindedir; ekranda Türkçe metin
  ikisini birlikte kullanır. Hangi harfin hangi dosyadan geldiğini `unicode-range`
  bildirimi belirler, bu yüzden iki dosya da gereklidir.
- `Gazete` üç ağırlığın sabit kırpımlarıdır (400/600/700); `Inter` ve `Mono`
  değişken (variable) fontlardır ve ağırlık ekseni dosyanın içindedir.

## Kural

Yeni bir yazı tipi eklerken:

1. `.woff2` dosyalarını bu dizine koyun.
2. Lisansı bu dizindeki `OFL.txt` gibi bir dosyaya ekleyin — lisansı
   belgelenmemiş bir font, depoda barındırılamaz.
3. `ds/yazitipi.css` içine `@font-face` bildirimini ve `ds/tokenlar.css` içindeki
   aile yığınına adı ekleyin.
4. **Türkçe kapsamını doğrulayın.** ç, ğ, ı, İ, ö, ş, ü harflerinin eksik olduğu
   bir font, bu uygulamada kullanılamaz.
