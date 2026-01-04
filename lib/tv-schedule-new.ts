import { load } from 'cheerio';

// Kanal logoları
const CHANNEL_LOGOS: Record<string, string> = {
  'KANAL D': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Kanal_D_logo.svg/200px-Kanal_D_logo.svg.png',
  'SHOW TV': 'https://upload.wikimedia.org/wikipedia/tr/f/f9/Show_TV.png',
  'STAR TV': 'https://upload.wikimedia.org/wikipedia/tr/7/73/Star_TV_logosu.png',
  'TRT 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/TRT_1_logo.svg/200px-TRT_1_logo.svg.png',
  'TRT TÜRK': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/TRT_T%C3%BCrk_logo.svg/200px-TRT_T%C3%BCrk_logo.svg.png',
  'ATV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Atv_logo.svg/200px-Atv_logo.svg.png',
  'TV8': 'https://upload.wikimedia.org/wikipedia/tr/6/68/Tv8_Yeni_Logo.png',
  'FOX': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Fox_logosu.svg/200px-Fox_logosu.svg.png',
  'KANAL 7': 'https://upload.wikimedia.org/wikipedia/tr/c/c2/Kanal_7.png',
  'A2': 'https://upload.wikimedia.org/wikipedia/tr/e/e8/A2_logosu.png',
  'FX': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/FX_International_logo.svg/200px-FX_International_logo.svg.png',
  'NOW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Now_TV_logo.svg/200px-Now_TV_logo.svg.png',
  'TEVE2': 'https://upload.wikimedia.org/wikipedia/tr/e/e7/Teve2_yeni_logo.png',
};

function getChannelLogoUrl(channel: string): string {
  return CHANNEL_LOGOS[channel] || '';
}

export interface TodaySeriesItem {
  time: string;
  title: string;
  channel: string;
  channelLogo?: string;
  type?: 'dizi';
}

export interface TodayMovieItem {
  time: string;
  title: string;
  channel: string;
  channelLogo?: string;
  type?: 'film';
}

export interface TodayMatch {
  time: string;
  homeTeam: string;
  awayTeam: string;
  channels: string[];
  sport: 'futbol' | 'basketbol';
}

// Bilinen kanallar listesi
const KNOWN_CHANNELS = [
  'KANAL D', 'SHOW TV', 'STAR TV', 'TRT 1', 'TRT TÜRK', 'TRT KURDİ', 'TRT 2', 'TRT ÇOCUK', 'TRT HABER',
  'SİNEMA TV', 'SİNEMA YERLİ', 'SİNEMA YERLİ 2', 'SİNEMA AİLE', 'SİNEMA KOMEDİ', 'SİNEMA TV AKSİYON', 'SİNEMA 1002',
  'BEYAZ TV', 'TEVE2', 'FX', 'A2', 'NOW', 'ATV', 'TV8', '360', 'CARTOON NETWORK', 'KANAL 7',
  'FOX', 'NTV', 'CNN TÜRK', 'HABERTÜRK', 'A HABER', 'TV 8.5', 'BLOOMBERG HT'
];

// Bugünkü dizileri çek
export async function getTodaySeries(): Promise<TodaySeriesItem[]> {
  try {
    console.log('[LIB] Fetching series from tvyayinakisi.com...');
    const url = 'https://www.tvyayinakisi.com/dizi-yayin-akisi/';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const series: TodaySeriesItem[] = [];

    $('li').each((index, element) => {
      const fullText = $(element).text().trim();
      
      // Boş veya çok kısa metinleri atla
      if (!fullText || fullText.length < 10) return;
      
      // Zaman formatı kontrolü: HH:MM veya H:MM (başta olmalı)
      const timeMatch = fullText.match(/^(\d{1,2}):(\d{2})/);
      if (!timeMatch) return;
      
      const time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
      
      // Zaman kısmını çıkar
      let remaining = fullText.replace(/^(\d{1,2}):(\d{2})/, '').trim();
      
      if (!remaining) return;
      
      // Kanal bul (sondan başlayarak bilinen kanalları ara)
      let channel = '';
      let title = remaining;
      
      // Önce bilinen kanalları kontrol et
      for (const knownChannel of KNOWN_CHANNELS) {
        if (remaining.toUpperCase().includes(knownChannel)) {
          const idx = remaining.toUpperCase().lastIndexOf(knownChannel);
          channel = knownChannel;
          title = remaining.substring(0, idx).trim();
          break;
        }
      }
      
      // Eğer bilinen kanal bulunamadıysa, son büyük harfli kelime(ler)i kanal olarak al
      if (!channel) {
        const words = remaining.split(/\s+/);
        // Sondan başlayarak büyük harfli kelimeleri bul
        let channelWords: string[] = [];
        for (let i = words.length - 1; i >= 0; i--) {
          const word = words[i];
          // Eğer kelime tamamen büyük harfse veya sayı içeriyorsa, kanal olabilir
          if (word === word.toUpperCase() && word.length > 1 && /[A-Z]/.test(word)) {
            channelWords.unshift(word);
          } else {
            break;
          }
        }
        
        if (channelWords.length > 0) {
          channel = channelWords.join(' ');
          title = words.slice(0, words.length - channelWords.length).join(' ').trim();
        }
      }
      
      // Başlık ve kanal varsa ekle
      if (title && channel) {
        series.push({
          time,
          title,
          channel,
          channelLogo: getChannelLogoUrl(channel),
          type: 'dizi',
        });
      }
    });

    console.log(`[LIB] Parsed ${series.length} series`);
    return series;
  } catch (error) {
    console.error('[LIB] Error fetching series:', error);
    return [];
  }
}

