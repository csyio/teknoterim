/**
 * Yönetim şifresinin özetini üretir.
 *
 *   npm run sifre-ozeti
 *
 * Şifre ekrana yazılmadan sorulur ve hiçbir yere kaydedilmez. Çıkan satırı
 * sunucuda /etc/teknoterim/web.env dosyasına
 *
 *   YONETIM_SIFRE_OZETI=scrypt:...
 *
 * olarak yazın ve siteyi yeniden başlatın (bkz. infra/README.md → Gündem).
 * Özet de bir sırdır: depoya, nota ya da sohbete yapıştırmayın.
 */

import { stdin, stdout } from "node:process";

import { sifreOzetiUret } from "../lib/yonetim-sifre.ts";

function gizliSor(soru) {
  return new Promise((coz, reddet) => {
    if (!stdin.isTTY) {
      reddet(new Error("Bu komut bir terminalde çalıştırılmalı (şifre gizli sorulur)."));
      return;
    }
    stdout.write(soru);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let girdi = "";
    const dinle = (parca) => {
      for (const k of parca) {
        if (k === "\r" || k === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", dinle);
          stdout.write("\n");
          coz(girdi);
          return;
        }
        if (k === "\u0003") {
          stdout.write("\n");
          process.exit(130);
        }
        if (k === "\u007f" || k === "\b") girdi = girdi.slice(0, -1);
        else girdi += k;
      }
    };
    stdin.on("data", dinle);
  });
}

const sifre = await gizliSor("Yönetim şifresi: ");
if (sifre.length < 12) {
  console.error("Şifre en az 12 karakter olmalı.");
  process.exit(1);
}
const tekrar = await gizliSor("Tekrar: ");
if (sifre !== tekrar) {
  console.error("Şifreler aynı değil.");
  process.exit(1);
}
console.log(`\nYONETIM_SIFRE_OZETI=${await sifreOzetiUret(sifre)}`);
