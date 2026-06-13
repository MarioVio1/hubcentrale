import { NextRequest, NextResponse } from 'next/server';
import { MangaWorldScraper } from '@manga/lib/mangaworld-scraper';
import type { ChapterWithManga } from '@manga/lib/base-scraper';

// GET trending and recent chapters from MangaWorld
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'trending'; // 'trending' or 'recent'

    const scraper = new MangaWorldScraper();
    let chapters: ChapterWithManga[] = [];

    if (type === 'trending') {
      chapters = await scraper.getTrendingChapters();
      console.log(`Found ${chapters.length} trending chapters`);
    } else if (type === 'recent') {
      chapters = await scraper.getRecentChapters();
      console.log(`Found ${chapters.length} recent chapters`);
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use "trending" or "recent"' },
        { status: 400 }
      );
    }

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters', details: String(error) },
      { status: 500 }
    );
  }
}
