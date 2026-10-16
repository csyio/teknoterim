# Sunucu kurulumu

Tekno Terim, `tigin` VPS'inde (89.252.132.96) **kendi kullanıcısı** ve **kendi
systemd servisi** ile çalışır; mevcut `csystudio.com.tr` ve
`tigin.csystudio.com.tr` kurulumlarına dokunmaz.

Sunucudaki deseni izler:

```
/opt/teknoterim            → uygulama dizini (teknoterim kullanıcısına ait)
teknoterim.service         → 127.0.0.1:8767 dinler
Caddy                    → teknoterim.com.tr'yi o porta proxy'ler, SSL otomatik
```

Sunucuda **derleme yapılmaz** (2 GB RAM, iki canlı proje var). Derleme GitHub
Actions'ta yapılır, çıktı buraya kopyalanır.

---

## 1. Alan adı

`teknoterim.com.tr` kaydını yapın ve A kaydını **89.252.132.96**'ya yönlendirin.
Caddy, DNS yayıldıktan sonra Let's Encrypt sertifikasını kendiliğinden alır.

## 2. Sunucu kurulumu (bir kez)

Depoyu sunucuya kopyalayıp betiği çalıştırın:

```bash
sudo bash infra/kur.sh
```

Betiğin yaptıkları:

| | |
|---|---|
| `teknoterim` sistem kullanıcısı | `/opt/teknoterim` ev dizini, giriş kabuğu yok |
| `/opt/teknoterim` | `2775`, setgid — dağıtım kullanıcısı yazabilir |
| `teknoterim.service` | kurulur ve `enable` edilir |
| `sudoers` kuralı | `codex` yalnızca bu servisi `restart/start/stop/status` edebilir |
| Caddy bloğu | eklenir, `caddy validate` ile doğrulanır, geri alınabilir şekilde |

Betik **tekrar çalıştırılabilir**; var olanı bozmaz. Caddy dosyası
değiştirilmeden önce zaman damgalı yedek alınır, doğrulama başarısız olursa
otomatik geri dönülür.

## 3. Dağıtım anahtarı

CI'nın sunucuya yazabilmesi için ayrı bir anahtar üretin (kişisel anahtarınızı
kullanmayın):

```bash
ssh-keygen -t ed25519 -C "teknoterim-cı-dağıtım" -f ~/.ssh/teknoterim_dagitim -N ""
cat ~/.ssh/teknoterim_dagitim.pub   # bu satırı sunucudaki codex kullanıcısına ekleyin
```

Sunucuda (`codex` kullanıcısı olarak):

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "<yukarıdaki açık anahtar>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 4. GitHub sırları

Depo → Settings → Secrets and variables → Actions:

| Sır | Değer |
|---|---|
| `SSH_SUNUCU` | `89.252.132.96` |
| `SSH_KULLANICI` | `codex` |
| `SSH_ANAHTAR` | `~/.ssh/teknoterim_dagitim` **özel** anahtarının tamamı |
| `SSH_BILINEN_ANAHTAR` | Sunucunun doğrulanmış SSH kimliği (`known_hosts` satırı, aşağıda) |

### Sunucu kimliği (`SSH_BILINEN_ANAHTAR`)

İş akışı sunucuya yalnızca bu anahtarı gösteren makineyle konuşur
(`StrictHostKeyChecking yes`). Sır tanımlı değilse dağıtım hata verip durur;
körü körüne bağlanmaz.

1. Sunucuda, kendi oturumunuzla parmak izini okuyun:

   ```bash
   ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
   ```

2. Kendi bilgisayarınızda satırı alın ve parmak izinin 1. adımla **aynı**
   olduğunu kontrol edin:

   ```bash
   ssh-keyscan -t ed25519 89.252.132.96 > bilinen.txt
   ssh-keygen -lf bilinen.txt
   ```

3. Parmak izleri aynıysa `bilinen.txt` içeriğinin tamamını
   `SSH_BILINEN_ANAHTAR` sırrına yapıştırın.

Sunucu yeniden kurulur ya da SSH anahtarı değişirse bu sırrı da güncelleyin;
aksi hâlde dağıtım "Host key verification failed" ile durur (beklenen
davranış).

## 5. İlk yayın

`main` dalına push edin. İş akışı derler, kopyalar ve servisi yeniden başlatır.

Doğrulama:

```bash
curl -I https://teknoterim.com.tr                 # 200 ve geçerli sertifika
ssh tigin-codex 'systemctl status teknoterim'     # aktif (running)
ssh tigin-codex 'journalctl -u teknoterim -n 30'  # son kayıtlar
curl -s https://teknoterim.com.tr/sitemap.xml | grep -c '<url>'   # 156 (/, /sozluk, /doviz + 153 terim)
```

---

## Geri alma

Her dağıtım öncekinin üzerine yazar. Bozuk bir sürümde önceki commit'i
`main`'e geri alıp yeniden push edin; iş akışı eski hâli yeniden yayınlar.

## Notlar

- **Veritabanı ve sırlar korunur:** `rsync --delete` kullanılıyor ama `data/`,
  `*.db*` ve `.env*` hariç tutuluyor.
- **Bellek tavanı:** servis `MemoryMax=512M` ile sınırlı; 2 GB'lık paylaşımlı
  kutuda tek bir projenin kutusunu doldurmasını engeller.
- **SQLite yedeği:** veritabanı Faz 3'te devreye girdiğinde günlük yedek
  eklenecek (`VACUUM INTO` ile snapshot + harici kopya).
