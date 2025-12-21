# 🔧 Cloudflare Pages Build Hatası Düzeltme

## ❌ SORUN

Build output directory yanlış ayarlanmış:
- ❌ Yanlış: `.next/static`
- ✅ Doğru: `.next` (veya boş bırak)

## ✅ ÇÖZÜM

### 1. Cloudflare Pages Build Ayarları

**Cloudflare Pages Dashboard'da:**

1. **Pages** > Projeniz > **Settings** > **Builds & deployments**

2. **Build settings** bölümünde:

   **Build command:**
   ```
   npm install && npm run build
   ```

   **Build output directory:**
   ```
   .next
   ```
   VEYA boş bırak (Cloudflare otomatik algılar)

   **Root directory:**
   - Boş bırak

3. **Environment variables:**
   - `NEXT_PUBLIC_TMDB_API_KEY` = API key'iniz

4. **Node.js version:**
   - `18.x` veya `20.x` seç

5. **Save** tıkla

### 2. Yeni Deploy

1. **Deployments** sekmesine git
2. **Retry deployment** veya **Redeploy** tıkla
3. Build başlar (5-10 dakika)

---

## 📝 DOĞRU AYARLAR ÖZET

| Ayar | Değer |
|------|-------|
| Framework preset | Next.js |
| Build command | `npm install && npm run build` |
| Build output directory | `.next` (veya boş) |
| Root directory | (boş) |
| Node.js version | 18.x veya 20.x |
| Environment variable | `NEXT_PUBLIC_TMDB_API_KEY` |

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Output directory:** `.next/static` DEĞİL, `.next` olmalı
2. **Image optimization:** `next.config.js`'de `unoptimized: true` yapıldı (Cloudflare için)
3. **Build command:** `npm install && npm run build` (node_modules yüklenmesi için)

---

## 🔄 SONRAKI ADIMLAR

Build başarılı olduktan sonra:
1. ✅ Domain ekle (newspublic.org)
2. ✅ SSL ayarları (Full mode)
3. ✅ Test et

---

**Başarılar! 🎉**

