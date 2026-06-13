import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initializeTachiyomiRepo, syncRepoExtensions } from '@/lib/init-tachiyomi';
import { TachiyomiScraperLoader } from '@/lib/tachiyomi-scraper-loader';

// POST sync Tachiyomi extensions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoId, reloadSources = true } = body;

    let result;

    if (repoId) {
      // Sync specific repo
      result = await syncRepoExtensions(repoId);
    } else {
      // Initialize Keiyoushi repo
      result = await initializeTachiyomiRepo();
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to sync extensions' },
        { status: 500 }
      );
    }

    // Reload sources after syncing extensions
    if (reloadSources) {
      console.log('[Sync] Reloading sources...');
      const loadResult = await TachiyomiScraperLoader.loadAllSources();
      result.sourcesLoaded = loadResult.sourcesCount;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Sync] Error syncing extensions:', error);
    return NextResponse.json(
      { error: 'Failed to sync extensions', details: String(error) },
      { status: 500 }
    );
  }
}

// GET check sync status
export async function GET() {
  try {
    const repos = await db.repo.findMany({
      where: { enabled: true },
      include: {
        _count: {
          select: { extensions: true },
        },
      },
      orderBy: { lastChecked: 'desc' },
    });

    return NextResponse.json({
      repos,
      totalExtensions: repos.reduce((sum, r) => sum + r._count.extensions, 0),
    });
  } catch (error) {
    console.error('[Sync] Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
