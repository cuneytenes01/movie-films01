import { load } from 'cheerio';

export interface TVScheduleItem {
  time: string;
  title: string;
  channel: string;
  channelLogo?: string;
  type?: 'dizi' | 'film' | 'program'; // İçerik tipi
  genre?: string; // Opsiyonel tür bilgisi
  duration?: string; // Opsiyonel süre (örn: "120 dk")
}

// Bugünkü maç verisi
export interface TodayMatch {
  time: string; // "04.01.2026 14:30"
  homeTeam: string; // "Lazio"
  awayTeam: string; // "Napoli"
  channels: string[]; // ["S Sport Plus", "Tivibu Spor 1", "S Sport 2"]
  sport: 'futbol' | 'basketbol';
}

// Bugünkü dizi verisi
export interface TodaySeriesItem {
  time: string;
  title: string;
  channel: string;
  channelLogo?: string;
  type: 'dizi';
  genre?: string;
  episode?: string; // "Bölüm 5" gibi
}

// Bugünkü film verisi
export interface TodayMovieItem {
  time: string;
  title: string;
  channel: string;
  channelLogo?: string;
  type: 'film';
  genre?: string;
  duration?: string;
}

export interface TVSchedule {
  date: string;
  items: TVScheduleItem[];
}

// Kanal bazlı yayın akışı
export interface TVScheduleByChannel {
  channel: string;
  channelLogo?: string;
  movies: TVScheduleItem[];
  series: TVScheduleItem[];
  programs: TVScheduleItem[];
}

// TV kanal logoları mapping - tvyayinakisi.com'dan alınan logo URL'leri
const CHANNEL_LOGOS: Record<string, string> = {
  'KANAL D': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/kanald-logo-150x131.webp',
  'ATV': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/ATV-150x150.webp',
  'SHOW TV': 'https://www.tvyayinakisi.com/wp-content/uploads/2025/08/Show-TV-150x150.webp',
  'STAR TV': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/star-logo-150x150.jpg',
  'NOW': 'https://tpsbayxekmes.merlincdn.net//img/logos/logo.svg',
  'TRT 1': 'https://www.tvyayinakisi.com/wp-content/uploads/2025/08/TRT_1_logo_2021-.svg_-150x150.webp',
  'TRT TÜRK': 'https://yt3.googleusercontent.com/_hMhvMb_k2zs9MKnOXMEtcmYYVH5nGVDmRsPElkBt1o6W0s5zMNHUzj_RG5x0XH47YrNIsZwfw=s900-c-k-c0x00ffffff-no-rj',
  'TRT KURDİ': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/trt-kurdi-logo-150x150.webp',
  'TV8': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/Q1eMnkyc3Zh1mMXRccrChMR5gLBJI7RWAAFax46q.png',
  'FX': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/fx-logo-150x150.webp',
  'A2': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/a2-logo-150x150.webp',
  'KANAL 7': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/kanal-7-logo-150x150.webp',
  'TEVE2': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/teve-2-2.png',
  'BEYAZ TV': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/beyaz-tv-150x150.webp',
  '360': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/360-logo-150x150.webp',
  'CARTOON NETWORK': 'https://www.tvyayinakisi.com/wp-content/uploads/2020/05/cn-loho-150x150.png',
};

// Kanal isimlerini normalize et
function normalizeChannelName(channel: string): string {
  return channel.trim().toUpperCase();
}

// Kanal logosu URL'ini getir (fallback mekanizması ile)
export function getChannelLogoUrl(channel: string): string | undefined {
  const normalized = normalizeChannelName(channel);
  const logoUrl = CHANNEL_LOGOS[normalized];
  
  // Eğer logo bulunamazsa, alternatif kaynaklar dene
  if (!logoUrl) {
    // FX için alternatif
    if (normalized === 'FX') {
      return 'https://www.fxturkiye.com.tr/favicon.ico';
    }
    // A2 için alternatif
    if (normalized === 'A2') {
      return 'https://www.atv.com.tr/favicon.ico';
    }
    // Kanal 7 için alternatif
    if (normalized === 'KANAL 7') {
      return 'https://www.kanal7.com/favicon.ico';
    }
  }
  
  return logoUrl;
}

