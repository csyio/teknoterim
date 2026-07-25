<img src="assets/hero.svg" alt="rootline — MSP, hosting ve sunucu dünyasının terimleri" width="100%">

<p align="center">
  <img src="https://img.shields.io/badge/durum-canlı-4ADE80?style=flat-square&labelColor=161A18" alt="Canlı">
  <img src="https://img.shields.io/badge/bağımlılık-sıfır-4ADE80?style=flat-square&labelColor=161A18" alt="Sıfır bağımlılık">
  <img src="https://img.shields.io/badge/terim-49-5EC8D8?style=flat-square&labelColor=161A18" alt="49 terim">
  <img src="https://img.shields.io/badge/dil-Türkçe-93A099?style=flat-square&labelColor=161A18" alt="Türkçe">
</p>

<p align="center">
  <a href="https://rootline.cansoykanyilmaz.com"><b>rootline.cansoykanyilmaz.com &nbsp;→</b></a>
</p>

<br>

## Nedir?

**rootline**, MSP/MSSP, hosting, alan adı/DNS ve ağ güvenliği alanlarının
terimlerini öğreten, sektör gündemini takip eden ve günlük işte lazım olan
araçları tek yerde toplayan Türkçe bir bilgi uygulamasıdır.

Bu sektörde çalışan biri için terimler, güncel haberler ve kur takibi dağınık
kaynaklara yayılmıştır. rootline bunları sade, hızlı ve reklamsız tek bir
arayüzde birleştirir — kurulum yok, hesap yok, dağınıklık yok.

<br>

## Ne var içinde?

| | |
| :-- | :-- |
| **`terimler`** | 49 sektör terimi. Her terim dört katmanda anlatılır: *nedir* → *ne amaçla kullanılır* → *hangi işte karşına çıkar* → *somut örnek*. Arama, kategori filtresi ve "öğrendim" işaretlemesiyle kişisel ilerleme takibi. |
| **`gündem`** | Yapay zekâ, güvenlik, hosting ve DNS dünyasından güncel haberler. 27 doğrulanmış kaynaktan günde iki kez taranır; her haber özgün Türkçe özet ve kaynak bağlantısıyla yayımlanır. İlgili terime tek dokunuşla geçiş. |
| **`döviz`** | Hosting ve domain maliyetleri döviz cinsindendir. USD/EUR/GBP → TRY çevirici, geçmiş kur grafiği ve kur alarmı. |

<br>

## Ekran görüntüleri

<img src="assets/preview-terimler.svg" alt="rootline — terimler sekmesi" width="100%">

<br>

<img src="assets/preview-gundem.svg" alt="rootline — gündem sekmesi" width="100%">

<br>

## Kullanım

Tarayıcıdan açılır. İndirme, kurulum veya kayıt gerekmez:

<p align="center">
  <a href="https://rootline.cansoykanyilmaz.com"><b>rootline.cansoykanyilmaz.com</b></a>
</p>

"Öğrenildi" işaretlerin yalnızca senin tarayıcında saklanır; hesap açılmaz,
sunucu tarafında hiçbir kayıt tutulmaz.

<br>

## Tasarım ve teknoloji yaklaşımı

rootline sadeliği ve gizliliği bir ilke olarak benimser:

- **Tek dosya, sıfır bağımlılık.** Arayüz hiçbir dış kütüphaneye bağlı değildir —
  grafik kütüphanesi, framework, ikon paketi yok. Grafikler, ikonlar ve bayraklar
  dahil her şey el yapımıdır.
- **Kendi ikon paketi.** 30 ikon rootline için sıfırdan çizildi: 24×24 ızgara,
  kare uçlar, köşeli birleşimler — şema/plotter dili.
- **Kendi sunucumuzda barındırılan yazı tipleri.** Google Fonts gibi üçüncü
  taraflara bağlanılmaz; ziyaretçinin verisi dışarı sızmaz.
- **Dış istek yok.** Tek istisna, döviz kuru için kullanılan açık referans
  API'sidir; bu da arayüzde açıkça belirtilir.
- **Dürüst veri.** Kurlar "ECB günlük referans kuru" olarak etiketlenir;
  "gerçek zamanlı" veya "banka kuru" gibi yanıltıcı ifadeler kullanılmaz.
- **Telife saygı.** Haber özetleri kaynaktan kopyalanmaz, kendi cümlelerimizle
  yazılır ve her kayıtta orijinal habere bağlantı verilir.
- **Erişilebilirlik.** Klavyeyle tam gezinme, ekran okuyucu uyumu, WCAG AA
  kontrast hedefleri ve `prefers-reduced-motion` desteği.

<br>

## Kaynak kodu

Bu depo yalnızca **tanıtım ve kullanım** amaçlıdır; uygulamanın kaynak kodunu
içermez. Kaynak kod özeldir ve halka açık değildir.

<br>

---

<p align="center">
  <sub>Bir <a href="https://cansoykanyilmaz.com">cansoykanyilmaz.com</a> iştirakidir · © 2026</sub>
</p>
