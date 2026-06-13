// Service for fetching manga data from actual manga sources
// This uses real scrapers from multiple sources

import { BaseScraper, type MangaInfo, type ChapterInfo, type MangaPage, type SourceConfig } from './base-scraper';
import { MangaWorldScraper } from './mangaworld-scraper';
import { MangaWorldAdultScraper } from './mangaworld-adult-scraper';
import { MangaDexScraper } from './mangadex-scraper';
import { ComickScraper } from './comick-scraper';
import { MangaLifeScraper } from './mangalife-scraper';

export type { MangaInfo, ChapterInfo, MangaPage, SourceConfig };

export class MangaSourceService {
  private static scrapers = new Map<string, BaseScraper>();

  static {
    // Register all scrapers
    this.scrapers.set('mangaworld', new MangaWorldScraper());
    this.scrapers.set('mangaworld-adult', new MangaWorldAdultScraper());
    this.scrapers.set('mangadex', new MangaDexScraper());
    this.scrapers.set('comick', new ComickScraper());
    this.scrapers.set('mangalife', new MangaLifeScraper());
  }

  /**
   * Get all available sources
   */
  static getAllSources(): SourceConfig[] {
    return Array.from(this.scrapers.values()).map((scraper) => scraper.config);
  }

  /**
   * Register a source scraper
   */
  static registerScraper(sourceId: string, scraper: BaseScraper) {
    this.scrapers.set(sourceId, scraper);
  }

  /**
   * Get scraper for source
   */
  static getScraper(sourceId: string): BaseScraper | undefined {
    return this.scrapers.get(sourceId);
  }

  /**
   * Search manga across all enabled sources
   */
  static async searchManga(
    query: string,
    sourceIds?: string[]
  ): Promise<MangaInfo[]> {
    const sources = sourceIds || Array.from(this.scrapers.keys());
    const allManga: MangaInfo[] = [];

    for (const sourceId of sources) {
      const scraper = this.getScraper(sourceId);
      if (scraper && scraper.searchManga) {
        try {
          const results = await scraper.searchManga(query);
          allManga.push(...results);
        } catch (error) {
          console.error(`Error searching in ${sourceId}:`, error);
        }
      }
    }

    return allManga;
  }

  /**
   * Get popular manga
   */
  static async getPopularManga(sourceIds?: string[]): Promise<MangaInfo[]> {
    const sources = sourceIds || Array.from(this.scrapers.keys());
    const allManga: MangaInfo[] = [];

    for (const sourceId of sources) {
      const scraper = this.getScraper(sourceId);
      if (scraper && scraper.getPopularManga) {
        try {
          const results = await scraper.getPopularManga();
          allManga.push(...results);
        } catch (error) {
          console.error(`Error getting popular from ${sourceId}:`, error);
        }
      }
    }

    return allManga;
  }

  /**
   * Get latest updates
   */
  static async getLatestManga(sourceIds?: string[]): Promise<MangaInfo[]> {
    const sources = sourceIds || Array.from(this.scrapers.keys());
    const allManga: MangaInfo[] = [];

    for (const sourceId of sources) {
      const scraper = this.getScraper(sourceId);
      if (scraper && scraper.getLatestManga) {
        try {
          const results = await scraper.getLatestManga();
          allManga.push(...results);
        } catch (error) {
          console.error(`Error getting latest from ${sourceId}:`, error);
        }
      }
    }

    return allManga;
  }

  /**
   * Get manga details
   */
  static async getMangaDetails(mangaUrl: string, sourceId?: string): Promise<MangaInfo | null> {
    const scraper = this.getScraper(sourceId || 'mangaworld');
    if (scraper && scraper.getMangaDetails) {
      try {
        return await scraper.getMangaDetails(mangaUrl);
      } catch (error) {
        console.error('Error getting manga details:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Get manga chapters
   */
  static async getChapters(mangaUrl: string, sourceId?: string): Promise<ChapterInfo[]> {
    const scraper = this.getScraper(sourceId || 'mangaworld');
    if (scraper && scraper.getChapters) {
      try {
        return await scraper.getChapters(mangaUrl);
      } catch (error) {
        console.error('Error getting chapters:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Get chapter pages
   */
  static async getChapterPages(chapterUrl: string, sourceId?: string): Promise<MangaPage[]> {
    const scraper = this.getScraper(sourceId || 'mangaworld');
    if (scraper && scraper.getChapterPages) {
      try {
        return await scraper.getChapterPages(chapterUrl);
      } catch (error) {
        console.error('Error getting chapter pages:', error);
        return [];
      }
    }
    return [];
  }
}

