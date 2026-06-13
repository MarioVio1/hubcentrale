import { NextRequest, NextResponse } from 'next/server';
import { db } from '@manga/lib/db';
import { TachiyomiExtensionService, type TachiyomiExtension } from '@manga/lib/tachiyomi-extension-service';

// GET all extensions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'all';
    const enabled = searchParams.get('enabled');

    const where: any = {};

    if (lang !== 'all') {
      where.lang = lang;
    }

    if (enabled !== null) {
      where.enabled = enabled === 'true';
    }

    const extensions = await db.extension.findMany({
      where,
      include: {
        repo: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Add count of manga for each extension
    const extensionsWithCounts = await Promise.all(
      extensions.map(async (ext) => {
        const count = await db.manga.count({
          where: { extensionId: ext.id },
        });
        return {
          ...ext,
          _count: { mangas: count },
        };
      })
    );

    return NextResponse.json(extensionsWithCounts);
  } catch (error) {
    console.error('Error fetching extensions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch extensions', details: String(error) },
      { status: 500 }
    );
  }
}

// POST sync extensions from a repository
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoId } = body;

    if (!repoId) {
      return NextResponse.json(
        { error: 'Repository ID is required' },
        { status: 400 }
      );
    }

    // Get repository
    const repo = await db.repo.findUnique({
      where: { id: repoId },
    });

    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    console.log(`Syncing extensions from repo: ${repo.name} (${repo.url})`);

    // Fetch repository index using Tachiyomi service
    const repoBaseUrl = repo.url.endsWith('index.min.json')
      ? repo.url
      : `${repo.url}/repo/index.min.json`;

    const index = await TachiyomiExtensionService.fetchRepoIndex(repoBaseUrl);

    if (!index) {
      return NextResponse.json(
        { error: 'Failed to fetch repository index' },
        { status: 500 }
      );
    }

    console.log(`Fetched ${index.extensions.length} extensions from repo`);

    // Get Italian extensions (or all if no language filter)
    const italianExtensions = TachiyomiExtensionService.getItalianExtensions(index.extensions);
    console.log(`Found ${italianExtensions.length} Italian extensions`);

    // Sync each extension
    const results = [];

    for (const ext of italianExtensions) {
      try {
        const iconUrl = TachiyomiExtensionService.getIconUrl(repoBaseUrl, ext.icon);
        const apkUrl = TachiyomiExtensionService.getApkUrl(repoBaseUrl, ext.apk);

        // Check if extension already exists
        const existing = await db.extension.findUnique({
          where: { pkgName: ext.pkg },
        });

        const extensionData = {
          name: TachiyomiExtensionService.formatExtensionName(ext),
          pkgName: ext.pkg,
          versionName: ext.version,
          versionCode: ext.code,
          lang: ext.lang,
          nsfw: ext.nsfw,
          iconUrl,
          apkUrl,
          sources: ext.sources || [],
          enabled: true,
          repoId,
        };

        let extension;
        if (existing) {
          // Update existing extension
          extension = await db.extension.update({
            where: { id: existing.id },
            data: extensionData,
          });
          console.log(`Updated extension: ${extension.name}`);
        } else {
          // Create new extension
          extension = await db.extension.create({
            data: extensionData,
          });
          console.log(`Created extension: ${extension.name}`);
        }

        results.push(extension);
      } catch (error) {
        console.error(`Error syncing extension ${ext.pkg}:`, error);
      }
    }

    // Update repo last checked timestamp
    await db.repo.update({
      where: { id: repoId },
      data: { lastChecked: new Date() },
    });

    return NextResponse.json({
      success: true,
      synced: results.length,
      total: italianExtensions.length,
      extensions: results,
    });
  } catch (error) {
    console.error('Error syncing extensions:', error);
    return NextResponse.json(
      { error: 'Failed to sync extensions', details: String(error) },
      { status: 500 }
    );
  }
}
