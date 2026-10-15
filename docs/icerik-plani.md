# İçerik planı

Bu belge, sözlüğü 49 terimden ~150'ye çıkarma planıdır. Amaç yalnızca sayı
artırmak değil: **her terim gerçek bir arama ihtiyacını karşılamalı.**

## Kural

Değişmeyen iki ilke var:

1. **Dört katman.** Nedir → ne amaçla kullanılır → hangi işte karşınıza çıkar
   → somut örnek.
2. **Doğruluk.** Yanlış öğretilen bir terim, hiç öğretilmemiş olmaktan kötüdür.
   Emin olunmayan bir ayrıntı yazılmaz; yazılamıyorsa terim eklenmez.

## Yazı sesi (mevcut içerikten çıkarıldı)

Yeni terimler mevcut sesle yazılmalı, yoksa içerik yamalı görünür. İmza şudur:

| Alan | Kural |
|---|---|
| `ozet` | İngilizce karşılık (varsa) + tek cümle, süslü olmayan tanım |
| `## Ne amaçla kullanılır` | 2–3 cümle. **Sonu, insanların yanlış bildiği noktayla biter** ("Yedeklemenin yerini tutmaz", "kayıt yoksa erişim kesilmez"). |
| `## Örnek` | **Tek cümle.** Somut, gerçekçi, çoğu zaman bir sayı içerir. |
| `isler` | 2–3 kısa iş bağlamı. **Mevcut etiketler tercih edilir** (aşağıya bakın). |

Tehdit ve risk terimlerinde "ne amaçla kullanılır" başlığı korunur, ama içerik
"bu terimi bilmek ne işe yarar" biçiminde yazılır. Mevcut içerikte de böyle
yapılmış (bkz. `fidye-yazilimi.md`).

## Mevcut durum

Bu bölüm, plan yazıldığı andaki durumu (devralınan 49 terim) gösterir.

| Kategori | Terim |
|---|---|
| Sunucu/Hosting | 12 |
| Domain/DNS | 11 |
| Ağ/Güvenlik | 11 |
| MSP/MSSP | 9 |
| Müşteri/İş | 6 |
| **Toplam** | **49** |

Plan tamamlandıktan sonraki durum için "Parti planı" bölümünün sonuna bakın.

## Boşluk analizi

**Domain/DNS** — Kavramlar var, **kayıt tipleri yok.** A kaydı ve CNAME
anlatılmış ama MX, TXT, AAAA, PTR, CAA gibi günlük işte sürekli kullanılan
kayıtlar yok. Ayrıca alan adı yaşam döngüsü (transfer, registrar, sahiplik) ve
modern riskler (alt alan adı ele geçirme, DoH) hiç yok. **Bu kategori en çok
aranan ve en zayıf kalan alan.**

**Sunucu/Hosting** — Sunucu *türleri* iyi anlatılmış; **altyapı kavramları
yok.** Depolama türleri, sanallaştırma, konteyner, ölçeklendirme, yüksek
erişilebilirlik ve felaket kurtarma eksik. Müşteri teklifi hazırlarken en çok
ihtiyaç duyulan terimler bunlar.

**Ağ/Güvenlik** — Çevre güvenliği (firewall, WAF, DDoS) ve uç nokta (EDR)
var; **saldırı türleri ve ağ temelleri yok.** SQL enjeksiyonu, XSS, kaba kuvvet,
kimlik bilgisi hırsızlığı gibi müşteriye anlatılması gereken saldırılar
anlatılmamış. Ağ tarafında port, NAT, segmentasyon, VPN eksik. Uyum
(KVKK, ISO 27001) hiç yok — MSP görüşmelerinde sürekli geçer.

**MSP/MSSP** — Roller var (MSP, MSSP, NOC, SOC); **iş modeli ve süreç yok.**
MRR, sözleşme, fiyatlandırma, öncelik seviyeleri, kök neden analizi, bilgi
tabanı yok. Bunlar MSP'yi "teknik destekçi"den "hizmet sağlayıcı"ya çeviren
kavramlar.

