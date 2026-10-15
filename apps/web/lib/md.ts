import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/**
 * Terim içeriğindeki Markdown'ı HTML'e çevirir.
 *
 * İçerik bizim depomuzdaki dosyalardan gelir; dışarıdan kullanıcı girdisi
 * kabul edilmez. Buna rağmen çıktı yalnızca yayımlanan sayfada kullanılır,
 * içerik ekleme akışı (PR) zaten gözden geçirmeden geçer.
 */
export function markdown(md: string): string {
  return marked.parse(md, { async: false });
}
