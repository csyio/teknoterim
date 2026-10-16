---
slug: "dikey-ve-yatay-olceklendirme"
baslik: "Dikey ve Yatay Ölçeklendirme"
kategori: "Sunucu/Hosting"
ozet: "Kapasite artırmanın iki yolu: mevcut sunucuya kaynak eklemek (dikey) veya sunucu sayısını artırmak (yatay)."
isler:
  - "Kapasite planlama"
  - "Mimari tasarım"
  - "Yüksek trafik çözümü"
kaynaklar: []
---

## Ne amaçla kullanılır

Büyüme karşısında hangi yolun izleneceğine karar vermek için kullanılır. Dikey ölçeklendirme basittir, ek yazılım gerektirmez, ama donanım sınırına dayanır ve genellikle yeniden başlatma ister. Yatay ölçeklendirme sınıra yaklaşmadan büyür, ancak uygulamanın birden fazla sunucuda çalışacak biçimde yazılmış olmasını şart koşar.

## Örnek

Oturum bilgisini yalnızca kendi belleğinde tutan bir uygulama, ikinci sunucu eklendiği anda kullanıcıları rastgele çıkış yaptırmaya başlar.
