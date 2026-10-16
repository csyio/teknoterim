/**
 * Kullanıcının yazdığı tutarı sayıya çeviren saf yardımcı (döviz çevirici).
 */

/** "1.234.567" gibi: ilk grup 1–3 rakam (0 ile başlamaz), sonra üçlü gruplar. */
function binlikMi(metin: string, ayirici: "." | ","): boolean {
  const a = ayirici === "." ? "\\." : ",";
  return new RegExp(`^[1-9]\\d{0,2}(${a}\\d{3})+$`).test(metin);
}

/** Tam sayı kısmı: düz rakam ya da doğru gruplanmış binlik. */
function tamKisimGecerli(metin: string, ayirici: "." | ","): boolean {
  return /^\d+$/.test(metin) || binlikMi(metin, ayirici);
}

/**
 * "1.234,56" / "1234.56" / "1 234" gibi girdileri sayıya çevirir.
 *
 * Türkçe yazımda virgül ondalık, nokta binlik ayırıcıdır; ama "1.5" yazan
 * da çoktur. Kurallar:
 *   - İki ayırıcı birlikte varsa sondaki ondalıktır; öndeki kısım doğru
 *     gruplanmış olmalıdır ("1.234,56", "1,234.56").
 *   - Yalnızca nokta varsa ve dizge gerçekten binlik biçimindeyse ("1.500",
 *     "12.000.000") binliktir; tek nokta başka her durumda ondalıktır
 *     ("1.5", "0.125"). Biçime uymayan birden çok nokta geçersizdir.
 *   - Yalnızca virgül varsa tek virgül ondalıktır ("2,5").
 *
 * Emin olunamayan girdi `null` döner: yanlış tutar, tutar olmamasından kötüdür
 * (bin kat yanlış bir sonuç fark edilmeyebilir).
 */
export function tutarAyristir(metin: string): number | null {
  const temiz = metin.replace(/\s/g, "");
  if (temiz === "" || !/^[\d.,]+$/.test(temiz) || !/\d/.test(temiz)) return null;

  const sonVirgul = temiz.lastIndexOf(",");
  const sonNokta = temiz.lastIndexOf(".");
  let normal: string;

  if (sonVirgul >= 0 && sonNokta >= 0) {
    const ondalikVirgul = sonVirgul > sonNokta;
    const ayirac = ondalikVirgul ? "," : ".";
    const binlik = ondalikVirgul ? "." : ",";
    const son = ondalikVirgul ? sonVirgul : sonNokta;
    const tam = temiz.slice(0, son);
    const kesir = temiz.slice(son + 1);
    if (temiz.indexOf(ayirac) !== son) return null; // iki ondalık ayırıcı
    if (!/^\d*$/.test(kesir) || !tamKisimGecerli(tam, binlik)) return null;
    normal = `${tam.split(binlik).join("")}.${kesir}`;
  } else if (sonVirgul >= 0) {
    if (temiz.indexOf(",") !== sonVirgul) return null;
    normal = temiz.replace(",", ".");
  } else if (sonNokta >= 0) {
    if (binlikMi(temiz, ".")) normal = temiz.replace(/\./g, "");
    else if (temiz.indexOf(".") === sonNokta) normal = temiz;
    else return null;
  } else {
    normal = temiz;
  }

  const n = Number(normal);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
