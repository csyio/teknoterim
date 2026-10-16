#!/usr/bin/env bash
#
# teknoterim — sunucu kurulum betiği (bir kez çalıştırılır)
#
#   sudo bash infra/kur.sh
#
# Yaptıkları:
#   1. "teknoterim" sistem kullanıcısı + /opt/teknoterim dizini
#   2. systemd birimi (teknoterim.service)
#   3. codex kullanıcısına sınırlı dağıtım yetkisi (rsync için grup, restart için sudo)
#   4. Caddy'ye teknoterim.com.tr bloğu (doğrulayıp yeniden yükler)
#
# Mevcut csystudio.com.tr ve tigin.csystudio.com.tr kurulumlarına dokunmaz.
# Tekrar çalıştırılabilir; var olanı bozmaz.

set -euo pipefail

UYGULAMA_KULLANICI=teknoterim
UYGULAMA_DIZIN=/opt/teknoterim
DAGITIM_KULLANICI=codex
BIRIM=teknoterim.service
CADDYFILE=/etc/caddy/Caddyfile
BETIK_DIZINI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ $EUID -ne 0 ]]; then
  echo "Bu betik root yetkisi ister: sudo bash infra/kur.sh" >&2
  exit 1
fi

adim() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }

# ---------------------------------------------------------------- 1. kullanıcı
adim "Uygulama kullanıcısı ve dizini"
if getent passwd "$UYGULAMA_KULLANICI" >/dev/null; then
  echo "  $UYGULAMA_KULLANICI zaten var, atlanıyor."
else
  # Ev dizini uygulama dizinidir; içi aşağıda ayrıca kurulur, iskelet
  # dosyaları (.bashrc vb.) gerekmez.
  useradd --system --no-create-home --home-dir "$UYGULAMA_DIZIN" \
    --shell /usr/sbin/nologin "$UYGULAMA_KULLANICI"
  echo "  $UYGULAMA_KULLANICI oluşturuldu."
fi
mkdir -p "$UYGULAMA_DIZIN"

# Dağıtım kullanıcısı bu dizine yazabilsin (setgid: yeni dosyalar da gruba ait olsun).
if getent passwd "$DAGITIM_KULLANICI" >/dev/null; then
  usermod -aG "$UYGULAMA_KULLANICI" "$DAGITIM_KULLANICI"
  echo "  $DAGITIM_KULLANICI → $UYGULAMA_KULLANICI grubuna eklendi."
else
  echo "  UYARI: $DAGITIM_KULLANICI kullanıcısı yok; grup izni atlandı."
fi
chown -R "$UYGULAMA_KULLANICI:$UYGULAMA_KULLANICI" "$UYGULAMA_DIZIN"
chmod 2775 "$UYGULAMA_DIZIN"
echo "  $UYGULAMA_DIZIN hazır (2775)."

# ----------------------------------------------------------------- 2. systemd
adim "systemd birimi"
install -m 0644 "$BETIK_DIZINI/$BIRIM" "/etc/systemd/system/$BIRIM"
systemctl daemon-reload
systemctl enable "$BIRIM" >/dev/null
echo "  $BIRIM kuruldu ve etkinleştirildi."

# --------------------------------------------------- 3. dağıtım yetkisi (sudo)
adim "Dağıtım için sınırlı sudo yetkisi"
SUDOERS=/etc/sudoers.d/teknoterim-dagitim
cat > "$SUDOERS" <<EOF
# teknoterim dağıtımı: $DAGITIM_KULLANICI yalnızca bu servisi yönetebilir.
$DAGITIM_KULLANICI ALL=(root) NOPASSWD: /usr/bin/systemctl restart $BIRIM, /usr/bin/systemctl start $BIRIM, /usr/bin/systemctl stop $BIRIM, /usr/bin/systemctl is-active $BIRIM, /usr/bin/systemctl status $BIRIM
EOF
chmod 0440 "$SUDOERS"
if visudo -cf "$SUDOERS" >/dev/null; then
  echo "  $SUDOERS yazıldı ve doğrulandı."
else
  rm -f "$SUDOERS"
  echo "  UYARI: sudoers dosyası doğrulanamadı, geri alındı." >&2
fi

# ------------------------------------------------------------------- 4. Caddy
adim "Caddy site bloğu"
if grep -q '^teknoterim.com.tr' "$CADDYFILE" 2>/dev/null; then
  echo "  teknoterim.com.tr bloğu zaten var, atlanıyor."
else
  cp -a "$CADDYFILE" "$CADDYFILE.yedek-$(date +%Y%m%d-%H%M%S)"
  echo "  Mevcut dosya yedeklendi."
  printf '\n' >> "$CADDYFILE"
  cat "$BETIK_DIZINI/Caddyfile.blok" >> "$CADDYFILE"
  if caddy validate --config "$CADDYFILE" >/dev/null 2>&1; then
    systemctl reload caddy
    echo "  Blok eklendi, yapılandırma doğrulandı, Caddy yeniden yüklendi."
  else
    echo "  HATA: Caddy yapılandırması geçersiz. Yedekten geri dönülüyor." >&2
    son_yedek=$(ls -1t "$CADDYFILE".yedek-* | head -1)
    cp -a "$son_yedek" "$CADDYFILE"
    echo "  Geri alındı: $son_yedek" >&2
    exit 1
  fi
fi

# ------------------------------------------------------------------- özet
adim "Kurulum tamam"
if [[ -f "$UYGULAMA_DIZIN/server.js" ]]; then
  systemctl restart "$BIRIM"
  echo "  Uygulama bulundu, servis başlatıldı."
else
  echo "  Henüz uygulama kopyalanmadı (server.js yok)."
  echo "  İlk dağıtımdan sonra: sudo systemctl restart $BIRIM"
fi
cat <<'NOT'

Sıradaki adımlar
  1. teknoterim.com.tr için A kaydını 89.252.132.96'ya yönlendirin.
  2. GitHub deposuna dağıtım anahtarını ekleyin (bkz. infra/README.md).
  3. İlk dağıtımı çalıştırın; sonra: curl -I https://teknoterim.com.tr
NOT
