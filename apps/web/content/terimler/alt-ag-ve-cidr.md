---
slug: "alt-ag-ve-cidr"
baslik: "Alt Ağ ve CIDR"
kategori: "Ağ/Güvenlik"
ozet: "Ağın daha küçük parçalara bölünmesi ve bu parçaların 192.168.1.0/24 gibi bir önek uzunluğuyla yazılması."
isler:
  - "Altyapı tasarımı"
  - "Erişim kuralı"
  - "İlk kurulum"
kaynaklar: []
---

## Ne amaçla kullanılır

Ağın büyüklüğünü ve erişim sınırlarını tek satırda ifade etmek için kullanılır. Sondaki sayı, adresin kaç bitinin ağa ait olduğunu söyler: sayı büyüdükçe ağ küçülür. Güvenlik duvarı kuralları, VPN tanımları ve yönlendirme kararları bu gösterimle yazıldığı için yanlış önek, kuralların yanlış genişlikte olmasına yol açar.

## Örnek

/24 ile yazılan bir ağ 254 kullanılabilir adres içerir; ikiye bölündüğünde her /25 parçasında 126 adres kalır.
