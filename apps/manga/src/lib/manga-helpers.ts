import { db } from './db';

/**
 * Ensure a default repository exists
 */
async function ensureDefaultRepo() {
  const existing = await db.repo.findUnique({
    where: { url: 'https://github.com/keiyoushi/extensions' },
  });

  if (!existing) {
    console.log('[ensureDefaultRepo] Creating default repository');
    await db.repo.create({
      data: {
        name: 'Keiyoushi Extensions',
        url: 'https://github.com/keiyoushi/extensions',
        description: 'Default extension repository',
        icon: '📦',
        enabled: true,
      },
    });
    return db.repo.findUnique({
      where: { url: 'https://github.com/keiyoushi/extensions' },
    });
  }

  return existing;
}

/**
 * Ensure an extension exists in the database, create it if it doesn't
 */
export async function ensureExtension(extensionId: string, sourceId: string) {
  const existing = await db.extension.findUnique({
    where: { id: extensionId },
  });

  if (existing) {
    return existing;
  }

  console.log(`[ensureExtension] Creating extension: ${extensionId}`);

  // Ensure default repo exists
  const repo = await ensureDefaultRepo();

  const newExtension = await db.extension.create({
    data: {
      id: extensionId,
      repoId: repo.id,
      name: `${sourceId} Extension`,
      pkgName: `ext.${sourceId}`,
      versionName: '1.0.0',
      versionCode: 1,
      lang: 'it',
      nsfw: 0,
      enabled: true,
      sources: null,
    },
  });

  return newExtension;
}
