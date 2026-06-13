import { NextRequest, NextResponse } from 'next/server';
import { db } from '@manga/lib/db';
import { syncRepoExtensions } from '@manga/lib/init-tachiyomi';
import { TachiyomiScraperLoader } from '@manga/lib/tachiyomi-scraper-loader';

// Default repositories to load
const DEFAULT_REPOS = [
  {
    name: 'Keiyoushi Extensions',
    url: 'https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json',
    description: 'Official Tachiyomi extensions repository (keiyoushi)',
    icon: 'https://raw.githubusercontent.com/keiyoushi/extensions/repo/icon.png',
  },
  {
    name: 'Keiyoushi Multisrc',
    url: 'https://raw.githubusercontent.com/keiyoushi/extensions-multisrc/repo/index.min.json',
    description: 'Keiyoushi multi-source extensions',
    icon: 'https://raw.githubusercontent.com/keiyoushi/extensions-multisrc/repo/icon.png',
  },
];

// POST initialize default repositories
export async function POST() {
  try {
    const createdRepos = [];
    const syncResults = [];

    for (const repoData of DEFAULT_REPOS) {
      // Check if repo already exists
      const existing = await db.repo.findUnique({
        where: { url: repoData.url },
      });

      let repo;
      if (!existing) {
        repo = await db.repo.create({
          data: {
            ...repoData,
            enabled: true,
          },
        });
        createdRepos.push(repo);
        console.log(`[Repos Init] Created repository: ${repo.name}`);
      } else {
        repo = existing;
        console.log(`[Repos Init] Repository already exists: ${repoData.name}`);
      }

      // Sync extensions for this repo
      try {
        console.log(`[Repos Init] Syncing extensions for ${repo.name}...`);
        const syncResult = await syncRepoExtensions(repo.id);
        syncResults.push({
          repo: repo.name,
          ...syncResult,
        });
      } catch (error) {
        console.error(`[Repos Init] Error syncing extensions for ${repo.name}:`, error);
        syncResults.push({
          repo: repo.name,
          success: false,
          error: String(error),
        });
      }
    }

    // Reload sources after syncing all extensions
    try {
      console.log(`[Repos Init] Reloading Tachiyomi sources...`);
      const loadResult = await TachiyomiScraperLoader.loadAllSources();
      console.log(`[Repos Init] Loaded ${loadResult.sourcesCount} sources`);
    } catch (error) {
      console.error('[Repos Init] Error reloading sources:', error);
    }

    return NextResponse.json({
      success: true,
      message: `Initialized ${createdRepos.length} repositories`,
      repos: createdRepos,
      syncResults,
    });
  } catch (error) {
    console.error('Error initializing repos:', error);
    return NextResponse.json(
      { error: 'Failed to initialize repositories' },
      { status: 500 }
    );
  }
}

// GET check if default repos exist
export async function GET() {
  try {
    const existingUrls = new Set(
      (await db.repo.findMany()).map((r) => r.url)
    );

    const missing = DEFAULT_REPOS.filter((r) => !existingUrls.has(r.url));

    return NextResponse.json({
      initialized: missing.length === 0,
      missing: missing.map((r) => r.name),
    });
  } catch (error) {
    console.error('Error checking repos:', error);
    return NextResponse.json(
      { error: 'Failed to check repositories' },
      { status: 500 }
    );
  }
}
