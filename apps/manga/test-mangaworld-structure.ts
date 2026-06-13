import * as cheerio from 'cheerio';
import * as fs from 'fs';

async function findSectionStructure() {
  try {
    const html = fs.readFileSync('/tmp/mangaworld-homepage.html', 'utf-8');
    const $ = cheerio.load(html);

    console.log('=== Finding Section Structures ===\n');

    // Find "Capitoli di tendenza" section
    const trendHeading = $('*:contains("Capitoli di tendenza")').first();
    if (trendHeading.length > 0) {
      console.log('1. "Capitoli di tendenza" section:');
      const trendSection = trendHeading.closest('section, div');
      const items = trendSection.find('.entry, .thumb, .chapter-item, [class*="chapter"]');

      console.log(`   Parent: ${trendSection.prop('tagName')} class="${trendSection.attr('class') || ''}"`);
      console.log(`   Found ${items.length} potential items`);

      items.slice(0, 3).each((i, el) => {
        const $el = $(el);
        const img = $el.find('img').first();
        const link = $el.find('a').first();
        const chapter = $el.find('.chapter').first();

        console.log(`\n   Item ${i}:`);
        console.log(`     Class: ${$el.attr('class')}`);
        if (link.length > 0) {
          console.log(`     Link: ${link.attr('href')}`);
        }
        if (img.length > 0) {
          console.log(`     Img: ${img.attr('src') || img.attr('data-src')}`);
        }
        if (chapter.length > 0) {
          console.log(`     Chapter: ${chapter.text().trim()}`);
        }
      });
    }

    // Find "Ultimi capitoli aggiunti" section
    const recentHeading = $('*:contains("Ultimi capitoli aggiunti")').first();
    if (recentHeading.length > 0) {
      console.log('\n2. "Ultimi capitoli aggiunti" section:');
      const recentSection = recentHeading.closest('section, div');
      const items = recentSection.find('.entry, .thumb, .chapter-item, [class*="chapter"]');

      console.log(`   Parent: ${recentSection.prop('tagName')} class="${recentSection.attr('class') || ''}"`);
      console.log(`   Found ${items.length} potential items`);

      items.slice(0, 3).each((i, el) => {
        const $el = $(el);
        const img = $el.find('img').first();
        const link = $el.find('a').first();
        const chapter = $el.find('.chapter').first();

        console.log(`\n   Item ${i}:`);
        console.log(`     Class: ${$el.attr('class')}`);
        if (link.length > 0) {
          console.log(`     Link: ${link.attr('href')}`);
        }
        if (img.length > 0) {
          console.log(`     Img: ${img.attr('src') || img.attr('data-src')}`);
        }
        if (chapter.length > 0) {
          console.log(`     Chapter: ${chapter.text().trim()}`);
        }
      });
    }

    // Also check for .entry elements with specific classes
    console.log('\n3. All .entry elements with details:');
    $('.entry').slice(0, 5).each((i, el) => {
      const $el = $(el);
      const img = $el.find('img').first();
      const link = $el.find('a').first();
      const chapter = $el.find('.chapter').first();
      const title = $el.find('.title, h3, h4').first();

      console.log(`\n   Entry ${i}: class="${$el.attr('class')}"`);
      if (title.length > 0) {
        console.log(`     Title: ${title.text().trim()}`);
      }
      if (link.length > 0) {
        console.log(`     Link: ${link.attr('href')}`);
      }
      if (img.length > 0) {
        console.log(`     Img: ${img.attr('src') || img.attr('data-src')}`);
      }
      if (chapter.length > 0) {
        console.log(`     Chapter: ${chapter.text().trim()}`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

findSectionStructure();
