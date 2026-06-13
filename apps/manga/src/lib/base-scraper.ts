// Base interface for all manga scrapers
// This standardizes how all scrapers should work

export interface MangaInfo {
  id: string;
  extensionId: string;
  sourceId: string;
  url: string;
  title: string;
  altTitle?: string;
  description?: string;
  author?: string;
  artist?: string;
  genre?: string[];
  status?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  coverUrl?: string;
  thumbnailUrl?: string;
  rating?: number;
}

export interface ChapterInfo {
  id: string;
  mangaId: string;
  chapterNum: number;
  name?: string;
  url: string;
  scanlator?: string;
  uploadedAt?: Date;
  read?: boolean;
}

export interface ChapterWithManga extends ChapterInfo {
  manga: {
    id: string;
    title: string;
    coverUrl?: string;
    url: string;
    sourceId: string;
  };
}

export interface MangaPage {
  url: string;
  index: number;
  page?: number;
}

export interface SourceConfig {
  id: string;
  name: string;
  lang: string;
  baseUrl: string;
  icon?: string;
  nsfw?: number; // 0 = safe, 1 = questionable, 2 = explicit
}

/**
 * Base interface that all scrapers must implement
 */
export abstract class BaseScraper {
  abstract readonly config: SourceConfig;
  abstract searchManga(query: string): Promise<MangaInfo[]>;
  abstract getPopularManga(): Promise<MangaInfo[]>;
  abstract getLatestManga(): Promise<MangaInfo[]>;
  abstract getMangaDetails(mangaUrl: string): Promise<MangaInfo | null>;
  abstract getChapters(mangaUrl: string): Promise<ChapterInfo[]>;
  abstract getChapterPages(chapterUrl: string): Promise<MangaPage[]>;

  /**
   * Helper method to fetch HTML with proper headers
   */
  protected async fetchHTML(url: string, options?: RequestInit): Promise<string> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.status}`);
        return '';
      }

      return await response.text();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return '';
    }
  }

  /**
   * Helper method to fetch JSON
   */
  protected async fetchJSON(url: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MangaFlow/1.0',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        console.error(`Failed to fetch JSON ${url}: ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching JSON ${url}:`, error);
      return null;
    }
  }

  /**
   * Helper method to extract chapter number from text
   */
  protected extractChapterNumber(text: string): number | null {
    const match = text.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  /**
   * Helper method to parse status from text
   */
  protected parseStatus(text: string): 'ongoing' | 'completed' | 'hiatus' | 'cancelled' {
    const lower = text.toLowerCase();

    if (lower.includes('ongoing') || lower.includes('in corso') || lower.includes('in corso di pubblicazione') || lower.includes('releasing') || lower.includes('continuing')) {
      return 'ongoing';
    }
    if (lower.includes('completed') || lower.includes('completato') || lower.includes('finito') || lower.includes('finished') || lower.includes('complete')) {
      return 'completed';
    }
    if (lower.includes('hiatus') || lower.includes('pausa') || lower.includes('in pausa') || lower.includes('on hold')) {
      return 'hiatus';
    }
    if (lower.includes('cancelled') || lower.includes('cancellato') || lower.includes('dropped') || lower.includes('discontinued')) {
      return 'cancelled';
    }

    return 'ongoing';
  }
}
