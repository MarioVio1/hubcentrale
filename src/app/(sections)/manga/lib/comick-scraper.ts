// Comick scraper - uses Comick API
import { BaseScraper, type MangaInfo, type ChapterInfo, type MangaPage, type SourceConfig } from './base-scraper';

interface ComickManga {
  id: string;
  title: string;
  slug: string;
  md_covers?: Array<{
    w: number;
    h: number;
    b2key: string;
  }>;
  md_titles?: Array<{
    title: string;
  }>;
  artist?: string;
  author?: string;
  status?: number;
  desc?: string;
  year?: number;
  lang?: string;
  md_comic_md_genres?: Array<{
    md_genres: {
      name: string;
    };
  }>;
}

interface ComickChapter {
  id: string;
  chap: string;
  title?: string;
  lang: string;
  group_name?: string;
  created_at: string;
  hid: string;
  md_comics?: {
    id: string;
    slug: string;
  };
}

export class ComickScraper extends BaseScraper {
  readonly config: SourceConfig = {
    id: 'comick',
    name: 'Comick',
    lang: 'en',
    baseUrl: 'https://comick.app',
    nsfw: 0,
  };

  private readonly API_BASE = 'https://api.comick.fun';

  /**
   * Search manga on Comick
   */
  async searchManga(query: string): Promise<MangaInfo[]> {
    try {
      const url = `${this.API_BASE}/v1.0/search?q=${encodeURIComponent(query)}&page=1&limit=20`;
      const data = await this.fetchJSON(url);

      if (!data || !data.data) {
        console.log('No results from Comick search');
        return [];
      }

      const mangas: MangaInfo[] = data.data.map((item: ComickManga) => this.parseComickManga(item));
      console.log(`Found ${mangas.length} manga from Comick search`);
      return mangas;
    } catch (error) {
      console.error('Error searching Comick:', error);
      return [];
    }
  }

  /**
   * Get popular manga from Comick
   */
  async getPopularManga(): Promise<MangaInfo[]> {
    try {
      const url = `${this.API_BASE}/v1.0/top?page=1&limit=50`;
      const data = await this.fetchJSON(url);

      if (!data || !data.data) {
        console.log('No popular manga from Comick');
        return [];
      }

      const mangas: MangaInfo[] = data.data.map((item: ComickManga) => this.parseComickManga(item));
      console.log(`Found ${mangas.length} popular manga from Comick`);
      return mangas;
    } catch (error) {
      console.error('Error getting popular Comick:', error);
      return [];
    }
  }

  /**
   * Get latest updates from Comick
   */
  async getLatestManga(): Promise<MangaInfo[]> {
    try {
      const url = `${this.API_BASE}/v1.0/chapter?page=1&limit=30&order=new`;
      const data = await this.fetchJSON(url);

      if (!data || !data.data) {
        console.log('No latest manga from Comick');
        return [];
      }

      // Get unique manga from chapters
      const uniqueMangas = new Map<string, ComickManga>();
      data.data.forEach((item: any) => {
        if (item.md_comics && !uniqueMangas.has(item.md_comics.id)) {
          uniqueMangas.set(item.md_comics.id, {
            id: item.md_comics.id,
            slug: item.md_comics.slug,
            title: item.md_comics.title || item.comic?.title || 'Unknown',
          });
        }
      });

      const mangas: MangaInfo[] = Array.from(uniqueMangas.values()).map((item: ComickManga) =>
        this.parseComickManga(item)
      );
      console.log(`Found ${mangas.length} latest manga from Comick`);
      return mangas.slice(0, 30);
    } catch (error) {
      console.error('Error getting latest Comick:', error);
      return [];
    }
  }

  /**
   * Get manga details
   */
  async getMangaDetails(mangaUrl: string): Promise<MangaInfo | null> {
    try {
      const mangaId = this.extractMangaId(mangaUrl);
      const url = `${this.API_BASE}/comic/${mangaId}?hid=${mangaId}`;
      const data = await this.fetchJSON(url);

      if (!data || !data.comic) {
        console.log('No manga details from Comick');
        return null;
      }

      const mangaInfo = this.parseComickManga(data.comic, true);
      console.log(`Fetched details for manga from Comick: ${mangaInfo.title}`);
      return mangaInfo;
    } catch (error) {
      console.error('Error getting manga details from Comick:', error);
      return null;
    }
  }

