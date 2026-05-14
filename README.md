# 🌙 TuranGe — SvelteKit Portfolio

Bu proje, ödüllü web tasarımcısı Kuon Yagi'nin ikonik portföy sitesinden ilham alınarak geliştirilmiş, etkileşimli ve modern bir web portföyüdür. Projenin kodlama, tasarım uyarlaması ve özellikle karmaşık animasyonlarının koda dökülmesi **Claude AI** yapay zeka asistanı kullanılarak gerçekleştirilmiştir.

Yapay zeka destekli web geliştirmenin gücünü sergileyen bu site, estetik tasarımı, özel sayfa geçişleri ve akıcı etkileşimleriyle orijinal projenin ruhunu yansıtmayı amaçlamaktadır.

## 🚀 Canlı Demo
Kuon Yagi'nin portföy sitesi için: **[Kuon Yagi - Netlify](https://turange-animated-portfolio.vercel.app/)**
Projeyi canlı olarak incelemek için: **[TuranGe Portfolio - Vercel](https://kuon-yagi-portfolio.netlify.app/)**

## 🤖 Claude AI ile Geliştirme Süreci
Bu proje, gelişmiş bir yapay zeka modelinin karmaşık frontend yapılarını hayata geçirmede nasıl etkili kullanılabileceğine dair harika bir örnektir. Claude AI özellikle şu konularda aktif rol oynamıştır:
- SvelteKit mimarisinin, bileşen (component) yapısının ve rotaların kurgulanması.
- GSAP ScrollTrigger entegrasyonu ve altın/koyu çift panel perde geçişi gibi gelişmiş sayfa animasyonlarının yazılması.
- TailwindCSS kullanılarak responsive tasarımın tüm cihazlar için kusursuz hale getirilmesi.

## ✨ Animasyonlar ve Özellikler
- **Sayfa Geçişleri (`PageTransition.svelte`):** GSAP ile tasarlanmış altın ve koyu renkli çift panel perde geçiş animasyonu.
- **Scroll Etkileşimleri:** GSAP ScrollTrigger destekli kaydırma bazlı (scroll-based) reveal animasyonları.
- **Parallax Efektleri:** Derinlik hissi veren parallax arka plan elementleri.
- **Marquee:** Akıcı kayan yazı (marquee) efektleri.

## 🛠️ Teknolojiler
- **Frontend:** SvelteKit
- **Stil:** TailwindCSS 3 / CSS3
- **Animasyon:** GSAP 3 (Sayfa geçişleri ve ScrollTrigger)
- **Tipografi:** Google Fonts (Playfair Display, DM Sans, JetBrains Mono)
- **Gereksinimler:** Node.js >= 20

## 📂 Sayfa Yapısı
- `/` — Ana sayfa
- `/work/reile` — Horizon Studio detay
- `/work/nova` — Nova Space detay
- `/work/mori` — Mori Gardens detay
- `/work/arc` — Arc Architecture detay
- `/about` — Hakkında
- `/contact` — İletişim

## ⚙️ Kurulum ve Çalıştırma

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

## 👨‍💻 Geliştirici Hakkında
Yazılım geliştirme tutkusu ile makine mühendisliği disiplinini harmanlayan bir vizyonla hareket ediyorum. Bir yandan üniversitede eğitimime devam edip Teknofest İnsansız Kara Aracı (İKA) gibi projelerde yer alarak 3D modelleme (SolidWorks, Fusion 360) alanında çalışmalar yürütürken; diğer yandan SvelteKit, TypeScript ve modern web teknolojileri ile dijital dünyada estetik ve işlevsel arayüzler inşa ediyorum.