// Test verisi (geçici olarak) - Film ve dizi örnekleri ile
const TEST_DATA: TVScheduleItem[] = [
  // Diziler
  { time: '20:00', title: 'Eşref Rüya', channel: 'KANAL D', channelLogo: getChannelLogoUrl('KANAL D'), type: 'dizi' },
  { time: '20:00', title: 'Sahipsizler', channel: 'STAR TV', channelLogo: getChannelLogoUrl('STAR TV'), type: 'dizi' },
  { time: '20:00', title: 'Halef', channel: 'NOW', channelLogo: getChannelLogoUrl('NOW'), type: 'dizi' },
  { time: '20:00', title: 'Kuruluş Orhan', channel: 'ATV', channelLogo: getChannelLogoUrl('ATV'), type: 'dizi' },
  { time: '21:00', title: 'Gönül Dağı', channel: 'TRT TÜRK', channelLogo: getChannelLogoUrl('TRT TÜRK'), type: 'dizi' },
  { time: '21:15', title: 'Arafta', channel: 'KANAL 7', channelLogo: getChannelLogoUrl('KANAL 7'), type: 'dizi' },
  { time: '21:30', title: 'We Were the Lucky Ones', channel: 'FX', channelLogo: getChannelLogoUrl('FX'), type: 'dizi' },
  { time: '22:00', title: 'Eşkıya Dünyaya Hükümdar Olmaz', channel: 'A2', channelLogo: getChannelLogoUrl('A2'), type: 'dizi' },
  { time: '22:30', title: 'Zerhun', channel: 'KANAL 7', channelLogo: getChannelLogoUrl('KANAL 7'), type: 'dizi' },
  { time: '23:00', title: 'Sahtekarlar', channel: 'NOW', channelLogo: getChannelLogoUrl('NOW'), type: 'dizi' },
  // Filmler
  { time: '14:00', title: 'Recep İvedik 7', channel: 'SHOW TV', channelLogo: getChannelLogoUrl('SHOW TV'), type: 'film', duration: '120 dk' },
  { time: '16:30', title: 'Ayla', channel: 'TRT 1', channelLogo: getChannelLogoUrl('TRT 1'), type: 'film', duration: '110 dk' },
  { time: '19:00', title: 'Dedemin İnsanları', channel: 'ATV', channelLogo: getChannelLogoUrl('ATV'), type: 'film', duration: '105 dk' },
  { time: '23:30', title: 'Kelebekler', channel: 'KANAL D', channelLogo: getChannelLogoUrl('KANAL D'), type: 'film', duration: '95 dk' },
];

