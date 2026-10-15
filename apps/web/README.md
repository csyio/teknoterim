# rootline — web uygulaması

Next.js 16 (App Router, TypeScript) ile yazılmıştır. İçerik `content/terimler/`
altındaki Markdown dosyalarından okunur ve derleme zamanında statik sayfalara
dönüştürülür.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # üretim derlemesi
```

Node 22 gerekir (bkz. `.nvmrc`).

Projenin tamamı ve içerik kuralları için depo kökündeki
[README](../../README.md), sunucu ve dağıtım için
[infra/README.md](../../infra/README.md).
