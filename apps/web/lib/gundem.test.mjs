/**
 * Gündem saf yardımcılarının testleri.
 *
 *   npm test
 *
 * Çoğu bir içerik ya da güvenlik iddiasıdır: aynı haber iki kez alınmamalı,
 * özetteki tek bağlantı türü sözlük bağlantısı olmalı, kaynaktan kopya
 * yakalanmalı.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  ayarlariOku,
  baglantiNormallestir,
  beslemeAyristir,
  disAdresMi,
  haberKimligi,
  kalanTaslakHakki,
  kopyaParcasi,
  kullanilanTerimler,
  makaleMetni,
  metniTemizle,
  ozetParcala,
  ozetYaz,
} from "./gundem.ts";

const RSS = `<?xml version="1.0"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel><title>Örnek</title>
  <item>
    <title>Critical &amp; exploited flaw in VPN</title>
    <link>https://ornek.com/haber/1?utm_source=rss&amp;id=7</link>
    <description><![CDATA[<p>Attackers <b>exploit</b> a bug.</p>]]></description>
    <pubDate>Thu, 15 Oct 2026 10:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Başlıksız bağlantı yok</title>
  </item>
</channel></rss>`;

const ATOM = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title type="html">DNS &lt;b&gt;outage&lt;/b&gt; report</title>
    <link rel="replies" href="https://ornek.org/yorumlar"/>
    <link rel="alternate" href="https://ornek.org/yazi"/>
    <summary type="html">&lt;img src="x.png"&gt;Resolver failed for two hours.</summary>
    <published>2026-10-14T08:00:00Z</published>
  </entry>
</feed>`;

test("RSS 2.0 öğeleri ayrıştırılır, eksik olanlar atlanır", () => {
  const ogeler = beslemeAyristir(RSS);
  assert.equal(ogeler.length, 1);
  assert.equal(ogeler[0].baslik, "Critical & exploited flaw in VPN");
  assert.equal(ogeler[0].aciklama, "Attackers exploit a bug.");
  assert.equal(ogeler[0].yayinAni, Date.UTC(2026, 9, 15, 10));
});

test("Atom: alternate bağlantısı seçilir, kaçışlanmış HTML temizlenir", () => {
  const [oge] = beslemeAyristir(ATOM);
  assert.equal(oge.baglanti, "https://ornek.org/yazi");
  assert.equal(oge.baslik, "DNS outage report");
  assert.equal(oge.aciklama, "Resolver failed for two hours.");
});

test("bozuk besleme hata fırlatmaz, boş liste döner", () => {
  assert.deepEqual(beslemeAyristir("<html><body>bakımda</body></html>"), []);
  assert.deepEqual(beslemeAyristir("<<<"), []);
});

test("bağlantı normalleştirme izleme parametrelerini ve çapayı atar, https'e yükseltir", () => {
  assert.equal(
    baglantiNormallestir("http://ORNEK.com/a?utm_source=x&id=7&fbclid=1#yorum"),
    "https://ornek.com/a?id=7"
  );
  assert.equal(baglantiNormallestir("javascript:alert(1)"), null);
  assert.equal(baglantiNormallestir("ftp://ornek.com/x"), null);
  assert.equal(baglantiNormallestir("bozuk adres"), null);
});

test("iç ve şüpheli adresler dış adres sayılmaz", () => {
  const dis = (a) => disAdresMi(new URL(a));
  assert.equal(dis("https://www.bleepingcomputer.com/news/x"), true);
  assert.equal(dis("https://ornek.com:443/x"), true);
  for (const a of [
    "http://ornek.com/",
    "https://127.0.0.1/",
    "https://2130706433/",
    "https://0x7f000001/",
    "https://[::1]/",
    "https://localhost/",
    "https://localhost./",
    "https://meta.internal./",
    "https://yazici.local/",
    "https://intranet/",
    "https://ornek.com:8767/",
    "https://kullanici:parola@ornek.com/",
  ]) {
    assert.equal(dis(a), false, a);
  }
  assert.equal(baglantiNormallestir("http://127.0.0.1/haber"), null, "iç adres veritabanına girmez");
});

test("aynı haberin farklı adres biçimleri aynı kimliği alır", () => {
  const a = haberKimligi(baglantiNormallestir("https://ornek.com/a?utm_medium=rss"));
  const b = haberKimligi(baglantiNormallestir("http://ornek.com/a#x"));
  assert.equal(a, b);
  assert.equal(a.length, 32);
});

test("yalnızca sözlük bağlantıları bağlantıya dönüşür", () => {
  const sluglar = new Set(["dns", "vpn"]);
  const [p1, p2] = ozetParcala(
    "Bir [VPN](/sozluk/vpn) açığı [kötü](https://kotu.example) ve [uydurma](/sozluk/yok).\n\nİkinci [DNS](/sozluk/dns) paragrafı.",
    sluglar
  );
  assert.deepEqual(p1, [
    { metin: "Bir " },
    { metin: "VPN", slug: "vpn" },
    { metin: " açığı [kötü](https://kotu.example) ve " },
    { metin: "uydurma" },
    { metin: "." },
  ]);
  assert.deepEqual(p2[1], { metin: "DNS", slug: "dns" });
});

test("slug listesi verilmezse yalnızca biçim denetlenir", () => {
  const [p] = ozetParcala("[a](/sozluk/x-1) [b](/sozluk/../gizli) [c](/sozluk/BUYUK)");
  assert.deepEqual(p[0], { metin: "a", slug: "x-1" });
  assert.equal(p.filter((x) => x.slug).length, 1, "yol gezinme ve büyük harf kabul edilmez");
});

test("özet yeniden yazılınca bilinmeyen bağlantılar düz metne döner", () => {
  const temiz = ozetYaz(ozetParcala("[DNS](/sozluk/dns) ve [X](/sozluk/x)", new Set(["dns"])));
  assert.equal(temiz, "[DNS](/sozluk/dns) ve X");
  assert.deepEqual(kullanilanTerimler(temiz), ["dns"]);
});

test("kaynaktan 8 kelimelik aynen alıntı yakalanır", () => {
  const kaynak = "The attackers used a stolen certificate to sign the malicious update for thousands of customers.";
  assert.equal(
    kopyaParcasi("Rapora göre the attackers used a stolen certificate to sign the malicious update.", kaynak),
    "the attackers used a stolen certificate to sign"
  );
  assert.equal(kopyaParcasi("Saldırganlar çalıntı bir sertifikayla güncellemeyi imzaladı.", kaynak), null);
});

test("HTML temizleme betik ve stil içeriğini atar", () => {
  assert.equal(metniTemizle("<p>A<script>alert(1)</script> B</p><style>x{}</style>"), "A B");
  assert.equal(metniTemizle("&#x130;stanbul &amp; &#305;"), "İstanbul & ı");
});

test("makale metni article öğesini tercih eder, gezinmeyi atar", () => {
  const html = "<body><nav>Menü</nav><article><header>Üst</header><p>Asıl haber.</p></article><footer>Alt</footer></body>";
  assert.equal(makaleMetni(html), "Asıl haber.");
  assert.equal(makaleMetni("<body><p>" + "a".repeat(50) + "</p></body>", 10).length, 10);
});

test("ayarlar ortamdan okunur, geçersiz değer varsayılana döner", () => {
  assert.deepEqual(ayarlariOku({}), { esik: 4, gunlukTavan: 20 });
  assert.deepEqual(ayarlariOku({ GUNDEM_ESIK: "3", GUNDEM_GUNLUK_TAVAN: "5" }), { esik: 3, gunlukTavan: 5 });
  assert.deepEqual(ayarlariOku({ GUNDEM_ESIK: "9", GUNDEM_GUNLUK_TAVAN: "-1" }), { esik: 5, gunlukTavan: 0 });
  assert.deepEqual(ayarlariOku({ GUNDEM_ESIK: "dört" }), { esik: 4, gunlukTavan: 20 });
});

test("günlük tavan aşılmaz", () => {
  assert.equal(kalanTaslakHakki(0, 20), 20);
  assert.equal(kalanTaslakHakki(18, 20), 2);
  assert.equal(kalanTaslakHakki(25, 20), 0);
});
