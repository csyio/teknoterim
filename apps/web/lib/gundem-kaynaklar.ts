/**
 * Gündem kaynakları — yalnızca güvenilir RSS/Atom beslemeleri.
 *
 * Liste Can'ın onayıyla belirlendi (2026-10-16). Sosyal medya kaynağı
 * bilinçli olarak yok: amaç, X'teki doğrulanmamış haber kalabalığının
 * tersine, az ama güvenilir bir akış.
 *
 * Bırakılanlar ve nedeni:
 *   - The Hacker News: sponsorlu "webinar" yazıları çok, haberlerin çoğu
 *     BleepingComputer'la aynı.
 *   - USOM ve ICANN: çalışan bir RSS beslemeleri yok (adresler HTML sayfası
 *     döndürüyor). Yerlerine CISA ile APNIC/RIPE Labs/Domain Incite.
 *   - Anthropic: RSS yayımlamıyor.
 *
 * Kaynak eklemek: bir satır ekleyin, `kimlik` kısa ve kalıcı olsun (veritabanında
 * saklanır; sonradan değiştirmeyin).
 */

export type Konu = "guvenlik" | "hosting" | "dns" | "yapay-zeka";

export type Kaynak = {
  /** Veritabanında saklanan kısa ad; değiştirilmez. */
  kimlik: string;
  /** Okura gösterilen ad. */
  ad: string;
  besleme: string;
  konu: Konu;
};

export const KAYNAKLAR: readonly Kaynak[] = [
  // Güvenlik
  { kimlik: "bleepingcomputer", ad: "BleepingComputer", besleme: "https://www.bleepingcomputer.com/feed/", konu: "guvenlik" },
  { kimlik: "cisa", ad: "CISA", besleme: "https://www.cisa.gov/cybersecurity-advisories/all.xml", konu: "guvenlik" },
  { kimlik: "sans-isc", ad: "SANS ISC", besleme: "https://isc.sans.edu/rssfeed_full.xml", konu: "guvenlik" },
  { kimlik: "krebs", ad: "Krebs on Security", besleme: "https://krebsonsecurity.com/feed/", konu: "guvenlik" },
  { kimlik: "google-guvenlik", ad: "Google Security Blog", besleme: "https://feeds.feedburner.com/GoogleOnlineSecurityBlog", konu: "guvenlik" },

  // Hosting ve bulut
  { kimlik: "cloudflare", ad: "Cloudflare Blog", besleme: "https://blog.cloudflare.com/rss/", konu: "hosting" },
  { kimlik: "aws", ad: "AWS News Blog", besleme: "https://aws.amazon.com/blogs/aws/feed/", konu: "hosting" },
  { kimlik: "aws-guvenlik", ad: "AWS Security Blog", besleme: "https://aws.amazon.com/blogs/security/feed/", konu: "hosting" },
  { kimlik: "letsencrypt", ad: "Let's Encrypt", besleme: "https://letsencrypt.org/feed.xml", konu: "hosting" },

  // Alan adı ve DNS
  { kimlik: "apnic", ad: "APNIC Blog", besleme: "https://blog.apnic.net/feed/", konu: "dns" },
  { kimlik: "ripe-labs", ad: "RIPE Labs", besleme: "https://labs.ripe.net/rss/", konu: "dns" },
  { kimlik: "domainincite", ad: "Domain Incite", besleme: "https://domainincite.com/feed", konu: "dns" },

  // Yapay zekâ
  { kimlik: "openai", ad: "OpenAI", besleme: "https://openai.com/news/rss.xml", konu: "yapay-zeka" },
  { kimlik: "google-ai", ad: "Google AI Blog", besleme: "https://blog.google/technology/ai/rss/", konu: "yapay-zeka" },
];

export const KONU_ADI: Record<Konu, string> = {
  guvenlik: "Güvenlik",
  hosting: "Hosting ve bulut",
  dns: "Alan adı ve DNS",
  "yapay-zeka": "Yapay zekâ",
};
