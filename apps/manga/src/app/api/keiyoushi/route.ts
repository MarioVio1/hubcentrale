import { NextRequest, NextResponse } from 'next/server';
import { TachiyomiExtensionService } from '@/lib/tachiyomi-extension-service';
import { MOCK_KEIYOSHI_EXTENSIONS } from '@/lib/mock-extensions';

/**
 * Fetch and return Keiyoushi extensions index
 * This endpoint returns the raw extension data from the Keiyoushi repository
 * Falls back to mock data if repository is not accessible
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'all';
    const useMock = searchParams.get('mock') === 'true';

    console.log('Fetching Keiyoushi extensions...');

    let index;

    if (useMock) {
      console.log('Using mock data');
      index = MOCK_KEIYOSHI_EXTENSIONS;
    } else {
      // Try to fetch from Keiyoushi repository
      index = await TachiyomiExtensionService.fetchRepoIndex();

      // Fallback to mock data if fetch fails
      if (!index) {
        console.log('Repository not accessible, using mock data');
        index = MOCK_KEIYOSHI_EXTENSIONS;
      }
    }

    let extensions = index.extensions;

    // Filter by language if specified
    if (lang !== 'all') {
      if (lang === 'it') {
        extensions = TachiyomiExtensionService.getItalianExtensions(extensions);
      } else {
        extensions = extensions.filter(ext => ext.lang === lang);
      }
    }

    // Filter out NSFW extensions by default
    extensions = TachiyomiExtensionService.filterByNSFW(extensions, 0);

    // Get available languages
    const availableLanguages = TachiyomiExtensionService.getAvailableLanguages(index.extensions);

    // Get popular Italian sources
    const popularItalianSources = TachiyomiExtensionService.getPopularItalianSources(index.extensions);

    return NextResponse.json({
      version: index.version,
      totalExtensions: index.extensions.length,
      filteredExtensions: extensions.length,
      languages: availableLanguages,
      isMock: index === MOCK_KEIYOSHI_EXTENSIONS,
      extensions: extensions.map(ext => ({
        name: TachiyomiExtensionService.formatExtensionName(ext),
        pkg: ext.pkg,
        version: ext.version,
        lang: ext.lang,
        nsfw: ext.nsfw,
        icon: ext.icon,
        sources: ext.sources || [],
        sourcesCount: ext.sources?.length || 0,
      })),
      popularItalianSources,
    });
  } catch (error) {
    console.error('Error fetching Keiyoushi extensions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch extensions', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Test connection to Keiyoushi repository
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl } = body;

    const index = await TachiyomiExtensionService.fetchRepoIndex(
      repoUrl || 'https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json'
    );

    if (!index) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to repository' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      version: index.version,
      totalExtensions: index.extensions.length,
      italianExtensions: TachiyomiExtensionService.getItalianExtensions(index.extensions).length,
      languages: TachiyomiExtensionService.getAvailableLanguages(index.extensions),
    });
  } catch (error) {
    console.error('Error testing repository:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
