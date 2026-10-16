import type { Metadata } from "next";
import { DovizCevirici } from "./DovizCevirici";

export const metadata: Metadata = {
  title: "Döviz çevirici",
  description:
    "TCMB'nin günlük döviz satış kurlarıyla hızlı döviz çevirici. Reklamsız, hesapsız; kurlar kendi sunucumuz üzerinden alınır.",
  alternates: { canonical: "/doviz" },
};

export default function DovizSayfasi() {
  return (
    <div className="kabuk">
      <div className="baslik-alani">
        <h1>Döviz çevirici</h1>
        <p>
          Hosting faturası, lisans ya da donanım fiyatı döviz cinsinden geldiğinde hızlı
          bir karşılık için. Kurlar TCMB&apos;nin günlük bülteninden kendi sunucumuz
          üzerinden alınır; tarayıcınız başka bir siteye bağlanmaz.
        </p>
      </div>
      <div className="doviz-sayfa">
        <DovizCevirici />
      </div>
    </div>
  );
}
