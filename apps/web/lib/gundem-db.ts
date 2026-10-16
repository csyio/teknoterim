/**
 * Gündem veritabanı: ölçümle aynı SQLite dosyası, ayrı tablolar.
 *
 * Aynı dosyayı iki süreç kullanır: site (onay, yayın) ve saatlik toplayıcı
 * (araclar/gundem.ts). WAL kipi ve `busy_timeout` sayesinde biri yazarken
 * diğeri bekler, kilit hatası almaz.
 *
 * Bağlantı `olcum-db.ts` ile aynı biçimde kurulur ama ondan bağımsızdır:
 * toplayıcı ayrı bir süreçte, Next olmadan çalışır ve ölçüm koduna ihtiyaç
 * duymaz.
 *
 * Bir haberin yaşamı (`durum`):
 *
 *   yeni ──puan──▶ elendi                (eşiğin altı)
 *        └───────▶ aday ──taslak──▶ taslak ──▶ yayinda ──▶ atildi (kaldırıldı)
 *                    │                  └────▶ atildi
 *                    └──(48 saat bekledi)──▶ eskidi
 */

import { mkdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { and, desc, eq, gte, inArray, lt, ne, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type Durum = "yeni" | "elendi" | "aday" | "taslak" | "yayinda" | "atildi" | "eskidi";

export const gundemHaber = sqliteTable(
  "gundem_haber",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Normalleştirilmiş adresin özeti; aynı haber iki kez alınmaz. */
    kimlik: text("kimlik").notNull().unique(),
    /** `gundem-kaynaklar.ts` içindeki kaynak kimliği. */
    kaynak: text("kaynak").notNull(),
    /** Kaynaktaki özgün başlık (editöre gösterilir, sitede gösterilmez). */
    baslik: text("baslik").notNull(),
    baglanti: text("baglanti").notNull(),
    /** Beslemedeki kısa açıklama; yalnızca ayıklamada kullanılır. */
    aciklama: text("aciklama").notNull().default(""),
    yayinAni: integer("yayin_ani"),
    toplanmaAni: integer("toplanma_ani").notNull(),
    durum: text("durum").$type<Durum>().notNull().default("yeni"),
    puan: integer("puan"),
    puanGerekce: text("puan_gerekce"),
    taslakBaslik: text("taslak_baslik"),
    taslakOzet: text("taslak_ozet"),
    taslakAni: integer("taslak_ani"),
    /** Taslağın yazıldığı gün (TR); günlük tavan buna göre sayılır. */
    taslakGun: text("taslak_gun"),
    /**
     * 0 = Claude taslağı. 1 = API anahtarı olmadan üretilmiş sahte taslak;
     * yayınlanamaz. 2 = sahte taslaktı, metni tamamen editör yazdı (sitede
     * "yapay zekâ taslağı" değil "editör yazısı" notu çıkar).
     */
    sahte: integer("sahte").notNull().default(0),
    /** Editöre gösterilecek uyarı (ör. kaynakla örtüşen ifade). */
    uyari: text("uyari"),
    /** 1 = editör metni elle düzeltti. */
    duzenlendi: integer("duzenlendi").notNull().default(0),
    kararAni: integer("karar_ani"),
  },
  (t) => [index("gundem_durum").on(t.durum), index("gundem_taslak_gun").on(t.taslakGun)]
);

/** Yönetim oturumları. Çerezdeki belirtecin kendisi değil, özeti saklanır. */
export const yonetimOturum = sqliteTable("yonetim_oturum", {
  ozet: text("ozet").primaryKey(),
  olusturma: integer("olusturma").notNull(),
  bitis: integer("bitis").notNull(),
});

/** Toplayıcının her çalışmasının kısa kaydı (yönetim sayfasında gösterilir). */
export const gundemCalisma = sqliteTable("gundem_calisma", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  an: integer("an").notNull(),
  toplanan: integer("toplanan").notNull(),
  puanlanan: integer("puanlanan").notNull(),
  taslak: integer("taslak").notNull(),
  hata: integer("hata").notNull(),
  sahte: integer("sahte").notNull(),
});