// Bugünün TV yayın akışını getir
export async function getTodayTVSchedule(): Promise<TVScheduleItem[]> {
  try {
    // Geçici olarak test verisi döndür
    // TODO: Gerçek scraping'i düzelt
    console.log('TV Schedule: Test verisi döndürülüyor...');
    return TEST_DATA;
    
    /* Gerçek scraping kodu (şimdilik devre dışı)
    const response = await fetch('https://www.tvyayinakisi.com/dizi-yayin-akisi/', {
      next: { revalidate: 3600 }, // 1 saat cache
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const scheduleItems: TVScheduleItem[] = [];
    
    console.log('TV Schedule: HTML yüklendi, parsing başlıyor...');
    console.log('TV Schedule: Toplam li sayısı:', $('li').length);
    console.log('TV Schedule: strong içeren li sayısı:', $('li:has(strong)').length);
    
    // Alternatif: Tüm strong elementlerini kontrol et
    const strongElements = $('strong');
    console.log('TV Schedule: Toplam strong sayısı:', strongElements.length);

    // Önce li elementlerini kontrol et
    let processedCount = 0;
    $('li').each((index, element) => {
      const $el = $(element);
      const fullText = $el.text().trim();
      
      // Saat bilgisini bul (bold içinde **00**:00 formatında)
      const $timeEl = $el.find('strong').first();
      if ($timeEl.length === 0) return;
      
      const timeText = $timeEl.text().trim();
      const timeMatch = timeText.match(/(\d{1,2}):(\d{2})/);
      if (!timeMatch) return;
      
      const time = timeMatch[0];
      
      // Kanal linkini bul
      const $channelLink = $el.find('a').last();
      let channel = '';
      if ($channelLink.length > 0) {
        channel = $channelLink.text().trim();
      }
      
      // Dizi adını bul - saat ve kanal linkini çıkar
      let title = fullText;
      // Saati çıkar
      title = title.replace(timeText, '').trim();
      // Kanal adını çıkar (eğer varsa)
      if (channel) {
        title = title.replace(channel, '').trim();
      }
      
      // Eğer hala link metni varsa, onu da çıkar
      title = title.replace(/\[.*?\]/g, '').trim();
      
      // Eğer kanal bulunamadıysa, text'in son kısmını kanal olarak al
      if (!channel && title) {
        const parts = title.split(/\s+/);
        if (parts.length > 1) {
          channel = parts[parts.length - 1];
          title = parts.slice(0, -1).join(' ');
        }
      }
      
      if (time && title && channel) {
        processedCount++;
        scheduleItems.push({
          time,
          title: title.trim(),
          channel: channel.trim(),
          channelLogo: getChannelLogoUrl(channel),
        });
      }
    });
    
    // Eğer li'lerden veri bulunamadıysa, tüm strong elementlerini kontrol et
    if (scheduleItems.length === 0) {
      console.log('TV Schedule: li elementlerinden veri bulunamadı, alternatif yöntem deneniyor...');
      $('strong').each((index, element) => {
        const $strong = $(element);
        const timeText = $strong.text().trim();
        const timeMatch = timeText.match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) return;
        
        const time = timeMatch[0];
        const $parent = $strong.parent();
        const fullText = $parent.text().trim();
        
        // Kanal linkini bul
        const $channelLink = $parent.find('a').last();
        let channel = '';
        if ($channelLink.length > 0) {
          channel = $channelLink.text().trim();
        }
        
        // Dizi adını bul
        let title = fullText.replace(timeText, '').trim();
        if (channel) {
          title = title.replace(channel, '').trim();
        }
        title = title.replace(/\[.*?\]/g, '').trim();
        
        if (!channel && title) {
          const parts = title.split(/\s+/);
          if (parts.length > 1) {
            channel = parts[parts.length - 1];
            title = parts.slice(0, -1).join(' ');
          }
        }
        
        if (time && title && channel) {
          scheduleItems.push({
            time,
            title: title.trim(),
            channel: channel.trim(),
            channelLogo: getChannelLogoUrl(channel),
          });
        }
      });
    }
    
    console.log(`TV Schedule: ${processedCount} item işlendi, ${scheduleItems.length} item eklendi`);

    // Saate göre sırala
    scheduleItems.sort((a, b) => {
      const [aHour, aMin] = a.time.split(':').map(Number);
      const [bHour, bMin] = b.time.split(':').map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });

    // Duplicate'leri kaldır
    const uniqueItems = scheduleItems.filter((item, index, self) =>
      index === self.findIndex((t) => t.time === item.time && t.title === item.title && t.channel === item.channel)
    );

    console.log(`TV Schedule: ${uniqueItems.length} dizi bulundu`);
    return uniqueItems.slice(0, 30); // İlk 30 dizi
    */
  } catch (error) {
    console.error('TV yayın akışı yüklenemedi:', error);
    // Hata durumunda test verisi döndür
    return TEST_DATA;
  }
}

