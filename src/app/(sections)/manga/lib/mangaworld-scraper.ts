// Real MangaWorld scraper that fetches data from https://www.mangaworld.mx
import * as cheerio from 'cheerio';
import { BaseScraper, type MangaInfo, type ChapterInfo, type MangaPage, type SourceConfig, type ChapterWithManga } from './base-scraper';

export class MangaWorldScraper extends BaseScraper {
  readonly config: SourceConfig = {
    id: 'mangaworld',
    name: 'MangaWorld',
    lang: 'it',
    baseUrl: 'https://www.mangaworld.mx',
    nsfw: 0,
  };

  /**
   * Search manga on MangaWorld
   */
  async searchManga(query: string): Promise<MangaInfo[]> {
    try {
      const searchUrl = `${this.config.baseUrl}/archive?keyword=${encodeURIComponent(query)}`;
      const html = await this.fetchHTML(searchUrl);

      if (!html) {
        console.log('No HTML returned from search');
        return [];
      }

      const $ = cheerio.load(html);
      const mangas: MangaInfo[] = [];

      // Try multiple selectors for manga cards
      const selectors = [
        '.manga-card',
        '.thumb',
        '.entry',
        '.manga-item',
        'article',
        '.comic-grid .thumb',
        '.archive-grid .thumb',
        '.col-6 .thumb',
        '.col-sm-6 .thumb',
      ];

      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} manga cards with selector: ${selector}`);

          elements.each((_, element) => {
            try {
              const $el = $(element);
              const link = $el.find('a').first();
              const href = link.attr('href');
              const img = $el.find('img').first();

              // Try multiple sources for title
              const title =
                img.attr('alt') ||
                link.attr('title') ||
                $el.find('.title, .entry-title, .manga-title, h2, h3, .series-title').first().text().trim();

              // Try multiple sources for cover
              const cover =
                img.attr('data-src') ||
                img.attr('data-lazy-src') ||
                img.attr('src') ||
                img.attr('data-srcset');

              if (href && title && title !== '') {
                const fullUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
                const mangaId = this.extractMangaId(fullUrl);

                const coverUrl = cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined;

                if (coverUrl) {
                  console.log(`[MangaWorld] Found cover for "${title}": ${coverUrl}`);
                } else {
                  console.log(`[MangaWorld] No cover found for "${title}", img src: ${img.attr('src')}, data-src: ${img.attr('data-src')}`);
                }

                mangas.push({
                  id: mangaId,
                  extensionId: 'mangaworld-ext',
                  sourceId: this.config.id,
                  url: fullUrl,
                  title: title,
                  coverUrl: coverUrl,
                  thumbnailUrl: coverUrl,
                });
              }
            } catch (error) {
              console.error('Error parsing manga card:', error);
            }
          });

          if (mangas.length > 0) {
            break;
          }
        }
      }

      console.log(`Parsed ${mangas.length} manga from search`);
      return mangas;
    } catch (error) {
      console.error('Error searching MangaWorld:', error);
      return [];
    }
  }

  /**
   * Get popular manga from MangaWorld
   */
  async getPopularManga(): Promise<MangaInfo[]> {
    try {
      const url = `${this.config.baseUrl}/archive`;
      const html = await this.fetchHTML(url);

      if (!html) {
        console.log('Failed to fetch popular manga, returning empty array');
        return [];
      }

      const $ = cheerio.load(html);
      const mangas: MangaInfo[] = [];

      // Try different selectors for manga cards
      const selectors = [
        '.manga-card',
        '.thumb',
        '.entry',
        '.manga-item',
        'article',
        '.comic-grid .thumb',
        '.archive-grid .thumb',
        '.col-6 .thumb',
        '.col-sm-6 .thumb',
      ];

      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} manga with selector: ${selector}`);

