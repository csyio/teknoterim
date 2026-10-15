# Katkı rehberi

Tekno Terim'in hem kodu hem içeriği bu depodadır ve ikisine de katkı
açabilirsiniz. Uygulama: `apps/web/`, terim içeriği:
`apps/web/content/terimler/`.

Ama projenin değeri koddan çok içeriğinde: 153 terimin doğru, anlaşılır ve
sahadaki gerçekle uyumlu anlatılmasında.

## En değerli katkı: yanlış bir terim

Yanlış öğretilen bir terim, hiç öğretilmemiş olmaktan kötüdür. Bir açıklamanın
teknik olarak hatalı, eksik ya da yanıltıcı olduğunu düşünüyorsanız
[terim düzeltmesi issue'su açın](../../issues/new/choose).

Şablonda bir **kaynak** alanı var — RFC, satıcı belgesi, standart metni ya da
sahadaki kendi deneyiminiz. Zorunlu değil; ama "bu yanlış" ile "bu yanlış,
çünkü RFC 7208 §3.1 şunu diyor" arasındaki fark, düzeltmenin ne kadar hızlı
gireceğini belirler.

## Eksik terim

Bu alanlarda çalışırken karşınıza çıkıp da Tekno Terim'de olmayan her terim bir
eksiktir: MSP/MSSP, sunucu/hosting, alan adı/DNS, ağ güvenliği, müşteri/iş.

Terim önerisi şablonunda "nerede karşınıza çıktı?" diye soruluyor. Bu alan
merak değil: Tekno Terim'de her terim dört katmanda anlatılıyor —
*nedir* → *ne amaçla kullanılır* → *hangi işte karşınıza çıkar* → *somut örnek*.
Üçüncü katmanı ancak sizin cevabınızla yazabilirim.

Terimi bilmiyor olmanız öneriyi geçersiz kılmaz. Zaten bilmediğiniz için
öneriyorsunuz.

## İçeriğe doğrudan katkı

Her terim tek bir dosyadır: `apps/web/content/terimler/<slug>.md`. Bu yüzden bir
terimi düzeltmek, tek bir dosyada küçük ve gözden geçirilebilir bir değişiklik
olarak açılabilir — issue açmadan da doğrudan PR gönderebilirsiniz.

Alanların anlamı ve kurallar (zorunlu `slug`, kategori listesi, dosya adı
eşleşmesi) [README](../README.md#terim-eklemek) içinde.

## Kod katkısı

Kod da bu depoda. Küçük ve tek amaçlı değişiklikler tercih edilir:
bir düzeltme ya da bir özellik, karışık değil.

```bash
cd apps/web
npm install
npm test         # birim testleri
npm run lint
npm run build
```

Bir değişikliğin **test, lint ve derlemeden** geçmesi beklenir; CI zaten bunları
koşar. Yeni bir davranış ekliyorsanız yanına testini de getirin — bu projede
testler gerçek davranışı ölçer, kapsam yüzdesini kovalamaz.

## Erişilebilirlik

Erişilebilirlik sorunları öncelikli ele alınır. Klavye tuzağı, ekran
okuyucuda okunmayan bir alan, yetersiz kontrast ya da
`prefers-reduced-motion` yok sayılması gördüyseniz lütfen bildirin —
hangi yardımcı teknolojiyi kullandığınızı da yazarsanız çok yardımcı olur.

## Haber özetleri

"gündem" bölümündeki özetler kaynaktan kopyalanmaz, kendi cümlelerimizle
yazılır ve her kayıt orijinal habere bağlanır. Bir özetin kaynağı yanlış
anlattığını fark ederseniz issue açın; kaynak bağlantısını da ekleyin.

## Çeviri

Tekno Terim'in Türkçe olması bilinçli bir karardır: bu alanın söz dağarcığı
ezici biçimde İngilizcedir ve Türkiye'de bu işi yapanlar terimleri anlayarak
değil, sindirerek öğrenir. Tekno Terim tam olarak o boşluğu kapatmak için var.
Bu yüzden uygulamanın İngilizce sürümü planlanmıyor.

## Yanıt süresi

Tekno Terim tek kişilik bir projedir; söz verilmiş bir yanıt süresi yoktur. Ama
her issue okunur.