const KURULUM = `
CREATE TABLE IF NOT EXISTS gundem_haber (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  kimlik        TEXT    NOT NULL UNIQUE,
  kaynak        TEXT    NOT NULL,
  baslik        TEXT    NOT NULL,
  baglanti      TEXT    NOT NULL,
  aciklama      TEXT    NOT NULL DEFAULT '',
  yayin_ani     INTEGER,
  toplanma_ani  INTEGER NOT NULL,
  durum         TEXT    NOT NULL DEFAULT 'yeni',
  puan          INTEGER,
  puan_gerekce  TEXT,
  taslak_baslik TEXT,
  taslak_ozet   TEXT,
  taslak_ani    INTEGER,
  taslak_gun    TEXT,
  sahte         INTEGER NOT NULL DEFAULT 0,
  uyari         TEXT,
  duzenlendi    INTEGER NOT NULL DEFAULT 0,
  karar_ani     INTEGER
);
CREATE INDEX IF NOT EXISTS gundem_durum ON gundem_haber (durum);
CREATE INDEX IF NOT EXISTS gundem_taslak_gun ON gundem_haber (taslak_gun);

CREATE TABLE IF NOT EXISTS yonetim_oturum (
  ozet      TEXT    PRIMARY KEY,
  olusturma INTEGER NOT NULL,
  bitis     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS gundem_calisma (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  an        INTEGER NOT NULL,
  toplanan  INTEGER NOT NULL,
  puanlanan INTEGER NOT NULL,
  taslak    INTEGER NOT NULL,
  hata      INTEGER NOT NULL,
  sahte     INTEGER NOT NULL
);
`;

let db: ReturnType<typeof drizzle> | null = null;

function baglan() {
  if (db) return db;
  // Yol olcum-db.ts ile aynı kuraldan gelir: aynı dosya, ayrı tablolar.
  const dizin = process.env.TEKNOTERIM_VERI ?? path.join(process.cwd(), "data");
  mkdirSync(dizin, { recursive: true });
  const yeni = new Database(path.join(dizin, "analytics.db"));
  yeni.pragma("journal_mode = WAL");
  yeni.pragma("synchronous = NORMAL");
  yeni.pragma("busy_timeout = 5000");
  yeni.exec(KURULUM);
  db = drizzle(yeni);
  return db;
}

export type Haber = typeof gundemHaber.$inferSelect;

// ------------------------------------------------------------------ toplayıcı

export type YeniHaber = {
  kimlik: string;
  kaynak: string;
  baslik: string;
  baglanti: string;
  aciklama: string;
  yayinAni: number | null;
};

/** Yeni haberleri ekler; daha önce görülenler sessizce atlanır. Eklenen sayısını döner. */
export function haberleriEkle(haberler: YeniHaber[], an = Date.now()): number {
  if (haberler.length === 0) return 0;
  const d = baglan();
  let eklenen = 0;
  for (const h of haberler) {
    const sonuc = d
      .insert(gundemHaber)
      .values({ ...h, toplanmaAni: an })
      .onConflictDoNothing({ target: gundemHaber.kimlik })
      .run();
    eklenen += sonuc.changes;
  }
  return eklenen;
}

export function puanlanacaklar(enFazla: number): Haber[] {
  return baglan()
    .select()
    .from(gundemHaber)
    .where(eq(gundemHaber.durum, "yeni"))
    .orderBy(desc(gundemHaber.toplanmaAni))
    .limit(enFazla)
    .all();
}

export function puanYaz(id: number, puan: number, gerekce: string, durum: "aday" | "elendi"): void {
  baglan()
    .update(gundemHaber)
    .set({ puan, puanGerekce: gerekce, durum })
    .where(and(eq(gundemHaber.id, id), eq(gundemHaber.durum, "yeni")))
    .run();
}

/**
 * Puanlanamayan haber (model reddetti ya da yanıtta yoktu): her saat yeniden
 * Claude'a gönderilip para harcatmasın diye bırakılır.
 */
