import { NextRequest, NextResponse } from 'next/server';
import { UnifiedMangaService } from '@/lib/unified-manga-service';

// GET chapters for a manga
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mangaUrl = searchParams.get('mangaUrl');
    const sourceId = searchParams.get('sourceId') || 'mangaworld';

    if (!mangaUrl) {
      return NextResponse.json(
        { error: 'Manga URL is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching chapters from source: ${sourceId}, url: ${mangaUrl}`);

    // Fetch from source
    let chapters = await UnifiedMangaService.getChapters(mangaUrl, sourceId);

    // Ensure chapters are sorted consistently (descending by chapter number)
    chapters = chapters.sort((a, b) => {
      const numA = a.chapterNum ?? 0;
      const numB = b.chapterNum ?? 0;
      return numB - numA; // Descending order (newest first)
    });

    console.log(`Found ${chapters.length} chapters`);
    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters', details: String(error) },
      { status: 500 }
    );
  }
}
