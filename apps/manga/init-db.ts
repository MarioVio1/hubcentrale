// Initialize database with default repos and sync extensions
import { db } from './src/lib/db';

const DEFAULT_REPOS = [
  {
    name: 'Keiyoushi (Official)',
    url: 'https://raw.githubusercontent.com/keiyoushi/extensions/repo',
    description: 'Official Tachiyomi/Mihon extension repository with many sources',
    enabled: true,
  },
  {
    name: 'Mihon (Official)',
    url: 'https://raw.githubusercontent.com/mihonapp/extensions/repo',
    description: 'Official Mihon extension repository',
    enabled: true,
  },
  {
    name: 'Karelia',
    url: 'https://raw.githubusercontent.com/keiyoushi/extensions/repo',
    description: 'Alternative repository with additional sources',
    enabled: true,
  },
];

async function initDatabase() {
  console.log('🚀 Initializing MangaFlow database...');

  try {
    // Check if repos already exist
    const existingRepos = await db.repo.findMany();

    if (existingRepos.length === 0) {
      console.log('📦 Adding default repositories...');

      for (const repo of DEFAULT_REPOS) {
        const newRepo = await db.repo.create({
          data: {
            name: repo.name,
            url: repo.url,
            description: repo.description,
            enabled: repo.enabled,
          },
        });
        console.log(`  ✅ Added repo: ${repo.name} (ID: ${newRepo.id})`);
      }
    } else {
      console.log(`ℹ️  Found ${existingRepos.length} existing repos`);
    }

    // List all repos
    const allRepos = await db.repo.findMany();
    console.log('\n📋 Available repositories:');
    allRepos.forEach((repo) => {
      console.log(`  - ${repo.name}: ${repo.url}`);
    });

    console.log('\n✅ Database initialized successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Sync extensions from repositories via the Settings page');
    console.log('2. Enable/disable sources in Settings');
    console.log('3. Search and read manga!');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
