// Initialize Tachiyomi Keiyoushi repository and sync extensions
import { db } from '@manga/lib/db';
import { TachiyomiExtensionService } from '@manga/lib/tachiyomi-extension-service';

const KEIYOUSHI_REPO_URL = 'https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json';

export async function initializeTachiyomiRepo() {
  try {
    console.log('[Init] Initializing Keiyoushi repository...');

    // Check if Keiyoushi repo already exists
    const existingRepo = await db.repo.findFirst({
      where: {
        url: {
          contains: 'keiyoushi'
        }
      }
    });

    if (existingRepo) {
      console.log('[Init] Keiyoushi repo already exists, updating...');
      await syncRepoExtensions(existingRepo.id);
      return { success: true, repo: existingRepo };
    }

    // Create Keiyoushi repository
    const repo = await db.repo.create({
      data: {
        id: 'keiyoushi-repo',
        name: 'Keiyoushi Extensions',
        url: KEIYOUSHI_REPO_URL,
        description: 'Official Tachiyomi extensions repository by Keiyoushi',
        icon: 'https://raw.githubusercontent.com/keiyoushi/extensions/repo/icon/icon.png',
        enabled: true,
        version: '1.0',
        lastChecked: new Date(),
      },
    });

    console.log('[Init] Created Keiyoushi repository');

    // Sync extensions
    const result = await syncRepoExtensions(repo.id);

    return { success: true, repo, ...result };
  } catch (error) {
    console.error('[Init] Error initializing Keiyoushi repo:', error);
    return { success: false, error: String(error) };
  }
}

export async function syncRepoExtensions(repoId: string) {
  try {
    const repo = await db.repo.findUnique({
      where: { id: repoId },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    console.log(`[Sync] Syncing extensions from repo: ${repo.name}`);

    // Fetch repository index
    const index = await TachiyomiExtensionService.fetchRepoIndex(repo.url);

    if (!index) {
      throw new Error('Failed to fetch repository index');
    }

    console.log(`[Sync] Fetched ${index.extensions.length} total extensions`);

    // Filter for Italian extensions
    const italianExtensions = TachiyomiExtensionService.getItalianExtensions(index.extensions);
    console.log(`[Sync] Found ${italianExtensions.length} Italian extensions`);

    let created = 0;
    let updated = 0;

    for (const ext of italianExtensions) {
      try {
        const iconUrl = TachiyomiExtensionService.getIconUrl(repo.url, ext.icon);
        const apkUrl = TachiyomiExtensionService.getApkUrl(repo.url, ext.apk);

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

        if (existing) {
          await db.extension.update({
            where: { id: existing.id },
            data: extensionData,
          });
          updated++;
          console.log(`[Sync] Updated: ${extensionData.name}`);
        } else {
          await db.extension.create({
            data: extensionData,
          });
          created++;
          console.log(`[Sync] Created: ${extensionData.name}`);
        }
      } catch (error) {
        console.error(`[Sync] Error syncing extension ${ext.pkg}:`, error);
      }
    }

    // Update repo last checked timestamp
    await db.repo.update({
      where: { id: repoId },
      data: { lastChecked: new Date() },
    });

    console.log(`[Sync] Sync complete: ${created} created, ${updated} updated`);

    return {
      success: true,
      total: italianExtensions.length,
      created,
      updated,
      extensions: italianExtensions,
    };
  } catch (error) {
    console.error('[Sync] Error syncing extensions:', error);
    throw error;
  }
}
