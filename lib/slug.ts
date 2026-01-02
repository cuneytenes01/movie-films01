import { searchContent, searchPerson, Movie, TVShow } from '@/lib/tmdb';

// Türkçe karakterleri İngilizce karşılıklarına çevir
function turkishToEnglish(text: string): string {
  const turkishChars: Record<string, string> = {
    'ş': 's', 'Ş': 'S',
    'ı': 'i', 'İ': 'I',
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C',
  };
  
  return text.split('').map(char => turkishChars[char] || char).join('');
}

// Başlıktan SEO-friendly slug oluştur
export function createSlug(title: string, type: 'movie' | 'tv'): string {
  // Türkçe karakterleri çevir
  let slug = turkishToEnglish(title);
  
  // Küçük harfe çevir
  slug = slug.toLowerCase();
  
  // Özel karakterleri temizle, sadece harf, rakam ve boşluk bırak
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  
  // Birden fazla boşluğu tek boşluğa çevir
  slug = slug.replace(/\s+/g, ' ');
  
  // Boşlukları tire ile değiştir
  slug = slug.trim().replace(/\s+/g, '-');
  
  // Birden fazla tire'yi tek tire'ye çevir
  slug = slug.replace(/-+/g, '-');
  
  // Başta ve sonda tire varsa kaldır
  slug = slug.replace(/^-+|-+$/g, '');
  
  // Tip'e göre suffix ekle
  const suffix = type === 'movie' ? '-filmi-hangi-platformda' : '-dizisi-hangi-platformda';
  
  return `${slug}${suffix}`;
}

// Slug'dan film/dizi adını çıkar
function extractTitleFromSlug(slug: string): { title: string; type: 'movie' | 'tv' | null } {
  // Boş veya sadece tire içeren slug'ları kontrol et
  if (!slug || slug.trim() === '' || slug.trim() === '-') {
    return { title: '', type: null };
  }
  
  // Başta ve sonda tire'leri temizle
  let cleanSlug = slug.trim().replace(/^-+|-+$/g, '');
  
  if (!cleanSlug || cleanSlug === '') {
    return { title: '', type: null };
  }
  
  // Suffix'leri kaldır
  let title = cleanSlug.replace(/-filmi-hangi-platformda$/, '');
  let type: 'movie' | 'tv' | null = 'movie';
  
  if (title === cleanSlug) {
    // Film suffix'i yoksa dizi suffix'ini dene
    title = cleanSlug.replace(/-dizisi-hangi-platformda$/, '');
    if (title !== cleanSlug) {
      type = 'tv';
    } else {
      // Hiçbiri yoksa null döndür
      return { title: '', type: null };
    }
  }
  
  // Başta ve sonda kalan tire'leri temizle
  title = title.replace(/^-+|-+$/g, '').trim();
  
  if (!title || title === '') {
    return { title: '', type: null };
  }
  
  // Tire'leri boşluğa çevir
  title = title.replace(/-/g, ' ');
  
  return { title, type };
}

// Slug'dan TMDB ID'yi bul (TMDB Search API kullanarak)
export async function getIdFromSlug(slug: string): Promise<{ id: number | null; type: 'movie' | 'tv' | null }> {
  try {
    const { title, type } = extractTitleFromSlug(slug);
    
    if (!title || !type) {
      console.error('extractTitleFromSlug başarısız:', { slug, title, type });
      return { id: null, type: null };
    }
    
    // TMDB Search API ile arama yap
    const searchResults = await searchContent(title, 1);
    
    if (!searchResults.results || searchResults.results.length === 0) {
      console.error('TMDB search sonuç bulamadı:', { title, type });
      return { id: null, type: null };
    }
    
    // Tip'e göre filtrele
    const filteredResults = searchResults.results.filter(item => {
      if (type === 'movie') {
        return 'title' in item; // Movie
      } else {
        return 'name' in item; // TV Show
      }
    });
    
    if (filteredResults.length === 0) {
      console.error('Filtrelenmiş sonuç bulunamadı:', { title, type, totalResults: searchResults.results.length });
      return { id: null, type: null };
    }
    
    // İlk sonucu al (en popüler/ilgili olanı)
    const firstResult = filteredResults[0];
    
    // Başlık eşleşmesini kontrol et (fuzzy match)
    const resultTitle = type === 'movie' 
      ? (firstResult as Movie).title.toLowerCase()
      : (firstResult as TVShow).name.toLowerCase();
    
    const searchTitle = title.toLowerCase();
    
    // Basit eşleşme kontrolü (tam eşleşme veya içeriyor mu)
    if (resultTitle.includes(searchTitle) || searchTitle.includes(resultTitle)) {
      return { id: firstResult.id, type };
    }
    
    // Eşleşme yoksa yine de ilk sonucu döndür (fallback)
    console.warn('Tam eşleşme bulunamadı, ilk sonuç kullanılıyor:', { 
      searchTitle, 
      resultTitle, 
      id: firstResult.id 
    });
    return { id: firstResult.id, type };
    
  } catch (error) {
    console.error('Slug\'dan ID bulunamadı:', error);
    return { id: null, type: null };
  }
}

// Person adından SEO-friendly slug oluştur
export function createPersonSlug(name: string): string {
  // Türkçe karakterleri çevir
  let slug = turkishToEnglish(name);
  
  // Küçük harfe çevir
  slug = slug.toLowerCase();
  
  // Özel karakterleri temizle, sadece harf, rakam ve boşluk bırak
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  
  // Birden fazla boşluğu tek boşluğa çevir
  slug = slug.replace(/\s+/g, ' ');
  
  // Boşlukları tire ile değiştir
  slug = slug.trim().replace(/\s+/g, '-');
  
  // Birden fazla tire'yi tek tire'ye çevir
  slug = slug.replace(/-+/g, '-');
  
  // Başta ve sonda tire varsa kaldır
  slug = slug.replace(/^-+|-+$/g, '');
  
  // Person suffix ekle
  return `${slug}-filmleri-dizileri`;
}

// Person slug'dan ismi çıkar
function extractNameFromPersonSlug(slug: string): string {
  // Suffix'i kaldır
  let name = slug.replace(/-filmleri-dizileri$/, '');
  
  // Tire'leri boşluğa çevir
  name = name.replace(/-/g, ' ');
  
  return name;
}

// Person slug'dan TMDB ID'yi bul (TMDB Person Search API kullanarak)
export async function getPersonIdFromSlug(slug: string): Promise<number | null> {
  try {
    const name = extractNameFromPersonSlug(slug);
    
    if (!name) {
      return null;
    }
    
    // TMDB Person Search API ile arama yap
    const searchResults = await searchPerson(name, 1);
    
    if (!searchResults.results || searchResults.results.length === 0) {
      return null;
    }
    
    // İlk sonucu al (en popüler/ilgili olanı)
    const firstResult = searchResults.results[0];
    
    // İsim eşleşmesini kontrol et (fuzzy match)
    const resultName = firstResult.name.toLowerCase();
    const searchName = name.toLowerCase();
    
    // Basit eşleşme kontrolü (tam eşleşme veya içeriyor mu)
    if (resultName.includes(searchName) || searchName.includes(resultName)) {
      return firstResult.id;
    }
    
    // Eşleşme yoksa yine de ilk sonucu döndür (fallback)
    return firstResult.id;
  } catch (error) {
    console.error('Person slug\'dan ID bulunamadı:', error);
    return null;
  }
}

