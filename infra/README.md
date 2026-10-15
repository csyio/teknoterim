# Sunucu kurulumu

Rootline, `tigin` VPS'inde (89.252.132.96) **kendi kullanıcısı** ve **kendi
systemd servisi** ile çalışır; mevcut `csystudio.com.tr` ve
`tigin.csystudio.com.tr` kurulumlarına dokunmaz.

Sunucudaki deseni izler:

```
/opt/rootline            → uygulama dizini (rootline kullanıcısına ait)
rootline.service         → 127.0.0.1:8767 dinler
Caddy                    → rootline.com.tr'yi o porta proxy'ler, SSL otomatik
```

Sunucuda **derleme yapılmaz** (2 GB RAM, iki canlı proje var). Derleme GitHub
Actions'ta yapılır, çıktı buraya kopyalanır.

---

## 1. Alan adı

`rootline.com.tr` kaydını yapın ve A kaydını **89.252.132.96**'ya yönlendirin.
Caddy, DNS yayıldıktan sonra Let's Encrypt sertifikasını kendiliğinden alır.

## 2. Sunucu kurulumu (bir kez)

Depoyu sunucuya kopyalayıp betiği çalıştırın:

```bash
sudo bash infra/kur.sh
```

Betiğin yaptıkları:

| | |
|---|---|
| `rootline` sistem kullanıcısı | `/opt/rootline` ev dizini, giriş kabuğu yok |
| `/opt/rootline` | `2775`, setgid — dağıtım kullanıcısı yazabilir |
| `rootline.service` | kurulur ve `enable` edilir |
| `sudoers` kuralı | `codex` yalnızca bu servisi `restart/start/stop/status` edebilir |
| Caddy bloğu | eklenir, `caddy validate` ile doğrulanır, geri alınabilir şekilde |

Betik **tekrar çalıştırılabilir**; var olanı bozmaz. Caddy dosyası
değiştirilmeden önce zaman damgalı yedek alınır, doğrulama başarısız olursa
otomatik geri dönülür.

## 3. Dağıtım anahtarı

CI'nın sunucuya yazabilmesi için ayrı bir anahtar üretin (kişisel anahtarınızı
kullanmayın):

```bash
ssh-keygen -t ed25519 -C "rootline-cı-dağıtım" -f ~/.ssh/rootline_dagitim -N ""
cat ~/.ssh/rootline_dagitim.pub   # bu satırı sunucudaki codex kullanıcısına ekleyin
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
| `SSH_ANAHTAR` | `~/.ssh/rootline_dagitim` **özel** anahtarının tamamı |

## 5. İlk yayın

`main` dalına push edin. İş akışı derler, kopyalar ve servisi yeniden başlatır.

Doğrulama:

```bash
curl -I https://rootline.com.tr                 # 200 ve geçerli sertifika
ssh tigin-codex 'systemctl status rootline'     # aktif (running)
ssh tigin-codex 'journalctl -u rootline -n 30'  # son kayıtlar
curl -s https://rootline.com.tr/sitemap.xml | grep -c '<url>'   # 51
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
