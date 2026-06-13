// MangaDex scraper - uses official MangaDex API
import { BaseScraper, type MangaInfo, type ChapterInfo, type MangaPage, type SourceConfig } from './base-scraper';

interface MangaDexManga {
  id: string;
  attributes: {
    title: Record<string, string>;
    altTitles: Record<string, string[]>;
    description: Record<string, string>;
    tags: Array<{
      attributes: {
        name: Record<string, string>;
        group: string;
      };
    }>;
    status: string;
    contentRating: string;
    originalLanguage: string;
    lastChapter?: string;
    lastVolume?: string;
    year?: number;
  };
  relationships: Array<{
    type: string;
    id: string;
    attributes?: {
      name?: string;
      fileName?: string;
    };
  }>;
}

interface MangaDexChapter {
  id: string;
  attributes: {
    chapter: string;
    title?: string;
    translatedLanguage: string;
    publishAt: string;
    pages: number;
    chapterName?: string;
  };
  relationships: Array<{
    type: string;
    id: string;
  }>;
}

interface MangaDexPage {
  originalFileName: string;
  hash: string;
  data: string[];
  dataSaver: string[];
}

export class MangaDexScraper extends BaseScraper {
  readonly config: SourceConfig = {
    id: 'mangadex',
    name: 'MangaDex',
    lang: 'en',
    baseUrl: 'https://api.mangadex.org',
    nsfw: 0,
  };

  private readonly API_BASE = 'https://api.mangadex.org';
  private readonly COVER_BASE = 'https://uploads.mangadex.org/covers';

  /**
   * Search manga on MangaDex
   */
  async searchManga(query: string): Promise<MangaInfo[]> {
    try {
      const url = `${this.API_BASE}/manga?title=${encodeURIComponent(query)}&limit=20&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`;
      const data = await this.fetchJSON(url);

      if (!data || !data.data) {
        console.log('No results from MangaDex search');
        return [];
      }

      const mangas: MangaInfo[] = data.data.map((item: MangaDexManga) => this.parseMangaDexManga(item));
      console.log(`Found ${mangas.length} manga from MangaDex search`);
      return mangas;
    } catch (error) {
      console.error('Error searching MangaDex:', error);
      return [];
    }
  }

  /**
   * Get popular manga from MangaDex (using trending endpoint)
   */
  async getPopularManga(): Promise<MangaInfo[]> {
    try {
      const url = `${this.API_BASE}/manga?order[followedCount]=desc&limit=50&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`;
      const data = await this.fetchJSON(url);

      if (!data || !data.data) {
        console.log('No popular manga from MangaDex');
        return [];
      }

      const mangas: MangaInfo[] = data.data.map((item: MangaDexManga) => this.parseMangaDexManga(item));
      console.log(`Found ${mangas.length} popular manga from MangaDex`);
      return mangas;
    } catch (error) {
      console.error('Error getting popular MangaDex:', error);
      return [];
    }
  }

  /**
   * Get latest updates from MangaDex (using latest chapter feed)
   */
  async getLatestManga(): Promise<MangaInfo[]> {
    try {
      const url = `${this.API_BASE}/manga?order[latestUploadedChapter]=desc&limit=30&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`;
      const data = await this.fetchJSON(url);

      if (!data || !data.data) {
        console.log('No latest manga from MangaDex');
        return [];
      }

      const mangas: MangaInfo[] = data.data.map((item: MangaDexManga) => this.parseMangaDexManga(item));
      console.log(`Found ${mangas.length} latest manga from MangaDex`);
      return mangas;
    } catch (error) {
      console.error('Error getting latest MangaDex:', error);
      return [];
    }
  }

  /**
   * Get manga details
   */
  async getMangaDetails(mangaUrl: string): Promise<MangaInfo | null> {
    try {
      const mangaId = this.extractMangaId(mangaUrl);
      const url = `${this.API_BASE}/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`;
      const data = await this.fetchJSON(url);

      if (!data || !data.data) {
        console.log('No manga details from MangaDex');
        return null;
      }

      const mangaInfo = this.parseMangaDexManga(data.data, true);
      console.log(`Fetched details for manga from MangaDex: ${mangaInfo.title}`);
      return mangaInfo;
    } catch (error) {
      console.error('Error getting manga details from MangaDex:', error);
      return null;
    }
  }

