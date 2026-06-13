// Unified manga service that prioritizes MangaWorld and uses other sources as fallback
// Integrates both direct scrapers and Tachiyomi extensions

import { db } from './db';
import { MangaSourceService } from './manga-source-service';
import type { MangaInfo, ChapterInfo, MangaPage } from './base-scraper';

export interface SourcePriority {
  sourceId: string;
  priority: number; // 1 = highest, 10 = lowest
  enabled: boolean;
}

export interface UnifiedSearchResult extends MangaInfo {
  primarySource: string;
  alternativeSources: string[];
}

export class UnifiedMangaService {
  // Default source priorities - MangaWorld is always first
  private static DEFAULT_PRIORITIES: SourcePriority[] = [
    { sourceId: 'mangaworld', priority: 1, enabled: true }, // Always first
    { sourceId: 'mangaworld-adult', priority: 2, enabled: true },
    { sourceId: 'mangadex', priority: 3, enabled: false }, // Disabled - chapter pages not working
    { sourceId: 'comick', priority: 4, enabled: false }, // Disabled - DNS error (ENOTFOUND)
    { sourceId: 'mangalife', priority: 5, enabled: false }, // Disabled - DNS error (ENOTFOUND)
  ];

  /**
   * Get enabled sources in priority order
   */
  static async getEnabledSources(): Promise<string[]> {
    // In the future, load priorities from database
    // For now, use defaults
    return this.DEFAULT_PRIORITIES
      .filter(s => s.enabled)
      .sort((a, b) => a.priority - b.priority)
      .map(s => s.sourceId);
  }

  /**
   * Search manga with priority - MangaWorld first, then others
   */
  static async searchManga(query: string): Promise<MangaInfo[]> {
    const enabledSources = await this.getEnabledSources();
    console.log(`Searching manga "${query}" in ${enabledSources.length} sources:`, enabledSources);

    const allResults: Map<string, MangaInfo> = new Map();

    // Search in priority order
    for (const sourceId of enabledSources) {
      try {
        const results = await MangaSourceService.searchManga(query, [sourceId]);
        console.log(`  Found ${results.length} results from ${sourceId}`);

        // Add results, marking the primary source
        for (const manga of results) {
          const key = this.getMangaKey(manga);
          if (!allResults.has(key)) {
            // First source to find this manga
            manga.primarySource = sourceId as any;
            allResults.set(key, manga);
          } else {
            // Alternative source - could store for later use
            const existing = allResults.get(key)!;
            if (!existing.alternativeSources) {
              existing.alternativeSources = [];
            }
            existing.alternativeSources.push(sourceId);
          }
        }
      } catch (error) {
        console.error(`Error searching in ${sourceId}:`, error);
      }
    }

    const results = Array.from(allResults.values());
    console.log(`Total unique results: ${results.length}`);
    return results;
  }

  /**
   * Get popular manga from MangaWorld only
   */
  static async getPopularManga(): Promise<MangaInfo[]> {
    // Only use MangaWorld for popular manga
    const sourceId = 'mangaworld';
    try {
      const results = await MangaSourceService.getPopularManga([sourceId]);
      return results;
    } catch (error) {
      console.error(`Error getting popular from ${sourceId}:`, error);
      return [];
    }
  }

  /**
   * Get latest manga from all enabled sources
   * Note: Latest updates only from MangaWorld (not Adult)
   */
  static async getLatestManga(): Promise<MangaInfo[]> {
    // Only use MangaWorld for latest updates, not MangaWorldAdult
    const sourceId = 'mangaworld';
    try {
      const results = await MangaSourceService.getLatestManga([sourceId]);
      return results;
    } catch (error) {
      console.error(`Error getting latest from ${sourceId}:`, error);
      return [];
    }
  }

  /**
   * Get manga details with fallback
   */
  static async getMangaDetails(mangaUrl: string, sourceId: string): Promise<MangaInfo | null> {
    try {
      return await MangaSourceService.getMangaDetails(mangaUrl, sourceId);
    } catch (error) {
      console.error(`Error getting manga details from ${sourceId}:`, error);
      return null;
    }
  }

  /**
   * Get chapters with fallback to alternative sources
   */
  static async getChapters(mangaUrl: string, sourceId: string): Promise<ChapterInfo[]> {
    try {
      return await MangaSourceService.getChapters(mangaUrl, sourceId);
    } catch (error) {
      console.error(`Error getting chapters from ${sourceId}:`, error);
      return [];
    }
  }

  /**
   * Get chapter pages
   */
  static async getChapterPages(chapterUrl: string, sourceId: string): Promise<MangaPage[]> {
    try {
      return await MangaSourceService.getChapterPages(chapterUrl, sourceId);
    } catch (error) {
      console.error(`Error getting chapter pages from ${sourceId}:`, error);
      return [];
    }
  }

  /**
   * Get all available sources with their status
   */
  static async getAllSources() {
    const sources = MangaSourceService.getAllSources();
    const enabledSources = await this.getEnabledSources();

    return sources
      .map(source => {
        if (!source || !source.id) {
          return null;
        }
        return {
          ...source,
          enabled: enabledSources.includes(source.id),
          priority: this.DEFAULT_PRIORITIES.find(p => p.sourceId === source.id)?.priority || 99,
        };
      })
      .filter((source): source is NonNullable<typeof source> => source !== null && source.id !== undefined);
  }

  /**
   * Toggle source enabled status
   */
  static async toggleSource(sourceId: string): Promise<void> {
    // In the future, save to database
    const priority = this.DEFAULT_PRIORITIES.find(p => p.sourceId === sourceId);
    if (priority) {
      priority.enabled = !priority.enabled;
    }
  }

  /**
   * Generate a unique key for a manga to deduplicate results
   */
  private static getMangaKey(manga: MangaInfo): string {
    // Normalize title for comparison
    return manga.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
