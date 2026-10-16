/**
 * İstemci IP'si (yalnızca hız sınırı anahtarı olarak kullanılır, saklanmaz).
 *
 * Uygulama yalnızca 127.0.0.1 dinler ve önünde Caddy vardır; başlık Caddy
 * tarafından yazılır. Doğrudan internete açık bir kurulumda bu başlığa
 * güvenilmemelidir — bu yüzden bağlama adresi ayrıca kilitlidir (bkz. infra).
 *
 * Listenin **son** elemanı alınır: bir vekil adresi listeye sona ekler, yani
 * en sağdaki değer bizim Caddy'mizin gördüğü bağlantıdır. En soldaki değer
 * istemcinin kendi gönderdiği başlıktan gelebilir ve sahtelenebilir.
 */
export function istemciIp(basliklar: Headers): string {
  const son = basliklar.get("x-forwarded-for")?.split(",").pop()?.trim();
  if (son) return son;
  return basliklar.get("x-real-ip")?.trim() || "0.0.0.0";
}
