/**
 * Gündem toplayıcısının tek çalışması: topla → ayıkla → taslak yaz.
 *
 * Sunucuda saatte bir systemd zamanlayıcısı çalıştırır (bkz.
 * infra/teknoterim-gundem.timer). Ağ (`fetch`) ve yazar dışarıdan verilir:
 * testler gerçek ağa ve Claude'a gitmeden bütün akışı dener.
 *
 * Her adım kendi hatasını yutar ve sayar: tek bir kaynağın ya da tek bir
 * taslağın hatası çalışmanın geri kalanını durdurmaz. Yarıda kalan iş bir
 * sonraki saatte kaldığı yerden devam eder (durumlar veritabanında).
 */

import {
  adayiEle,
  adaylar,
  bugunkuTaslakSayisi,
  calismaKaydet,
  eskileriKapat,
  haberleriEkle,
  puanYaz,
  puanlanamadi,
  puanlanacaklar,
  sonBasliklar,
  taslakKaydet,
  type YeniHaber,
} from "./gundem-db.ts";
import { ReddedildiHatasi, type SozlukTerimi, type Yazar } from "./gundem-claude.ts";
import type { Kaynak } from "./gundem-kaynaklar.ts";
import {
  baglantiNormallestir,
  beslemeAyristir,
  disAdresMi,
  gunMetni,
  haberKimligi,
  kalanTaslakHakki,
  kopyaParcasi,
  makaleMetni,
  ozetParcala,
  ozetYaz,
  type GundemAyarlari,
} from "./gundem.ts";

const SAAT = 60 * 60 * 1000;

/** Bu kadar eski haber toplanmaz (ilk çalıştırmada arşivin tamamı gelmesin). */
const EN_ESKI_HABER = 72 * SAAT;
/** Bir beslemeden tek çalışmada en fazla bu kadar öğe. */
const BESLEME_BASINA = 30;
/** Puanlanmamış ya da taslağa dönüşmemiş haber bu süreden sonra bırakılır. */
const BEKLEME_SINIRI = 48 * SAAT;
/** Ayıklamaya tek seferde gönderilen haber sayısı. */
const PUAN_PAKETI = 40;
const PUAN_TAVANI = 120;

const ZAMAN_ASIMI_MS = 15_000;
const EN_BUYUK_BESLEME = 3 * 1024 * 1024;
const EN_BUYUK_SAYFA = 2 * 1024 * 1024;
const KULLANICI_AJANI = "TeknoTerimGundem/1.0 (+https://teknoterim.com.tr/gundem)";

export type Getir = typeof fetch;

export type CalismaSecenekleri = {
  kaynaklar: readonly Kaynak[];
  terimler: SozlukTerimi[];
  yazar: Yazar;
  ayarlar: GundemAyarlari;
  getir?: Getir;
  an?: number;
  gunluk?: (mesaj: string) => void;
};

export type CalismaSonucu = {
  toplanan: number;
  puanlanan: number;
  taslak: number;
  hata: number;
  sahte: boolean;
};

/**
 * Düz http adresi (bazı beslemeler hâlâ öyle bağlıyor) https'e yükseltilir;
 * şifresiz bağlantı hiç kurulmaz. Geri kalan kurallar `disAdresMi` içinde.
 */
function adresDenetle(url: URL): void {
  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:") throw new Error(`yalnızca https: ${url.href}`);
  if (!disAdresMi(url)) throw new Error(`iç adres reddedildi: ${url.host}`);
}

const EN_FAZLA_YONLENDIRME = 3;

/**
 * Adresi sınırlı boyut ve süreyle okur. Yönlendirmeler elle izlenir ve her
 * adımda adres yeniden denetlenir: bir besleme ya da haber bağlantısı bizi
 * sunucunun kendi ağındaki bir adrese yönlendiremez.
 */
