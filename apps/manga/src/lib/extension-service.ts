// Service for fetching and parsing extensions from Tachiyomi-compatible repositories

interface ExtensionMetadata {
  name: string;
  pkg: string;
  apk: string;
  lang: string;
  code: number;
  version: string;
  nsfw: number;
  sources: Array<{
    id: string;
    lang: string;
    name: string;
    baseUrl: string;
  }>;
}

interface RepoIndex {
  version: number;
  extensions: ExtensionMetadata[];
}

export class ExtensionService {
  /**
   * Fetch repository index from GitHub
   */
  static async fetchRepoIndex(repoUrl: string): Promise<RepoIndex | null> {
    try {
      // Convert GitHub URL to raw content URL
      const rawUrl = this.convertToRawUrl(repoUrl, 'index.min.json');

      const response = await fetch(rawUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MangaFlow/1.0',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        console.error(`Failed to fetch repo index: ${response.status}`);
        return null;
      }

      const index: RepoIndex = await response.json();
      return index;
    } catch (error) {
      console.error('Error fetching repo index:', error);
      return null;
    }
  }

  /**
   * Convert GitHub repo URL to raw content URL
   */
  static convertToRawUrl(repoUrl: string, path: string): string {
    // Remove .git if present
    const cleanUrl = repoUrl.replace(/\.git$/, '');

    // Extract owner and repo
    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }

    const [, owner, repo] = match;
    return `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
  }

  /**
   * Filter extensions by language
   */
  static filterExtensionsByLang(
    extensions: ExtensionMetadata[],
    lang: string = 'all'
  ): ExtensionMetadata[] {
    if (lang === 'all') {
      return extensions;
    }
    return extensions.filter(ext => ext.lang === lang);
  }

  /**
   * Filter extensions by NSFW level
   */
  static filterExtensionsByNSFW(
    extensions: ExtensionMetadata[],
    maxNsfw: number = 0
  ): ExtensionMetadata[] {
    return extensions.filter(ext => ext.nsfw <= maxNsfw);
  }

  /**
   * Get specific Italian extensions (like Manga World)
   */
  static getItalianExtensions(extensions: ExtensionMetadata[]): ExtensionMetadata[] {
    return extensions.filter(ext => ext.lang === 'it');
  }

  /**
   * Find extension by package name
   */
  static findExtensionByPkg(
    extensions: ExtensionMetadata[],
    pkgName: string
  ): ExtensionMetadata | undefined {
    return extensions.find(ext => ext.pkg === pkgName);
  }

  /**
   * Parse extension icon URL
   */
  static getIconUrl(repoUrl: string, pkgName: string, iconFile: string): string {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return '';

    const [, owner, repo] = match;
    return `https://raw.githubusercontent.com/${owner}/${repo}/main/icon/${iconFile}`;
  }

  /**
   * Get popular repositories
   */
  static getPopularRepos(): Array<{
    name: string;
    url: string;
    description: string;
    icon: string;
  }> {
    return [
      {
        name: 'Keiyoushi Extensions',
        url: 'https://github.com/keiyoushi/extensions',
        description: 'Largest collection of manga extensions',
        icon: '📚',
      },
      {
        name: 'Keiyoushi Sources',
        url: 'https://github.com/keiyoushi/sources',
        description: 'Official source extensions',
        icon: '⚡',
      },
      {
        name: 'J2K Extensions',
        url: 'https://github.com/j2k-jm/extensions',
        description: 'Alternative extensions repository',
        icon: '🎭',
      },
    ];
  }

  /**
   * Get source information for a specific manga site
   */
  static getSourceInfo(extension: ExtensionMetadata) {
    return extension.sources?.[0] || null;
  }
}