          elements.each((_, element) => {
            try {
              const $el = $(element);
              const link = $el.find('a').first();
              const href = link.attr('href');
              const img = $el.find('img').first();

              // Try multiple sources for title
              const title =
                img.attr('alt') ||
                link.attr('title') ||
                $el.find('.title, .entry-title, .manga-title, .series-title, h2, h3').first().text().trim();

              // Try multiple sources for cover
              const cover =
                img.attr('data-src') ||
                img.attr('data-lazy-src') ||
                img.attr('src') ||
                img.attr('data-srcset');

              if (href && title && title !== '') {
                const fullUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
                const mangaId = this.extractMangaId(fullUrl);

                const coverUrl = cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined;

                if (coverUrl) {
                  console.log(`[MangaWorld] Popular - Found cover for "${title}": ${coverUrl}`);
                } else {
                  console.log(`[MangaWorld] Popular - No cover found for "${title}", img src: ${img.attr('src')}, data-src: ${img.attr('data-src')}`);
                }

                mangas.push({
                  id: mangaId,
                  extensionId: 'mangaworld-ext',
                  sourceId: this.config.id,
                  url: fullUrl,
                  title: title,
                  coverUrl: coverUrl,
                  thumbnailUrl: coverUrl,
                });
              }
            } catch (error) {
              console.error('Error parsing manga card:', error);
            }
          });