export async function sinirliGetir(getir: Getir, adres: string, enFazla: number): Promise<string> {
  let url = new URL(adres);
  adresDenetle(url);

  const denetleyici = new AbortController();
  const sayac = setTimeout(() => denetleyici.abort(), ZAMAN_ASIMI_MS);
  try {
    let yanit: Response;
    for (let adim = 0; ; adim++) {
      yanit = await getir(url, {
        signal: denetleyici.signal,
        headers: {
          "user-agent": KULLANICI_AJANI,
          accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8",
        },
        redirect: "manual",
      });
      const hedef = yanit.headers.get("location");
      if (yanit.status < 300 || yanit.status >= 400 || !hedef) break;
      if (adim >= EN_FAZLA_YONLENDIRME) throw new Error(`${url.hostname}: çok fazla yönlendirme`);
      await yanit.body?.cancel();
      url = new URL(hedef, url);
      adresDenetle(url);
    }
    if (!yanit.ok) throw new Error(`${url.hostname} ${yanit.status} döndürdü`);
    if (!yanit.body) return "";

    const okuyucu = yanit.body.getReader();
    const parcalar: Uint8Array[] = [];
    let toplam = 0;
    for (;;) {
      const { done, value } = await okuyucu.read();
      if (done) break;
      toplam += value.byteLength;
      if (toplam > enFazla) {
        await okuyucu.cancel();
        throw new Error(`${url.hostname}: yanıt çok büyük`);
      }
      parcalar.push(value);
    }
    return new TextDecoder().decode(Buffer.concat(parcalar));
  } finally {
    clearTimeout(sayac);
  }
}

async function kaynakTopla(
  kaynak: Kaynak,
  getir: Getir,
  an: number
): Promise<YeniHaber[]> {
  const xml = await sinirliGetir(getir, kaynak.besleme, EN_BUYUK_BESLEME);
  const sonuc: YeniHaber[] = [];
  for (const oge of beslemeAyristir(xml)) {
    if (sonuc.length >= BESLEME_BASINA) break;
    if (oge.yayinAni !== null && an - oge.yayinAni > EN_ESKI_HABER) continue;
    const normal = baglantiNormallestir(oge.baglanti);
    if (!normal) continue;
    sonuc.push({
      kimlik: haberKimligi(normal),
      kaynak: kaynak.kimlik,
      baslik: oge.baslik,
      baglanti: normal,
      aciklama: oge.aciklama,
      // Gelecek tarihli öğe (saat dilimi hatası) sıralamayı bozmasın.
      yayinAni: oge.yayinAni !== null ? Math.min(oge.yayinAni, an) : null,
    });
  }
  return sonuc;
}

