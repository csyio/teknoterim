/**
 * Ölçüm veritabanı: SQLite (WAL) + Drizzle.
 *
 * Neden ayrı bir dosya: sözlük içeriği git'te yaşar ve derleme zamanında
 * gömülür; ölçüm verisi ise çalışma zamanında büyür ve asla depoya girmez.
 * İkisini aynı veritabanında tutmak, içeriği "veri" sayma eğilimi doğurur.
 *
 * Dizin: varsayılan olarak çalışma dizini altındaki `data/`. Sunucuda
 * `/opt/teknoterim/data` olur — CI dağıtımı bu dizini bilinçli olarak korur
 * (bkz. .github/workflows/yayinla.yml). Yerel geliştirmede de aynı yol geçerli.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { gunMetni, konukAnahtari } from "./olcum";

const VERI_DIZINI =
  process.env.TEKNOTERIM_VERI ?? path.join(process.cwd(), "data");

/** Tek satır = bir sayfa görüntülemesi. Kişiyi tanımlayan hiçbir alan yok. */
export const olay = sqliteTable(
  "olay",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Görüntüleme anı (Unix ms). */
    an: integer("an").notNull(),
    /** Türkiye saatine göre gün; raporlar bu alana göre gruplanır. */
    gun: text("gun").notNull(),
    yol: text("yol").notNull(),
    /** Günlük dönen ziyaretçi anahtarı — günler arası takip mümkün değil. */
    konuk: text("konuk").notNull(),
    /** Yönlendiren alan adı ya da null (iç gezinme ve doğrudan girişler). */
    kaynak: text("kaynak"),
  },
  (t) => [index("olay_gun").on(t.gun), index("olay_yol").on(t.gun, t.yol)]
);

/**
 * Tablolar `IF NOT EXISTS` ile kurulur.
 *
 * Şema değişikliği gerektiğinde bu yaklaşım yetmez; o noktada `drizzle-kit`
 * ile sürümlü göçlere geçilir. Şimdilik şema tek tablo ve veri kaybı kabul
 * edilebilir olduğu için ek bağımlılık eklemedik.
 */
const KURULUM = `
CREATE TABLE IF NOT EXISTS olay (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  an     INTEGER NOT NULL,
  gun    TEXT    NOT NULL,
  yol    TEXT    NOT NULL,
  konuk  TEXT    NOT NULL,
  kaynak TEXT
);
CREATE INDEX IF NOT EXISTS olay_gun ON olay (gun);
CREATE INDEX IF NOT EXISTS olay_yol ON olay (gun, yol);
`;

let sqlite: Database.Database | null = null;
let db: ReturnType<typeof drizzle> | null = null;
let tuz = "";

/** Tuz ilk çalıştırmada üretilir ve dosyada kalır; dosya kaybolursa tekil
 *  ziyaretçi sayımı sıfırdan başlar (veri kaybı değil, ölçüm kesintisi). */
function tuzOku(): string {
  const tuzYolu = path.join(VERI_DIZINI, "olcum-tuz");
  if (!existsSync(tuzYolu)) {
    writeFileSync(tuzYolu, randomBytes(32).toString("hex"), { mode: 0o600 });
  }
  return readFileSync(tuzYolu, "utf8").trim();
}

function baglan() {
  if (sqlite && db) return { sqlite, db };

  mkdirSync(VERI_DIZINI, { recursive: true });
  const yeni = new Database(path.join(VERI_DIZINI, "analytics.db"));
  // WAL: okuma yazmayı beklemez — raporu çalıştırırken site çalışmaya devam eder.
  yeni.pragma("journal_mode = WAL");
  yeni.pragma("synchronous = NORMAL");
  yeni.pragma("busy_timeout = 5000");
  yeni.exec(KURULUM);

  tuz = tuzOku();
  sqlite = yeni;
  db = drizzle(yeni, { schema: { olay } });
  return { sqlite, db };
}

export type OlayKaydi = {
  yol: string;
  kaynak: string | null;
  /** Yalnızca anahtar üretmek için kullanılır, kaydedilmez. */
  ip: string;
  tarayici: string;
};

/** Tek bir görüntülemeyi kaydeder. Veritabanı hatası yukarıya taşınır; çağıran
 *  taraf yutar, çünkü ölçüm hatası sitenin çalışmasını etkilememeli. */
export function olayYaz(kayit: OlayKaydi): void {
  const { db } = baglan();
  const an = Date.now();
  const gun = gunMetni(an);
  db.insert(olay)
    .values({
      an,
      gun,
      yol: kayit.yol,
      konuk: konukAnahtari(tuz, gun, kayit.ip, kayit.tarayici),
      kaynak: kayit.kaynak,
    })
    .run();
}

/** Veritabanının yolu; rapor aracı ve yedekleme aynı yolu kullanır. */
export function veritabaniYolu(): string {
  return path.join(VERI_DIZINI, "analytics.db");
}
