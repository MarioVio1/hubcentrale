import * as cheerio from 'cheerio';

async function analyzeMangaWorld() {
  try {
    console.log('Fetching MangaWorld homepage...');
    const response = await fetch('https://www.mangaworld.mx/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = await response.text();
    console.log(`Downloaded ${html.length} characters\n`);

    const $ = cheerio.load(html);

    // Save HTML for manual inspection
    const fs = await import('fs');
    fs.writeFileSync('/tmp/mangaworld-analyzed.html', html);

    console.log('=== Section Headers ===\n');
    $('h2, h3, h4, .section-title, .title').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 100) {
        console.log(`[${i}] ${text}`);
      }
    });

    console.log('\n=== Looking for "Capitoli di tendenza" ===\n');
    // Find elements containing the text
    const trendHeader = $('*:contains("Capitoli di tendenza")').filter(function() {
      return $(this).clone().children().remove().end().text().trim() === 'Capitoli di tendenza';
    }).first();

    if (trendHeader.length > 0) {
      console.log('✓ Found "Capitoli di tendenza" header');
      console.log(`  Tag: ${trendHeader.prop('tagName')}`);
      console.log(`  Class: ${trendHeader.attr('class') || ''}`);

      // Find parent container with items
      let container = trendHeader.parent();
      for (let depth = 0; depth < 10 && container.length > 0; depth++) {
        const items = container.find('.entry.vertical, .entry, .thumb');
        if (items.length > 0 && items.length < 50) {
          console.log(`\n  ✓ Found container at depth ${depth} with ${items.length} items`);
          console.log(`    Tag: ${container.prop('tagName')}, Class: ${container.attr('class') || ''}`);

          items.slice(0, 3).each((i, el) => {
            const $el = $(el);
            const img = $el.find('img').first();
            const link = $el.find('a[href]').first();
            const chapter = $el.find('.chapter').first();
            const title = $el.find('.title, h3').first();

            console.log(`\n    Item ${i}:`);
            console.log(`      Class: ${$el.attr('class')}`);
            if (title.length > 0) console.log(`      Title: ${title.text().trim()}`);
            if (link.length > 0) console.log(`      Link: ${link.attr('href')}`);
            if (chapter.length > 0) console.log(`      Chapter: ${chapter.text().trim()}`);
            if (img.length > 0) console.log(`      Img: ${img.attr('src') || img.attr('data-src')}`);
          });
          break;
        }
        container = container.parent();
      }
    }

    console.log('\n=== Looking for "Ultimi capitoli aggiunti" ===\n');
    const recentHeader = $('*:contains("Ultimi capitoli aggiunti")').filter(function() {
      return $(this).clone().children().remove().end().text().trim() === 'Ultimi capitoli aggiunti';
    }).first();

    if (recentHeader.length > 0) {
      console.log('✓ Found "Ultimi capitoli aggiunti" header');
      console.log(`  Tag: ${recentHeader.prop('tagName')}`);
      console.log(`  Class: ${recentHeader.attr('class') || ''}`);

      // Find parent container with items
      let container = recentHeader.parent();
      for (let depth = 0; depth < 10 && container.length > 0; depth++) {
        const items = container.find('.entry.vertical, .entry, .thumb');
        if (items.length > 0 && items.length < 100) {
          console.log(`\n  ✓ Found container at depth ${depth} with ${items.length} items`);
          console.log(`    Tag: ${container.prop('tagName')}, Class: ${container.attr('class') || ''}`);

          items.slice(0, 3).each((i, el) => {
            const $el = $(el);
            const img = $el.find('img').first();
            const link = $el.find('a[href]').first();
            const chapter = $el.find('.chapter').first();
            const title = $el.find('.title, h3').first();

            console.log(`\n    Item ${i}:`);
            console.log(`      Class: ${$el.attr('class')}`);
            if (title.length > 0) console.log(`      Title: ${title.text().trim()}`);
            if (link.length > 0) console.log(`      Link: ${link.attr('href')}`);
            if (chapter.length > 0) console.log(`      Chapter: ${chapter.text().trim()}`);
            if (img.length > 0) console.log(`      Img: ${img.attr('src') || img.attr('data-src')}`);
          });
          break;
        }
        container = container.parent();
      }
    }

    console.log('\n=== All .entry.vertical elements ===\n');
    const verticalEntries = $('.entry.vertical');
    console.log(`Total: ${verticalEntries.length}`);

    if (verticalEntries.length > 0) {
      verticalEntries.slice(0, 5).each((i, el) => {
        const $el = $(el);
        const img = $el.find('img').first();
        const link = $el.find('a[href]').first();
        const chapter = $el.find('.chapter').first();
        const title = $el.find('.title, h3').first();

        console.log(`\n[${i}] Class: ${$el.attr('class')}`);
        if (title.length > 0) console.log(`  Title: ${title.text().trim()}`);
        if (link.length > 0) console.log(`  Link: ${link.attr('href')}`);
        if (chapter.length > 0) console.log(`  Chapter: ${chapter.text().trim()}`);
        if (img.length > 0) console.log(`  Img: ${img.attr('src') || img.attr('data-src')}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeMangaWorld();
