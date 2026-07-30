# Katkı rehberi

Bu depo rootline'ın **kaynak kodunu içermez**; uygulamanın kodu özel bir
depoda tutulur. Yani buraya kod pull request'i açamazsınız.

Ama rootline'ın değeri koddan çok içeriğinde: 49 terimin doğru, anlaşılır ve
sahadaki gerçekle uyumlu anlatılmasında. Orada yardıma ihtiyaç var.

## En değerli katkı: yanlış bir terim

Yanlış öğretilen bir terim, hiç öğretilmemiş olmaktan kötüdür. Bir açıklamanın
teknik olarak hatalı, eksik ya da yanıltıcı olduğunu düşünüyorsanız
[terim düzeltmesi issue'su açın](../../issues/new/choose).

Şablonda bir **kaynak** alanı var — RFC, satıcı belgesi, standart metni ya da
sahadaki kendi deneyiminiz. Zorunlu değil; ama "bu yanlış" ile "bu yanlış,
çünkü RFC 7208 §3.1 şunu diyor" arasındaki fark, düzeltmenin ne kadar hızlı
gireceğini belirler.

## Eksik terim

Bu alanlarda çalışırken karşınıza çıkıp da rootline'da olmayan her terim bir
eksiktir: MSP/MSSP, hosting, alan adı/DNS, ağ güvenliği.

Terim önerisi şablonunda "nerede karşınıza çıktı?" diye soruluyor. Bu alan
merak değil: rootline'da her terim dört katmanda anlatılıyor —
*nedir* → *ne amaçla kullanılır* → *hangi işte karşına çıkar* → *somut örnek*.
Üçüncü katmanı ancak sizin cevabınızla yazabilirim.

Terimi bilmiyor olmanız öneriyi geçersiz kılmaz. Zaten bilmediğiniz için
öneriyorsunuz.

## Erişilebilirlik

Erişilebilirlik sorunları öncelikli ele alınır. Klavye tuzağı, ekran
okuyucuda okunmayan bir alan, yetersiz kontrast ya da
`prefers-reduced-motion` yok sayılması gördüyseniz lütfen bildirin —
hangi yardımcı teknolojiyi kullandığınızı da yazarsanız çok yardımcı olur.

## Haber özetleri

"gündem" bölümündeki özetler kaynaktan kopyalanmaz, kendi cümlelerimizle
yazılır ve her kayıt orijinal habere bağlanır. Bir özetin kaynağı yanlış
anlattığını fark ederseniz issue açın; kaynak bağlantısını da ekleyin.

## Belge düzeltmesi

Bu depodaki `.md` dosyalarına pull request açabilirsiniz — yazım hatası, bozuk
bağlantı, yanlış anlaşılan bir anlatım.

## Çeviri

rootline'ın Türkçe olması bilinçli bir karardır: bu alanın söz dağarcığı
ezici biçimde İngilizcedir ve Türkiye'de bu işi yapanlar terimleri anlayarak
değil, sindirerek öğrenir. rootline tam olarak o boşluğu kapatmak için var.
Bu yüzden uygulamanın İngilizce sürümü planlanmıyor.

## Yanıt süresi

rootline tek kişilik bir projedir; söz verilmiş bir yanıt süresi yoktur. Ama
her issue okunur.