  /**
   * Get manga chapters
   */
  async getChapters(mangaUrl: string): Promise<ChapterInfo[]> {
    try {
      const mangaId = this.extractMangaId(mangaUrl);
      const url = `${this.API_BASE}/manga/${mangaId}/feed?translatedLanguage[]=en&translatedLanguage[]=it&order[chapter]=desc&limit=500`;
      const data = await this.fetchJSON(url);

      if (!data || !data.data) {
        console.log('No chapters from MangaDex');
        return [];
      }

      const chapters: ChapterInfo[] = data.data
        .map((item: MangaDexChapter) => this.parseMangaDexChapter(item, mangaId))
        .filter((ch: ChapterInfo | null) => ch !== null) as ChapterInfo[];

      console.log(`Found ${chapters.length} chapters from MangaDex`);
      return chapters;
    } catch (error) {
      console.error('Error getting chapters from MangaDex:', error);
      return [];
    }
  }

  /**
   * Get chapter pages
   */
  async getChapterPages(chapterUrl: string): Promise<MangaPage[]> {
    try {
      const chapterId = this.extractChapterId(chapterUrl);
      const url = `${this.API_BASE}/at-home/server/${chapterId}`;
      const data = await this.fetchJSON(url);

      if (!data || !data.chapter || !data.chapter.data) {
        console.log('No pages from MangaDex');
        return [];
      }

      const baseUrl = data.baseUrl;
      const hash = data.chapter.hash;
      const files = data.chapter.data;

      const pages: MangaPage[] = files.map((file: string, index: number) => ({
        url: `${baseUrl}/data/${hash}/${file}`,
        index: index,
        page: index + 1,
      }));

      console.log(`Found ${pages.length} pages from MangaDex`);
      return pages;
    } catch (error) {
      console.error('Error getting chapter pages from MangaDex:', error);
      return [];
    }
  }

  /**
   * Parse MangaDex manga response
   */
  private parseMangaDexManga(item: MangaDexManga, includeDetails = false): MangaInfo {
    const attributes = item.attributes;
    const title = attributes.title.en || Object.values(attributes.title)[0] || 'Unknown';
    const description = attributes.description.en || attributes.description.it || Object.values(attributes.description)[0];

    // Extract cover
    let coverUrl: string | undefined;
    const coverRel = item.relationships.find((r) => r.type === 'cover_art');
    if (coverRel && coverRel.attributes?.fileName) {
      coverUrl = `${this.COVER_BASE}/${item.id}/${coverRel.attributes.fileName}.256.jpg`;
      console.log(`[MangaDex] Cover URL for "${title}": ${coverUrl}`);
    } else {
      console.log(`[MangaDex] No cover found for "${title}", relationships:`, item.relationships.map(r => r.type));
    }

    // Extract author
    let author: string | undefined;
    const authorRel = item.relationships.find((r) => r.type === 'author');
    if (authorRel && authorRel.attributes?.name) {
      author = authorRel.attributes.name;
    }

    // Extract artist
    let artist: string | undefined;
    const artistRel = item.relationships.find((r) => r.type === 'artist');
    if (artistRel && artistRel.attributes?.name) {
      artist = artistRel.attributes.name;
    }

    // Extract genres
    const genres = attributes.tags
      .filter((tag) => tag.attributes.group === 'genre' || tag.attributes.group === 'theme')
      .map((tag) => tag.attributes.name.en || Object.values(tag.attributes.name)[0]);

    // Parse status
    const status = this.parseStatus(attributes.status);

    return {
      id: item.id,
      extensionId: 'mangadex-ext',
      sourceId: this.config.id,
      url: `${this.config.baseUrl}/manga/${item.id}`,
      title: title,
      altTitle: attributes.altTitles?.en?.[0],
      description: description || undefined,
      author: author,
      artist: artist,
      genre: genres.length > 0 ? genres : undefined,
      status: status,
      coverUrl: coverUrl,
      thumbnailUrl: coverUrl,
    };
  }

  /**
   * Parse MangaDex chapter response
   */
  private parseMangaDexChapter(item: MangaDexChapter, mangaId: string): ChapterInfo | null {
    const attributes = item.attributes;
    const chapterNum = attributes.chapter ? parseFloat(attributes.chapter) : null;

    if (chapterNum === null || isNaN(chapterNum)) {
      return null;
    }

    return {
      id: item.id,
      mangaId: mangaId,
      chapterNum: chapterNum,
      name: attributes.title || attributes.chapterName || `Chapter ${chapterNum}`,
      url: `${this.config.baseUrl}/chapter/${item.id}`,
      uploadedAt: new Date(attributes.publishAt),
    };
  }

  /**
   * Extract manga ID from URL
   */
  private extractMangaId(url: string): string {
    const match = url.match(/\/manga\/([a-f0-9-]+)/i);
    return match ? match[1] : '';
  }

  /**
   * Extract chapter ID from URL
   */
  private extractChapterId(url: string): string {
    const match = url.match(/\/chapter\/([a-f0-9-]+)/i);
    return match ? match[1] : '';
  }
}