  /**
   * Get manga chapters
   */
  async getChapters(mangaUrl: string): Promise<ChapterInfo[]> {
    try {
      const mangaId = this.extractMangaId(mangaUrl);
      const url = `${this.API_BASE}/comic/${mangaId}/chapters?page=1&limit=500&chap-order=desc`;
      const data = await this.fetchJSON(url);

      if (!data || !data.data) {
        console.log('No chapters from Comick');
        return [];
      }

      const chapters: ChapterInfo[] = data.data
        .map((item: ComickChapter) => this.parseComickChapter(item, mangaId))
        .filter((ch: ChapterInfo | null) => ch !== null) as ChapterInfo[];

      console.log(`Found ${chapters.length} chapters from Comick`);
      return chapters;
    } catch (error) {
      console.error('Error getting chapters from Comick:', error);
      return [];
    }
  }

  /**
   * Get chapter pages
   */
  async getChapterPages(chapterUrl: string): Promise<MangaPage[]> {
    try {
      const chapterId = this.extractChapterId(chapterUrl);
      const url = `${this.API_BASE}/chapter/${chapterId}?tachiyomi=true`;
      const data = await this.fetchJSON(url);

      if (!data || !data.chapter || !data.chapter.images) {
        console.log('No pages from Comick');
        return [];
      }

      const images = data.chapter.images;
      const baseUrl = data.chapter.md_images?.high || data.chapter.md_images?.medium || '';

      const pages: MangaPage[] = images.map((img: any, index: number) => ({
        url: img.url || `${baseUrl}/${img.filename}`,
        index: index,
        page: index + 1,
      }));

      console.log(`Found ${pages.length} pages from Comick`);
      return pages;
    } catch (error) {
      console.error('Error getting chapter pages from Comick:', error);
      return [];
    }
  }

  /**
   * Parse Comick manga response
   */
  private parseComickManga(item: ComickManga, includeDetails = false): MangaInfo {
    const title = item.title || 'Unknown';

    // Extract cover
    let coverUrl: string | undefined;
    if (item.md_covers && item.md_covers.length > 0) {
      const cover = item.md_covers.find((c) => c.w >= 256) || item.md_covers[0];
      coverUrl = `https://meo.comick.pictures/${cover.b2key}`;
    }

    // Extract genres
    const genres = item.md_comic_md_genres
      ? item.md_comic_md_genres.map((g) => g.md_genres.name)
      : [];

    // Parse status (Comick uses numbers: 1=ongoing, 2=completed, 3=hiatus, 4=cancelled)
    let status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled' = 'ongoing';
    if (item.status !== undefined) {
      switch (item.status) {
        case 1:
          status = 'ongoing';
          break;
        case 2:
          status = 'completed';
          break;
        case 3:
          status = 'hiatus';
          break;
        case 4:
          status = 'cancelled';
          break;
      }
    }

    return {
      id: item.id,
      extensionId: 'comick-ext',
      sourceId: this.config.id,
      url: `${this.config.baseUrl}/comic/${item.slug}`,
      title: title,
      altTitle: item.md_titles?.[0]?.title,
      description: item.desc || undefined,
      author: item.author || undefined,
      artist: item.artist || undefined,
      genre: genres.length > 0 ? genres : undefined,
      status: status,
      coverUrl: coverUrl,
      thumbnailUrl: coverUrl,
    };
  }

  /**
   * Parse Comick chapter response
   */
  private parseComickChapter(item: ComickChapter, mangaId: string): ChapterInfo | null {
    const chapterNum = item.chap ? parseFloat(item.chap) : null;

    if (chapterNum === null || isNaN(chapterNum)) {
      return null;
    }

    return {
      id: item.id,
      mangaId: mangaId,
      chapterNum: chapterNum,
      name: item.title || `Chapter ${chapterNum}`,
      url: `${this.config.baseUrl}/chapter/${item.hid}`,
      scanlator: item.group_name,
      uploadedAt: new Date(item.created_at),
    };
  }

  /**
   * Extract manga ID/slug from URL
   */
  private extractMangaId(url: string): string {
    const match = url.match(/\/comic\/([a-z0-9-]+)/i);
    return match ? match[1] : '';
  }

  /**
   * Extract chapter ID from URL
   */
  private extractChapterId(url: string): string {
    const match = url.match(/\/chapter\/([a-z0-9-]+)/i);
    return match ? match[1] : '';
  }
}
