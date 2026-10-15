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
        <div className="giris-sol">
          <p className="mono">MSP · hosting · DNS · ağ güvenliği</p>
          <h1>Sektörün terimleri, tek yerde.</h1>
        </div>

        <div className="giris-sag">
          <p className="giris-aciklama">
            Bu alanda çalışan biri için terimler, haberler ve araçlar dağınık kaynaklara
            yayılmıştır. Tekno Terim bunları sade, hızlı ve reklamsız tek bir yerde
            toplar — kurulum yok, hesap yok.
          </p>
          <div className="dugme-sirasi">
            <Link className="dugme" href="/sozluk">
              Sözlüğe göz at <span aria-hidden="true">→</span>
            </Link>
            <Link className="baglanti-dugme" href="/calis">
              Çalış
            </Link>
          </div>
        </div>
      </section>

      <section className="bolumler" aria-label="Bölümler">
        {SUTUNLAR.map((s, i) => (
          <article className="bolum" key={s.ad}>
            <span className="bolum-no" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="bolum-govde">
              <h2>{s.ad}</h2>
              <p>{s.aciklama}</p>
            </div>
            <div className="bolum-sag">
              <span className={s.durum === "hazır" ? "etiket hazir" : "etiket"}>
                {s.durum}
              </span>
              {s.href && (
                <Link className="tamami" href={s.href}>
                  {terimler.length} terim →
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="one-cikanlar" aria-labelledby="nereden-baslamali">
        <div className="bolum-baslik">
          <h2 id="nereden-baslamali">Nereden başlamalı</h2>
        </div>
        <div className="dizin">
          {oneCikan.map((t) => (
            <Link key={t.slug} className="dizin-satir" href={`/sozluk/${t.slug}`}>
              <span className="dizin-ad">{t.baslik}</span>
              <span className="dizin-ozet">
                {t.ozet}
                {t.isler.length > 0 && (
                  <span className="dizin-isler">{t.isler.join(" · ")}</span>
                )}
              </span>
              <span className="dizin-kat">{t.kategori}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