export async function gundemCalistir(s: CalismaSecenekleri): Promise<CalismaSonucu> {
  const getir = s.getir ?? fetch;
  const an = s.an ?? Date.now();
  const gunluk = s.gunluk ?? (() => {});
  const sonuc: CalismaSonucu = { toplanan: 0, puanlanan: 0, taslak: 0, hata: 0, sahte: s.yazar.sahte };
  const kaynakAdi = new Map(s.kaynaklar.map((k) => [k.kimlik, k.ad]));

  if (s.yazar.sahte) gunluk("UYARI: API anahtarı yok, sahte kipte çalışılıyor (taslaklar [SAHTE] işaretli).");

  // 1. Topla — kaynaklar birbirini beklemez.
  const sonuclar = await Promise.allSettled(s.kaynaklar.map((k) => kaynakTopla(k, getir, an)));
  sonuclar.forEach((r, i) => {
    const k = s.kaynaklar[i];
    if (r.status === "fulfilled") {
      const eklenen = haberleriEkle(r.value, an);
      sonuc.toplanan += eklenen;
      gunluk(`${k.kimlik}: ${r.value.length} öğe, ${eklenen} yeni`);
    } else {
      sonuc.hata++;
      gunluk(`${k.kimlik}: HATA ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`);
    }
  });

  const kapanan = eskileriKapat(an - BEKLEME_SINIRI);
  if (kapanan) gunluk(`${kapanan} eski haber bırakıldı`);

  // 2. Ayıkla
  const bekleyen = puanlanacaklar(PUAN_TAVANI);
  // Bu çalışmada aday seçilenler de eklenir: sonraki paket aynı olayı
  // ikinci kez seçmesin.
  const secilenler = sonBasliklar(an - EN_ESKI_HABER);

  async function paketPuanla(paket: typeof bekleyen): Promise<void> {
    let puanlar;
    try {
      puanlar = await s.yazar.puanla(
        paket.map((h) => ({ id: h.id, kaynak: kaynakAdi.get(h.kaynak) ?? h.kaynak, baslik: h.baslik, aciklama: h.aciklama })),
        secilenler
      );
    } catch (hata) {
      // Tek bir haber (ör. istismar ayrıntısı) bütün paketi reddettirebilir:
      // paket bölünerek reddedilen haber bulunur, diğerleri puanlanır.
      if (hata instanceof ReddedildiHatasi) {
        if (paket.length === 1) {
          puanlanamadi(paket[0].id, "Model bu haberi değerlendirmeyi reddetti.");
          gunluk(`#${paket[0].id} ayıklamada reddedildi`);
          return;
        }
        const yari = Math.ceil(paket.length / 2);
        await paketPuanla(paket.slice(0, yari));
        await paketPuanla(paket.slice(yari));
        return;
      }
      // Geçici hata (ağ, kota): haberler "yeni" kalır, sonraki saatte denenir.
      sonuc.hata++;
      gunluk(`ayıklama HATA: ${hata instanceof Error ? hata.message : String(hata)}`);
      return;
    }

    const donen = new Set<number>();
    for (const p of puanlar) {
      const aday = p.puan >= s.ayarlar.esik;
      puanYaz(p.id, p.puan, p.gerekce.slice(0, 300), aday ? "aday" : "elendi");
      donen.add(p.id);
      sonuc.puanlanan++;
      if (aday) {
        const h = paket.find((x) => x.id === p.id);
        if (h) secilenler.push(h.baslik);
      }
    }
    for (const h of paket) {
      if (!donen.has(h.id)) puanlanamadi(h.id, "Model yanıtında puan yoktu.");
    }
  }

  for (let i = 0; i < bekleyen.length; i += PUAN_PAKETI) {
    await paketPuanla(bekleyen.slice(i, i + PUAN_PAKETI));
  }

  // 3. Taslak — günlük tavan Türkiye gününe göre.
  const gun = gunMetni(an);
  const hak = kalanTaslakHakki(bugunkuTaslakSayisi(gun), s.ayarlar.gunlukTavan);
  const sluglar = new Set(s.terimler.map((t) => t.slug));
  for (const h of adaylar(hak)) {
    let metin = h.aciklama;
    try {
      const okunan = makaleMetni(await sinirliGetir(getir, h.baglanti, EN_BUYUK_SAYFA));
      if (okunan.length > metin.length) metin = okunan;
    } catch (hata) {
      gunluk(`#${h.id} sayfa okunamadı, besleme açıklaması kullanılıyor: ${hata instanceof Error ? hata.message : String(hata)}`);
    }

    try {
      const taslak = await s.yazar.taslakYaz(
        { kaynak: kaynakAdi.get(h.kaynak) ?? h.kaynak, baslik: h.baslik, baglanti: h.baglanti, metin },
        s.terimler
      );
      if (!taslak) {
        adayiEle(h.id, "Taslak aşamasında uygun bulunmadı.");
        gunluk(`#${h.id} uygun bulunmadı`);
        continue;
      }
      // Sözlükte olmayan bağlantılar düz metne döner.
      const ozet = ozetYaz(ozetParcala(taslak.ozet, sluglar));
      const kopya = kopyaParcasi(ozet, `${h.baslik}\n${metin}`);
      taslakKaydet(h.id, {
        baslik: taslak.baslik.slice(0, 160),
        ozet,
        sahte: s.yazar.sahte,
        uyari: kopya ? `Kaynakla aynı ifade: "${kopya}"` : null,
        an,
        gun,
      });
      sonuc.taslak++;
    } catch (hata) {
      if (hata instanceof ReddedildiHatasi) {
        adayiEle(h.id, "Model bu haberi özetlemeyi reddetti.");
      }
      sonuc.hata++;
      gunluk(`#${h.id} taslak HATA: ${hata instanceof Error ? hata.message : String(hata)}`);
    }
  }

  calismaKaydet({
    an,
    toplanan: sonuc.toplanan,
    puanlanan: sonuc.puanlanan,
    taslak: sonuc.taslak,
    hata: sonuc.hata,
    sahte: sonuc.sahte ? 1 : 0,
  });
  gunluk(`bitti: ${sonuc.toplanan} yeni, ${sonuc.puanlanan} puanlandı, ${sonuc.taslak} taslak, ${sonuc.hata} hata`);
  return sonuc;
}
