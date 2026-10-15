---
slug: "sql-enjeksiyonu"
baslik: "SQL Enjeksiyonu"
kategori: "Ağ/Güvenlik"
ozet: "Kullanıcı girdisinin temizlenmeden veritabanı sorgusuna eklenmesiyle oluşan uygulama açığı."
isler:
  - "Saldırı müdahalesi"
  - "Geliştirici talebi"
  - "Olay müdahale"
kaynaklar: []
---

## Ne amaçla kullanılır

Uygulama kaynaklı veri sızıntılarının en bilinen örneğini tanımlamak için kullanılır. Saldırgan sorgunun içine kendi SQL parçasını ekleyerek veri okur, değiştirir veya siler. Girdi yalnızca form alanı değildir; adres satırındaki her parametre de girdidir. Kalıcı çözüm girdiyi filtrelemek değil, sorguları parametreli yazmaktır.

## Örnek

Adres satırındaki bir parametre sorguya doğrudan ekleniyorsa, saldırgan tek istekle tablodaki tüm e-posta adreslerini dışarı alabilir.
