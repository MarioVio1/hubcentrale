import { NextRequest, NextResponse } from 'next/server';
import { UnifiedMangaService } from '@manga/lib/unified-manga-service';

// GET chapter pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterUrl = searchParams.get('chapterUrl');
    const sourceId = searchParams.get('sourceId') || 'mangaworld';

    if (!chapterUrl) {
      return NextResponse.json(
        { error: 'Chapter URL is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Fetching pages from source: ${sourceId}, chapter: ${chapterUrl}`);

    const pages = await UnifiedMangaService.getChapterPages(chapterUrl, sourceId);

    console.log(`[API] Found ${pages.length} pages from source: ${sourceId}`);

    if (pages.length === 0) {
      console.error(`[API] No pages found for chapter: ${chapterUrl} from source: ${sourceId}`);
      return NextResponse.json(
        {
          error: 'Unable to load chapter pages',
          details: `The chapter might not be available from ${sourceId}. Try using a different source.`,
          sourceId,
          chapterUrl
        },
        { status: 404 }
      );
    }

    return NextResponse.json(pages);
  } catch (error) {
    console.error('[API] Error fetching chapter pages:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch chapter pages',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