export function puanlanamadi(id: number, gerekce: string): void {
  baglan()
    .update(gundemHaber)
    .set({ durum: "elendi", puanGerekce: gerekce })
    .where(and(eq(gundemHaber.id, id), eq(gundemHaber.durum, "yeni")))
    .run();
}

/**
 * Uzun süre puanlanamayan ya da taslak sırası gelmeyen haberler artık
 * gündem değildir; bir daha denenmez.
 */
export function eskileriKapat(sinirAn: number): number {
  return baglan()
    .update(gundemHaber)
    .set({ durum: "eskidi" })
    .where(and(inArray(gundemHaber.durum, ["yeni", "aday"]), lt(gundemHaber.toplanmaAni, sinirAn)))
    .run().changes;
}

/** Taslak aşamasında uygun bulunmayan aday (model reddetti, kaynak okunamadı vb.). */
export function adayiEle(id: number, gerekce: string): void {
  baglan()
    .update(gundemHaber)
    .set({ durum: "elendi", puanGerekce: gerekce })
    .where(and(eq(gundemHaber.id, id), eq(gundemHaber.durum, "aday")))
    .run();
}

/** Taslak sırası: önce en yüksek puan, sonra en yeni. */
export function adaylar(enFazla: number): Haber[] {
  return baglan()
    .select()
    .from(gundemHaber)
    .where(eq(gundemHaber.durum, "aday"))
    .orderBy(desc(gundemHaber.puan), desc(sql`coalesce(${gundemHaber.yayinAni}, ${gundemHaber.toplanmaAni})`))
    .limit(enFazla)
    .all();
}

export function bugunkuTaslakSayisi(gun: string): number {
  const satir = baglan()
    .select({ sayi: sql<number>`count(*)` })
    .from(gundemHaber)
    .where(eq(gundemHaber.taslakGun, gun))
    .get();
  return satir?.sayi ?? 0;
}

export type TaslakGirdisi = {
  baslik: string;
  ozet: string;
  sahte: boolean;
  uyari: string | null;
  an: number;
  gun: string;
};

export function taslakKaydet(id: number, t: TaslakGirdisi): void {
  baglan()
    .update(gundemHaber)
    .set({
      durum: "taslak",
      taslakBaslik: t.baslik,
      taslakOzet: t.ozet,
      sahte: t.sahte ? 1 : 0,
      uyari: t.uyari,
      taslakAni: t.an,
      taslakGun: t.gun,
    })
    .where(and(eq(gundemHaber.id, id), eq(gundemHaber.durum, "aday")))
    .run();
}

/**
 * Son günlerde taslağa ya da yayına giren haberlerin başlıkları: ayıklamada
 * Claude'a verilir ki aynı olayı anlatan ikinci haberi tekrar seçmesin.
 */
export function sonBasliklar(sinirAn: number): string[] {
  return baglan()
    .select({ baslik: gundemHaber.baslik })
    .from(gundemHaber)
    .where(
      and(
        inArray(gundemHaber.durum, ["aday", "taslak", "yayinda"]),
        gte(gundemHaber.toplanmaAni, sinirAn)
      )
    )
    .orderBy(desc(gundemHaber.toplanmaAni))
    .limit(150)
    .all()
    .map((s) => s.baslik);
}

export type CalismaOzeti = Omit<typeof gundemCalisma.$inferInsert, "id">;

export function calismaKaydet(c: CalismaOzeti): void {
  baglan().insert(gundemCalisma).values(c).run();
}

export function sonCalisma(): typeof gundemCalisma.$inferSelect | null {
  return baglan().select().from(gundemCalisma).orderBy(desc(gundemCalisma.an)).limit(1).get() ?? null;
}

// ------------------------------------------------------------------- yönetim

export function bekleyenTaslaklar(): Haber[] {
  return baglan()
    .select()
    .from(gundemHaber)
    .where(eq(gundemHaber.durum, "taslak"))
    .orderBy(desc(gundemHaber.puan), desc(gundemHaber.taslakAni))
    .all();
}