// Apify ile TV yayın akışını getir (gelecekte kullanılacak)
async function getTVScheduleFromApify(): Promise<TVScheduleItem[]> {
  const APIFY_API_KEY = process.env.APIFY_API_KEY;
  const ACTOR_ID = process.env.APIFY_ACTOR_ID;

  if (!APIFY_API_KEY || !ACTOR_ID) {
    console.log('Apify API key veya Actor ID bulunamadı, test verisi kullanılıyor.');
    return TEST_DATA;
  }

  try {
    // Actor'ı çalıştır
    const runResponse = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startUrls: [{ url: 'https://www.tvyayinakisi.com/dizi-yayin-akisi/' }],
      }),
    });

    if (!runResponse.ok) {
      throw new Error(`Apify run failed: ${runResponse.status}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    // Run'ın tamamlanmasını bekle (basit polling)
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 30; // 5 dakika timeout

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 saniye bekle
      
      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${APIFY_API_KEY}`,
        },
      });
      
      const statusData = await statusResponse.json();
      status = statusData.data.status;
      attempts++;
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Apify run failed with status: ${status}`);
    }

    // Sonuçları al
    const resultsResponse = await fetch(`https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items`, {
      headers: {
        'Authorization': `Bearer ${APIFY_API_KEY}`,
      },
    });

    if (!resultsResponse.ok) {
      throw new Error(`Failed to fetch results: ${resultsResponse.status}`);
    }

    const results = await resultsResponse.json();
    
    // Apify sonuçlarını TVScheduleItem formatına dönüştür
    return results.map((item: any) => ({
      time: item.time || '',
      title: item.title || '',
      channel: item.channel || '',
      channelLogo: getChannelLogoUrl(item.channel || ''),
      type: item.type || 'program',
      duration: item.duration,
      genre: item.genre,
    })).filter((item: TVScheduleItem) => item.time && item.title && item.channel);

  } catch (error) {
    console.error('Apify hatası:', error);
    return TEST_DATA; // Fallback to test data
  }
}

// Kanal bazlı yayın akışını getir
export async function getTodayTVScheduleByChannel(): Promise<TVScheduleByChannel[]> {
  try {
    // Önce tüm verileri al
    let allItems: TVScheduleItem[] = [];
    
    // Apify kullanılabilirse onu kullan, değilse test verisi
    if (process.env.APIFY_API_KEY && process.env.APIFY_ACTOR_ID) {
      allItems = await getTVScheduleFromApify();
    } else {
      allItems = await getTodayTVSchedule();
    }

    // Kanallara göre grupla
    const channelMap = new Map<string, TVScheduleByChannel>();

    allItems.forEach((item) => {
      const channelKey = normalizeChannelName(item.channel);
      
      if (!channelMap.has(channelKey)) {
        channelMap.set(channelKey, {
          channel: item.channel,
          channelLogo: item.channelLogo,
          movies: [],
          series: [],
          programs: [],
        });
      }

      const channelData = channelMap.get(channelKey)!;
      const type = item.type || 'program';

      if (type === 'film') {
        channelData.movies.push(item);
      } else if (type === 'dizi') {
        channelData.series.push(item);
      } else {
        channelData.programs.push(item);
      }
    });

    // Her kanal için saat bazlı sıralama
    const result: TVScheduleByChannel[] = Array.from(channelMap.values()).map((channel) => {
      const sortByTime = (a: TVScheduleItem, b: TVScheduleItem) => {
        const [aHour, aMin] = a.time.split(':').map(Number);
        const [bHour, bMin] = b.time.split(':').map(Number);
        return aHour * 60 + aMin - (bHour * 60 + bMin);
      };

      return {
        ...channel,
        movies: channel.movies.sort(sortByTime),
        series: channel.series.sort(sortByTime),
        programs: channel.programs.sort(sortByTime),
      };
    });

    // Kanalları alfabetik sırala
    result.sort((a, b) => a.channel.localeCompare(b.channel));

    return result;
  } catch (error) {
    console.error('Kanal bazlı yayın akışı yüklenemedi:', error);
    // Fallback: Test verisini kanal bazlı dönüştür
    const fallbackItems = TEST_DATA;
    const channelMap = new Map<string, TVScheduleByChannel>();

    fallbackItems.forEach((item) => {
      const channelKey = normalizeChannelName(item.channel);
      
      if (!channelMap.has(channelKey)) {
        channelMap.set(channelKey, {
          channel: item.channel,
          channelLogo: item.channelLogo,
          movies: [],
          series: [],
          programs: [],
        });
      }

      const channelData = channelMap.get(channelKey)!;
      const type = item.type || 'program';

      if (type === 'film') {
        channelData.movies.push(item);
      } else if (type === 'dizi') {
        channelData.series.push(item);
      } else {
        channelData.programs.push(item);
      }
    });

    return Array.from(channelMap.values());
  }
}

// Bugünkü maçları çek
export async function getTodayMatches(sport: 'futbol' | 'basketbol' = 'futbol'): Promise<TodayMatch[]> {
  try {
    const url = `https://www.tvyayinakisi.com/bugunku-maclar/?sport=${sport}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const matches: TodayMatch[] = [];

    // Maç listesini parse et - daha basit ve güvenilir yaklaşım
    $('li').each((index, element) => {
      const $el = $(element);
      const fullText = $el.text().trim();
      
      if (!fullText || fullText.length < 15) return;
      
      // Zaman bilgisini bul (strong içinde veya ** ile çevrili)
      const $strong = $el.find('strong').first();
      let timeText = '';
      
      if ($strong.length > 0) {
        timeText = $strong.text().trim();
      } else {
        // ** ile çevrili
        const timeMatch = fullText.match(/\*\*([^*]+)\*\*/);
        if (timeMatch) {
          timeText = timeMatch[1].trim();
        }
      }
      
      if (!timeText) return;
      
      // Kalan metni al
      let content = fullText;
      if ($strong.length > 0) {
        content = fullText.replace(timeText, '').trim();
      } else {
        content = fullText.replace(/\*\*[^*]+\*\*/, '').trim();
      }
      
      // Format: "Lazio - Napoli S Sport Plus, Tivibu Spor 1, S Sport 2"
      // veya "Lazio - Napoli S Sport Plus"
      const dashMatch = content.match(/^(.+?)\s+-\s+(.+)$/);
      if (!dashMatch) return;
      
      const homeTeam = dashMatch[1].trim();
      const rest = dashMatch[2].trim();
      
      // Kanalları bul
      const possibleChannels = [
        'S Sport Plus', 'S Sport 2', 'S Sport', 'Spor Smart',
        'beIN SPORTS 3', 'beIN SPORTS 4', 'beIN SPORTS MAX 1', 'beIN SPORTS MAX 2', 'beIN SPORTS HABER', 'beIN SPORTS 5', 'beIN SPORTS', 'beIN CONNECT',
        'EXXEN', 'Tivibu Spor 1', 'Tivibu Spor 2', 'Tivibu Spor',
        'TRT Spor', 'tabii', 'A-Leagues YouTube'
      ];
      
      const channels: string[] = [];
      let awayTeam = rest;
      
      // Kanalları bul
      for (const channel of possibleChannels) {
        if (rest.includes(channel)) {
          channels.push(channel);
          awayTeam = awayTeam.replace(channel, '').trim();
        }
      }
      
      // Virgülle ayrılmış kanalları da kontrol et
      if (rest.includes(',')) {
        const parts = rest.split(',');
        parts.forEach(part => {
          const trimmed = part.trim();
          for (const channel of possibleChannels) {
            if (trimmed.includes(channel) && !channels.includes(channel)) {
              channels.push(channel);
              awayTeam = awayTeam.replace(trimmed, '').trim();
            }
          }
        });
      }
      
      // Away team'i temizle (kanallardan arındır)
      awayTeam = awayTeam.replace(/,/g, '').trim();
      
      if (homeTeam && awayTeam && channels.length > 0) {
        matches.push({
          time: timeText,
          homeTeam,
          awayTeam,
          channels: Array.from(new Set(channels)),
          sport,
        });
      }
    });

    return matches;
  } catch (error) {
    console.error('Maçlar çekilemedi:', error);
    return [];
  }
}

