import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { SITE } from "@/lib/site";
import { TemaDugmesi } from "./TemaDugmesi";
import { Olcum } from "./Olcum";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.ad} — MSP, hosting, DNS ve ağ güvenliği terimleri`,
    template: `%s — ${SITE.ad}`,
  },
  description: SITE.aciklama,
  applicationName: SITE.ad,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: SITE.ad,
    url: "/",
  },
};

/**
 * Tema tercihini ilk boyamadan önce uygular. Aksi halde koyu tema seçmiş
 * kullanıcı bir an aydınlık sayfa görür ("tema sıçraması").
 */
const TEMA_KOMUTU = `(function(){try{var t=localStorage.getItem('rootline-tema');if(t==='acik'||t==='koyu'){document.documentElement.setAttribute('data-tema',t)}}catch(e){}})();`;

/**
 * Telif yılı. `new Date()` prerender sırasında "değişken değer" sayılır;
 * bu yüzden değeri önbelleğe alıyoruz (max = nadiren değişir).
 */
async function Yil() {
  "use cache";
  cacheLife("max");
  return <>{new Date().getFullYear()}</>;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEMA_KOMUTU }} />
      </head>
      <body>
        <a className="atla" href="#icerik">
          İçeriğe geç
        </a>

        <header className="ust">
          <div className="kabuk ust-ic">
            <Link className="marka" href="/" aria-label={`${SITE.ad} ana sayfa`}>
              <span className="marka-isaret" aria-hidden="true">
                ┄
              </span>
              {SITE.ad}
            </Link>
            <nav className="gezinme" aria-label="Ana gezinme">
              <Link href="/sozluk">Sözlük</Link>
              <Link href="/calis">Çalış</Link>
            </nav>
            <TemaDugmesi />
          </div>
        </header>

        <main id="icerik">{children}</main>

        <footer className="alt kabuk">
          <span>
            © <Yil /> {SITE.ad}
          </span>
          <span>Terimler Türkçe yazılmıştır ve kaynak gösterilerek kullanılabilir.</span>
        </footer>

        <Olcum />
      </body>
    </html>
  );
}