export function haberGetir(id: number): Haber | null {
  return baglan().select().from(gundemHaber).where(eq(gundemHaber.id, id)).get() ?? null;
}

/**
 * Yayınla: yalnızca bekleyen ve sahte olmayan taslak. Sahte taslak önce
 * "Düzelt" ile editörün kendi metnine dönüşmelidir.
 */
export function yayinla(id: number, an = Date.now()): boolean {
  return (
    baglan()
      .update(gundemHaber)
      .set({ durum: "yayinda", kararAni: an })
      .where(and(eq(gundemHaber.id, id), eq(gundemHaber.durum, "taslak"), ne(gundemHaber.sahte, 1)))
      .run().changes === 1
  );
}

/** At: bekleyen taslağı reddeder ya da yayındaki haberi kaldırır. */
export function at(id: number, an = Date.now()): boolean {
  return (
    baglan()
      .update(gundemHaber)
      .set({ durum: "atildi", kararAni: an })
      .where(and(eq(gundemHaber.id, id), inArray(gundemHaber.durum, ["taslak", "yayinda"])))
      .run().changes === 1
  );
}

/**
 * Düzelt: editörün metni taslağın yerine geçer. Sahte taslak düzeltilince
 * "editör yazısı" olur (2); Claude taslağı Claude taslağı olarak kalır.
 */
export function duzelt(id: number, baslik: string, ozet: string): boolean {
  return (
    baglan()
      .update(gundemHaber)
      .set({
        taslakBaslik: baslik,
        taslakOzet: ozet,
        sahte: sql`case when ${gundemHaber.sahte} = 1 then 2 else ${gundemHaber.sahte} end`,
        duzenlendi: 1,
        uyari: null,
      })
      .where(and(eq(gundemHaber.id, id), inArray(gundemHaber.durum, ["taslak", "yayinda"])))
      .run().changes === 1
  );
}

// ------------------------------------------------------------------- yayın

export type YayindakiHaber = {
  id: number;
  kaynak: string;
  baglanti: string;
  baslik: string;
  ozet: string;
  /** Kaynaktaki yayın anı; yoksa toplandığı an. */
  an: number;
  /** Metni tamamen editör yazdı (sahte taslaktan). */
  editorYazisi: boolean;
};

export function yayindakiler(enFazla = 60): YayindakiHaber[] {
  const zaman = sql<number>`coalesce(${gundemHaber.yayinAni}, ${gundemHaber.toplanmaAni})`;
  return baglan()
    .select({
      id: gundemHaber.id,
      kaynak: gundemHaber.kaynak,
      baglanti: gundemHaber.baglanti,
      baslik: sql<string>`${gundemHaber.taslakBaslik}`,
      ozet: sql<string>`${gundemHaber.taslakOzet}`,
      an: zaman,
      editorYazisi: sql<boolean>`${gundemHaber.sahte} = 2`,
    })
    .from(gundemHaber)
    .where(eq(gundemHaber.durum, "yayinda"))
    .orderBy(desc(zaman), desc(gundemHaber.id))
    .limit(enFazla)
    .all()
    .map((h) => ({ ...h, editorYazisi: Boolean(h.editorYazisi) }));
}

// ------------------------------------------------------------------ oturum

export function oturumEkle(ozet: string, bitis: number, an = Date.now()): void {
  const d = baglan();
  d.delete(yonetimOturum).where(lt(yonetimOturum.bitis, an)).run();
  d.insert(yonetimOturum).values({ ozet, olusturma: an, bitis }).run();
}

export function oturumGecerli(ozet: string, an = Date.now()): boolean {
  const satir = baglan()
    .select({ bitis: yonetimOturum.bitis })
    .from(yonetimOturum)
    .where(eq(yonetimOturum.ozet, ozet))
    .get();
  return !!satir && satir.bitis > an;
}

export function oturumSil(ozet: string): void {
  baglan().delete(yonetimOturum).where(eq(yonetimOturum.ozet, ozet)).run();
}