// Bugünkü dizileri çek
export async function getTodaySeries(): Promise<TodaySeriesItem[]> {
  try {
    const url = 'https://www.tvyayinakisi.com/dizi-yayin-akisi/';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const series: TodaySeriesItem[] = [];

    // Dizi listesini parse et - Format: **00**:00 Dizi Adı KANAL
    // Sadece bugünün dizileri bölümündeki li elementlerini al
    let foundTodaySection = false;
    let foundTomorrowSection = false;
    let hasTodayHeader = false;
    
    // Önce "Bugünün Dizileri" başlığının var olup olmadığını kontrol et
    $('li').each((index, element) => {
      const text = $(element).text().trim();
      if (text.includes('Bugünün Dizileri')) {
        hasTodayHeader = true;
        return false; // break
      }
    });
    
    // Eğer "Bugünün Dizileri" başlığı yoksa, tüm li elementlerini çek (fallback)
    if (!hasTodayHeader) {
      foundTodaySection = true;
    }
    
    $('li').each((index, element) => {
      const $el = $(element);
      const fullText = $el.text().trim();
      
      // "Bugünün Dizileri" başlığını bul - bundan sonra başla
      if (fullText.includes('Bugünün Dizileri')) {
        foundTodaySection = true;
        return; // continue - bu başlığı atla, sonraki elementlerden başla
      }
      
      // "Yarının Dizileri" başlığını bul - bundan sonra dur
      if (fullText.includes('Yarının Dizileri')) {
        foundTomorrowSection = true;
        return false; // break
      }
      
      // Eğer bugünün bölümüne henüz gelmediysek veya yarının bölümüne geldiysek, atla
      if (!foundTodaySection || foundTomorrowSection) {
        return;
      }
      
      if (!fullText || fullText.length < 5) return;
      
      // Zaman formatı kontrolü - eğer sadece tarih varsa (örn: "04 Jan2026"), atla
      if (/^\d{1,2}\s+[A-Z][a-z]{2}\d{4}$/.test(fullText)) {
        return;
      }
      
      // Zaman bilgisini bul - HTML'de <strong>00</strong>:00 formatı olabilir
      let time = '';
      let content = fullText;
      
      // Önce tam zaman formatını regex ile bul
      const timeMatch = fullText.match(/(\d{1,2})\s*:\s*(\d{2})/);
      if (timeMatch) {
        time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
        // Zaman kısmını content'ten tamamen çıkar (hem **00**:00 hem de 00:00 formatlarını)
        content = fullText
          .replace(/\*\*?\s*(\d{1,2})\s*:\s*(\d{2})\s*\*\*?/g, '') // **00**:00 formatı
          .replace(/(\d{1,2})\s*:\s*(\d{2})/g, '') // 00:00 formatı (başta kalan)
          .trim();
      } else {
        // Fallback: strong elementinden al
        const $strong = $el.find('strong').first();
        if ($strong.length > 0) {
          const timeText = $strong.text().trim();
          // Strong içinde sadece saat varsa, dakikayı da bul
          const hourMatch = timeText.match(/(\d{1,2})/);
          if (hourMatch) {
            const hour = hourMatch[1];
            // Dakikayı fullText'ten bul
            const minuteMatch = fullText.match(new RegExp(`${hour}\\s*:\\s*(\\d{2})`));
            if (minuteMatch) {
              time = `${hour.padStart(2, '0')}:${minuteMatch[1]}`;
              // Zaman kısmını content'ten tamamen çıkar
              content = fullText
                .replace(/\*\*?\s*(\d{1,2})\s*:\s*(\d{2})\s*\*\*?/g, '') // **00**:00 formatı
                .replace(/(\d{1,2})\s*:\s*(\d{2})/g, '') // 00:00 formatı (başta kalan)
                .trim();
            } else {
              return;
            }
          } else {
            return;
          }
        } else {
          return;
        }
      }
      
      // Zaman formatını normalize et (boşlukları kaldır, formatı düzelt)
      if (time) {
        time = time.replace(/\s+/g, '').replace(/(\d{1,2})\s*:\s*(\d{2})/, (match, h, m) => {
          return `${h.padStart(2, '0')}:${m}`;
        });
      }
      
      // Title'dan kalan zaman formatlarını da temizle (güvenlik için)
      if (content) {
        content = content.replace(/^(\d{1,2})\s*:\s*(\d{2})/g, '').trim();
      }
      
      if (!time || !content) return;
      
      // Kanal isimlerini kontrol et (daha kapsamlı liste)
      const knownChannels = [
        'KANAL D', 'SHOW TV', 'STAR TV', 'TRT 1', 'TRT TÜRK', 'TRT KURDİ', 'TRT 2', 'TRT ÇOCUK', 'TRT HABER',
        'SİNEMA TV', 'SİNEMA YERLİ', 'SİNEMA YERLİ 2', 'SİNEMA AİLE', 'SİNEMA KOMEDİ', 'SİNEMA TV AKSİYON', 'SİNEMA 1002',
        'BEYAZ TV', 'TEVE2', 'FX', 'A2', 'NOW', 'ATV', 'TV8', '360', 'CARTOON NETWORK', 'KANAL 7',
        'FOX', 'NTV', 'CNN TÜRK', 'HABERTÜRK', 'A HABER', 'KANAL 7', 'TV 8.5', 'BLOOMBERG HT'
      ];
      
      // Kanalı bul
      let channel = '';
      let title = content;
      
      for (const knownChannel of knownChannels) {
        if (content.includes(knownChannel)) {
          channel = knownChannel;
          title = content.replace(knownChannel, '').trim();
          break;
        }
      }
      
      // Eğer bilinen kanal bulunamadıysa, son kelime veya kelimeleri kanal olarak dene
      if (!channel) {
        const words = content.split(/\s+/);
        if (words.length >= 2) {
          // Son 1-2 kelime kanal olabilir
          const lastWord = words[words.length - 1];
          if (lastWord.length > 2 && /^[A-Z]/.test(lastWord)) {
            channel = lastWord;
            title = words.slice(0, -1).join(' ').trim();
          }
        }
      }
      
      if (time && title && channel) {
        series.push({
          time,
          title,
          channel,
          channelLogo: getChannelLogoUrl(channel),
          type: 'dizi',
        });
      }
    });

    return series;
  } catch (error) {
    console.error('Diziler çekilemedi:', error);
    return [];
  }
}

