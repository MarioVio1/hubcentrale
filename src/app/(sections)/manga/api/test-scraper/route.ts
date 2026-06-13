import { NextResponse } from 'next/server';
import { MangaWorldScraper } from '@manga/lib/mangaworld-scraper';

export async function GET() {
  try {
    console.log('Testing MangaWorld scraper...');

    // Test popular manga
    console.log('Fetching popular manga...');
    const popular = await MangaWorldScraper.getPopularManga();
    console.log(`Found ${popular.length} popular manga`);

    // Test latest manga
    console.log('Fetching latest manga...');
    const latest = await MangaWorldScraper.getLatestManga();
    console.log(`Found ${latest.length} latest manga`);

    // Test search
    console.log('Testing search...');
    const searchResults = await MangaWorldScraper.searchManga('one piece');
    console.log(`Found ${searchResults.length} search results`);

    // Test manga details (if we have any)
    let details = null;
    let chapters: any[] = [];
    if (popular.length > 0) {
      console.log(`Testing manga details for: ${popular[0].title}`);
      details = await MangaWorldScraper.getMangaDetails(popular[0].url);
      console.log(`Got details: ${details ? 'YES' : 'NO'}`);

      if (details) {
        console.log(`Testing chapters for: ${details.title}`);
        chapters = await MangaWorldScraper.getChapters(details.url);
        console.log(`Found ${chapters.length} chapters`);

        // Test chapter pages (if we have any)
        if (chapters.length > 0) {
          console.log(`Testing pages for chapter: ${chapters[0].name}`);
          const pages = await MangaWorldScraper.getChapterPages(chapters[0].url);
          console.log(`Found ${pages.length} pages`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      popularCount: popular.length,
      popularSample: popular.slice(0, 3).map(m => ({
        title: m.title,
        url: m.url,
        coverUrl: m.coverUrl,
      })),
      latestCount: latest.length,
      latestSample: latest.slice(0, 3).map(m => ({
        title: m.title,
        url: m.url,
        coverUrl: m.coverUrl,
      })),
      searchCount: searchResults.length,
      searchSample: searchResults.slice(0, 3).map(m => ({
        title: m.title,
        url: m.url,
        coverUrl: m.coverUrl,
      })),
      details: details ? {
        title: details.title,
        author: details.author,
        genre: details.genre,
        status: details.status,
      } : null,
      chaptersCount: chapters.length,
      chaptersSample: chapters.slice(0, 3).map(c => ({
        name: c.name,
        chapterNum: c.chapterNum,
        url: c.url,
      })),
    });
  } catch (error) {
    console.error('Error testing scraper:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