// Bugünkü filmleri çek
export async function getTodayMovies(): Promise<TodayMovieItem[]> {
  try {
    console.log('[LIB] Fetching movies from tvyayinakisi.com...');
    const url = 'https://www.tvyayinakisi.com/film-yayin-akisi/';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const movies: TodayMovieItem[] = [];

    $('li').each((index, element) => {
      const fullText = $(element).text().trim();
      
      // Boş veya çok kısa metinleri atla
      if (!fullText || fullText.length < 10) return;
      
      // Zaman formatı kontrolü: HH:MM veya H:MM (başta olmalı)
      const timeMatch = fullText.match(/^(\d{1,2}):(\d{2})/);
      if (!timeMatch) return;
      
      const time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
      
      // Zaman kısmını çıkar
      let remaining = fullText.replace(/^(\d{1,2}):(\d{2})/, '').trim();
      
      if (!remaining) return;
      
      // Kanal bul (sondan başlayarak bilinen kanalları ara)
      let channel = '';
      let title = remaining;
      
      // Önce bilinen kanalları kontrol et
      for (const knownChannel of KNOWN_CHANNELS) {
        if (remaining.toUpperCase().includes(knownChannel)) {
          const idx = remaining.toUpperCase().lastIndexOf(knownChannel);
          channel = knownChannel;
          title = remaining.substring(0, idx).trim();
          break;
        }
      }
      
      // Eğer bilinen kanal bulunamadıysa, son büyük harfli kelime(ler)i kanal olarak al
      if (!channel) {
        const words = remaining.split(/\s+/);
        // Sondan başlayarak büyük harfli kelimeleri bul
        let channelWords: string[] = [];
        for (let i = words.length - 1; i >= 0; i--) {
          const word = words[i];
          // Eğer kelime tamamen büyük harfse veya sayı içeriyorsa, kanal olabilir
          if (word === word.toUpperCase() && word.length > 1 && /[A-Z]/.test(word)) {
            channelWords.unshift(word);
          } else {
            break;
          }
        }
        
        if (channelWords.length > 0) {
          channel = channelWords.join(' ');
          title = words.slice(0, words.length - channelWords.length).join(' ').trim();
        }
      }
      
      // Başlık ve kanal varsa ekle
      if (title && channel) {
        movies.push({
          time,
          title,
          channel,
          channelLogo: getChannelLogoUrl(channel),
          type: 'film',
        });
      }
    });

    console.log(`[LIB] Parsed ${movies.length} movies`);
    return movies;
  } catch (error) {
    console.error('[LIB] Error fetching movies:', error);
    return [];
  }
}

// Bugünkü maçları çek
export async function getTodayMatches(sport: 'futbol' | 'basketbol' = 'futbol'): Promise<TodayMatch[]> {
  try {
    console.log(`[LIB] Fetching ${sport} matches from tvyayinakisi.com...`);
    const url = `https://www.tvyayinakisi.com/bugunku-maclar/?sport=${sport}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const matches: TodayMatch[] = [];

    $('li').each((index, element) => {
      const fullText = $(element).text().trim();
      
      // Boş veya çok kısa metinleri atla
      if (!fullText || fullText.length < 10) return;
      
      // Zaman formatı kontrolü: HH:MM veya H:MM (başta olmalı)
      const timeMatch = fullText.match(/^(\d{1,2}):(\d{2})/);
      if (!timeMatch) return;
      
      const time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
      
      // Zaman kısmını çıkar
      let remaining = fullText.replace(/^(\d{1,2}):(\d{2})/, '').trim();
      
      if (!remaining) return;
      
      // "vs" veya "-" ile takımları ayır
      const teamSeparator = remaining.includes(' vs ') ? ' vs ' : ' - ';
      const parts = remaining.split(teamSeparator);
      
      if (parts.length < 2) return;
      
      const homeTeam = parts[0].trim();
      let awayPart = parts.slice(1).join(teamSeparator).trim();
      
      // Kanalları bul
      const channels: string[] = [];
      let awayTeam = awayPart;
      
      // Bilinen kanalları ara
      for (const knownChannel of KNOWN_CHANNELS) {
        if (awayPart.toUpperCase().includes(knownChannel)) {
          channels.push(knownChannel);
          awayPart = awayPart.replace(new RegExp(knownChannel, 'gi'), '').trim();
        }
      }
      
      // Eğer bilinen kanal bulunamadıysa, son büyük harfli kelime(ler)i kanal olarak al
      if (channels.length === 0) {
        const words = awayPart.split(/\s+/);
        let channelWords: string[] = [];
        for (let i = words.length - 1; i >= 0; i--) {
          const word = words[i];
          if (word === word.toUpperCase() && word.length > 1 && /[A-Z]/.test(word)) {
            channelWords.unshift(word);
          } else {
            break;
          }
        }
        
        if (channelWords.length > 0) {
          channels.push(channelWords.join(' '));
          awayTeam = words.slice(0, words.length - channelWords.length).join(' ').trim();
        }
      } else {
        awayTeam = awayPart.trim();
      }
      
      if (homeTeam && awayTeam && channels.length > 0) {
        matches.push({
          time,
          homeTeam,
          awayTeam,
          channels: Array.from(new Set(channels)),
          sport,
        });
      }
    });

    console.log(`[LIB] Parsed ${matches.length} ${sport} matches`);
    return matches;
  } catch (error) {
    console.error(`[LIB] Error fetching ${sport} matches:`, error);
    return [];
  }
}