// Bugünkü filmleri çek
export async function getTodayMovies(): Promise<TodayMovieItem[]> {
  try {
    const url = 'https://www.tvyayinakisi.com/film-yayin-akisi/';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const movies: TodayMovieItem[] = [];

    // Film listesini parse et - Format: **00**:00 Film Adı KANAL
    // Sadece bugünün filmleri bölümündeki li elementlerini al
    let foundTodaySection = false;
    let foundTomorrowSection = false;
    let hasTodayHeader = false;
    
    // Önce "Bugünün Filmleri" başlığının var olup olmadığını kontrol et
    $('li').each((index, element) => {
      const text = $(element).text().trim();
      if (text.includes('Bugünün Filmleri')) {
        hasTodayHeader = true;
        return false; // break
      }
    });
    
    // Eğer "Bugünün Filmleri" başlığı yoksa, tüm li elementlerini çek (fallback)
    if (!hasTodayHeader) {
      foundTodaySection = true;
    }
    
    $('li').each((index, element) => {
      const $el = $(element);
      const fullText = $el.text().trim();
      
      // "Bugünün Filmleri" başlığını bul - bundan sonra başla
      if (fullText.includes('Bugünün Filmleri')) {
        foundTodaySection = true;
        return; // continue - bu başlığı atla, sonraki elementlerden başla
      }
      
      // "Yarının Filmleri" başlığını bul - bundan sonra dur
      if (fullText.includes('Yarının Filmleri')) {
        foundTomorrowSection = true;
        return false; // break
      }
      
      // Eğer bugünün bölümüne henüz gelmediysek veya yarının bölümüne geldiysek, atla
      if (!foundTodaySection || foundTomorrowSection) {
        return;
      }
      
      if (!fullText || fullText.length < 5) return;
      
      // Zaman formatı kontrolü - eğer sadece tarih varsa (örn: "04 Jan2026"), atla
      if (/^\d{1,2}\s+[A-Z][a-z]{2}\d{4}$/.test(fullText)) {
        return;
      }
      
      // Zaman bilgisini bul - HTML'de <strong>00</strong>:00 formatı olabilir
      let time = '';
      let content = fullText;
      
      // Önce tam zaman formatını regex ile bul
      const timeMatch = fullText.match(/(\d{1,2})\s*:\s*(\d{2})/);
      if (timeMatch) {
        time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
        // Zaman kısmını content'ten tamamen çıkar (hem **00**:00 hem de 00:00 formatlarını)
        content = fullText
          .replace(/\*\*?\s*(\d{1,2})\s*:\s*(\d{2})\s*\*\*?/g, '') // **00**:00 formatı
          .replace(/(\d{1,2})\s*:\s*(\d{2})/g, '') // 00:00 formatı (başta kalan)
          .trim();
      } else {
        // Fallback: strong elementinden al
        const $strong = $el.find('strong').first();
        if ($strong.length > 0) {
          const timeText = $strong.text().trim();
          // Strong içinde sadece saat varsa, dakikayı da bul
          const hourMatch = timeText.match(/(\d{1,2})/);
          if (hourMatch) {
            const hour = hourMatch[1];
            // Dakikayı fullText'ten bul
            const minuteMatch = fullText.match(new RegExp(`${hour}\\s*:\\s*(\\d{2})`));
            if (minuteMatch) {
              time = `${hour.padStart(2, '0')}:${minuteMatch[1]}`;
              // Zaman kısmını content'ten tamamen çıkar
              content = fullText
                .replace(/\*\*?\s*(\d{1,2})\s*:\s*(\d{2})\s*\*\*?/g, '') // **00**:00 formatı
                .replace(/(\d{1,2})\s*:\s*(\d{2})/g, '') // 00:00 formatı (başta kalan)
                .trim();
            } else {
              return;
            }
          } else {
            return;
          }
        } else {
          return;
        }
      }
      
      // Zaman formatını normalize et (boşlukları kaldır, formatı düzelt)
      if (time) {
        time = time.replace(/\s+/g, '').replace(/(\d{1,2})\s*:\s*(\d{2})/, (match, h, m) => {
          return `${h.padStart(2, '0')}:${m}`;
        });
      }
      
      // Title'dan kalan zaman formatlarını da temizle (güvenlik için)
      if (content) {
        content = content.replace(/^(\d{1,2})\s*:\s*(\d{2})/g, '').trim();
      }
      
      if (!time || !content) return;
      
      // Kanal isimlerini kontrol et (daha kapsamlı liste)
      const knownChannels = [
        'KANAL D', 'SHOW TV', 'STAR TV', 'TRT 1', 'TRT TÜRK', 'TRT KURDİ', 'TRT 2', 'TRT ÇOCUK', 'TRT HABER',
        'SİNEMA TV', 'SİNEMA YERLİ', 'SİNEMA YERLİ 2', 'SİNEMA AİLE', 'SİNEMA KOMEDİ', 'SİNEMA TV AKSİYON', 'SİNEMA 1002',
        'BEYAZ TV', 'TEVE2', 'FX', 'A2', 'NOW', 'ATV', 'TV8', '360', 'CARTOON NETWORK', 'KANAL 7',
        'FOX', 'NTV', 'CNN TÜRK', 'HABERTÜRK', 'A HABER', 'KANAL 7', 'TV 8.5', 'BLOOMBERG HT'
      ];
      
      // Kanalı bul
      let channel = '';
      let title = content;
      
      for (const knownChannel of knownChannels) {
        if (content.includes(knownChannel)) {
          channel = knownChannel;
          title = content.replace(knownChannel, '').trim();
          break;
        }
      }
      
      // Eğer bilinen kanal bulunamadıysa, son kelime veya kelimeleri kanal olarak dene
      if (!channel) {
        const words = content.split(/\s+/);
        if (words.length >= 2) {
          // Son 1-2 kelime kanal olabilir
          const lastWord = words[words.length - 1];
          if (lastWord.length > 2 && /^[A-Z]/.test(lastWord)) {
            channel = lastWord;
            title = words.slice(0, -1).join(' ').trim();
          }
        }
      }
      
      if (time && title && channel) {
        movies.push({
          time,
          title,
          channel,
          channelLogo: getChannelLogoUrl(channel),
          type: 'film',
        });
      }
    });

    return movies;
  } catch (error) {
    console.error('Filmler çekilemedi:', error);
    return [];
  }
}

