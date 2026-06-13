import * as cheerio from 'cheerio';

async function analyzeMangaWorldHomepage() {
  try {
    const response = await fetch('https://www.mangaworld.mx/');
    const html = await response.text();

    const $ = cheerio.load(html);

    console.log('=== MangaWorld Homepage Analysis ===\n');

    // Look for trending/featured sections
    console.log('1. Searching for trending/featured sections...');
    const trendingSelectors = [
      '.trending', '.featured', '.capitoli-di-tendenza',
      '[class*="trending"]', '[class*="featured"]', '[class*="tendenza"]',
      '.home-left', '.main-featured', '.hero-section',
    ];

    for (const selector of trendingSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`✓ Found ${elements.length} elements with selector: ${selector}`);
        console.log(`  HTML snippet:`, $(elements[0]).html().substring(0, 200));
      }
    }

    // Look for recent updates sections
    console.log('\n2. Searching for recent updates sections...');
    const recentSelectors = [
      '.recent-updates', '.latest-updates', '.ultimi-capitoli',
      '[class*="recent"]', '[class*="latest"]', '[class*="ultimi"]',
      '.home-right', '.update-section', '.chapter-updates',
    ];

    for (const selector of recentSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`✓ Found ${elements.length} elements with selector: ${selector}`);
        console.log(`  HTML snippet:`, $(elements[0]).html().substring(0, 200));
      }
    }

    // Look for chapter items
    console.log('\n3. Searching for chapter items...');
    const chapterSelectors = [
      '.chapter-item', '.update-item', '.manga-update',
      '.chapter', '.chapter-row', '.chapter-list-item',
      '[class*="chapter"]',
    ];

    for (const selector of chapterSelectors) {
      const elements = $(selector);
      if (elements.length > 0 && elements.length < 50) {
        console.log(`✓ Found ${elements.length} elements with selector: ${selector}`);
        if (elements.length > 0) {
          const firstItem = $(elements[0]);
          console.log(`  First item HTML:`, firstItem.html().substring(0, 500));
        }
      }
    }

    // Look for all divs with class containing "thumb" or "entry"
    console.log('\n4. Searching for thumbnails/entries...');
    const thumbElements = $('.thumb, .entry, [class*="thumb"], [class*="entry"]');
    console.log(`✓ Found ${thumbElements.length} thumbnail/entry elements`);

    if (thumbElements.length > 0) {
      console.log(`  First 3 thumbnails structure:`);
      thumbElements.slice(0, 3).each((i, el) => {
        const $el = $(el);
        console.log(`\n  [${i}] Class: ${$el.attr('class')}`);
        console.log(`      Has img: ${$el.find('img').length > 0}`);
        console.log(`      Has link: ${$el.find('a').length > 0}`);
        if ($el.find('img').length > 0) {
          const img = $el.find('img').first();
          console.log(`      Img src: ${img.attr('src') || img.attr('data-src') || 'N/A'}`);
        }
        if ($el.find('a').length > 0) {
          const link = $el.find('a').first();
          console.log(`      Link href: ${link.attr('href') || 'N/A'}`);
        }
      });
    }

    // Look for any section with "Capitoli" in the text
    console.log('\n5. Searching for sections with "Capitoli" in text...');
    $('h2, h3, h4, .section-title, .title').each((i, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().includes('capitolo') || text.toLowerCase().includes('tendenza') || text.toLowerCase().includes('ultim')) {
        console.log(`✓ Found heading: "${text}"`);
        console.log(`  Selector: ${$(el).parents().map((_, p) => $(p).prop('tagName') + (p.className ? '.' + p.className : '')).get().reverse().join(' > ')}`);
      }
    });

    // Save full HTML for manual inspection
    const fs = await import('fs');
    fs.writeFileSync('/tmp/mangaworld-homepage.html', html);
    console.log('\n✓ Full HTML saved to /tmp/mangaworld-homepage.html');

  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeMangaWorldHomepage();
