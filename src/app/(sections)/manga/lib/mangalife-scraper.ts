// MangaLife scraper - scrapes from MangaLife.cc
import * as cheerio from 'cheerio';
import { BaseScraper, type MangaInfo, type ChapterInfo, type MangaPage, type SourceConfig } from './base-scraper';

export class MangaLifeScraper extends BaseScraper {
  readonly config: SourceConfig = {
    id: 'mangalife',
    name: 'MangaLife',
    lang: 'en',
    baseUrl: 'https://mangalife.cc',
    nsfw: 0,
  };

  /**
   * Search manga on MangaLife
   */
  async searchManga(query: string): Promise<MangaInfo[]> {
    try {
      const searchUrl = `${this.config.baseUrl}/search?q=${encodeURIComponent(query)}`;
      const html = await this.fetchHTML(searchUrl);

      if (!html) {
        console.log('No HTML returned from MangaLife search');
        return [];
      }

      const $ = cheerio.load(html);
      const mangas: MangaInfo[] = [];

      // MangaLife uses specific selectors
      $('.search-results .manga-card, .manga-item, .row .manga-card').each((_, element) => {
        try {
          const $el = $(element);
          const link = $el.find('a').first();
          const href = link.attr('href');
          const img = $el.find('img').first();

          const title = img.attr('alt') || link.attr('title') || $el.find('.title, h3, h4').first().text().trim();
          const cover = img.attr('src') || img.attr('data-src') || img.attr('data-srcset');

          if (href && title) {
            const fullUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
            const mangaId = this.extractMangaId(fullUrl);

            mangas.push({
              id: mangaId,
              extensionId: 'mangalife-ext',
              sourceId: this.config.id,
              url: fullUrl,
              title: title,
              coverUrl: cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined,
              thumbnailUrl: cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined,
            });
          }
        } catch (error) {
          console.error('Error parsing manga card:', error);
        }
      });

      console.log(`Parsed ${mangas.length} manga from MangaLife search`);
      return mangas;
    } catch (error) {
      console.error('Error searching MangaLife:', error);
      return [];
    }
  }

  /**
   * Get popular manga from MangaLife
   */
  async getPopularManga(): Promise<MangaInfo[]> {
    try {
      const url = this.config.baseUrl;
      const html = await this.fetchHTML(url);

      if (!html) {
        console.log('Failed to fetch popular manga from MangaLife');
        return [];
      }

      const $ = cheerio.load(html);
      const mangas: MangaInfo[] = [];

      // Try to find popular/featured manga sections
      $('.popular .manga-card, .featured .manga-card, .grid .manga-card, .latest .manga-card').each((_, element) => {
        try {
          const $el = $(element);
          const link = $el.find('a').first();
          const href = link.attr('href');
          const img = $el.find('img').first();

          const title = img.attr('alt') || link.attr('title') || $el.find('.title, h3, h4').first().text().trim();
          const cover = img.attr('src') || img.attr('data-src') || img.attr('data-srcset');

          if (href && title) {
            const fullUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
            const mangaId = this.extractMangaId(fullUrl);

            mangas.push({
              id: mangaId,
              extensionId: 'mangalife-ext',
              sourceId: this.config.id,
              url: fullUrl,
              title: title,
              coverUrl: cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined,
              thumbnailUrl: cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined,
            });
          }
        } catch (error) {
          console.error('Error parsing manga card:', error);
        }
      });

      console.log(`Parsed ${mangas.length} manga from MangaLife`);
      return mangas.slice(0, 50);
    } catch (error) {
      console.error('Error getting popular MangaLife:', error);
      return [];
    }
  }

  /**
   * Get latest updates from MangaLife
   */
  async getLatestManga(): Promise<MangaInfo[]> {
    try {
      const url = this.config.baseUrl;
      const html = await this.fetchHTML(url);

      if (!html) {
        console.log('Failed to fetch latest manga from MangaLife');
        return [];
      }

      const $ = cheerio.load(html);
      const mangas: MangaInfo[] = [];

      // Find latest updates section
      $('.latest-updates .manga-card, .updates .manga-card, .recent .manga-card').each((_, element) => {
        try {
          const $el = $(element);
          const link = $el.find('a').first();
          const href = link.attr('href');
          const img = $el.find('img').first();

          const title = img.attr('alt') || link.attr('title') || $el.find('.title, h3, h4').first().text().trim();
          const cover = img.attr('src') || img.attr('data-src') || img.attr('data-srcset');

          if (href && title) {
            const fullUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
            const mangaId = this.extractMangaId(fullUrl);

            mangas.push({
              id: mangaId,
              extensionId: 'mangalife-ext',
              sourceId: this.config.id,
              url: fullUrl,
              title: title,
              coverUrl: cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined,
              thumbnailUrl: cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined,
            });
          }
        } catch (error) {
          console.error('Error parsing latest update:', error);
        }
      });

      console.log(`Parsed ${mangas.length} latest manga from MangaLife`);
      return mangas.slice(0, 30);
    } catch (error) {
      console.error('Error getting latest MangaLife:', error);
      return [];
    }
  }

