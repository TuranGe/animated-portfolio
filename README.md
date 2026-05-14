# Kuon — SvelteKit Portfolio

## Kurulum

> Önceki kurulumdan kalan dosyaları temizle:
```bash
rm -rf node_modules package-lock.json .svelte-kit
```

> Paketleri yükle:
```bash
npm install
```

> Geliştirme sunucusunu başlat:
```bash
npm run dev
```

> Production build:
```bash
npm run build
npm run preview
```

## Gereksinimler
- Node.js >= 20

## Teknolojiler
- SvelteKit 1.x
- TailwindCSS 3
- GSAP 3 (sayfa geçiş animasyonları + ScrollTrigger)
- Google Fonts: Playfair Display, DM Sans, JetBrains Mono

## Animasyonlar
- `PageTransition.svelte`: GSAP ile altın + koyu çift panel perde geçişi
- ScrollTrigger: scroll bazlı reveal animasyonları
- Parallax arka plan elementleri
- Özel cursor (masaüstü)
- Marquee

## Sayfalar
- `/` — Ana sayfa
- `/work` — Proje listesi
- `/work/reile` — Horizon Studio detay
- `/work/nova` — Nova Space detay
- `/work/mori` — Mori Gardens detay
- `/work/arc` — Arc Architecture detay
- `/about` — Hakkında
- `/contact` — İletişim
