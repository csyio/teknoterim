# Güvenlik Politikası

*[English below](#security-policy)*

## Bildirim

rootline'da bir güvenlik açığı bulduğunuzu düşünüyorsanız **lütfen genel bir
issue açmayın.**

[Özel güvenlik bildirimi açın](https://github.com/csyio/rootline/security/advisories/new) —
bildiriminiz yalnızca depo sahibi tarafından görülür ve açık düzeltilene kadar
gizli kalır.

İlk yanıt için hedef süre **72 saattir**.

## Kapsam

**Kapsam içinde** — rootline.cansoykanyilmaz.com üzerinde:

- XSS, içerik enjeksiyonu ve içerik güvenlik politikasının atlatılması
- Ziyaretçi verisinin üçüncü taraflara sızması
- Sunucu yapılandırmasında veya TLS kurulumunda bir zafiyet
- Haber toplama hattı üzerinden içerik enjekte edilebilmesi
- Alan adı, DNS veya sertifika yapılandırmasında ele geçirmeye açık bir nokta

**Kapsam dışı**

- Otomatik tarayıcı çıktılarının ham hâlde gönderilmesi (etkiyi gösterin)
- Kullanıcı etkileşimi gerektiren, gerçekçi bir senaryosu olmayan bulgular
- Güvenlik başlıklarının "en katı" değerde olmaması — gerekçeli bir sömürü
  senaryosu olmadan
- Kaynak gösterilen üçüncü taraf servislerdeki (ECB kur referansı, haber
  kaynakları) sorunlar
- Rate limit ve DoS senaryoları

## Ziyaretçi verisi hakkında

rootline hesap açmaz ve sunucu tarafında kullanıcı kaydı tutmaz. "Öğrenildi"
işaretleri yalnızca ziyaretçinin kendi tarayıcısında saklanır.

Yazı tipleri kendi sunucumuzdan verilir; Google Fonts gibi üçüncü taraflara
bağlantı kurulmaz. Dış istek olarak yalnızca döviz kuru için kullanılan açık
referans API'si vardır ve bu arayüzde açıkça belirtilir.

Bu nedenle "sızabilecek kullanıcı verisi" yüzeyi bilinçli olarak küçüktür.
Buna rağmen bir veri sızıntısı yolu bulduysanız, kapsam içindedir.

---

<a name="security-policy"></a>

# Security Policy

## Reporting

If you believe you have found a security vulnerability in rootline, **please do
not open a public issue.**

[Open a private security advisory](https://github.com/csyio/rootline/security/advisories/new) —
your report is visible only to the repository owner and stays confidential
until the issue is fixed.

The target for a first response is **72 hours**.

## Scope

**In scope** — on rootline.cansoykanyilmaz.com:

- XSS, content injection, and content-security-policy bypass
- Visitor data leaking to third parties
- A weakness in the server configuration or TLS setup
- Content injection through the news aggregation pipeline
- Anything in the domain, DNS, or certificate configuration open to takeover

**Out of scope**

- Raw automated scanner output submitted as-is (demonstrate impact)
- Findings requiring user interaction with no realistic scenario
- Security headers not being at their strictest value, absent a reasoned
  exploitation scenario
- Issues in attributed third-party services (ECB rate reference, news sources)
- Rate limiting and DoS scenarios

## About visitor data

rootline creates no accounts and keeps no user records server-side. "Learned"
marks are stored only in the visitor's own browser.

Fonts are served from our own server; no connection is made to third parties
such as Google Fonts. The only outbound request is the open reference API used
for exchange rates, and that is stated plainly in the interface.

The surface of "user data that could leak" is therefore deliberately small. If
you have nonetheless found a data-leak path, it is in scope.