  /**
   * Get manga details
   */
  async getMangaDetails(mangaUrl: string): Promise<MangaInfo | null> {
    try {
      const html = await this.fetchHTML(mangaUrl);

      if (!html) {
        console.log('Failed to fetch manga details from MangaLife');
        return null;
      }

      const $ = cheerio.load(html);

      const title =
        $('h1.title, .manga-title, h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content') ||
        '';

      const cover =
        $('.cover img, .manga-cover img, .thumbnail img').first().attr('src') ||
        $('.cover img, .manga-cover img, .thumbnail img').first().attr('data-src') ||
        $('meta[property="og:image"]').attr('content') ||
        '';

      const description = $('.description, .summary, .manga-summary').first().text().trim() || '';

      const author = $('.author, .meta-author').first().text().trim() || '';
      const artist = $('.artist, .meta-artist').first().text().trim() || '';

      const statusText = $('.status, .manga-status').first().text().trim().toLowerCase() || '';
      const status = this.parseStatus(statusText);

      const genres: string[] = [];
      $('.genres a, .genre a, .tags a').each((_, el) => {
        const genre = $(el).text().trim();
        if (genre) {
          genres.push(genre);
        }
      });

      let rating: number | undefined;
      const ratingText = $('.rating, .score').first().text().trim();
      const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
      }

      const mangaId = this.extractMangaId(mangaUrl);

      const mangaInfo: MangaInfo = {
        id: mangaId,
        extensionId: 'mangalife-ext',
        sourceId: this.config.id,
        url: mangaUrl,
        title: title || mangaId,
        description: description || undefined,
        author: author || undefined,
        artist: artist || undefined,
        genre: genres.length > 0 ? genres : undefined,
        status: status,
        coverUrl: cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined,
        thumbnailUrl: cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined,
        rating: rating,
      };

      console.log(`Fetched details for manga from MangaLife: ${title}`);
      return mangaInfo;
    } catch (error) {
      console.error('Error getting manga details from MangaLife:', error);
      return null;
    }
  }

  /**
   * Get manga chapters
   */
  async getChapters(mangaUrl: string): Promise<ChapterInfo[]> {
    try {
      const html = await this.fetchHTML(mangaUrl);

      if (!html) {
        console.log('Failed to fetch chapters from MangaLife');
        return [];
      }

      const $ = cheerio.load(html);
      const chapters: ChapterInfo[] = [];

      const selectors = [
        '.chapter-list a',
        '.chapters a',
        '.chapter-item a',
        '.chapter-row a',
        '.list-chapter a',
        'tbody tr a',
      ];

      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} chapters with selector: ${selector}`);

          elements.each((index, element) => {
            try {
              const $el = $(element);
              const href = $el.attr('href');
              const text = $el.text().trim();

              if (href) {
                const fullUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
                const chapterNum = this.extractChapterNumber(text);
                const mangaId = this.extractMangaId(mangaUrl);

                chapters.push({
                  id: `${mangaId}-ch-${chapterNum || index}`,
                  mangaId: mangaId,
                  chapterNum: chapterNum || index + 1,
                  name: text || `Chapter ${chapterNum || index + 1}`,
                  url: fullUrl,
                });
              }
            } catch (error) {
              console.error('Error parsing chapter:', error);
            }
          });

          if (chapters.length > 0) {
            break;
          }
        }
      }

      chapters.sort((a, b) => {
        if (a.chapterNum === b.chapterNum) return 0;
        return (a.chapterNum || 0) - (b.chapterNum || 0);
      });
      chapters.reverse();

      console.log(`Parsed ${chapters.length} chapters from MangaLife`);
      return chapters;
    } catch (error) {
      console.error('Error getting chapters from MangaLife:', error);
      return [];
    }
  }

  /**
   * Get chapter pages
   */
  async getChapterPages(chapterUrl: string): Promise<MangaPage[]> {
    try {
      const html = await this.fetchHTML(chapterUrl);

      if (!html) {
        console.log('Failed to fetch chapter pages from MangaLife');
        return [];
      }

      const $ = cheerio.load(html);
      const pages: MangaPage[] = [];

      // Try to extract pages from various selectors
      const imageSelectors = [
        '.chapter-image img',
        '.manga-page img',
        '.page-image img',
        '.img-container img',
        '#image-container img',
        '.reader-area img',
        '.chapter-images img',
        '.pages img',
        '.reading-content img',
        '.viewer img',
      ];

      let pageUrls: string[] = [];

      for (const selector of imageSelectors) {
        const images = $(selector);
        if (images.length > 0) {
          console.log(`Found ${images.length} images with selector: ${selector}`);

          images.each((_, img) => {
            const $img = $(img);
            const src =
              $img.attr('data-src') ||
              $img.attr('data-lazy-src') ||
              $img.attr('data-url') ||
              $img.attr('src') ||
              $img.attr('data-srcset');

            if (src && !src.startsWith('data:') && !src.endsWith('.svg')) {
              const fullUrl = src.startsWith('http') ? src : `${this.config.baseUrl}${src}`;
              if (!pageUrls.includes(fullUrl)) {
                pageUrls.push(fullUrl);
              }
            }
          });

          if (pageUrls.length > 0) {
            break;
          }
        }
      }

      if (pageUrls.length > 0) {
        pages.push(
          ...pageUrls.map((url, index) => ({
            url: url,
            index: index,
            page: index + 1,
          }))
        );

        console.log(`Parsed ${pages.length} pages from MangaLife`);
        return pages;
      }

      console.log(`No pages found for ${chapterUrl}`);
      return pages;
    } catch (error) {
      console.error('Error getting chapter pages from MangaLife:', error);
      return [];
    }
  }

  /**
   * Extract manga ID from URL
   */
  private extractMangaId(url: string): string {
    const match = url.match(/\/manga\/([^\/\?#]+)/i);
    return match ? match[1] : url.split('/').pop() || 'unknown';
  }
}
