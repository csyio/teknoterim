# Güvenlik Politikası

*[English below](#security-policy)*

## Bildirim

Tekno Terim'de bir güvenlik açığı bulduğunuzu düşünüyorsanız **lütfen genel bir
issue açmayın.**

[Özel güvenlik bildirimi açın](https://github.com/csyio/teknoterim/security/advisories/new) —
bildiriminiz yalnızca depo sahibi tarafından görülür ve açık düzeltilene kadar
gizli kalır.

İlk yanıt için hedef süre **72 saattir**.

## Kapsam

**Kapsam içinde** — teknoterim.com.tr üzerinde:

- XSS, içerik enjeksiyonu ve içerik güvenlik politikasının atlatılması
- Ziyaretçi verisinin üçüncü taraflara sızması
- Sunucu yapılandırmasında veya TLS kurulumunda bir zafiyet
- Kendi ölçüm toplayıcımız (`/api/olcum`) üzerinden veri sızdırılması ya da
  sahte kayıt üretilmesi
- Kur dönüştürücünün sunucu tarafı önbelleğinde veya TCMB isteğinde bir zafiyet
- Haber toplama hattı üzerinden içerik enjekte edilebilmesi
- Alan adı, DNS veya sertifika yapılandırmasında ele geçirmeye açık bir nokta

**Kapsam dışı**

- Otomatik tarayıcı çıktılarının ham hâlde gönderilmesi (etkiyi gösterin)
- Kullanıcı etkileşimi gerektiren, gerçekçi bir senaryosu olmayan bulgular
- Güvenlik başlıklarının "en katı" değerde olmaması — gerekçeli bir sömürü
  senaryosu olmadan
- Kaynak gösterilen üçüncü taraf servislerdeki (TCMB kur verisi, haber
  kaynakları) sorunlar
- Rate limit ve DoS senaryoları

## Ziyaretçi verisi hakkında

Tekno Terim hesap açmaz ve sunucu tarafında kullanıcı kaydı tutmaz. "Öğrenildi"
işaretleri yalnızca ziyaretçinin kendi tarayıcısında saklanır.

Ziyaretçi sayısı, kendi yazdığımız küçük bir toplayıcıyla ölçülür; üçüncü taraf
analitik yoktur. Bu toplayıcının kuralları bilinçli olarak dardır:

- IP adresi **saklanmaz**. Yalnızca günlük dönen bir ziyaretçi anahtarı üretmek
  için anlık olarak kullanılır ve sonra bırakılır.
- Çerez, `localStorage` veya kalıcı tarayıcı kimliği kullanılmaz.
- Tuz her gün değişir; anahtarlar günler arasında birleştirilemez.
- Yönlendiren adresten yalnızca alan adı saklanır, tam adres saklanmaz.
- `DNT` ve Global Privacy Control başlıklarına uyulur.
- Analitik verisi ayrı bir veritabanında (`analytics.db`) durur; uygulama
  verisinden ayrıdır.

Yazı tipleri kendi sunucumuzdan verilir; Google Fonts gibi üçüncü taraflara
bağlantı kurulmaz. Tarayıcıdan çıkan dış istek yoktur: kur verisi de kendi
sunucumuz üzerinden, TCMB'den alınır.

Bu nedenle "sızabilecek kullanıcı verisi" yüzeyi bilinçli olarak küçüktür.
Buna rağmen bir veri sızıntısı yolu bulduysanız, kapsam içindedir.

---

<a name="security-policy"></a>

# Security Policy

## Reporting

If you believe you have found a security vulnerability in Tekno Terim, **please
do not open a public issue.**

[Open a private security advisory](https://github.com/csyio/teknoterim/security/advisories/new) —
your report is visible only to the repository owner and stays confidential
until the issue is fixed.

The target for a first response is **72 hours**.

## Scope

**In scope** — on teknoterim.com.tr:

- XSS, content injection, and content-security-policy bypass
- Visitor data leaking to third parties
- A weakness in the server configuration or TLS setup
- Data exfiltration or forged records through our own analytics collector
  (`/api/olcum`)
- A weakness in the currency converter's server-side cache or its request to
  TCMB
- Content injection through the news aggregation pipeline
- Anything in the domain, DNS, or certificate configuration open to takeover

**Out of scope**

- Raw automated scanner output submitted as-is (demonstrate impact)
- Findings requiring user interaction with no realistic scenario
- Security headers not being at their strictest value, absent a reasoned
  exploitation scenario
- Issues in attributed third-party services (TCMB rate data, news sources)
- Rate limiting and DoS scenarios

## About visitor data

Tekno Terim creates no accounts and keeps no user records server-side.
"Learned" marks are stored only in the visitor's own browser.

Visitor numbers are measured with a small collector we wrote ourselves; there
is no third-party analytics. Its rules are deliberately narrow:

- The IP address is **not stored**. It is used momentarily to derive a
  daily-rotating visitor key and then discarded.
- No cookies, no `localStorage`, no persistent browser identifier.
- The salt rotates daily, so keys cannot be joined across days.
- Only the host of the referrer is stored, never the full URL.
- `DNT` and Global Privacy Control headers are honoured.
- Analytics data lives in a separate database (`analytics.db`), apart from
  application data.

Fonts are served from our own server; no connection is made to third parties
such as Google Fonts. No outbound requests leave the browser: exchange-rate
data is also fetched server-side, from TCMB.

The surface of "user data that could leak" is therefore deliberately small. If
you have nonetheless found a data-leak path, it is in scope.
