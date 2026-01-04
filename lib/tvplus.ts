// TV+ yayın akışı scraper

export interface TVPlusProgram {
  id: string;
  name: string;
  genres: string;
  introduce: string;
  channelId: string;
  channelName: string;
  channelLogo: string;
  startTime: number;
  endTime: number;
  image: string;
  broadcastType?: string;
}

export interface TVPlusResponse {
  success: boolean;
  data: TVPlusProgram[];
  count: number;
}

// Bugünkü filmleri çek
export async function getTodayMovies(): Promise<TVPlusProgram[]> {
  try {
    console.log('[TVPLUS] Fetching today movies...');
    
    const response = await fetch('https://tvplus.com.tr/canli-tv/yayin-akisi/bugun-hangi-filmler-var', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // __NEXT_DATA__ içindeki JSON'u çıkar
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    
    if (!nextDataMatch) {
      console.error('[TVPLUS] __NEXT_DATA__ not found');
      return [];
    }

    const nextData = JSON.parse(nextDataMatch[1]);
    const dayPlaybills = nextData?.props?.pageProps?.pageData?.dayPlaybills || [];

    console.log(`[TVPLUS] Parsed ${dayPlaybills.length} movies`);

    return dayPlaybills.map((item: any) => ({
      id: item.id,
      name: item.name,
      genres: item.genres,
      introduce: item.introduce,
      channelId: item.channelid,
      channelName: item.channelName,
      channelLogo: item.channelLogo,
      startTime: item.starttime,
      endTime: item.endtime,
      image: item.srcItem,
      broadcastType: item.extensionInfo?.find((info: any) => info.key === 'broadcastType')?.value,
    }));
  } catch (error) {
    console.error('[TVPLUS] Error fetching movies:', error);
    return [];
  }
}

// Bugünkü dizileri çek
export async function getTodaySeries(): Promise<TVPlusProgram[]> {
  try {
    console.log('[TVPLUS] Fetching today series...');
    
    const response = await fetch('https://tvplus.com.tr/canli-tv/yayin-akisi/bugun-hangi-diziler-var', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // __NEXT_DATA__ içindeki JSON'u çıkar
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    
    if (!nextDataMatch) {
      console.error('[TVPLUS] __NEXT_DATA__ not found');
      return [];
    }

    const nextData = JSON.parse(nextDataMatch[1]);
    const dayPlaybills = nextData?.props?.pageProps?.pageData?.dayPlaybills || [];

    console.log(`[TVPLUS] Parsed ${dayPlaybills.length} series`);

    return dayPlaybills.map((item: any) => ({
      id: item.id,
      name: item.name,
      genres: item.genres,
      introduce: item.introduce,
      channelId: item.channelid,
      channelName: item.channelName,
      channelLogo: item.channelLogo,
      startTime: item.starttime,
      endTime: item.endtime,
      image: item.srcItem,
      broadcastType: item.extensionInfo?.find((info: any) => info.key === 'broadcastType')?.value,
    }));
  } catch (error) {
    console.error('[TVPLUS] Error fetching series:', error);
    return [];
  }
}

// Bugünkü belgeselleri çek
export async function getTodayDocumentaries(): Promise<TVPlusProgram[]> {
  try {
    console.log('[TVPLUS] Fetching today documentaries...');
    
    const response = await fetch('https://tvplus.com.tr/canli-tv/yayin-akisi/bugun-hangi-belgeseller-var', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    
    if (!nextDataMatch) {
      console.error('[TVPLUS] __NEXT_DATA__ not found');
      return [];
    }

    const nextData = JSON.parse(nextDataMatch[1]);
    const dayPlaybills = nextData?.props?.pageProps?.pageData?.dayPlaybills || [];

    console.log(`[TVPLUS] Parsed ${dayPlaybills.length} documentaries`);

    return dayPlaybills.map((item: any) => ({
      id: item.id,
      name: item.name,
      genres: item.genres,
      introduce: item.introduce,
      channelId: item.channelid,
      channelName: item.channelName,
      channelLogo: item.channelLogo,
      startTime: item.starttime,
      endTime: item.endtime,
      image: item.srcItem,
      broadcastType: item.extensionInfo?.find((info: any) => info.key === 'broadcastType')?.value,
    }));
  } catch (error) {
    console.error('[TVPLUS] Error fetching documentaries:', error);
    return [];
  }
}

// Bugünkü spor yayınlarını çek
export async function getTodaySports(): Promise<TVPlusProgram[]> {
  try {
    console.log('[TVPLUS] Fetching today sports...');
    
    const response = await fetch('https://tvplus.com.tr/canli-tv/yayin-akisi/bugun-hangi-spor-yayinlari-var', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    
    if (!nextDataMatch) {
      console.error('[TVPLUS] __NEXT_DATA__ not found');
      return [];
    }

    const nextData = JSON.parse(nextDataMatch[1]);
    const dayPlaybills = nextData?.props?.pageProps?.pageData?.dayPlaybills || [];

    console.log(`[TVPLUS] Parsed ${dayPlaybills.length} sports`);

    return dayPlaybills.map((item: any) => ({
      id: item.id,
      name: item.name,
      genres: item.genres,
      introduce: item.introduce,
      channelId: item.channelid,
      channelName: item.channelName,
      channelLogo: item.channelLogo,
      startTime: item.starttime,
      endTime: item.endtime,
      image: item.srcItem,
      broadcastType: item.extensionInfo?.find((info: any) => info.key === 'broadcastType')?.value,
    }));
  } catch (error) {
    console.error('[TVPLUS] Error fetching sports:', error);
    return [];
  }
}

// Bugünkü futbol maçlarını çek
export async function getTodayFootballMatches(): Promise<TVPlusProgram[]> {
  try {
    console.log('[TVPLUS] Fetching today football matches...');
    
    const response = await fetch('https://tvplus.com.tr/canli-tv/yayin-akisi/bugun-hangi-futbol-maclari-var', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    
    if (!nextDataMatch) {
      console.error('[TVPLUS] __NEXT_DATA__ not found');
      return [];
    }

    const nextData = JSON.parse(nextDataMatch[1]);
    const dayPlaybills = nextData?.props?.pageProps?.pageData?.dayPlaybills || [];

    console.log(`[TVPLUS] Parsed ${dayPlaybills.length} football matches`);

    return dayPlaybills.map((item: any) => ({
      id: item.id,
      name: item.name,
      genres: item.genres,
      introduce: item.introduce,
      channelId: item.channelid,
      channelName: item.channelName,
      channelLogo: item.channelLogo,
      startTime: item.starttime,
      endTime: item.endtime,
      image: item.srcItem,
      broadcastType: item.extensionInfo?.find((info: any) => info.key === 'broadcastType')?.value,
    }));
  } catch (error) {
    console.error('[TVPLUS] Error fetching football matches:', error);
    return [];
  }
}

// Bugünkü basketbol maçlarını çek
export async function getTodayBasketballMatches(): Promise<TVPlusProgram[]> {
  try {
    console.log('[TVPLUS] Fetching today basketball matches...');
    
    const response = await fetch('https://tvplus.com.tr/canli-tv/yayin-akisi/bugun-hangi-basketbol-maclari-var', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    
    if (!nextDataMatch) {
      console.error('[TVPLUS] __NEXT_DATA__ not found');
      return [];
    }

    const nextData = JSON.parse(nextDataMatch[1]);
    const dayPlaybills = nextData?.props?.pageProps?.pageData?.dayPlaybills || [];

    console.log(`[TVPLUS] Parsed ${dayPlaybills.length} basketball matches`);

    return dayPlaybills.map((item: any) => ({
      id: item.id,
      name: item.name,
      genres: item.genres,
      introduce: item.introduce,
      channelId: item.channelid,
      channelName: item.channelName,
      channelLogo: item.channelLogo,
      startTime: item.starttime,
      endTime: item.endtime,
      image: item.srcItem,
      broadcastType: item.extensionInfo?.find((info: any) => info.key === 'broadcastType')?.value,
    }));
  } catch (error) {
    console.error('[TVPLUS] Error fetching basketball matches:', error);
    return [];
  }
}

// Timestamp'i saat:dakika formatına çevir
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

