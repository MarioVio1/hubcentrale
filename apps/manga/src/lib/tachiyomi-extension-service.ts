// Service for fetching and parsing Tachiyomi/Keiyoushi extensions
// This handles the official extension repository format

export interface TachiyomiExtension {
  name: string;
  pkg: string; // Package name, e.g., "eu.kanade.tachiyomi.extension.it.mangaworld"
  apk: string; // APK filename
  lang: string; // Language code: it, en, etc.
  code: number; // Version code
  version: string; // Version name
  nsfw: number; // 0 = safe, 1 = questionable, 2 = explicit
  icon: string; // Icon filename
  sources?: TachiyomiSource[];
}

export interface TachiyomiSource {
  id: string; // Source ID, e.g., "mangaworld"
  lang: string; // Source language
  name: string; // Display name
  baseUrl: string; // Base URL of the source
}

export interface TachiyomiRepoIndex {
  version: number;
  extensions: TachiyomiExtension[];
}

export class TachiyomiExtensionService {
  private static readonly DEFAULT_REPO =
    'https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json';

  /**
   * Fetch the repository index with retry logic
   */
  static async fetchRepoIndex(repoUrl: string = this.DEFAULT_REPO): Promise<TachiyomiRepoIndex | null> {
    const maxRetries = 3;
    const timeoutMs = 15000; // 15 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Fetching repo index (attempt ${attempt}/${maxRetries}): ${repoUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(repoUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MangaFlow/1.0 (+https://github.com/mangaflow/app)',
          },
          signal: controller.signal,
          cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(`Failed to fetch repo: ${response.status} ${response.statusText}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
          return null;
        }

        const data: TachiyomiRepoIndex = await response.json();

        // Validate the structure
        if (!data.version || !Array.isArray(data.extensions)) {
          console.error('Invalid repo index structure');
          return null;
        }

        console.log(`Successfully fetched ${data.extensions.length} extensions`);
        return data;
      } catch (error) {
        console.error(`Error fetching repo index (attempt ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          console.log(`Retrying in ${2 * attempt} seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }

        console.error('All retry attempts failed, returning null');
        return null;
      }
    }

    return null;
  }

  /**
   * Get Italian extensions only
   */
  static getItalianExtensions(extensions: TachiyomiExtension[]): TachiyomiExtension[] {
    return extensions.filter(ext => ext.lang === 'it');
  }

  /**
   * Get extension by package name
   */
  static getExtensionByPkg(
    extensions: TachiyomiExtension[],
    pkgName: string
  ): TachiyomiExtension | undefined {
    return extensions.find(ext => ext.pkg === pkgName);
  }

  /**
   * Get extension icon URL
   */
  static getIconUrl(repoBaseUrl: string, iconFile: string): string {
    // Convert from raw GitHub URL to icon folder
    const baseUrl = repoBaseUrl.replace('/index.min.json', '');
    return `${baseUrl}/icon/${iconFile}`;
  }

  /**
   * Get APK download URL
   */
  static getApkUrl(repoBaseUrl: string, apkFile: string): string {
    const baseUrl = repoBaseUrl.replace('/index.min.json', '');
    return `${baseUrl}/apk/${apkFile}`;
  }

  /**
   * Filter extensions by NSFW level
   */
  static filterByNSFW(
    extensions: TachiyomiExtension[],
    maxNsfw: number = 0
  ): TachiyomiExtension[] {
    return extensions.filter(ext => ext.nsfw <= maxNsfw);
  }

  /**
   * Search extensions by name
   */
  static searchExtensions(
    extensions: TachiyomiExtension[],
    query: string
  ): TachiyomiExtension[] {
    const q = query.toLowerCase();
    return extensions.filter(
      ext =>
        ext.name.toLowerCase().includes(q) ||
        ext.pkg.toLowerCase().includes(q) ||
        ext.sources?.some(s => s.name.toLowerCase().includes(q))
    );
  }

  /**
   * Get all unique languages from extensions
   */
  static getAvailableLanguages(extensions: TachiyomiExtension[]): string[] {
    const languages = new Set(extensions.map(ext => ext.lang));
    return Array.from(languages).sort();
  }

  /**
   * Get popular Italian manga sources
   */
  static getPopularItalianSources(extensions: TachiyomiExtension[]): TachiyomiSource[] {
    const italianExtensions = this.getItalianExtensions(extensions);
    const sources = italianExtensions.flatMap(ext => ext.sources || []);

    // Known popular Italian sources
    const popularSourceIds = [
      'mangaworld',     // MangaWorld
      'mangaworld-academy', // MangaWorld Academy
      'mangahentai',    // MangaHentai
      'mangaworld-in',
    ];

    return sources
      .filter(s => popularSourceIds.includes(s.id))
      .filter((s, i, arr) => arr.findIndex(s2 => s2.id === s.id) === i);
  }

  /**
   * Get source by ID from all extensions
   */
  static getSourceById(
    extensions: TachiyomiExtension[],
    sourceId: string
  ): { source: TachiyomiSource; extension: TachiyomiExtension } | undefined {
    for (const ext of extensions) {
      const source = ext.sources?.find(s => s.id === sourceId);
      if (source) {
        return { source, extension: ext };
      }
    }
    return undefined;
  }

  /**
   * Format extension name for display
   */
  static formatExtensionName(extension: TachiyomiExtension): string {
    // Remove common prefixes
    return extension.name
      .replace(/^Tachiyomi: /, '')
      .replace(/^Mihon: /, '')
      .trim();
  }

  /**
   * Get extension display info
   */
  static getExtensionDisplayInfo(extension: TachiyomiExtension) {
    return {
      name: this.formatExtensionName(extension),
      package: extension.pkg,
      version: extension.version,
      language: extension.lang,
      nsfwLevel: extension.nsfw,
      sourcesCount: extension.sources?.length || 0,
      sources: extension.sources || [],
      icon: extension.icon,
    };
  }
}
