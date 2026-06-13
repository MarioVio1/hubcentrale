import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Add Keiyoushi Extensions Repository
  const keiyoushiRepo = await prisma.repo.upsert({
    where: { url: 'https://github.com/keiyoushi/extensions' },
    update: {},
    create: {
      name: 'Keiyoushi Extensions',
      url: 'https://github.com/keiyoushi/extensions',
      description: 'Largest collection of manga extensions including Manga World',
      icon: '📚',
      enabled: true,
      version: '1.0',
    },
  });

  console.log('✅ Created/Updated Keiyoushi repository:', keiyoushiRepo.name);

  // Check if Manga World extension already exists
  const existingMangaWorld = await prisma.extension.findFirst({
    where: {
      pkgName: {
        contains: 'mangaworld',
      },
    },
  });

  if (!existingMangaWorld) {
    // Create Manga World extension
    const mangaWorldExt = await prisma.extension.create({
      data: {
        repoId: keiyoushiRepo.id,
        name: 'MangaWorld',
        pkgName: 'eu.kanade.tachiyomi.extension.it.mangaworld',
        versionName: '1.4.22',
        versionCode: 10422,
        lang: 'it',
        nsfw: 0,
        iconUrl: 'https://raw.githubusercontent.com/keiyoushi/extensions/repo/icon/eu.kanade.tachiyomi.extension.it.mangaworld.png',
        sources: [
          {
            id: 'mangaworld',
            lang: 'it',
            name: 'MangaWorld',
            baseUrl: 'https://www.mangaworld.mx',
          },
        ],
        enabled: true,
      },
    });

    console.log('✅ Created Manga World extension:', mangaWorldExt.name);
  } else {
    console.log('ℹ️  Manga World extension already exists, updating...');

    // Update Manga World extension to use the new domain
    const updatedMangaWorld = await prisma.extension.update({
      where: { id: existingMangaWorld.id },
      data: {
        sources: [
          {
            id: 'mangaworld',
            lang: 'it',
            name: 'MangaWorld',
            baseUrl: 'https://www.mangaworld.mx',
          },
        ],
      },
    });

    console.log('✅ Updated Manga World extension with new domain');
  }

  // Check if there are any manga in the database
  const mangaCount = await prisma.manga.count();
  console.log(`📚 Current manga count: ${mangaCount}`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
