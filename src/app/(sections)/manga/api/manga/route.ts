import { NextRequest, NextResponse } from 'next/server';
import { UnifiedMangaService } from '@manga/lib/unified-manga-service';

// GET manga list (search, popular, latest)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || 'all'; // all, popular, latest

    let mangas;

    if (type === 'popular') {
      mangas = await UnifiedMangaService.getPopularManga();
    } else if (type === 'latest') {
      mangas = await UnifiedMangaService.getLatestManga();
    } else {
      mangas = await UnifiedMangaService.searchManga(query);
    }

    return NextResponse.json(mangas);
  } catch (error) {
    console.error('Error fetching manga:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manga', details: String(error) },
      { status: 500 }
    );
  }
}

// POST get manga details from source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mangaUrl, sourceId } = body;

    if (!mangaUrl) {
      return NextResponse.json(
        { error: 'Manga URL is required' },
        { status: 400 }
      );
    }

    const manga = await UnifiedMangaService.getMangaDetails(mangaUrl, sourceId || 'mangaworld');

    if (!manga) {
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(manga);
  } catch (error) {
    console.error('Error getting manga details:', error);
    return NextResponse.json(
      { error: 'Failed to get manga details' },
      { status: 500 }
    );
  }
}
