import type { Metadata } from "next";
import { kategoriler, tumTerimler } from "@/lib/terms";
import { TerimListesi, type TerimOzeti } from "./TerimListesi";

export const metadata: Metadata = {
  title: "Sözlük",
  description:
    "MSP/MSSP, sunucu ve hosting, alan adı/DNS, ağ güvenliği ve müşteri/iş kategorilerinde sektör terimleri. Her terim dört katmanda anlatılır.",
  alternates: { canonical: "/sozluk" },
};

export default function SozlukSayfasi() {
  // Yalnızca listede gereken alanlar istemciye taşınır; uzun anlatım
  // katmanları terim sayfasında sunucuda kalır.
  const terimler: TerimOzeti[] = tumTerimler().map(
    ({ slug, baslik, kategori, ozet, isler }) => ({ slug, baslik, kategori, ozet, isler })
  );

  return (
    <div className="kabuk">
      <div className="baslik-alani">
        <h1>Sözlük</h1>
        <p>
          Bu sektörde işe başlayan biri için terimler dağınık kaynaklara yayılmıştır.
          Burada her terim dört katmanda anlatılır: ne olduğu, ne amaçla kullanıldığı,
          hangi işte karşınıza çıktığı ve somut bir örnek.
        </p>
      </div>
      <TerimListesi terimler={terimler} kategoriler={kategoriler()} />
    </div>
  );
}
