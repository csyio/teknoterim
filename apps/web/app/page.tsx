import Link from "next/link";
import { tumTerimler } from "@/lib/terms";

const SUTUNLAR = [
  {
    ad: "Terimler",
    durum: "hazır",
    aciklama:
      "Her terim dört katmanda anlatılır: nedir, ne amaçla kullanılır, hangi işte karşınıza çıkar ve somut bir örnek.",
    href: "/sozluk",
  },
  {
    ad: "Gündem",
    durum: "hazırlanıyor",
    aciklama:
      "Yapay zekâ, güvenlik, hosting ve DNS dünyasından haberler; geçen terimler sözlüğe bağlanır.",
    href: null,
  },
  {
    ad: "Araçlar",
    durum: "hazırlanıyor",
    aciklama:
      "Döviz çevirici ve hosting maliyetlerinde işe yarayan hesaplayıcılar.",
    href: null,
  },
] as const;

const ONE_CIKAN = ["dns", "msp", "vps", "firewall", "sla", "zero-trust"];

export default function AnaSayfa() {
  const terimler = tumTerimler();
  const oneCikan = ONE_CIKAN.map((s) => terimler.find((t) => t.slug === s)).filter(
    (t): t is NonNullable<typeof t> => Boolean(t)
  );

  return (
    <div className="kabuk">
      <section className="giris">
        <p className="mono">MSP · hosting · DNS · ağ güvenliği</p>
        <h1>Sektörün terimleri, tek yerde.</h1>
        <p className="giris-aciklama">
          Bu alanda çalışan biri için terimler, haberler ve araçlar dağınık kaynaklara
          yayılmıştır. rootline bunları sade, hızlı ve reklamsız tek bir yerde
          toplar — kurulum yok, hesap yok.
        </p>
        <Link className="dugme" href="/sozluk">
          Sözlüğe göz at <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="sutunlar" aria-label="Bölümler">
        {SUTUNLAR.map((s) => (
          <div className="sutun" key={s.ad}>
            <div className="sutun-ust">
              <h2>{s.ad}</h2>
              <span className={s.durum === "hazır" ? "etiket hazir" : "etiket"}>
                {s.durum}
              </span>
            </div>
            <p>{s.aciklama}</p>
            {s.href && (
              <Link className="sutun-baglanti" href={s.href}>
                {terimler.length} terim →
              </Link>
            )}
          </div>
        ))}
      </section>

      <section className="ornekler">
        <h2 className="ornekler-baslik">Nereden başlamalı</h2>
        <div className="kartlar">
          {oneCikan.map((t) => (
            <Link key={t.slug} className="kart" href={`/sozluk/${t.slug}`}>
              <div className="kart-ust">
                <h2>{t.baslik}</h2>
                <span className="kat">{t.kategori}</span>
              </div>
              <p className="ozet">{t.ozet}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
