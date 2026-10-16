import type { Metadata } from "next";
import { tumTerimler } from "@/lib/terms";
import type { TerimOzeti } from "@/lib/sorular";
import { Calisma } from "./Calisma";

export const metadata: Metadata = {
  title: "Çalış",
  description:
    "Terimleri aralıklı tekrar yöntemiyle çalışın. Doğru bildikleriniz seyrekleşir, yanlışlarınız sıranın başına döner. İlerlemeniz yalnızca kendi tarayıcınızda saklanır.",
  alternates: { canonical: "/calis" },
};

export default function CalisSayfasi() {
  // Sorular ve seçenekler istemcide üretilir; sunucu yalnızca özet veriyi taşır.
  const terimler: TerimOzeti[] = tumTerimler().map(
    ({ slug, baslik, kategori, ozet, isler }) => ({ slug, baslik, kategori, ozet, isler })
  );

  return (
    <div className="kabuk">
      <div className="baslik-alani">
        <h1>Çalış</h1>
        <p>
          Terimleri okuyup geçmek yerine sınayarak öğrenin. Her soru içerikten üretilir;
          doğru cevapladığınız terim giderek seyrekleşir, yanlış cevapladığınız terim
          sıranın başına döner.
        </p>
      </div>
      <Calisma terimler={terimler} />
    </div>
  );
}
