import { NextResponse } from 'next/server';
import { UnifiedMangaService } from '@/lib/unified-manga-service';

// GET all available manga sources
export async function GET() {
  try {
    const sources = await UnifiedMangaService.getAllSources();
    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error getting sources:', error);
    return NextResponse.json(
      { error: 'Failed to get sources', details: String(error) },
      { status: 500 }
    );
  }
}

// POST toggle source enabled status
export async function POST(request: Request) {
  try {
    const { sourceId } = await request.json();

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      );
    }

    await UnifiedMangaService.toggleSource(sourceId);

    const sources = await UnifiedMangaService.getAllSources();
    return NextResponse.json({ success: true, sources });
  } catch (error) {
    console.error('Error toggling source:', error);
    return NextResponse.json(
      { error: 'Failed to toggle source', details: String(error) },
      { status: 500 }
    );
  }
}
