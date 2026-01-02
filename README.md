# 🎬 YÜCETÜRK MEDİA - Film ve Dizi Kataloğu

TMDB API kullanarak oluşturulmuş modern bir film ve TV dizisi keşif platformu. 

## ✨ Özellikler

- 🎥 **Popüler İçerikler**: Güncel filmler ve diziler
- 🔍 **Gelişmiş Arama**: Film, dizi ve kişi arama
- 📊 **Detaylı Bilgiler**: Film/dizi detay sayfaları, oyuncu bilgileri
- 🎨 **Modern UI**: Responsive tasarım, renkli filtreleme sistemi
- 🎯 **Filtreleme**: Film ve dizi sayfalarında gelişmiş filtreleme seçenekleri
- 📱 **Responsive**: Mobil ve masaüstü uyumlu

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+ 
- npm veya yarn
- TMDB API Key

### Kurulum

1. Repository'yi klonlayın:
```bash
git clone https://github.com/Strawbery-creator/media_films.git
cd media_films
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env.local` dosyası oluşturun:
```bash
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📦 Teknolojiler

- **Next.js 14** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling
- **TMDB API** - Film ve dizi verileri

## 🎯 Sayfalar

- `/` - Ana sayfa (Trending, Popüler içerikler)
- `/movies` - Filmler (Filtreleme ile)
- `/tv` - TV Dizileri (Filtreleme ile)
- `/tv/on-the-air` - Şu anda yayında olan diziler
- `/movie/[id]` - Film detay sayfası
- `/tv/[id]` - Dizi detay sayfası
- `/person/[id]` - Kişi detay sayfası
- `/search` - Arama sayfası

## 🎨 Özellikler

### Filtreleme Sistemi
- Sıralama seçenekleri
- Tür filtreleme
- Tarih aralığı
- Puan ve oy sayısı
- Süre filtreleme
- Dil seçimi

### Renkli Tasarım
- Her sayfa için özel renkli gradient arka planlar
- Modern ve profesyonel UI/UX

## 📝 API Key Alma

1. [TMDB](https://www.themoviedb.org/) sitesine kaydolun
2. [API Settings](https://www.themoviedb.org/settings/api) sayfasına gidin
3. "Request an API Key" butonuna tıklayın
4. API Key'inizi alın ve `.env.local` dosyasına ekleyin

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için lütfen önce bir issue açarak neyi değiştirmek istediğinizi tartışın.

## 📄 Lisans

Bu proje açık kaynaklıdır.

## 👤 Yapımcı

**YÜCETÜRK MEDİA**

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