**Müşteri/İş** — En zayıf kategori (6 terim). Müşteri yaşam döngüsü, teklif,
maliyet, sözleşme yenileme, bulut ekonomisi eksik.

---

## Önerilen eklemeler (~104 terim)

Bu liste onayınıza sunulur. **Kesmek eklemekten kolaydır** — çıkarın, ekleyin,
sonra yazmaya başlarım.

### Domain/DNS (+18)

Kalan kayıt tipleri ve alan adı yaşam döngüsü:

- AAAA Kaydı
- MX Kaydı
- TXT Kaydı
- PTR Kaydı (Ters DNS)
- CAA Kaydı
- SRV Kaydı
- SOA Kaydı
- DNS Bölgesi (Zone)
- Alt Alan Adı (Subdomain)
- Joker Karakter Kaydı (Wildcard)
- Kayıt Şirketi (Registrar)
- Alan Adı Transferi
- Yetkili ve Özyinelemeli DNS
- DNS-over-HTTPS (DoH)
- NXDOMAIN
- DNS Kara Liste (DNSBL)
- Alt Alan Adı Ele Geçirme
- DNS Önbellek Zehirlenmesi

### Sunucu/Hosting (+20)

Altyapı kavramları:

- SSD / NVMe
- Depolama Türleri (Blok / Dosya / Nesne)
- Nesne Depolama
- Sanallaştırma (Hypervisor)
- Konteyner (Container)
- Kubernetes
- Dikey ve Yatay Ölçeklendirme
- Yüksek Erişilebilirlik (HA)
- Felaket Kurtarma (DR)
- İş Sürekliliği
- Veri Merkezi
- Kabinet / Raf (Rack)
- Statik IP
- Önbellekleme (Caching)
- Redis / Memcached
- Veritabanı Sunucusu
- Yönetimli Hosting (Managed)
- Aşırı Kaynak Satışı (Overselling)
- Sistem İmajı (Image)
- İzleme (Monitoring)

### Ağ/Güvenlik (+31)

Saldırı türleri, ağ temelleri ve uyum:

- VPN
- IPS / IDS
- XDR
- SIEM
- Sızma Testi (Pentest)
- Güvenlik Açığı (Vulnerability)
- CVE
- Güvenlik Açığı Taraması
- En Az Yetki İlkesi
- SSO
- Kaba Kuvvet Saldırısı
- SQL Enjeksiyonu
- XSS (Siteler Arası Betik)
- Sosyal Mühendislik
- Botnet
- Sıfır Gün Açığı (Zero-day)
- Ağ Segmentasyonu
- DMZ
- NAT
- Alt Ağ ve CIDR
- Port
- IPv4 ve IPv6
- HSTS
- Güvenlik Başlıkları (Security Headers)
- Olay Müdahalesi (Incident Response)
- Adli Bilişim (Forensics)
- Zararlı Yazılım Türleri
- Şifreleme (Encryption)
- Hash
- Veri Kaybı Önleme (DLP)
- KVKK

### MSP/MSSP (+20)

İş modeli ve süreç:

- Yönetimli Hizmet (Managed Service)
- Hizmet Kataloğu
- Aylık Yinelenen Gelir (MRR)
- Ana Hizmet Sözleşmesi (MSA)
- Kapsam Tanımı (SOW)
- PSA (Hizmet Otomasyonu)
- ITSM
- ITIL
- Vaka Yönetimi
- Öncelik Seviyeleri (P1/P2)
- Triyaj
- Bilgi Tabanı
- Kök Neden Analizi (RCA)
- Değişiklik Yönetimi
- Varlık Envanteri (CMDB)
- Uyarı Yorgunluğu
- Müşteri Kabulü (Onboarding)
- Müşteri Kaybı (Churn)
- Kullanıcı Başı Fiyatlandırma
- Üretici Sertifikasyonu

