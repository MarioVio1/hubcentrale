// Service to load and register Tachiyomi sources as dynamic scrapers
import { db } from '@/lib/db';
import { MangaSourceService } from '@/lib/manga-source-service';
import { MangaWorldScraper } from './mangaworld-scraper';

export interface TachiyomiSourceConfig {
  id: string;
  name: string;
  lang: string;
  baseUrl: string;
}

// Dynamic HTTP scraper that works with any Tachiyomi-style source
class GenericHttpScraper {
  constructor(private config: TachiyomiSourceConfig) {}

  private async fetchHTML(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`[Scraper ${this.config.id}] Error fetching ${url}:`, error);
      throw error;
    }
  }

  async getPopularManga(): Promise<any[]> {
    // For now, return empty array - needs per-site customization
    console.log(`[Scraper ${this.config.id}] getPopularManga not implemented`);
    return [];
  }

  async getLatestManga(): Promise<any[]> {
    // For now, return empty array - needs per-site customization
    console.log(`[Scraper ${this.config.id}] getLatestManga not implemented`);
    return [];
  }

  async searchManga(query: string): Promise<any[]> {
    // For now, return empty array - needs per-site customization
    console.log(`[Scraper ${this.config.id}] searchManga not implemented`);
    return [];
  }

  async getMangaDetails(url: string): Promise<any | null> {
    // For now, return null - needs per-site customization
    console.log(`[Scraper ${this.config.id}] getMangaDetails not implemented`);
    return null;
  }

  async getChapters(url: string): Promise<any[]> {
    // For now, return empty array - needs per-site customization
    console.log(`[Scraper ${this.config.id}] getChapters not implemented`);
    return [];
  }

  async getChapterPages(url: string): Promise<any[]> {
    // For now, return empty array - needs per-site customization
    console.log(`[Scraper ${this.config.id}] getChapterPages not implemented`);
    return [];
  }
}

export class TachiyomiScraperLoader {
  /**
   * Load all enabled extensions and register their sources
   */
  static async loadAllSources() {
    try {
      console.log('[Loader] Loading Tachiyomi sources...');

      // Get all enabled extensions
      const extensions = await db.extension.findMany({
        where: { enabled: true },
        include: { repo: true },
      });

      console.log(`[Loader] Found ${extensions.length} enabled extensions`);

      let registeredSources = 0;

      for (const ext of extensions) {
        const sources = ext.sources as any[];

        if (!sources || sources.length === 0) {
          console.log(`[Loader] No sources for extension: ${ext.name}`);
          continue;
        }

        for (const source of sources) {
          try {
            // Special case: use MangaWorld scraper for known sources
            if (source.id === 'mangaworld' || ext.pkgName.includes('mangaworld')) {
              MangaSourceService.registerScraper(source.id, MangaWorldScraper);
              console.log(`[Loader] Registered MangaWorld scraper for: ${source.name}`);
              registeredSources++;
              continue;
            }

            // For other sources, use generic HTTP scraper
            const config: TachiyomiSourceConfig = {
              id: source.id,
              name: source.name,
              lang: source.lang || ext.lang,
              baseUrl: source.baseUrl,
            };

            const scraper = new GenericHttpScraper(config);
            MangaSourceService.registerScraper(source.id, scraper);

            console.log(`[Loader] Registered generic scraper for: ${source.name} (${source.id})`);
            registeredSources++;
          } catch (error) {
            console.error(`[Loader] Error registering source ${source.id}:`, error);
          }
        }
      }

      console.log(`[Loader] Registered ${registeredSources} sources total`);

      return { success: true, sourcesCount: registeredSources };
    } catch (error) {
      console.error('[Loader] Error loading sources:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get available sources grouped by extension
   */
  static async getAvailableSources() {
    try {
      const extensions = await db.extension.findMany({
        where: { enabled: true },
        include: { repo: true },
      });

      const sourcesByExtension = extensions.map(ext => ({
        extension: {
          id: ext.id,
          name: ext.name,
          pkgName: ext.pkgName,
          iconUrl: ext.iconUrl,
        },
        sources: ext.sources as any[] || [],
      }));

      return sourcesByExtension;
    } catch (error) {
      console.error('[Loader] Error getting available sources:', error);
      return [];
    }
  }

  /**
   * Get source by ID
   */
  static async getSourceById(sourceId: string) {
    try {
      const extensions = await db.extension.findMany({
        where: { enabled: true },
      });

      for (const ext of extensions) {
        const sources = ext.sources as any[];
        const source = sources?.find(s => s.id === sourceId);

        if (source) {
          return {
            ...source,
            extension: ext,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('[Loader] Error getting source by ID:', error);
      return null;
    }
  }
}
