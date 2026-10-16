import Link from "next/link";

/** Bilinmeyen adresler ve sözlükte olmayan terimler için Türkçe 404. */
export default function Bulunamadi() {
  return (
    <div className="kabuk">
      <section className="bulunamadi">
        <p className="mono">404</p>
        <h1>Bu sayfa bulunamadı.</h1>
        <p>
          Adres yanlış yazılmış ya da aradığınız terim henüz sözlükte yok. Sözlükte
          arayabilir ya da eksik terimi bize önerebilirsiniz.
        </p>
        <div className="dugme-sirasi">
          <Link className="dugme" href="/sozluk">
            Sözlükte ara
          </Link>
          <Link className="baglanti-dugme" href="/">
            Ana sayfa
          </Link>
        </div>
      </section>
    </div>
  );
}