          if (mangas.length > 0) {
            break;
          }
        }
      }

      console.log(`Parsed ${mangas.length} manga from MangaWorld`);
      return mangas.slice(0, 50); // Limit to first 50
    } catch (error) {
      console.error('Error getting popular MangaWorld:', error);
      return [];
    }
  }

  /**
   * Get latest updates from MangaWorld
   */
  async getLatestManga(): Promise<MangaInfo[]> {
    try {
      const url = this.config.baseUrl;
      const html = await this.fetchHTML(url);

      if (!html) {
        console.log('Failed to fetch latest manga');
        return [];
      }

      const $ = cheerio.load(html);
      const mangas: MangaInfo[] = [];

      // Try different selectors for latest updates
      const selectors = [
        '.update-item',
        '.latest-updates .manga-card',
        '.manga-update',
        '.update .thumb',
        '.recent-updates .thumb',
        '.home-right .thumb',
      ];

      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} latest updates with selector: ${selector}`);

          elements.each((_, element) => {
            try {
              const $el = $(element);
              const link = $el.find('a').first();
              const href = link.attr('href');
              const img = $el.find('img').first();

              // Try multiple sources for title
              const title =
                img.attr('alt') ||
                link.attr('title') ||
                $el.find('.title, .entry-title, .manga-title, .series-title').first().text().trim();

              // Try multiple sources for cover
              const cover =
                img.attr('data-src') ||
                img.attr('data-lazy-src') ||
                img.attr('src') ||
                img.attr('data-srcset');

              if (href && title && title !== '') {
                const fullUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
                const mangaId = this.extractMangaId(fullUrl);

                const coverUrl = cover ? (cover.startsWith('http') ? cover : `${this.config.baseUrl}${cover}`) : undefined;

                if (coverUrl) {
                  console.log(`[MangaWorld] Latest - Found cover for "${title}": ${coverUrl}`);
                } else {
                  console.log(`[MangaWorld] Latest - No cover found for "${title}", img src: ${img.attr('src')}, data-src: ${img.attr('data-src')}`);
                }

                mangas.push({
                  id: mangaId,
                  extensionId: 'mangaworld-ext',
                  sourceId: this.config.id,
                  url: fullUrl,
                  title: title,
                  coverUrl: coverUrl,
                  thumbnailUrl: coverUrl,
                });
              }
            } catch (error) {
              console.error('Error parsing latest update:', error);
            }
          });

          if (mangas.length > 0) {
            break;
          }
        }
      }

      console.log(`Parsed ${mangas.length} latest manga from MangaWorld`);
      return mangas.slice(0, 30); // Limit to first 30
    } catch (error) {
      console.error('Error getting latest MangaWorld:', error);
      return [];
    }
  }

  /**
   * Normalize URL to always have trailing slash for MangaWorld
   */
  private normalizeUrl(url: string): string {
    return url.replace(/\/$/, '') + '/';
  }

  /**
   * Get manga details
   */
  async getMangaDetails(mangaUrl: string): Promise<MangaInfo | null> {
    try {
      const normalizedUrl = this.normalizeUrl(mangaUrl);
      const html = await this.fetchHTML(normalizedUrl);

      if (!html) {
        console.log('Failed to fetch manga details');
        return null;
      }

      const $ = cheerio.load(html);

      // Try to extract title
      const title =
        $('h1.title, .manga-title, h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content') ||
        $('.info .title h1').text().trim() ||
        '';

      // Try to extract cover
      const cover =
        $('.cover img, .manga-cover img, .thumbnail img, .info-left img').first().attr('src') ||
        $('.cover img, .manga-cover img, .thumbnail img, .info-left img').first().attr('data-src') ||
        $('meta[property="og:image"]').attr('content') ||
        '';

      // Try to extract description
      const description = $('.description, .summary, .manga-summary, .info-desc').first().text().trim() || '';

      // Try to extract author
      const author =
        $('.author a, .meta-author a, .info-author').first().text().trim() ||
        $('span:contains("Autore"), span:contains("Author")').next().text().trim() ||
        $('.info .meta-row:contains("Autore") a').text().trim() ||
        '';

      // Try to extract artist
      const artist =
        $('.artist a, .meta-artist a, .info-artist').first().text().trim() ||
        $('span:contains("Artista"), span:contains("Artist")').next().text().trim() ||
        $('.info .meta-row:contains("Artista") a').text().trim() ||
        '';

      // Try to extract status
      const statusText =
        $('.status, .manga-status, .info-status, .meta-status').first().text().trim().toLowerCase() ||
        $('.info .meta-row:contains("Stato")').text().trim().toLowerCase() ||
        '';
      const status = this.parseStatus(statusText);

      // Try to extract genres
      const genres: string[] = [];
      $('.genres a, .genre a, .manga-genres a, .tags a, .meta-genres a').each((_, el) => {
        const genre = $(el).text().trim();
        if (genre) {
          genres.push(genre);
        }
      });

      // Try to extract rating
      let rating: number | undefined;
      const ratingText = $('.rating, .score, .manga-rating, .meta-rating').first().text().trim();
      const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
      }

      const mangaId = this.extractMangaId(mangaUrl);

      const mangaInfo: MangaInfo = {
        id: mangaId,
        extensionId: 'mangaworld-ext',
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

      console.log(`Fetched details for manga: ${title} (${genres.length} genres, ${genres.join(', ')})`);
      return mangaInfo;
    } catch (error) {
      console.error('Error getting manga details:', error);
      return null;
    }
  }

  /**
   * Get manga chapters
   */
  async getChapters(mangaUrl: string): Promise<ChapterInfo[]> {
    try {
      const normalizedUrl = this.normalizeUrl(mangaUrl);
      const html = await this.fetchHTML(normalizedUrl);

      if (!html) {
        console.log('Failed to fetch chapters');
        return [];
      }

      const $ = cheerio.load(html);
      const chapters: ChapterInfo[] = [];

      // Try different selectors for chapters
      const selectors = [
        '.chapter a.chap',
        '.chapter-list a',
        '.chapters-list a',
        '.chapter-item a',
        '.chapters .chap',
        '.chapter-row a',
        '.list-chapter a',
      ];

      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} chapters with selector: ${selector}`);

          elements.each((index, element) => {
            try {
              const $el = $(element);
              const href = $el.attr('href');
              const text = $el.find('span').first().text().trim() || $el.text().trim();

              if (href) {
                const fullUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
                const chapterNum = this.extractChapterNumber(text);
                const mangaId = this.extractMangaId(mangaUrl);

                chapters.push({
                  id: `${mangaId}-ch-${chapterNum || index}`,
                  mangaId: mangaId,
                  chapterNum: chapterNum || index + 1,
                  name: text || `Capitolo ${chapterNum || index + 1}`,
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

      // Sort chapters by chapter number (descending) and then reverse
      // This ensures chapters are always ordered consistently
      chapters.sort((a, b) => {
        if (a.chapterNum === b.chapterNum) return 0;
        return (a.chapterNum || 0) - (b.chapterNum || 0);
      });

      // Reverse to show newest first
      chapters.reverse();

      console.log(`Parsed ${chapters.length} chapters from ${mangaUrl}`);
      return chapters;
    } catch (error) {
      console.error('Error getting chapters:', error);
      return [];
    }
  }

  /**
   * Get chapter pages - MangaWorld specific implementation
   * Pages are accessed via URLs like: .../read/{chapter-id}/1, /2, /3, etc.
   */
  async getChapterPages(chapterUrl: string): Promise<MangaPage[]> {
    try {
      // Normalize chapter URL
      let normalizedUrl = chapterUrl.endsWith('/') ? chapterUrl : chapterUrl + '/';
      console.log(`Fetching chapter pages from: ${normalizedUrl}`);

      // First, try to fetch the chapter page to get the base URL and page count
      const html = await this.fetchHTML(normalizedUrl);

      if (!html) {
        console.log('Failed to fetch chapter page');
        return [];
      }

      const $ = cheerio.load(html);
      const pages: MangaPage[] = [];

      // Extract the base URL pattern for pages
      // The chapter URL might be like: .../read/60bea24f23fd5f7ca6e58961/ or .../read/60bea24f23fd5f7ca6e58961
      let baseUrl = '';

      // Try to extract from page selector dropdown (reliable method)
      const pageSelect = $('select.page.custom-select, select#page-select, select.page-selector, select[onchange*="changePage"], select.page-list').first();
      let totalPages = 0;

      if (pageSelect.length > 0) {
        const options = pageSelect.find('option');
        totalPages = options.length;
        console.log(`Found ${totalPages} pages from select dropdown`);

        // Get the first option value to determine the URL pattern
        const firstOption = options.first();
        let firstPageUrl = firstOption.attr('value') || firstOption.text().trim();

        // If the option value is a relative URL, make it absolute
        if (firstPageUrl && !firstPageUrl.startsWith('http')) {
          if (firstPageUrl.startsWith('/')) {
            firstPageUrl = this.config.baseUrl + firstPageUrl;
          } else {
            // Try to get from onchange attribute
            const onchange = pageSelect.attr('onchange') || '';
            const changeMatch = onchange.match(/changePage\(['"]([^'"]+)['"]\)/);
            if (changeMatch) {
              let urlPattern = changeMatch[1];
              // Replace {page} placeholder or similar with 1
              firstPageUrl = urlPattern.replace(/{page}/g, '1').replace(/{num}/g, '1');
            }
          }
        }

        if (firstPageUrl) {
          // Extract base URL (remove page number at the end)
          const urlMatch = firstPageUrl.match(/^(.*\/read\/[^\/]+\/)\d+\/?$/);
          if (urlMatch) {
            baseUrl = urlMatch[1];
            console.log(`Extracted base URL: ${baseUrl}`);
          } else {
            // Fallback: try to extract from the original chapter URL
            const chapterMatch = normalizedUrl.match(/^(.*\/read\/[^\/]+)\/?$/);
            if (chapterMatch) {
              baseUrl = chapterMatch[1] + '/';
              console.log(`Using chapter URL as base: ${baseUrl}`);
            }
          }
        }
      }

      // Fallback: Try to extract base URL from chapter URL directly
      if (!baseUrl) {
        const chapterMatch = normalizedUrl.match(/^(.*\/read\/[^\/]+)\/?$/);
        if (chapterMatch) {
          baseUrl = chapterMatch[1] + '/';
          console.log(`Using chapter URL as base (fallback): ${baseUrl}`);
        }
      }

      // If we couldn't determine total pages, try a different approach
      if (totalPages === 0) {
        // Try to find page count from alternative sources
        const pageText = $('.page-info, .pagination-info, .chapter-pages, .page-count').first().text().trim();
        const pageMatch = pageText.match(/(\d+)\s*(?:pages?|pagine|\/)/i);
        if (pageMatch) {
          totalPages = parseInt(pageMatch[1]);
          console.log(`Found ${totalPages} pages from text: ${pageText}`);
        }
      }

      // If still no page count, try a reasonable default or check if there's an image
      if (totalPages === 0) {
        console.log('Could not determine page count, trying to fetch first page...');
        // Try to fetch page 1 and see if we can find pagination info
        if (baseUrl) {
          const page1Url = baseUrl + '1/';
          const page1Html = await this.fetchHTML(page1Url);
          if (page1Html) {
            const $1 = cheerio.load(page1Html);
            const select1 = $1('select.page.custom-select, select#page-select, select.page-selector').first();
            if (select1.length > 0) {
              totalPages = select1.find('option').length;
              console.log(`Found ${totalPages} pages from page 1`);
            }
          }
        }
      }

      // If we have a base URL and page count, generate all page URLs
      if (baseUrl && totalPages > 0) {
        console.log(`Generating ${totalPages} page URLs from ${baseUrl}`);

        for (let i = 1; i <= totalPages; i++) {
          const pageUrl = baseUrl + i + '/';

          // Fetch each page to extract the image URL
          try {
            const pageHtml = await this.fetchHTML(pageUrl);
            if (pageHtml) {
              const $page = cheerio.load(pageHtml);

              // Try multiple image selectors
              const imgSelectors = [
                '#page img.img-fluid',
                '#image-container img',
                '.reader-area img',
                '.chapter-view img',
                'img.chapter-img',
                '.page-image img',
                '.manga-page img',
                '.chapter-page img',
                '.img-container img',
                '.reading-content img',
                'img.img-fluid',
              ];

              let imageUrl = '';
              for (const selector of imgSelectors) {
                const img = $page(selector).first();
                if (img.length > 0) {
                  imageUrl =
                    img.attr('data-src') ||
                    img.attr('data-lazy-src') ||
                    img.attr('src') ||
                    img.attr('data-url') ||
                    '';
                  if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.endsWith('.svg')) {
                    // Make absolute URL if needed
                    if (!imageUrl.startsWith('http')) {
                      imageUrl = imageUrl.startsWith('/') ? this.config.baseUrl + imageUrl : this.config.baseUrl + '/' + imageUrl;
                    }
                    break;
                  }
                }
              }

              if (imageUrl) {
                pages.push({
                  url: imageUrl,
                  index: i - 1,
                  page: i,
                });
                console.log(`Page ${i}: ${imageUrl}`);
              } else {
                console.log(`No image found for page ${i}`);
                // Still add a placeholder to maintain page numbering
                pages.push({
                  url: '',
                  index: i - 1,
                  page: i,
                });
              }
            }
          } catch (pageError) {
            console.error(`Error fetching page ${i}:`, pageError);
          }

          // Add a small delay to avoid overwhelming the server
          if (i < totalPages) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        console.log(`Successfully fetched ${pages.filter(p => p.url).length}/${totalPages} pages`);
        return pages;
      }

      // Fallback: Try to extract images directly from the initial HTML
      console.log('Could not generate page URLs, trying direct image extraction...');

      const imageSelectors = [
        '.page-image img',
        '.manga-page img',
        '.chapter-page img',
        '.img-container img',
        '#image-container img',
        '.reader-area img',
        '.chapter-images img',
        '.pages img',
        '.reading-content img',
        '.reader .image-container img',
        '.chapter-view .page img',
        '.read-container img',
        '.img-wrapper img',
        '.page-wrapper img',
        '.manga-reader img',
        '.viewer-area img',
        'img.img-fluid',
        '.chapter-img',
        '.page-img',
        '.scan-page img',
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

        console.log(`Parsed ${pages.length} pages from direct image extraction`);
        return pages;
      }

      console.log(`No pages found for ${chapterUrl}`);
      return pages;
    } catch (error) {
      console.error('Error getting chapter pages:', error);
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

  /**
   * Get trending chapters (capitoli di tendenza) from MangaWorld homepage
   */
  async getTrendingChapters(): Promise<ChapterWithManga[]> {
    try {
      const url = this.config.baseUrl;
      const html = await this.fetchHTML(url);

      if (!html) {
        console.log('Failed to fetch trending chapters');
        return [];
      }

      const $ = cheerio.load(html);
      const chapters: ChapterWithManga[] = [];

      // Try to find the trending/featured section
      const selectors = [
        '.trending .item',
        '.featured .chapter-item',
        '.home-left .thumb',
        '.manga-item .chapter-link',
        '.update-item',
      ];

      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} trending items with selector: ${selector}`);

          elements.each((index, element) => {
            try {
              const $el = $(element);

              // Get manga title
              const mangaTitle = $el.find('.title, .entry-title, .manga-title, h3').first().text().trim() ||
                               $el.find('a').attr('title') ||
                               '';

              // Get manga cover
              const img = $el.find('img').first();
              const coverUrl = (img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src')) ?
                (img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src'))!.startsWith('http') ?
                (img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src'))! :
                this.config.baseUrl + (img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src'))! :
                undefined;

              // Get chapter link and info
              const chapterLink = $el.find('a').first();
              const href = chapterLink.attr('href');
              const chapterText = $el.find('.chapter, .chap, .chapter-num').first().text().trim() ||
                                 chapterLink.text().trim();

              // Extract chapter number
              const chapterNum = this.extractChapterNumber(chapterText) || (index + 1);

              if (href && mangaTitle) {
                const fullUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
                const mangaUrl = this.extractMangaUrlFromChapter(fullUrl);
                const mangaId = this.extractMangaId(mangaUrl);

                chapters.push({
                  id: `${mangaId}-trend-${index}`,
                  mangaId: mangaId,
                  chapterNum: chapterNum,
                  name: chapterText || `Capitolo ${chapterNum}`,
                  url: fullUrl,
                  uploadedAt: new Date(),
                  manga: {
                    id: mangaId,
                    title: mangaTitle,
                    coverUrl: coverUrl,
                    url: mangaUrl,
                    sourceId: this.config.id,
                  },
                });
              }
            } catch (error) {
              console.error('Error parsing trending item:', error);
            }
          });

          if (chapters.length > 0) {
            break;
          }
        }
      }

      console.log(`Parsed ${chapters.length} trending chapters from MangaWorld`);
      return chapters.slice(0, 10); // Limit to 10 trending chapters
    } catch (error) {
      console.error('Error getting trending chapters:', error);
      return [];
    }
  }

  /**
   * Get recent chapters (ultimi capitoli aggiunti) from MangaWorld
   */
  async getRecentChapters(): Promise<ChapterWithManga[]> {
    try {
      const url = this.config.baseUrl;
      const html = await this.fetchHTML(url);

      if (!html) {
        console.log('Failed to fetch recent chapters');
        return [];
      }

      const $ = cheerio.load(html);
      const chapters: ChapterWithManga[] = [];

      // Try different selectors for recent updates
      const selectors = [
        '.update-item',
        '.latest-updates .manga-card',
        '.manga-update',
        '.update .thumb',
        '.recent-updates .thumb',
        '.home-right .thumb',
      ];

      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} recent updates with selector: ${selector}`);

          elements.each((index, element) => {
            try {
              const $el = $(element);

              // Get manga title
              const mangaTitle = $el.find('.title, .entry-title, .manga-title, h3').first().text().trim() ||
                               $el.find('a').attr('title') ||
                               '';

              // Get manga cover
              const img = $el.find('img').first();
              const coverUrl = (img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src')) ?
                (img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src'))!.startsWith('http') ?
                (img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src'))! :
                this.config.baseUrl + (img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src'))! :
                undefined;

              // Get chapter link and info
              const chapterLink = $el.find('a').first();
              const href = chapterLink.attr('href');
              const chapterText = $el.find('.chapter, .chap, .chapter-num').first().text().trim() ||
                                 chapterLink.text().trim();

              // Extract chapter number
              const chapterNum = this.extractChapterNumber(chapterText) || (index + 1);

              if (href && mangaTitle) {
                const fullUrl = href.startsWith('http') ? href : `${this.config.baseUrl}${href}`;
                const mangaUrl = this.extractMangaUrlFromChapter(fullUrl);
                const mangaId = this.extractMangaId(mangaUrl);

                chapters.push({
                  id: `${mangaId}-recent-${index}`,
                  mangaId: mangaId,
                  chapterNum: chapterNum,
                  name: chapterText || `Capitolo ${chapterNum}`,
                  url: fullUrl,
                  uploadedAt: new Date(),
                  manga: {
                    id: mangaId,
                    title: mangaTitle,
                    coverUrl: coverUrl,
                    url: mangaUrl,
                    sourceId: this.config.id,
                  },
                });
              }
            } catch (error) {
              console.error('Error parsing recent chapter:', error);
            }
          });

          if (chapters.length > 0) {
            break;
          }
        }
      }

      console.log(`Parsed ${chapters.length} recent chapters from MangaWorld`);
      return chapters.slice(0, 20); // Limit to 20 recent chapters
    } catch (error) {
      console.error('Error getting recent chapters:', error);
      return [];
    }
  }

  /**
   * Extract manga URL from chapter URL
   */
  private extractMangaUrlFromChapter(chapterUrl: string): string {
    // Chapter URLs are usually like: /read/{chapter-id} or /manga/{manga-id}/read/{chapter-id}
    // We need to extract just the manga part
    const mangaMatch = chapterUrl.match(/(\/manga\/[^\/\?#]+)/i);
    if (mangaMatch) {
      return this.config.baseUrl + mangaMatch[1];
    }

    // Fallback: try to construct manga URL from chapter URL
    const parts = chapterUrl.split('/').filter(p => p);
    if (parts.length >= 2 && parts.includes('manga')) {
      const mangaIndex = parts.indexOf('manga');
      if (mangaIndex + 1 < parts.length) {
        return `${this.config.baseUrl}/manga/${parts[mangaIndex + 1]}`;
      }
    }

    return chapterUrl; // Return chapter URL if we can't determine manga URL
  }
}