### Müşteri/İş (+15)

- Müşteri Yaşam Döngüsü
- Toplam Sahip Olma Maliyeti (TCO)
- Yatırım Getirisi (ROI)
- Teklif (Proposal)
- Kapsam Dışı (Out of Scope)
- Sözleşme Yenileme
- Müşteri Memnuniyeti (CSAT)
- Referans
- Vaka Çalışması (Case Study)
- Yetkili Satıcı (Reseller)
- Lisans Yönetimi
- Bulut Bilişim
- Bulut Maliyeti
- Veri Saklama Süresi
- Hizmet Durumu Sayfası

---

## Parti planı

İnceleme yükünü dağıtmak için içerik partiler hâlinde yazılır. Her parti ayrı
bir değişikliktir; gözden geçirilmesi kolaydır ve tek başına yayınlanabilir.

| Parti | İçerik | Yazılan | Not |
|---|---|---|---|
| **P0** | Pilot — ses ve kalite kalibrasyonu | 16 | Birden fazla listede geçen terimler |
| **P1** | DNS kayıt tipleri ve alan adı yaşam döngüsü | 14 | |
| **P2** | Sunucu/hosting altyapı kavramları | 17 | Sanallaştırma, HA ve Veri Merkezi P0'da yazıldı |
| **P3** | Saldırı türleri ve ağ temelleri | 20 | |
| **P4** | Uyum, şifreleme ve olay yönetimi | 7 | VPN, Ağ Segmentasyonu, IPv4/IPv6, Olay Müdahalesi P0'da yazıldı |
| **P5** | MSP iş modeli ve süreç | 17 | MRR, Bilgi Tabanı ve RCA P0'da yazıldı |
| **P6** | Müşteri/iş | 13 | Bulut Maliyeti ve Hizmet Durumu Sayfası P0'da yazıldı |

**P2–P6 yazıldı.** Önerilen 104 terimin tamamı tamamlandı; sözlük 49'dan
**153 terime** çıktı. Kategori dağılımı: Ağ/Güvenlik 42, Sunucu/Hosting 32,
MSP/MSSP 29, Domain/DNS 29, Müşteri/İş 21.

Yeni terimler `yeniden-gelistirme` dalında, parti parti commit edilmiş hâlde
duruyor. İnceleme sonrası `main`'e alınacak.

## İnceleme akışı

1. Terim listesi onaylanır (bu belge).
2. Bir parti yazılır → commit → inceleme.
3. Siz gözden geçirirsiniz: yanlış olan düzeltilir, eksik olan eklenir.
4. Parti onaylanınca `main`'e alınır.

Bunun mümkün olmasının sebebi, içeriğin koddan ayrı ve git'te yaşaması:
her terim tek bir dosyadır, dolayısıyla her terim tek tek gözden geçirilebilir.

## Gözlemler

Yazarken fark ettiklerim, karar sizin:

- **Etiket tutarlılığı.** 49 terimde ~110 farklı etiket var; bazıları neredeyse
  aynı ("SLA ölçümü" / "SLA takibi" / "SLA taahhüdü", "Yüksek erişilebilirlik" /
  "Yüksek erişilebilirlik tasarımı"). Arama da bu etiketleri taradığı için
  yakın anlamlılar sonucu biraz dağıtıyor. İstenirse terim eklerken
  sadeleştirilebilir — ama mevcut 49'un etiketlerini değiştirmek sizin
  kararınız olmalı.
- **Kategori yerleşimi.** "Bandwidth" Müşteri/İş'te, "Backup (Yedekleme)" ve
  "CDN" Ağ/Güvenlik'te duruyor. Yeni içerikte kategori sınırlarını
  netleştirmek (ağ erişimi vs. güvenlik) sözlüğü daha tarayıcı yapar.
